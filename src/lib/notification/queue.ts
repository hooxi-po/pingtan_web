import { PrismaClient, NotificationStatus, NotificationChannel, NotificationPriority } from '@prisma/client'
import { Logger } from './logger'
import { EventEmitter } from 'events'

/**
 * 队列任务接口
 */
interface QueueTask {
  id: string
  notificationId: string
  priority: number
  scheduledAt: Date
  retryCount: number
  maxRetries: number
  data: any
}

/**
 * 重试配置接口
 */
interface RetryConfig {
  maxRetries: number
  baseDelay: number // 基础延迟时间（毫秒）
  maxDelay: number // 最大延迟时间（毫秒）
  backoffMultiplier: number // 退避乘数
  jitter: boolean // 是否添加随机抖动
}

/**
 * 队列配置接口
 */
interface QueueConfig {
  concurrency: number // 并发处理数量
  pollInterval: number // 轮询间隔（毫秒）
  batchSize: number // 批处理大小
  retryConfig: RetryConfig
}

/**
 * 通知队列处理器
 * 负责处理通知发送队列和重试机制
 */
export class NotificationQueue {
  private readonly prisma: PrismaClient
  private readonly logger: Logger
  private readonly config: QueueConfig
  public isProcessing: boolean = false
  private processingInterval: NodeJS.Timeout | null = null
  private readonly workers: Set<Promise<void>> = new Set()

  // 默认配置
  private static readonly DEFAULT_CONFIG: QueueConfig = {
    concurrency: 5,
    pollInterval: 5000, // 5秒
    batchSize: 10,
    retryConfig: {
      maxRetries: 3,
      baseDelay: 1000, // 1秒
      maxDelay: 300000, // 5分钟
      backoffMultiplier: 2,
      jitter: true
    }
  }

  constructor(
    notificationService: any,
    logger: Logger,
    config: Partial<QueueConfig> = {}
  ) {
    this.prisma = new PrismaClient()
    this.logger = logger
    this.config = { ...NotificationQueue.DEFAULT_CONFIG, ...config }
  }

  /**
   * 启动队列处理器
   */
  start(): void {
    if (this.isProcessing) {
      this.logger.warn('Queue processor is already running')
      return
    }

    this.isProcessing = true
    this.logger.info('Starting notification queue processor', {
      concurrency: this.config.concurrency,
      pollInterval: this.config.pollInterval,
      batchSize: this.config.batchSize
    })

    // 启动定时轮询
    this.processingInterval = setInterval(() => {
      this.processQueue().catch(error => {
        this.logger.error('Error in queue processing cycle', { error: error.message })
      })
    }, this.config.pollInterval)

    // 立即处理一次
    this.processQueue().catch(error => {
      this.logger.error('Error in initial queue processing', { error: error.message })
    })
  }

  /**
   * 停止队列处理器
   */
  async stop(): Promise<void> {
    if (!this.isProcessing) {
      return
    }

    this.logger.info('Stopping notification queue processor')
    this.isProcessing = false

    // 停止定时轮询
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
    }

    // 等待所有工作线程完成
    await Promise.all(this.workers)
    this.workers.clear()

