import { PrismaClient, NotificationStatus, NotificationChannel, NotificationType } from '@prisma/client'
import { Logger } from './logger'
import { EventEmitter } from 'events'

/**
 * 监控指标接口
 */
interface NotificationMetrics {
  timestamp: Date
  totalSent: number
  totalFailed: number
  totalPending: number
  successRate: number
  averageDeliveryTime: number
  channelStats: Record<string, {
    sent: number
    failed: number
    successRate: number
  }>
  typeStats: Record<string, {
    sent: number
    failed: number
    successRate: number
  }>
  errorStats: Record<string, number>
}

/**
 * 告警规则接口
 */
interface AlertRule {
  id: string
  name: string
  condition: string // 告警条件表达式
  threshold: number
  enabled: boolean
  channels: string[] // 告警通知渠道
  cooldown: number // 冷却时间（秒）
  lastTriggered?: Date
}

/**
 * 告警事件接口
 */
interface AlertEvent {
  id: string
  ruleId: string
  ruleName: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  message: string
  timestamp: Date
  resolved: boolean
  resolvedAt?: Date
  metadata: Record<string, any>
}

/**
 * 通知系统监控器
 * 负责监控通知系统的健康状态和性能指标
 */
export class NotificationMonitor extends EventEmitter {
  private readonly prisma: PrismaClient
  private readonly logger: Logger
  private readonly metrics: NotificationMetrics[] = []
  private readonly alerts: AlertEvent[] = []
  private readonly alertRules: Map<string, AlertRule> = new Map()
  private monitoringInterval: NodeJS.Timeout | null = null
  private readonly maxMetricsHistory = 1000 // 最大保存的指标历史数量

  constructor(prisma?: PrismaClient, logger?: Logger) {
    super()
    this.prisma = prisma || new PrismaClient()
    this.logger = logger || new Logger()
    this.initializeDefaultAlertRules()
  }

  /**
   * 启动监控
   */
  start(intervalMs: number = 60000): void { // 默认1分钟
    if (this.monitoringInterval) {
      this.logger.warn('Monitoring is already running')
      return
    }

    this.logger.info('Starting notification monitoring', { intervalMs })

    this.monitoringInterval = setInterval(async () => {
      try {
        await this.collectMetrics()
        await this.checkAlertRules()
      } catch (error) {
        this.logger.error('Error in monitoring cycle', { error: error instanceof Error ? error.message : String(error) })
      }
    }, intervalMs)

    // 立即执行一次
    this.collectMetrics().catch(error => {
      this.logger.error('Error in initial metrics collection', { error: error.message })
    })
  }

