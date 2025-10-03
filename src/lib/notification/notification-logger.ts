import { prisma } from '@/lib/prisma'
import { NotificationType, NotificationChannel, NotificationStatus, NotificationPriority } from '@prisma/client'

/**
 * 通知日志记录接口
 */
export interface NotificationLogEntry {
  id: string
  userId: string
  orderId?: string
  type: NotificationType
  channel: NotificationChannel
  status: NotificationStatus
  priority: NotificationPriority
  title: string
  content: string
  metadata?: any
  templateId?: string
  sentAt?: Date
  deliveredAt?: Date
  readAt?: Date
  errorMessage?: string
  retryCount: number
  createdAt: Date
  updatedAt: Date
}

/**
 * 通知日志查询条件
 */
export interface NotificationLogQuery {
  userId?: string
  orderId?: string
  type?: NotificationType
  channel?: NotificationChannel
  status?: NotificationStatus
  priority?: NotificationPriority
  startDate?: Date
  endDate?: Date
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'sentAt' | 'deliveredAt' | 'readAt'
  sortOrder?: 'asc' | 'desc'
}

/**
 * 通知统计数据
 */
export interface NotificationStats {
  totalSent: number
  totalDelivered: number
  totalRead: number
  totalFailed: number
  deliveryRate: number
  readRate: number
  channelStats: Record<NotificationChannel, {
    sent: number
    delivered: number
    failed: number
    deliveryRate: number
  }>
  typeStats: Record<NotificationType, {
    sent: number
    delivered: number
    failed: number
    deliveryRate: number
  }>
  dailyStats: Array<{
    date: string
    sent: number
    delivered: number
    failed: number
  }>
}

/**
 * 通知日志记录服务
 */