    this.logger.info('Notification queue processor stopped')
  }

  /**
   * 添加通知到队列
   */
  async enqueue(notificationId: string, priority: number = 1, scheduledAt?: Date): Promise<void> {
    try {
      await this.prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: 'PENDING',
          scheduledAt: scheduledAt || new Date(),
          priority: this.mapPriorityToEnum(priority)
        }
      })

      this.logger.info('Notification enqueued', {
        notificationId,
        priority,
        scheduledAt: scheduledAt || new Date()
      })
    } catch (error) {
      this.logger.error('Failed to enqueue notification', {
        notificationId,
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }

  /**
   * 处理队列
   */
  private async processQueue(): Promise<void> {
    if (!this.isProcessing) {
      return
    }

    try {
      // 获取待处理的通知
      const pendingNotifications = await this.getPendingNotifications()
      
      if (pendingNotifications.length === 0) {
        return
      }

      this.logger.debug(`Processing ${pendingNotifications.length} pending notifications`)

      // 按优先级和调度时间排序
      const sortedNotifications = this.sortNotificationsByPriority(pendingNotifications)

      // 分批处理
      const batches = this.chunkArray(sortedNotifications, this.config.batchSize)

      for (const batch of batches) {
        if (!this.isProcessing) break

        // 控制并发数量
        while (this.workers.size >= this.config.concurrency) {
          await Promise.race(this.workers)
        }

        // 为每个批次创建工作线程
        const worker = this.processBatch(batch)
        this.workers.add(worker)

        // 清理完成的工作线程
        worker.finally(() => {
          this.workers.delete(worker)
        })
      }
    } catch (error) {
      this.logger.error('Error processing queue', { error: error instanceof Error ? error.message : String(error) })
    }
  }

  /**
   * 处理批次
   */
  private async processBatch(notifications: any[]): Promise<void> {
    const promises = notifications.map(notification => 
      this.processNotification(notification).catch(error => {
        this.logger.error('Error processing notification', {
          notificationId: notification.id,
          error: error.message
        })
      })
    )

    await Promise.all(promises)
  }

  /**
   * 处理单个通知
   */
  private async processNotification(notification: any): Promise<void> {
    try {
      this.logger.debug('Processing notification', {
        notificationId: notification.id,
        type: notification.type,
        channel: notification.channel
      })

      // 标记为处理中
      await this.updateNotificationStatus(notification.id, 'SENT')

      // 模拟发送过程
      const success = await this.simulateSendNotification(notification)

      if (success) {
        // 发送成功
        await this.updateNotificationStatus(notification.id, 'DELIVERED', {
          deliveredAt: new Date()
        })

        this.logger.info('Notification sent successfully', {
          notificationId: notification.id
        })
      } else {
        // 发送失败，安排重试
        await this.handleFailedNotification(notification)
      }
    } catch (error) {
      this.logger.error('Error processing notification', {
        notificationId: notification.id,
        error: error instanceof Error ? error.message : String(error)
      })

      await this.handleFailedNotification(notification, error instanceof Error ? error.message : String(error))
    }
  }

  /**
   * 处理失败的通知
   */
  private async handleFailedNotification(notification: any, errorMessage?: string): Promise<void> {
    const retryCount = notification.retryCount || 0
    const maxRetries = this.config.retryConfig.maxRetries

    if (retryCount >= maxRetries) {
      // 超过最大重试次数，标记为失败
      await this.updateNotificationStatus(notification.id, 'FAILED', {
        errorMessage: errorMessage || 'Max retries exceeded',
        retryCount: retryCount + 1
      })

      this.logger.warn('Notification failed after max retries', {
        notificationId: notification.id,
        retryCount: retryCount + 1,
        maxRetries
      })
    } else {
      // 计算下次重试时间
      const nextRetryAt = this.calculateNextRetryTime(retryCount)

      await this.updateNotificationStatus(notification.id, 'PENDING', {
        scheduledAt: nextRetryAt,
        retryCount: retryCount + 1,
        errorMessage: errorMessage || 'Send failed, will retry'
      })

      this.logger.info('Notification scheduled for retry', {
        notificationId: notification.id,
        retryCount: retryCount + 1,
        nextRetryAt
      })
    }
  }

  /**
   * 计算下次重试时间
   */
  private calculateNextRetryTime(retryCount: number): Date {
    const { baseDelay, maxDelay, backoffMultiplier, jitter } = this.config.retryConfig

    // 指数退避算法
    let delay = baseDelay * Math.pow(backoffMultiplier, retryCount)
    delay = Math.min(delay, maxDelay)

    // 添加随机抖动，避免雪崩效应
    if (jitter) {
      const jitterAmount = delay * 0.1 // 10%的抖动
      delay += (Math.random() - 0.5) * 2 * jitterAmount
    }

    return new Date(Date.now() + delay)
  }

  /**
   * 获取待处理的通知
   */
  private async getPendingNotifications(): Promise<any[]> {
    return await this.prisma.notification.findMany({
      where: {
        status: 'PENDING',
        scheduledAt: {
          lte: new Date()
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            name: true
          }
        },
        order: {
          select: {
            id: true,
            totalAmount: true,
            status: true
          }
        }
      },
      take: this.config.batchSize * this.config.concurrency
    })
  }

  /**
   * 按优先级排序通知
   */
  private sortNotificationsByPriority(notifications: any[]): any[] {
    const priorityOrder = { 'URGENT': 4, 'HIGH': 3, 'NORMAL': 2, 'LOW': 1 }
    
    return notifications.sort((a, b) => {
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 1
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 1
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority // 高优先级在前
      }
      
      // 优先级相同时，按调度时间排序
      return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    })
  }

  /**
   * 更新通知状态
   */
  private async updateNotificationStatus(
    notificationId: string, 
    status: NotificationStatus,
    additionalData: any = {}
  ): Promise<void> {
    await this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        status,
        ...additionalData,
        updatedAt: new Date()
      }
    })
  }

  /**
   * 模拟发送通知
   */
  private async simulateSendNotification(notification: any): Promise<boolean> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500))

    // 模拟发送成功率（90%成功率）
    const successRate = this.getChannelSuccessRate(notification.channel)
    return Math.random() < successRate
  }

  /**
   * 获取渠道成功率
   */
  private getChannelSuccessRate(channel: NotificationChannel): number {
    const rates = {
      SMS: 0.95,
      EMAIL: 0.90,
      IN_APP: 0.99,
      PUSH: 0.85
    }
    return rates[channel] || 0.90
  }

  /**
   * 映射优先级数字到枚举
   */
  private mapPriorityToEnum(priority: number): NotificationPriority {
    const mapping = {
      1: NotificationPriority.LOW,
      2: NotificationPriority.NORMAL,
      3: NotificationPriority.HIGH,
      4: NotificationPriority.URGENT
    }
    return mapping[priority as keyof typeof mapping] || NotificationPriority.NORMAL
  }

  /**
   * 数组分块
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  /**
   * 获取队列统计信息
   */
  /**
   * 获取队列统计信息
   */
  async getStats(): Promise<{
    pending: number
    processing: number
    failed: number
    completed: number
    retrying: number
  }> {
    return this.getQueueStats()
  }

  async getQueueStats(): Promise<{
    pending: number
    processing: number
    failed: number
    completed: number
    retrying: number
  }> {
    const [pending, processing, failed, completed, retrying] = await Promise.all([
      this.prisma.notification.count({
        where: { status: 'PENDING' }
      }),
      this.prisma.notification.count({
        where: { status: 'SENT' }
      }),
      this.prisma.notification.count({
        where: { status: 'FAILED' }
      }),
      this.prisma.notification.count({
        where: { status: 'DELIVERED' }
      }),
      this.prisma.notification.count({
        where: {
          status: 'PENDING',
          retryCount: { gt: 0 }
        }
      })
    ])

    return {
      pending,
      processing,
      failed,
      completed,
      retrying
    }
  }

  /**
   * 清理过期的失败通知
   */
  async cleanupFailedNotifications(olderThanDays: number = 30): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

    const result = await this.prisma.notification.deleteMany({
      where: {
        status: 'FAILED',
        updatedAt: {
          lt: cutoffDate
        }
      }
    })

    this.logger.info('Cleaned up failed notifications', {
      deletedCount: result.count,
      olderThanDays
    })

    return result.count
  }
}

// 导出单例实例
export const notificationQueue = new NotificationQueue(
  {} as any, // notificationService placeholder
  new Logger()
)