import { NotificationService } from './service'
import { NotificationChannel, NotificationPriority, NotificationType } from '@prisma/client'
import { 
  BookingConfirmationData, 
  CreateBookingNotificationRequest,
  NotificationSendResult 
} from './types'

// 预订状态变更数据接口
export interface BookingStatusChangeData {
  confirmationNumber: string
  serviceName: string
  serviceType: 'attraction' | 'accommodation' | 'restaurant' | 'package' | 'experience'
  serviceDescription: string
  bookingDate: string
  bookingTime?: string
  totalAmount: number
  currency: string
  customerName: string
  customerPhone?: string
  customerEmail?: string
  oldStatus: string
  newStatus: string
  changeReason?: string
  refundAmount?: number
  contactInfo?: {
    phone: string
    email: string
    address?: string
  }
}

// 预订状态变更通知请求接口
export interface BookingStatusChangeRequest {
  userId: string
  orderId: string
  bookingData: BookingStatusChangeData
  channel?: NotificationChannel
  priority?: NotificationPriority
  scheduledAt?: Date
}

/**
 * 预订成功通知服务
 * 处理用户预订成功后的自动通知发送
 */
export class BookingNotificationService {
  private notificationService: NotificationService

  constructor() {
    // 创建默认配置
    const defaultConfig = {
      sms: {
        provider: 'aliyun' as const,
        apiKey: process.env.ALIYUN_SMS_ACCESS_KEY_ID || '',
        apiSecret: process.env.ALIYUN_SMS_ACCESS_KEY_SECRET || '',
        signName: process.env.ALIYUN_SMS_SIGN_NAME || '平潭旅游',
        templateCode: process.env.ALIYUN_SMS_TEMPLATE_CODE || 'SMS_123456789'
      },
      email: {
        provider: 'smtp' as const,
        host: process.env.SMTP_HOST || 'smtp.qq.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        username: process.env.SMTP_USER || '',
        password: process.env.SMTP_PASS || '',
        from: process.env.SMTP_FROM || 'noreply@pingtan-travel.com'
      },
      push: {
        provider: 'fcm' as const,
        apiKey: process.env.FCM_SERVER_KEY || '',
        apiSecret: process.env.FCM_PROJECT_ID || ''
      }
    }
    
    // 使用PrismaClient实例和配置初始化NotificationService
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()
    this.notificationService = new NotificationService(prisma, defaultConfig)
  }

