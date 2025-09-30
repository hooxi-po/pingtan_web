import { NotificationType, NotificationChannel, NotificationPriority, PaymentStatus, OrderStatus } from '@prisma/client'
import { notificationService } from './index'
import type { CreateNotificationRequest } from './types'

/**
 * 支付相关的通知类型映射
 */
const PAYMENT_NOTIFICATION_TYPES = {
  PAYMENT_SUCCESS: NotificationType.PAYMENT_SUCCESS,
  PAYMENT_FAILED: NotificationType.PAYMENT_FAILED,
  REFUND_SUCCESS: NotificationType.ORDER_REFUNDED,
  ORDER_CONFIRMED: NotificationType.ORDER_CONFIRMED,
  ORDER_CANCELLED: NotificationType.ORDER_CANCELLED
} as const

/**
 * 支付状态变更事件接口
 */
export interface PaymentStatusChangeEvent {
  orderId: string
  userId: string
  paymentId?: string
  oldStatus: PaymentStatus | OrderStatus
  newStatus: PaymentStatus | OrderStatus
  amount: number
  currency: string
  paymentMethod?: string
  failureReason?: string
  refundAmount?: number
  metadata?: Record<string, any>
  timestamp: Date
}

/**
 * 支付通知集成服务
 */
export class PaymentNotificationIntegration {
  /**
   * 处理支付状态变更事件
   */
  static async handlePaymentStatusChange(event: PaymentStatusChangeEvent): Promise<void> {
    try {
      const notificationType = this.getNotificationTypeFromStatus(event.newStatus)
      if (!notificationType) {
        console.log(`No notification type for status: ${event.newStatus}`)
        return
      }

      // 构建通知请求
      const notificationRequest: CreateNotificationRequest = {
        userId: event.userId,
        orderId: event.orderId,
        type: notificationType,
        channel: NotificationChannel.IN_APP, // 默认使用应用内通知
        priority: this.getNotificationPriority(notificationType),
        title: this.getNotificationTitle(notificationType, event),
        content: this.getNotificationContent(notificationType, event),
        templateId: this.getTemplateId(notificationType),
        metadata: this.buildTemplateVariables(event)
      }

      // 发送到多个渠道
      const channels = this.getNotificationChannels(notificationType)
      for (const channel of channels) {
        await notificationService.createAndSendNotification({
          ...notificationRequest,
          channel
        })
      }

      console.log(`Payment notification sent for order ${event.orderId}, status: ${event.newStatus}`)
    } catch (error) {
      console.error('Failed to handle payment status change:', error)
      throw error
    }
  }

  /**
   * 批量处理支付状态变更事件
   */
  static async handleBatchPaymentStatusChanges(events: PaymentStatusChangeEvent[]): Promise<void> {
    try {
      for (const event of events) {
        await this.handlePaymentStatusChange(event)
      }
      
      console.log(`Batch payment notifications sent for ${events.length} events`)
    } catch (error) {
      console.error('Failed to handle batch payment status changes:', error)
      throw error
    }
  }

  /**
   * 根据支付状态获取通知类型
   */
  private static getNotificationTypeFromStatus(status: PaymentStatus | OrderStatus): NotificationType | null {
    switch (status) {
      case PaymentStatus.PAID:
        return PAYMENT_NOTIFICATION_TYPES.PAYMENT_SUCCESS
      case PaymentStatus.FAILED:
        return PAYMENT_NOTIFICATION_TYPES.PAYMENT_FAILED
      case PaymentStatus.REFUNDED:
        return PAYMENT_NOTIFICATION_TYPES.REFUND_SUCCESS
      case OrderStatus.CONFIRMED:
        return PAYMENT_NOTIFICATION_TYPES.ORDER_CONFIRMED
      case OrderStatus.CANCELLED:
        return PAYMENT_NOTIFICATION_TYPES.ORDER_CANCELLED
      default:
        return null
    }
  }

  /**
   * 生成通知标题
   */
  private static getNotificationTitle(type: NotificationType, event: PaymentStatusChangeEvent): string {
    const titles: Partial<Record<NotificationType, string>> = {
      [NotificationType.PAYMENT_SUCCESS]: '支付成功',
      [NotificationType.PAYMENT_FAILED]: '支付失败',
      [NotificationType.ORDER_REFUNDED]: '退款成功',
      [NotificationType.ORDER_CONFIRMED]: '订单确认',
      [NotificationType.ORDER_CANCELLED]: '订单取消'
    }
    return titles[type] || '支付通知'
  }

