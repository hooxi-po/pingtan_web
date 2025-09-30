// 通知系统统一导出文件
export { NotificationService } from './service'
export { NotificationQueue } from './queue'
export { NotificationMonitor } from './monitoring'
export { TemplateEngine } from './template-engine'
export { Logger } from './logger'
export { NotificationSecurityValidator, NotificationEncryption } from './security'

// 通知渠道服务
export { SMSService } from './channels/sms'
export { EmailService } from './channels/email'
export { InAppService } from './channels/in-app'
export { PushService } from './channels/push'

// 类型定义
export type {
  CreateNotificationRequest,
  NotificationQueryParams,
  NotificationSendResult,
  NotificationTemplateVariables,
  NotificationUserConfig,
  RetryConfig,
  NotificationServiceConfig,
  NotificationStats
} from './types'

// 创建通知系统实例
import { PrismaClient } from '@prisma/client'
import { NotificationService } from './service'
import { NotificationQueue } from './queue'
import { NotificationMonitor } from './monitoring'
import { Logger } from './logger'
import { SMSService } from './channels/sms'
import { EmailService } from './channels/email'
import { InAppService } from './channels/in-app'
import { PushService } from './channels/push'

// 全局实例
const prisma = new PrismaClient()
const logger = new Logger()

// 创建通知服务实例
export const notificationService = new NotificationService(prisma, {
  sms: {
    provider: 'aliyun',
    apiKey: process.env.SMS_API_KEY || '',
    apiSecret: process.env.SMS_API_SECRET || '',
    signName: process.env.SMS_SIGN_NAME || '',
    templateCode: process.env.SMS_TEMPLATE_CODE || ''
  },
  email: {
    provider: 'smtp',
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '587'),
    username: process.env.SMTP_USERNAME || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'noreply@example.com'
  },
  push: {
    provider: 'fcm',
    apiKey: process.env.PUSH_API_KEY || '',
    apiSecret: process.env.PUSH_API_SECRET || '',
    bundleId: process.env.PUSH_BUNDLE_ID || ''
  }
})

// 创建通知队列实例
export const notificationQueue = new NotificationQueue(
  notificationService,
  logger,
  {
    batchSize: 50,
    concurrency: 3,
    pollInterval: 5000,
    retryConfig: {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      jitter: true
    }
  }
)

// 创建监控实例
export const notificationMonitor = new NotificationMonitor(prisma, logger)

// 初始化通知系统
export async function initializeNotificationSystem() {
  try {
    // 启动队列处理
    notificationQueue.start()
    
    // 启动监控
    notificationMonitor.start(60000) // 每分钟收集一次指标
    
    // 添加默认告警规则
    notificationMonitor.addAlertRule({
      id: 'low-success-rate',
      name: '通知成功率过低',
      condition: 'less_than',
      threshold: 0.9,
      enabled: true,
      channels: ['email'],
      cooldown: 300
    })
    
    notificationMonitor.addAlertRule({
      id: 'high-failure-count',
      name: '通知失败数量过高',
      condition: 'greater_than',
      threshold: 100,
      enabled: true,
      channels: ['email'],
      cooldown: 300
    })
    
    notificationMonitor.addAlertRule({
      id: 'slow-delivery',
      name: '通知发送速度过慢',
      condition: 'greater_than',
      threshold: 30000, // 30秒
      enabled: true,
      channels: ['email'],
      cooldown: 300
    })
    
    logger.info('Notification system initialized successfully')
    return true
  } catch (error) {
    logger.error('Failed to initialize notification system', { error })
    return false
  }
}

// 优雅关闭通知系统
export async function shutdownNotificationSystem() {
  try {
    // 停止队列处理
    notificationQueue.stop()
    
    // 停止监控
    notificationMonitor.stop()
    
    // 关闭数据库连接
    await prisma.$disconnect()
    
    logger.info('Notification system shutdown successfully')
    return true
  } catch (error) {
    logger.error('Failed to shutdown notification system', { error })
    return false
  }
}

// 健康检查
export async function healthCheck() {
  try {
    // 检查数据库连接
    await prisma.$queryRaw`SELECT 1`
    
    // 检查队列状态
    const queueStats = await notificationQueue.getQueueStats()
    
    // 检查监控状态
    const healthReport = notificationMonitor.generateHealthReport()
    
    return {
      status: 'healthy',
      database: 'connected',
      queue: {
        running: notificationQueue.isProcessing,
        pending: queueStats.pending,
        processing: queueStats.processing
      },
      monitoring: {
        running: healthReport.isHealthy,
        alerts: healthReport.activeAlerts
      },
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }
  }
}