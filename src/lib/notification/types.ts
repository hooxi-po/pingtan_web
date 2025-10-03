import { 
  NotificationType, 
  NotificationChannel, 
  NotificationStatus, 
  NotificationPriority 
} from '@prisma/client'

// 通知创建请求接口
export interface CreateNotificationRequest {
  userId: string
  orderId?: string
  type: NotificationType
  channel: NotificationChannel
  priority?: NotificationPriority
  title: string
  content: string
  templateId?: string
  metadata?: Record<string, any>
  scheduledAt?: Date
}

// 通知查询参数接口
export interface NotificationQueryParams {
  userId?: string
  type?: NotificationType
  channel?: NotificationChannel
  status?: NotificationStatus
  priority?: NotificationPriority
  startDate?: Date
  endDate?: Date
  page?: number
  limit?: number
}

// 通知发送结果接口
export interface NotificationSendResult {
  success: boolean
  externalId?: string
  errorMessage?: string
  deliveredAt?: Date
}

// 通知模板变量接口
export interface NotificationTemplateVariables {
  userName?: string
  orderAmount?: number
  orderNumber?: string
  bookingDate?: string
  contactName?: string
  contactPhone?: string
  [key: string]: any
}

// 通知配置接口
export interface NotificationUserConfig {
  userId: string
  channel: NotificationChannel
  isEnabled: boolean
  preferences?: {
    quietHours?: {
      start: string // HH:mm format
      end: string   // HH:mm format
    }
    frequency?: 'immediate' | 'hourly' | 'daily'
    categories?: NotificationType[]
  }
}

// 重试配置接口
export interface RetryConfig {
  maxRetries: number
  retryIntervals: number[] // 重试间隔时间（秒）
  exponentialBackoff: boolean
}

// 通知服务配置接口
export interface NotificationServiceConfig {
  sms: {
    provider: 'aliyun' | 'tencent' | 'twilio'
    apiKey: string
    apiSecret: string
    signName: string
    templateCode: string
  }
  email: {
    provider: 'smtp' | 'sendgrid' | 'ses'
    host?: string
    port?: number
    username?: string
    password?: string
    apiKey?: string
    from: string
  }
  push: {
    provider: 'fcm' | 'apns' | 'jpush'
    apiKey: string
    apiSecret?: string
    bundleId?: string
  }
}

// 预订成功通知专用接口
export interface BookingConfirmationData {
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
  specialRequests?: string
  cancellationPolicy?: string
  contactInfo?: {
    phone: string
    email: string
    address?: string
  }
}

// 预订通知创建请求接口
export interface CreateBookingNotificationRequest {
  userId: string
  orderId: string
  bookingData: BookingConfirmationData
  channel?: NotificationChannel
  priority?: NotificationPriority
  scheduledAt?: Date
}

// 站内通知UI数据接口
export interface InAppNotificationData {
  id: string
  title: string
  content: string
  type: NotificationType
  priority: NotificationPriority
  isRead: boolean
  createdAt: Date
  metadata?: {
    confirmationNumber?: string
    orderId?: string
    actionUrl?: string
    actionLabel?: string
    amount?: number
    currency?: string
  }
}

// 通知统计接口
export interface NotificationStats {
  total: number
  sent: number
  delivered: number
  failed: number
  pending: number
  successRate: number
  deliveryRate: number
}