  /**
   * 获取通知内容
   */
  private static getNotificationContent(type: NotificationType, event: PaymentStatusChangeEvent): string {
    const amount = `¥${event.amount.toFixed(2)}`
    
    switch (type) {
      case NotificationType.PAYMENT_SUCCESS:
        return `您的订单 ${event.orderId} 支付成功，金额 ${amount}，感谢您的购买！`
      case NotificationType.PAYMENT_FAILED:
        return `您的订单 ${event.orderId} 支付失败，金额 ${amount}。${event.failureReason ? `失败原因：${event.failureReason}` : '请重新尝试支付。'}`
      case NotificationType.ORDER_REFUNDED:
        const refundAmount = event.refundAmount ? `¥${event.refundAmount.toFixed(2)}` : amount
        return `您的订单 ${event.orderId} 退款成功，退款金额 ${refundAmount}，预计3-5个工作日到账。`
      case NotificationType.ORDER_CONFIRMED:
        return `您的订单 ${event.orderId} 已确认，金额 ${amount}，我们将尽快为您安排。`
      case NotificationType.ORDER_CANCELLED:
        return `您的订单 ${event.orderId} 已取消，如有疑问请联系客服。`
      default:
        return `您的订单 ${event.orderId} 状态已更新。`
    }
  }

  /**
   * 获取通知渠道
   */
  private static getNotificationChannels(type: NotificationType): NotificationChannel[] {
    // 根据通知类型确定发送渠道
    switch (type) {
      case NotificationType.PAYMENT_SUCCESS:
      case NotificationType.ORDER_REFUNDED:
        return [NotificationChannel.SMS, NotificationChannel.EMAIL, NotificationChannel.IN_APP, NotificationChannel.PUSH] // 重要通知，全渠道发送
      case NotificationType.PAYMENT_FAILED:
        return [NotificationChannel.SMS, NotificationChannel.IN_APP, NotificationChannel.PUSH] // 失败通知，及时提醒
      case NotificationType.ORDER_CONFIRMED:
      case NotificationType.ORDER_CANCELLED:
        return [NotificationChannel.EMAIL, NotificationChannel.IN_APP] // 订单状态，邮件和应用内通知
      default:
        return [NotificationChannel.IN_APP]
    }
  }

  /**
   * 获取通知优先级
   */
  private static getNotificationPriority(type: NotificationType): NotificationPriority {
    switch (type) {
      case NotificationType.PAYMENT_SUCCESS:
      case NotificationType.PAYMENT_FAILED:
        return NotificationPriority.HIGH
      case NotificationType.ORDER_REFUNDED:
        return NotificationPriority.HIGH
      case NotificationType.ORDER_CONFIRMED:
        return NotificationPriority.NORMAL
      case NotificationType.ORDER_CANCELLED:
        return NotificationPriority.LOW
      default:
        return NotificationPriority.NORMAL
    }
  }

  /**
   * 获取模板ID
   */
  private static getTemplateId(type: NotificationType): string | undefined {
    const templateIds: Partial<Record<NotificationType, string>> = {
      [NotificationType.PAYMENT_SUCCESS]: 'payment_success_template',
      [NotificationType.PAYMENT_FAILED]: 'payment_failed_template',
      [NotificationType.ORDER_REFUNDED]: 'refund_success_template',
      [NotificationType.ORDER_CONFIRMED]: 'order_confirmed_template'
    }
    return templateIds[type]
  }

  /**
   * 构建模板变量
   */
  private static buildTemplateVariables(event: PaymentStatusChangeEvent): Record<string, any> {
    return {
      orderId: event.orderId,
      amount: event.amount,
      currency: event.currency,
      formattedAmount: `¥${event.amount.toFixed(2)}`,
      paymentMethod: event.paymentMethod || '未知',
      failureReason: event.failureReason || '',
      refundAmount: event.refundAmount || 0,
      formattedRefundAmount: event.refundAmount ? `¥${event.refundAmount.toFixed(2)}` : '',
      timestamp: event.timestamp.toLocaleString('zh-CN'),
      date: event.timestamp.toLocaleDateString('zh-CN'),
      time: event.timestamp.toLocaleTimeString('zh-CN')
    }
  }
}

/**
 * 支付状态变更钩子函数
 * 在支付系统中调用此函数来触发通知
 */
export async function onPaymentStatusChange(event: PaymentStatusChangeEvent): Promise<void> {
  await PaymentNotificationIntegration.handlePaymentStatusChange(event)
}

/**
 * 批量支付状态变更钩子函数
 */
export async function onBatchPaymentStatusChange(events: PaymentStatusChangeEvent[]): Promise<void> {
  await PaymentNotificationIntegration.handleBatchPaymentStatusChanges(events)
}

/**
 * 创建支付状态变更事件的辅助函数
 */
export function createPaymentStatusChangeEvent(
  orderId: string,
  userId: string,
  oldStatus: PaymentStatus | OrderStatus,
  newStatus: PaymentStatus | OrderStatus,
  amount: number,
  options: Partial<PaymentStatusChangeEvent> = {}
): PaymentStatusChangeEvent {
  return {
    orderId,
    userId,
    oldStatus,
    newStatus,
    amount,
    currency: 'CNY',
    timestamp: new Date(),
    ...options
  }
}