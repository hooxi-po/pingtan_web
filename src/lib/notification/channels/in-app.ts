import { PrismaClient } from '@prisma/client'
import { NotificationSendResult } from '../types'

const prisma = new PrismaClient()

interface InAppSendRequest {
  userId: string
  title: string
  content: string
  metadata?: Record<string, any>
}

export class InAppService {
  async send(request: InAppSendRequest): Promise<NotificationSendResult> {
    try {
      // 站内信直接存储到数据库，不需要外部API调用
      // 通知记录已经在主服务中创建，这里只需要标记为已发送
      
      // 可以在这里添加实时推送逻辑，比如WebSocket推送
      await this.pushToWebSocket(request)
      
      return {
        success: true,
        externalId: `in_app_${Date.now()}`,
        deliveredAt: new Date()
      }
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown in-app notification error'
      }
    }
  }

  /**
   * 通过WebSocket推送实时通知
   */
  private async pushToWebSocket(request: InAppSendRequest): Promise<void> {
    try {
      // 这里应该集成WebSocket服务，向在线用户推送实时通知
      // 示例实现：
      
      // 1. 检查用户是否在线
      const isUserOnline = await this.checkUserOnlineStatus(request.userId)
      
      if (isUserOnline) {
        // 2. 发送WebSocket消息
        await this.sendWebSocketMessage(request.userId, {
          type: 'notification',
          data: {
            title: request.title,
            content: request.content,
            timestamp: new Date().toISOString(),
            metadata: request.metadata
          }
        })
      }
    } catch (error) {
      console.error('Failed to push WebSocket notification:', error)
      // WebSocket推送失败不影响站内信的存储
    }
  }

  /**
   * 检查用户在线状态
   */
  private async checkUserOnlineStatus(userId: string): Promise<boolean> {
    // 这里应该检查用户的在线状态
    // 可以通过Redis存储用户会话信息，或者查询WebSocket连接池
    
    // 模拟实现
    return Math.random() > 0.3 // 70%的用户在线概率
  }

  /**
   * 发送WebSocket消息
   */
  private async sendWebSocketMessage(userId: string, message: any): Promise<void> {
    // 这里应该通过WebSocket服务发送消息
    // 可以使用Socket.IO、ws库或者其他WebSocket实现
    
    console.log(`WebSocket message sent to user ${userId}:`, message)
    
    // 模拟发送延迟
    await new Promise(resolve => setTimeout(resolve, 10))
  }

  /**
   * 获取用户未读通知数量
   */
  async getUnreadCount(userId: string): Promise<number> {
    return await prisma.notification.count({
      where: {
        userId,
        channel: 'IN_APP',
        readAt: null,
        status: 'DELIVERED'
      }
    })
  }

  /**
   * 标记通知为已读
   */
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId,
          channel: 'IN_APP'
        },
        data: {
          readAt: new Date()
        }
      })
      
      return result.count > 0
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      return false
    }
  }

  /**
   * 批量标记通知为已读
   */
  async markMultipleAsRead(notificationIds: string[], userId: string): Promise<number> {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId,
          channel: 'IN_APP',
          readAt: null
        },
        data: {
          readAt: new Date()
        }
      })
      
      return result.count
    } catch (error) {
      console.error('Failed to mark notifications as read:', error)
      return 0
    }
  }

  /**
   * 标记所有通知为已读
   */
  async markAllAsRead(userId: string): Promise<number> {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId,
          channel: 'IN_APP',
          readAt: null
        },
        data: {
          readAt: new Date()
        }
      })
      
      return result.count
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
      return 0
    }
  }

  /**
   * 获取用户的站内信列表
   */
  async getUserNotifications(
    userId: string,
    options: {
      page?: number
      limit?: number
      unreadOnly?: boolean
      type?: string
    } = {}
  ) {
    const { page = 1, limit = 20, unreadOnly = false, type } = options
    const skip = (page - 1) * limit

    const where: any = {
      userId,
      channel: 'IN_APP',
      status: 'DELIVERED'
    }

    if (unreadOnly) {
      where.readAt = null
    }

    if (type) {
      where.type = type
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          type: true,
          title: true,
          content: true,
          metadata: true,
          createdAt: true,
          readAt: true,
          priority: true
        }
      }),
      prisma.notification.count({ where })
    ])

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  /**
   * 删除通知
   */
  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    try {
      const result = await prisma.notification.deleteMany({
        where: {
          id: notificationId,
          userId,
          channel: 'IN_APP'
        }
      })
      
      return result.count > 0
    } catch (error) {
      console.error('Failed to delete notification:', error)
      return false
    }
  }

  /**
   * 批量删除通知
   */
  async deleteMultipleNotifications(notificationIds: string[], userId: string): Promise<number> {
    try {
      const result = await prisma.notification.deleteMany({
        where: {
          id: { in: notificationIds },
          userId,
          channel: 'IN_APP'
        }
      })
      
      return result.count
    } catch (error) {
      console.error('Failed to delete notifications:', error)
      return 0
    }
  }

  /**
   * 清空所有已读通知
   */
  async clearReadNotifications(userId: string): Promise<number> {
    try {
      const result = await prisma.notification.deleteMany({
        where: {
          userId,
          channel: 'IN_APP',
          readAt: { not: null }
        }
      })
      
      return result.count
    } catch (error) {
      console.error('Failed to clear read notifications:', error)
      return 0
    }
  }
}