import { PrismaClient } from '@prisma/client'
import { 
  CreateNotificationRequest, 
  NotificationSendResult, 
  NotificationTemplateVariables,
  NotificationServiceConfig,
  RetryConfig
} from './types'
import { SMSService } from './channels/sms'
import { EmailService } from './channels/email'
import { InAppService } from './channels/in-app'
import { PushService } from './channels/push'
import { TemplateEngine } from './template-engine'
import { Logger } from './logger'

const prisma = new PrismaClient()

export class NotificationService {
  private smsService: SMSService
  private emailService: EmailService
  private inAppService: InAppService
  private pushService: PushService
  private templateEngine: TemplateEngine
  private logger: Logger
  private retryConfig: RetryConfig

  constructor(prisma: PrismaClient, config: NotificationServiceConfig) {
    this.smsService = new SMSService(config.sms)
    this.emailService = new EmailService(config.email)
    this.inAppService = new InAppService()
    this.pushService = new PushService(config.push)
    this.templateEngine = new TemplateEngine()
    this.logger = new Logger()
    
    this.retryConfig = {
      maxRetries: 3,
      retryIntervals: [60, 300, 1800], // 1分钟、5分钟、30分钟
      exponentialBackoff: true
    }
  }

  /**
   * 创建并发送通知
   */
  async createAndSendNotification(request: CreateNotificationRequest): Promise<string> {
    try {
      // 1. 检查用户通知配置
      const userConfig = await this.getUserNotificationConfig(request.userId, request.channel)
      if (!userConfig?.isEnabled) {
        this.logger.info(`User ${request.userId} has disabled ${request.channel} notifications`)
        return ''
      }

      // 2. 处理模板内容
      let { title, content } = request
      if (request.templateId) {
        const template = await this.getNotificationTemplate(request.templateId)
        if (template) {
          const variables = await this.buildTemplateVariables(request)
          title = this.templateEngine.render(template.title, variables)
          content = this.templateEngine.render(template.content, variables)
        }
      }

      // 3. 创建通知记录
      const notification = await prisma.notification.create({
        data: {
          userId: request.userId,
          orderId: request.orderId,
          type: request.type,
          channel: request.channel,
          priority: request.priority || 'NORMAL',
          title,
          content,
          templateId: request.templateId,
          metadata: request.metadata,
          scheduledAt: request.scheduledAt || new Date(),
          status: 'PENDING'
        }
      })

      // 4. 立即发送或调度发送
      if (!request.scheduledAt || request.scheduledAt <= new Date()) {
        await this.sendNotification(notification.id)
      }

      return notification.id
    } catch (error) {
      this.logger.error('Failed to create notification', { error, request })
      throw error
    }
  }

  /**
   * 发送通知
   */
  async sendNotification(notificationId: string): Promise<void> {
    try {
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
        include: { user: true, order: true }
      })

      if (!notification) {
        throw new Error(`Notification ${notificationId} not found`)
      }

      if (notification.status !== 'PENDING') {
        this.logger.warn(`Notification ${notificationId} is not in PENDING status`)
        return
      }

      // 更新状态为发送中
      await prisma.notification.update({
        where: { id: notificationId },
        data: { status: 'SENT', sentAt: new Date() }
      })

      let result: NotificationSendResult

      // 根据渠道发送通知
      switch (notification.channel) {
        case 'SMS':
          result = await this.smsService.send({
            to: notification.user.phone || '',
            content: notification.content,
            metadata: notification.metadata as Record<string, any> || {}
          })
          break
        case 'EMAIL':
          result = await this.emailService.send({
            to: notification.user.email,
            subject: notification.title,
            content: notification.content,
            metadata: notification.metadata as Record<string, any> || {}
          })
          break
        case 'IN_APP':
          result = await this.inAppService.send({
            userId: notification.userId,
            title: notification.title,
            content: notification.content,
            metadata: notification.metadata as Record<string, any> || {}
          })
          break
        case 'PUSH':
          result = await this.pushService.send({
            userId: notification.userId,
            title: notification.title,
            content: notification.content,
            metadata: notification.metadata as Record<string, any> || {}
          })
          break
        default:
          throw new Error(`Unsupported notification channel: ${notification.channel}`)
      }