  /**
   * 发送预订确认通知
   * @param request 预订通知请求
   * @returns 通知发送结果
   */
  async sendBookingConfirmation(
    request: CreateBookingNotificationRequest
  ): Promise<NotificationSendResult> {
    try {
      const { userId, orderId, bookingData, channel = NotificationChannel.IN_APP, priority = NotificationPriority.HIGH } = request

      // 生成通知标题
      const title = this.generateNotificationTitle(bookingData)
      
      // 生成通知内容
      const content = this.generateNotificationContent(bookingData)
      
      // 准备元数据
      const metadata = {
        confirmationNumber: bookingData.confirmationNumber,
        orderId,
        serviceType: bookingData.serviceType,
        totalAmount: bookingData.totalAmount,
        currency: bookingData.currency,
        actionUrl: `/orders/${orderId}`,
        actionLabel: '确认订单',
        bookingDate: bookingData.bookingDate,
        bookingTime: bookingData.bookingTime
      }

      // 创建并发送通知
      const notificationId = await this.notificationService.createAndSendNotification({
        userId,
        orderId,
        type: NotificationType.ORDER_CONFIRMED,
        channel,
        priority,
        title,
        content,
        metadata,
        scheduledAt: request.scheduledAt
      })

      return {
        success: true,
        externalId: notificationId
      }
    } catch (error) {
      console.error('发送预订确认通知失败:', error)
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : '未知错误'
      }
    }
  }

  /**
   * 生成通知标题
   * @param bookingData 预订数据
   * @returns 通知标题
   */
  private generateNotificationTitle(bookingData: BookingConfirmationData): string {
    const serviceTypeMap = {
      attraction: '景点门票',
      accommodation: '住宿预订',
      restaurant: '餐厅预订',
      package: '旅游套餐',
      experience: '体验活动'
    }

    const serviceTypeName = serviceTypeMap[bookingData.serviceType] || '服务'
    return `🎉 ${serviceTypeName}预订成功！`
  }

  /**
   * 发送预订状态变更通知
   * @param request 预订状态变更通知请求
   * @returns 通知发送结果
   */
  async sendBookingStatusChange(
    request: BookingStatusChangeRequest
  ): Promise<NotificationSendResult> {
    try {
      const { userId, orderId, bookingData, channel = NotificationChannel.IN_APP, priority = NotificationPriority.HIGH } = request

      // 生成通知标题
      const title = this.generateStatusChangeTitle(bookingData)
      
      // 生成通知内容
      const content = this.generateStatusChangeContent(bookingData)
      
      // 确定通知类型
      const notificationType = this.getNotificationTypeByStatus(bookingData.newStatus)
      
      // 准备元数据
      const metadata = {
        confirmationNumber: bookingData.confirmationNumber,
        orderId,
        serviceType: bookingData.serviceType,
        totalAmount: bookingData.totalAmount,
        currency: bookingData.currency,
        oldStatus: bookingData.oldStatus,
        newStatus: bookingData.newStatus,
        changeReason: bookingData.changeReason,
        refundAmount: bookingData.refundAmount,
        actionUrl: `/orders/${orderId}`,
        actionLabel: '查看详情',
        bookingDate: bookingData.bookingDate,
        bookingTime: bookingData.bookingTime
      }

      // 创建并发送通知
      const notificationId = await this.notificationService.createAndSendNotification({
        userId,
        orderId,
        type: notificationType,
        channel,
        priority,
        title,
        content,
        metadata,
        scheduledAt: request.scheduledAt
      })

      return {
        success: true,
        externalId: notificationId
      }
    } catch (error) {
      console.error('发送预订状态变更通知失败:', error)
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : '未知错误'
      }
    }
  }

  /**
   * 批量发送预订状态变更通知（支持多渠道）
   * @param request 预订状态变更通知请求
   * @param channels 通知渠道列表
   * @returns 各渠道发送结果
   */
  async sendMultiChannelStatusChange(
    request: BookingStatusChangeRequest,
    channels: NotificationChannel[] = [NotificationChannel.IN_APP, NotificationChannel.EMAIL]
  ): Promise<Record<NotificationChannel, NotificationSendResult>> {
    const results: Record<NotificationChannel, NotificationSendResult> = {} as any

    // 并行发送多渠道通知
    const promises = channels.map(async (channel) => {
      const channelRequest = { ...request, channel }
      const result = await this.sendBookingStatusChange(channelRequest)
      results[channel] = result
      return { channel, result }
    })

    await Promise.allSettled(promises)
    return results
  }

  /**
   * 批量发送预订确认通知（支持多渠道）
   * @param request 预订通知请求
   * @param channels 通知渠道列表
   * @returns 各渠道发送结果
   */
  async sendMultiChannelBookingConfirmation(
    request: CreateBookingNotificationRequest,
    channels: NotificationChannel[] = [NotificationChannel.IN_APP, NotificationChannel.EMAIL]
  ): Promise<Record<NotificationChannel, NotificationSendResult>> {
    const results: Record<NotificationChannel, NotificationSendResult> = {} as any

    // 并行发送多渠道通知
    const promises = channels.map(async (channel) => {
      const channelRequest = { ...request, channel }
      const result = await this.sendBookingConfirmation(channelRequest)
      results[channel] = result
      return { channel, result }
    })

    await Promise.allSettled(promises)
    return results
  }

  /**
   * 生成状态变更通知标题
   * @param bookingData 预订状态变更数据
   * @returns 通知标题
   */
  private generateStatusChangeTitle(bookingData: BookingStatusChangeData): string {
    const serviceTypeMap = {
      attraction: '景点门票',
      accommodation: '住宿预订',
      restaurant: '餐厅预订',
      package: '旅游套餐',
      experience: '体验活动'
    }

    const statusMap = {
      'CANCELLED': '❌ 预订已取消',
      'CONFIRMED': '✅ 预订已确认',
      'COMPLETED': '🎉 预订已完成',
      'REFUNDED': '💰 预订已退款',
      'PENDING': '⏳ 预订待处理'
    }

    const serviceTypeName = serviceTypeMap[bookingData.serviceType] || '服务'
    const statusText = statusMap[bookingData.newStatus as keyof typeof statusMap] || `状态已更新为${bookingData.newStatus}`
    
    return `${statusText} - ${serviceTypeName}`
  }

  /**
   * 生成状态变更通知内容
   * @param bookingData 预订状态变更数据
   * @returns 通知内容
   */
  private generateStatusChangeContent(bookingData: BookingStatusChangeData): string {
    const {
      confirmationNumber,
      serviceName,
      serviceDescription,
      bookingDate,
      bookingTime,
      totalAmount,
      currency,
      customerName,
      oldStatus,
      newStatus,
      changeReason,
      refundAmount
    } = bookingData

    let content = `亲爱的 ${customerName}，您的预订状态已更新！\n\n`
    content += `📋 预订确认编号：${confirmationNumber}\n`
    content += `🎯 服务名称：${serviceName}\n`
    content += `📝 服务详情：${serviceDescription}\n`
    content += `📅 预订日期：${bookingDate}\n`
    
    if (bookingTime) {
      content += `⏰ 预订时间：${bookingTime}\n`
    }
    
    content += `💰 订单金额：${currency} ${totalAmount.toFixed(2)}\n`
    content += `🔄 状态变更：${oldStatus} → ${newStatus}\n`
    
    if (changeReason) {
      content += `📝 变更原因：${changeReason}\n`
    }
    
    if (refundAmount && refundAmount > 0) {
      content += `💸 退款金额：${currency} ${refundAmount.toFixed(2)}\n`
    }
    
    content += `\n请点击下方"查看详情"按钮了解更多信息。\n`
    content += `如有疑问，请联系客服。`

    return content
  }

  /**
   * 根据订单状态获取通知类型
   * @param status 订单状态
   * @returns 通知类型
   */
  private getNotificationTypeByStatus(status: string): NotificationType {
    const statusTypeMap: Record<string, NotificationType> = {
      'CONFIRMED': NotificationType.ORDER_CONFIRMED,
      'CANCELLED': NotificationType.ORDER_CANCELLED,
      'COMPLETED': NotificationType.ORDER_CONFIRMED, // 使用确认类型
      'REFUNDED': NotificationType.ORDER_REFUNDED,
      'PENDING': NotificationType.ORDER_CONFIRMED
    }

    return statusTypeMap[status] || NotificationType.ORDER_CONFIRMED
  }

  /**
   * 生成通知内容
   * @param bookingData 预订数据
   * @returns 通知内容
   */
  private generateNotificationContent(bookingData: BookingConfirmationData): string {
    const {
      confirmationNumber,
      serviceName,
      serviceDescription,
      bookingDate,
      bookingTime,
      totalAmount,
      currency,
      customerName
    } = bookingData

    let content = `亲爱的 ${customerName}，您的预订已确认！\n\n`
    content += `📋 预订确认编号：${confirmationNumber}\n`
    content += `🎯 服务名称：${serviceName}\n`
    content += `📝 服务详情：${serviceDescription}\n`
    content += `📅 预订日期：${bookingDate}\n`
    
    if (bookingTime) {
      content += `⏰ 预订时间：${bookingTime}\n`
    }
    
    content += `💰 订单金额：${currency} ${totalAmount.toFixed(2)}\n\n`
    content += `请点击下方"确认订单"按钮查看详细信息。\n`
    content += `如有疑问，请联系客服。`

    return content
  }

  /**
   * 发送预订提醒通知
   * @param orderId 订单ID
   * @param reminderTime 提醒时间（分钟）
   * @returns 通知发送结果
   */
  async sendBookingReminder(
    orderId: string,
    reminderTime: number = 60
  ): Promise<NotificationSendResult> {
    try {
      // 这里应该从数据库获取订单信息
      // 为了示例，我们假设有一个获取订单的方法
      // const order = await this.getOrderById(orderId)
      
      // 计算提醒时间
      const scheduledAt = new Date(Date.now() + reminderTime * 60 * 1000)

      // 创建提醒通知
      const notificationId = await this.notificationService.createAndSendNotification({
        userId: 'user-id', // 应该从订单中获取
        orderId,
        type: NotificationType.BOOKING_REMINDER,
        channel: NotificationChannel.IN_APP,
        priority: NotificationPriority.NORMAL,
        title: '📅 预订提醒',
        content: '您有一个即将到期的预订，请及时确认。',
        scheduledAt
      })

      return {
        success: true,
        externalId: notificationId
      }
    } catch (error) {
      console.error('发送预订提醒失败:', error)
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : '未知错误'
      }
    }
  }
}

// 导出单例实例
export const bookingNotificationService = new BookingNotificationService()