  /**
   * 停止监控
   */
  stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
      this.logger.info('Notification monitoring stopped')
    }
  }

  /**
   * 收集指标
   */
  private async collectMetrics(): Promise<void> {
    try {
      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

      // 获取基础统计
      const [totalSent, totalFailed, totalPending] = await Promise.all([
        this.prisma.notification.count({
          where: {
            status: { in: ['SENT', 'DELIVERED'] },
            createdAt: { gte: oneHourAgo }
          }
        }),
        this.prisma.notification.count({
          where: {
            status: 'FAILED',
            createdAt: { gte: oneHourAgo }
          }
        }),
        this.prisma.notification.count({
          where: { status: 'PENDING' }
        })
      ])

      // 计算成功率
      const total = totalSent + totalFailed
      const successRate = total > 0 ? (totalSent / total) * 100 : 100

      // 获取平均投递时间
      const averageDeliveryTime = await this.calculateAverageDeliveryTime(oneHourAgo)

      // 获取渠道统计
      const channelStats = await this.getChannelStats(oneHourAgo)

      // 获取类型统计
      const typeStats = await this.getTypeStats(oneHourAgo)

      // 获取错误统计
      const errorStats = await this.getErrorStats(oneHourAgo)

      const metrics: NotificationMetrics = {
        timestamp: now,
        totalSent,
        totalFailed,
        totalPending,
        successRate,
        averageDeliveryTime,
        channelStats,
        typeStats,
        errorStats
      }

      // 保存指标
      this.metrics.push(metrics)

      // 限制历史数据量
      if (this.metrics.length > this.maxMetricsHistory) {
        this.metrics.splice(0, this.metrics.length - this.maxMetricsHistory)
      }

      // 发出指标事件
      this.emit('metrics', metrics)

      this.logger.debug('Metrics collected', {
        totalSent,
        totalFailed,
        totalPending,
        successRate: successRate.toFixed(2) + '%'
      })
    } catch (error) {
      this.logger.error('Failed to collect metrics', { error: error instanceof Error ? error.message : String(error) })
    }
  }

  /**
   * 计算平均投递时间
   */
  private async calculateAverageDeliveryTime(since: Date): Promise<number> {
    const notifications = await this.prisma.notification.findMany({
      where: {
        status: 'DELIVERED',
        createdAt: { gte: since },
        deliveredAt: { not: null }
      },
      select: {
        createdAt: true,
        deliveredAt: true
      }
    })

    if (notifications.length === 0) return 0

    const totalTime = notifications.reduce((sum, notification) => {
      const deliveryTime = notification.deliveredAt!.getTime() - notification.createdAt.getTime()
      return sum + deliveryTime
    }, 0)

    return totalTime / notifications.length / 1000 // 转换为秒
  }

  /**
   * 获取渠道统计
   */
  private async getChannelStats(since: Date): Promise<Record<string, any>> {
    const channelData = await this.prisma.notification.groupBy({
      by: ['channel', 'status'],
      where: { createdAt: { gte: since } },
      _count: { id: true }
    })

    const stats: Record<string, any> = {}

    for (const data of channelData) {
      if (!stats[data.channel]) {
        stats[data.channel] = { sent: 0, failed: 0, successRate: 0 }
      }

      if (data.status === 'SENT' || data.status === 'DELIVERED') {
        stats[data.channel].sent += data._count.id
      } else if (data.status === 'FAILED') {
        stats[data.channel].failed += data._count.id
      }
    }

    // 计算成功率
    for (const channel in stats) {
      const { sent, failed } = stats[channel]
      const total = sent + failed
      stats[channel].successRate = total > 0 ? (sent / total) * 100 : 100
    }

    return stats
  }

  /**
   * 获取类型统计
   */
  private async getTypeStats(since: Date): Promise<Record<string, any>> {
    const typeData = await this.prisma.notification.groupBy({
      by: ['type', 'status'],
      where: { createdAt: { gte: since } },
      _count: { id: true }
    })

    const stats: Record<string, any> = {}

    for (const data of typeData) {
      if (!stats[data.type]) {
        stats[data.type] = { sent: 0, failed: 0, successRate: 0 }
      }

      if (data.status === 'SENT' || data.status === 'DELIVERED') {
        stats[data.type].sent += data._count.id
      } else if (data.status === 'FAILED') {
        stats[data.type].failed += data._count.id
      }
    }

    // 计算成功率
    for (const type in stats) {
      const { sent, failed } = stats[type]
      const total = sent + failed
      stats[type].successRate = total > 0 ? (sent / total) * 100 : 100
    }

    return stats
  }

  /**
   * 获取错误统计
   */
  private async getErrorStats(since: Date): Promise<Record<string, number>> {
    const errorData = await this.prisma.notification.findMany({
      where: {
        status: 'FAILED',
        createdAt: { gte: since },
        errorMessage: { not: null }
      },
      select: { errorMessage: true }
    })

    const stats: Record<string, number> = {}

    for (const notification of errorData) {
      const errorMessage = notification.errorMessage || 'Unknown error'
      stats[errorMessage] = (stats[errorMessage] || 0) + 1
    }

    return stats
  }

  /**
   * 检查告警规则
   */
  private async checkAlertRules(): Promise<void> {
    const currentMetrics = this.metrics[this.metrics.length - 1]
    if (!currentMetrics) return

    for (const rule of this.alertRules.values()) {
      if (!rule.enabled) continue

      // 检查冷却时间
      if (rule.lastTriggered) {
        const cooldownMs = rule.cooldown * 1000
        const timeSinceLastTrigger = Date.now() - rule.lastTriggered.getTime()
        if (timeSinceLastTrigger < cooldownMs) {
          continue
        }
      }

      // 评估告警条件
      const shouldTrigger = this.evaluateAlertCondition(rule, currentMetrics)

      if (shouldTrigger) {
        await this.triggerAlert(rule, currentMetrics)
      }
    }
  }

  /**
   * 评估告警条件
   */
  private evaluateAlertCondition(rule: AlertRule, metrics: NotificationMetrics): boolean {
    try {
      // 简单的条件评估器
      const context = {
        successRate: metrics.successRate,
        totalFailed: metrics.totalFailed,
        totalPending: metrics.totalPending,
        averageDeliveryTime: metrics.averageDeliveryTime,
        threshold: rule.threshold
      }

      // 使用 Function 构造器创建条件评估函数（生产环境中应使用更安全的方式）
      const conditionFunction = new Function('context', `
        with (context) {
          return ${rule.condition};
        }
      `)

      return conditionFunction(context)
    } catch (error) {
      this.logger.error('Error evaluating alert condition', {
        ruleId: rule.id,
        condition: rule.condition,
        error: error instanceof Error ? error.message : String(error)
      })
      return false
    }
  }

  /**
   * 触发告警
   */
  private async triggerAlert(rule: AlertRule, metrics: NotificationMetrics): Promise<void> {
    const alertEvent: AlertEvent = {
      id: this.generateAlertId(),
      ruleId: rule.id,
      ruleName: rule.name,
      severity: this.determineSeverity(rule, metrics),
      message: this.generateAlertMessage(rule, metrics),
      timestamp: new Date(),
      resolved: false,
      metadata: {
        metrics: {
          successRate: metrics.successRate,
          totalFailed: metrics.totalFailed,
          totalPending: metrics.totalPending,
          averageDeliveryTime: metrics.averageDeliveryTime
        }
      }
    }

    // 保存告警事件
    this.alerts.push(alertEvent)

    // 更新规则的最后触发时间
    rule.lastTriggered = new Date()

    // 发出告警事件
    this.emit('alert', alertEvent)

    // 发送告警通知
    await this.sendAlertNotification(alertEvent, rule.channels)

    this.logger.warn('Alert triggered', {
      ruleId: rule.id,
      ruleName: rule.name,
      severity: alertEvent.severity,
      message: alertEvent.message
    })
  }

  /**
   * 确定告警严重程度
   */
  private determineSeverity(rule: AlertRule, metrics: NotificationMetrics): AlertEvent['severity'] {
    // 基于指标值确定严重程度
    if (metrics.successRate < 50) return 'CRITICAL'
    if (metrics.successRate < 70) return 'HIGH'
    if (metrics.successRate < 90) return 'MEDIUM'
    return 'LOW'
  }

  /**
   * 生成告警消息
   */
  private generateAlertMessage(rule: AlertRule, metrics: NotificationMetrics): string {
    return `Alert: ${rule.name} - Success rate: ${metrics.successRate.toFixed(2)}%, Failed: ${metrics.totalFailed}, Pending: ${metrics.totalPending}`
  }

  /**
   * 发送告警通知
   */
  private async sendAlertNotification(alert: AlertEvent, channels: string[]): Promise<void> {
    // 这里应该实现实际的告警通知发送逻辑
    // 例如发送邮件、短信、Slack消息等
    this.logger.info('Alert notification sent', {
      alertId: alert.id,
      channels,
      severity: alert.severity
    })
  }

  /**
   * 初始化默认告警规则
   */
  private initializeDefaultAlertRules(): void {
    const defaultRules: AlertRule[] = [
      {
        id: 'low-success-rate',
        name: 'Low Success Rate',
        condition: 'successRate < threshold',
        threshold: 90,
        enabled: true,
        channels: ['email', 'slack'],
        cooldown: 300 // 5分钟
      },
      {
        id: 'high-failure-count',
        name: 'High Failure Count',
        condition: 'totalFailed > threshold',
        threshold: 100,
        enabled: true,
        channels: ['email', 'sms'],
        cooldown: 600 // 10分钟
      },
      {
        id: 'high-pending-count',
        name: 'High Pending Count',
        condition: 'totalPending > threshold',
        threshold: 500,
        enabled: true,
        channels: ['email'],
        cooldown: 300 // 5分钟
      },
      {
        id: 'slow-delivery',
        name: 'Slow Delivery Time',
        condition: 'averageDeliveryTime > threshold',
        threshold: 60, // 60秒
        enabled: true,
        channels: ['email'],
        cooldown: 900 // 15分钟
      }
    ]

    for (const rule of defaultRules) {
      this.alertRules.set(rule.id, rule)
    }
  }

  /**
   * 生成告警ID
   */
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 获取当前指标
   */
  getCurrentMetrics(): NotificationMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null
  }

  /**
   * 获取指标历史
   */
  getMetricsHistory(limit?: number): NotificationMetrics[] {
    if (limit) {
      return this.metrics.slice(-limit)
    }
    return [...this.metrics]
  }

  /**
   * 获取活跃告警
   */
  getActiveAlerts(): AlertEvent[] {
    return this.alerts.filter(alert => !alert.resolved)
  }

  /**
   * 获取告警历史
   */
  getAlertHistory(limit?: number): AlertEvent[] {
    const sorted = [...this.alerts].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    return limit ? sorted.slice(0, limit) : sorted
  }

  /**
   * 解决告警
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert && !alert.resolved) {
      alert.resolved = true
      alert.resolvedAt = new Date()
      this.emit('alertResolved', alert)
      return true
    }
    return false
  }

  /**
   * 添加告警规则
   */
  addAlertRule(rule: AlertRule): void {
    this.alertRules.set(rule.id, rule)
    this.logger.info('Alert rule added', { ruleId: rule.id, ruleName: rule.name })
  }

  /**
   * 更新告警规则
   */
  updateAlertRule(ruleId: string, updates: Partial<AlertRule>): boolean {
    const rule = this.alertRules.get(ruleId)
    if (rule) {
      Object.assign(rule, updates)
      this.logger.info('Alert rule updated', { ruleId, updates })
      return true
    }
    return false
  }

  /**
   * 删除告警规则
   */
  removeAlertRule(ruleId: string): boolean {
    const deleted = this.alertRules.delete(ruleId)
    if (deleted) {
      this.logger.info('Alert rule removed', { ruleId })
    }
    return deleted
  }

  /**
   * 获取所有告警规则
   */
  getAlertRules(): AlertRule[] {
    return Array.from(this.alertRules.values())
  }

  /**
   * 生成健康报告
   */
  generateHealthReport(): {
    status: 'HEALTHY' | 'WARNING' | 'CRITICAL'
    summary: string
    metrics: NotificationMetrics | null
    activeAlerts: AlertEvent[]
    recommendations: string[]
    isHealthy: boolean
  } {
    const currentMetrics = this.getCurrentMetrics()
    const activeAlerts = this.getActiveAlerts()
    
    let status: 'HEALTHY' | 'WARNING' | 'CRITICAL' = 'HEALTHY'
    let summary = 'Notification system is operating normally'
    const recommendations: string[] = []

    if (currentMetrics) {
      if (currentMetrics.successRate < 70) {
        status = 'CRITICAL'
        summary = 'Notification system has critical issues'
        recommendations.push('Investigate high failure rate immediately')
      } else if (currentMetrics.successRate < 90 || activeAlerts.length > 0) {
        status = 'WARNING'
        summary = 'Notification system has some issues'
        recommendations.push('Monitor system closely and address warnings')
      }

      if (currentMetrics.totalPending > 1000) {
        recommendations.push('High pending count detected, consider scaling up processing capacity')
      }

      if (currentMetrics.averageDeliveryTime > 30) {
        recommendations.push('Delivery time is slower than expected, check system performance')
      }
    }

    return {
      status,
      summary,
      metrics: currentMetrics,
      activeAlerts,
      recommendations,
      isHealthy: status === 'HEALTHY'
    }
  }
}

// 导出单例实例
export const notificationMonitor = new NotificationMonitor()