      // 更新发送结果
      await prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: result.success ? 'DELIVERED' : 'FAILED',
          deliveredAt: result.deliveredAt,
          externalId: result.externalId,
          errorMessage: result.errorMessage
        }
      })

      // 如果发送失败，安排重试
      if (!result.success) {
        await this.scheduleRetry(notificationId)
      }

      this.logger.info(`Notification ${notificationId} sent`, { result })
    } catch (error) {
      this.logger.error(`Failed to send notification ${notificationId}`, { error })
      
      // 更新为失败状态
      await prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      })

      // 安排重试
      await this.scheduleRetry(notificationId)
    }
  }

  /**
   * 安排重试
   */
  private async scheduleRetry(notificationId: string): Promise<void> {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    })

    if (!notification || notification.retryCount >= notification.maxRetries) {
      return
    }

    const retryCount = notification.retryCount + 1
    const retryInterval = this.retryConfig.retryIntervals[Math.min(retryCount - 1, this.retryConfig.retryIntervals.length - 1)]
    const nextRetryAt = new Date(Date.now() + retryInterval * 1000)

    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        retryCount,
        lastRetryAt: new Date(),
        scheduledAt: nextRetryAt,
        status: 'PENDING'
      }
    })

    this.logger.info(`Scheduled retry ${retryCount} for notification ${notificationId}`, {
      nextRetryAt,
      retryInterval
    })
  }

  /**
   * 获取用户通知配置
   */
  private async getUserNotificationConfig(userId: string, channel: string) {
    const config = await prisma.notificationConfig.findUnique({
      where: {
        userId_channel: {
          userId,
          channel: channel as any
        }
      }
    })

    // 如果用户没有配置，返回默认启用状态
    if (!config) {
      return {
        isEnabled: true,
        preferences: {}
      }
    }

    return config
  }

  /**
   * 获取通知模板
   */
  private async getNotificationTemplate(templateId: string) {
    return await prisma.notificationTemplate.findUnique({
      where: { id: templateId }
    })
  }

  /**
   * 构建模板变量
   */
  private async buildTemplateVariables(request: CreateNotificationRequest): Promise<NotificationTemplateVariables> {
    const variables: NotificationTemplateVariables = {}

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: request.userId }
    })
    if (user) {
      variables.userName = user.name || user.username || user.email
    }

    // 获取订单信息
    if (request.orderId) {
      const order = await prisma.order.findUnique({
        where: { id: request.orderId }
      })
      if (order) {
        variables.orderAmount = order.totalAmount
        variables.orderNumber = order.id
        variables.bookingDate = order.bookingDate?.toISOString()
        variables.contactName = order.contactName
        variables.contactPhone = order.contactPhone
      }
    }

    // 合并元数据
    if (request.metadata) {
      Object.assign(variables, request.metadata)
    }

    return variables
  }

  /**
   * 处理待发送的通知（定时任务调用）
   */
  async processPendingNotifications(): Promise<void> {
    const pendingNotifications = await prisma.notification.findMany({
      where: {
        status: 'PENDING',
        scheduledAt: {
          lte: new Date()
        }
      },
      orderBy: {
        priority: 'desc'
      },
      take: 100 // 批量处理
    })

    for (const notification of pendingNotifications) {
      try {
        await this.sendNotification(notification.id)
      } catch (error) {
        this.logger.error(`Failed to process notification ${notification.id}`, { error })
      }
    }
  }

  /**
   * 显示应用内弹窗通知
   * 与新的苹果风格通知弹窗系统集成
   */
  async showModalNotification(
    userId: string, 
    notification: {
      title: string
      message: string
      type: 'success' | 'error' | 'warning' | 'info'
      priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
      actions?: Array<{ id: string; label: string }>
      metadata?: string
    }
  ): Promise<void> {
    try {
      // 创建应用内通知记录
      const inAppNotification = await prisma.notification.create({
        data: {
          userId,
          type: this.mapNotificationType(notification.type),
          channel: 'IN_APP',
          priority: notification.priority || 'MEDIUM',
          title: notification.title,
          content: notification.message,
          metadata: {
            modalType: notification.type,
            actions: notification.actions,
            extraInfo: notification.metadata
          },
          status: 'PENDING'
        }
      })

      // 发送到应用内通知服务
      await this.inAppService.send({
        userId,
        title: notification.title,
        content: notification.message,
        metadata: {
          notificationId: inAppNotification.id,
          modalType: notification.type,
          priority: notification.priority,
          actions: notification.actions,
          extraInfo: notification.metadata
        }
      })

      // 更新状态为已发送
      await prisma.notification.update({
        where: { id: inAppNotification.id },
        data: { 
          status: 'DELIVERED',
          sentAt: new Date(),
          deliveredAt: new Date()
        }
      })

      this.logger.info(`Modal notification sent to user ${userId}`, {
        notificationId: inAppNotification.id,
        type: notification.type
      })
    } catch (error) {
      this.logger.error('Failed to show modal notification', { error, userId, notification })
      throw error
    }
  }

  /**
   * 映射通知类型
   */
  private mapNotificationType(type: 'success' | 'error' | 'warning' | 'info') {
    const typeMap = {
      success: 'SUCCESS',
      error: 'ERROR', 
      warning: 'WARNING',
      info: 'INFO'
    }
    return typeMap[type] || 'INFO'
  }

  /**
   * 获取通知统计
   */
  async getNotificationStats(userId?: string, startDate?: Date, endDate?: Date) {
    const where: any = {}
    
    if (userId) {
      where.userId = userId
    }
    
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = startDate
      if (endDate) where.createdAt.lte = endDate
    }

    const [total, sent, delivered, failed, pending] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { ...where, status: 'SENT' } }),
      prisma.notification.count({ where: { ...where, status: 'DELIVERED' } }),
      prisma.notification.count({ where: { ...where, status: 'FAILED' } }),
      prisma.notification.count({ where: { ...where, status: 'PENDING' } })
    ])

    return {
      total,
      sent,
      delivered,
      failed,
      pending,
      successRate: total > 0 ? (delivered / total) * 100 : 0,
      deliveryRate: sent > 0 ? (delivered / sent) * 100 : 0
    }
  }
}