export class NotificationLogger {
  /**
   * 记录通知发送日志
   * @param logData 日志数据
   * @returns 日志记录
   */
  async logNotification(logData: {
    userId: string
    orderId?: string
    type: NotificationType
    channel: NotificationChannel
    status: NotificationStatus
    priority: NotificationPriority
    title: string
    content: string
    metadata?: any
    templateId?: string
    errorMessage?: string
    retryCount?: number
  }): Promise<NotificationLogEntry> {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: logData.userId,
          orderId: logData.orderId,
          type: logData.type,
          channel: logData.channel,
          status: logData.status,
          priority: logData.priority,
          title: logData.title,
          content: logData.content,
          metadata: logData.metadata || {},
          templateId: logData.templateId,
          errorMessage: logData.errorMessage,
          retryCount: logData.retryCount || 0,
          sentAt: logData.status === NotificationStatus.SENT ? new Date() : null
        }
      })

      return notification as NotificationLogEntry
    } catch (error) {
      console.error('记录通知日志失败:', error)
      throw new Error('记录通知日志失败')
    }
  }

  /**
   * 更新通知状态
   * @param notificationId 通知ID
   * @param status 新状态
   * @param errorMessage 错误信息（可选）
   * @returns 更新后的通知记录
   */
  async updateNotificationStatus(
    notificationId: string,
    status: NotificationStatus,
    errorMessage?: string
  ): Promise<NotificationLogEntry> {
    try {
      const updateData: any = {
        status,
        updatedAt: new Date()
      }

      if (status === NotificationStatus.DELIVERED) {
        updateData.deliveredAt = new Date()
      } else if (status === NotificationStatus.FAILED && errorMessage) {
        updateData.errorMessage = errorMessage
      }

      const notification = await prisma.notification.update({
        where: { id: notificationId },
        data: updateData
      })

      return notification as NotificationLogEntry
    } catch (error) {
      console.error('更新通知状态失败:', error)
      throw new Error('更新通知状态失败')
    }
  }

  /**
   * 增加重试次数
   * @param notificationId 通知ID
   * @returns 更新后的通知记录
   */
  async incrementRetryCount(notificationId: string): Promise<NotificationLogEntry> {
    try {
      const notification = await prisma.notification.update({
        where: { id: notificationId },
        data: {
          retryCount: {
            increment: 1
          },
          updatedAt: new Date()
        }
      })

      return notification as NotificationLogEntry
    } catch (error) {
      console.error('增加重试次数失败:', error)
      throw new Error('增加重试次数失败')
    }
  }

  /**
   * 查询通知日志
   * @param query 查询条件
   * @returns 通知日志列表和总数
   */
  async queryNotificationLogs(query: NotificationLogQuery): Promise<{
    logs: NotificationLogEntry[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    try {
      const {
        userId,
        orderId,
        type,
        channel,
        status,
        priority,
        startDate,
        endDate,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = query

      const where: any = {}

      if (userId) where.userId = userId
      if (orderId) where.orderId = orderId
      if (type) where.type = type
      if (channel) where.channel = channel
      if (status) where.status = status
      if (priority) where.priority = priority

      if (startDate || endDate) {
        where.createdAt = {}
        if (startDate) where.createdAt.gte = startDate
        if (endDate) where.createdAt.lte = endDate
      }

      const [logs, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: {
            [sortBy]: sortOrder
          },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            order: {
              select: {
                id: true,
                type: true,
                status: true,
                totalAmount: true
              }
            },
            template: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }),
        prisma.notification.count({ where })
      ])

      return {
        logs: logs as NotificationLogEntry[],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    } catch (error) {
      console.error('查询通知日志失败:', error)
      throw new Error('查询通知日志失败')
    }
  }

  /**
   * 获取通知统计数据
   * @param userId 用户ID（可选，不传则获取全局统计）
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 统计数据
   */
  async getNotificationStats(
    userId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<NotificationStats> {
    try {
      const where: any = {}
      
      if (userId) where.userId = userId
      
      if (startDate || endDate) {
        where.createdAt = {}
        if (startDate) where.createdAt.gte = startDate
        if (endDate) where.createdAt.lte = endDate
      }

      // 基础统计
      const [totalSent, totalDelivered, totalRead, totalFailed] = await Promise.all([
        prisma.notification.count({
          where: { ...where, status: { in: [NotificationStatus.SENT, NotificationStatus.DELIVERED] } }
        }),
        prisma.notification.count({
          where: { ...where, status: NotificationStatus.DELIVERED }
        }),
        prisma.notification.count({
          where: { ...where, status: NotificationStatus.DELIVERED }
        }),
        prisma.notification.count({
          where: { ...where, status: NotificationStatus.FAILED }
        })
      ])

      // 渠道统计
      const channelStats: Record<NotificationChannel, any> = {} as any
      for (const channel of Object.values(NotificationChannel)) {
        const [sent, delivered, failed] = await Promise.all([
          prisma.notification.count({
            where: { ...where, channel, status: { in: [NotificationStatus.SENT, NotificationStatus.DELIVERED] } }
          }),
          prisma.notification.count({
            where: { ...where, channel, status: NotificationStatus.DELIVERED }
          }),
          prisma.notification.count({
            where: { ...where, channel, status: NotificationStatus.FAILED }
          })
        ])

        channelStats[channel] = {
          sent,
          delivered,
          failed,
          deliveryRate: sent > 0 ? (delivered / sent) * 100 : 0
        }
      }

      // 类型统计
      const typeStats: Record<NotificationType, any> = {} as any
      for (const type of Object.values(NotificationType)) {
        const [sent, delivered, failed] = await Promise.all([
          prisma.notification.count({
            where: { ...where, type, status: { in: [NotificationStatus.SENT, NotificationStatus.DELIVERED] } }
          }),
          prisma.notification.count({
            where: { ...where, type, status: NotificationStatus.DELIVERED }
          }),
          prisma.notification.count({
            where: { ...where, type, status: NotificationStatus.FAILED }
          })
        ])

        typeStats[type] = {
          sent,
          delivered,
          failed,
          deliveryRate: sent > 0 ? (delivered / sent) * 100 : 0
        }
      }

      // 每日统计（最近7天）
      const dailyStats = []
      const now = new Date()
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        date.setHours(0, 0, 0, 0)
        
        const nextDate = new Date(date)
        nextDate.setDate(nextDate.getDate() + 1)

        const dayWhere = {
          ...where,
          createdAt: {
            gte: date,
            lt: nextDate
          }
        }

        const [sent, delivered, failed] = await Promise.all([
          prisma.notification.count({
            where: { ...dayWhere, status: { in: [NotificationStatus.SENT, NotificationStatus.DELIVERED] } }
          }),
          prisma.notification.count({
            where: { ...dayWhere, status: NotificationStatus.DELIVERED }
          }),
          prisma.notification.count({
            where: { ...dayWhere, status: NotificationStatus.FAILED }
          })
        ])

        dailyStats.push({
          date: date.toISOString().split('T')[0],
          sent,
          delivered,
          failed
        })
      }

      return {
        totalSent,
        totalDelivered,
        totalRead,
        totalFailed,
        deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
        readRate: totalDelivered > 0 ? (totalDelivered / totalDelivered) * 100 : 0,
        channelStats,
        typeStats,
        dailyStats
      }
    } catch (error) {
      console.error('获取通知统计失败:', error)
      throw new Error('获取通知统计失败')
    }
  }

  /**
   * 清理过期的通知日志
   * @param daysToKeep 保留天数
   * @returns 清理的记录数
   */
  async cleanupOldLogs(daysToKeep: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      const result = await prisma.notification.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate
          },
          status: {
            in: [NotificationStatus.DELIVERED, NotificationStatus.FAILED]
          }
        }
      })

      console.log(`清理了 ${result.count} 条过期通知日志`)
      return result.count
    } catch (error) {
      console.error('清理通知日志失败:', error)
      throw new Error('清理通知日志失败')
    }
  }
}

// 导出单例实例
export const notificationLogger = new NotificationLogger()