interface LogEntry {
  timestamp: Date
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  context?: Record<string, any>
  userId?: string
  notificationId?: string
  channel?: string
}

export class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 10000 // 内存中保留的最大日志数量

  /**
   * 记录信息日志
   */
  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context)
  }

  /**
   * 记录警告日志
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context)
  }

  /**
   * 记录错误日志
   */
  error(message: string, context?: Record<string, any>): void {
    this.log('error', message, context)
  }

  /**
   * 记录调试日志
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context)
  }

  /**
   * 通用日志记录方法
   */
  private log(level: LogEntry['level'], message: string, context?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
      userId: context?.userId,
      notificationId: context?.notificationId,
      channel: context?.channel
    }

    // 添加到内存日志
    this.logs.push(entry)

    // 保持日志数量在限制内
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // 输出到控制台
    this.outputToConsole(entry)

    // 异步写入到持久化存储
    this.persistLog(entry).catch(error => {
      console.error('Failed to persist log:', error)
    })
  }

  /**
   * 输出到控制台
   */
  private outputToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString()
    const contextStr = entry.context ? JSON.stringify(entry.context) : ''
    const logMessage = `[${timestamp}] [${entry.level.toUpperCase()}] ${entry.message} ${contextStr}`

    switch (entry.level) {
      case 'error':
        console.error(logMessage)
        break
      case 'warn':
        console.warn(logMessage)
        break
      case 'debug':
        console.debug(logMessage)
        break
      default:
        console.log(logMessage)
    }
  }

  /**
   * 持久化日志到数据库或文件
   */
  private async persistLog(entry: LogEntry): Promise<void> {
    try {
      // 这里可以实现日志持久化逻辑
      // 例如：写入数据库、文件系统、或发送到日志服务

      // 示例：写入到数据库
      // await prisma.notificationLog.create({
      //   data: {
      //     timestamp: entry.timestamp,
      //     level: entry.level,
      //     message: entry.message,
      //     context: entry.context,
      //     userId: entry.userId,
      //     notificationId: entry.notificationId,
      //     channel: entry.channel
      //   }
      // })

      // 示例：写入到文件
      // const fs = require('fs').promises
      // const logLine = JSON.stringify(entry) + '\n'
      // await fs.appendFile('logs/notification.log', logLine)

      // 示例：发送到外部日志服务（如ELK、Splunk等）
      // await this.sendToLogService(entry)

    } catch (error) {
      // 持久化失败不应该影响主要功能
      console.error('Log persistence failed:', error)
    }
  }

  /**
   * 发送到外部日志服务
   */
  private async sendToLogService(entry: LogEntry): Promise<void> {
    // 这里可以集成外部日志服务
    // 例如：Elasticsearch, Splunk, CloudWatch Logs等
    
    const logData = {
      '@timestamp': entry.timestamp.toISOString(),
      level: entry.level,
      message: entry.message,
      service: 'notification-system',
      environment: process.env.NODE_ENV || 'development',
      ...entry.context
    }

    // 模拟发送到日志服务
    // await fetch('https://logs.example.com/api/logs', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(logData)
    // })
  }

  /**
   * 查询日志
   */
  queryLogs(options: {
    level?: LogEntry['level']
    userId?: string
    notificationId?: string
    channel?: string
    startTime?: Date
    endTime?: Date
    limit?: number
  } = {}): LogEntry[] {
    let filteredLogs = this.logs

    // 按级别过滤
    if (options.level) {
      filteredLogs = filteredLogs.filter(log => log.level === options.level)
    }

    // 按用户ID过滤
    if (options.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === options.userId)
    }

    // 按通知ID过滤
    if (options.notificationId) {
      filteredLogs = filteredLogs.filter(log => log.notificationId === options.notificationId)
    }

    // 按渠道过滤
    if (options.channel) {
      filteredLogs = filteredLogs.filter(log => log.channel === options.channel)
    }

    // 按时间范围过滤
    if (options.startTime) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= options.startTime!)
    }
    if (options.endTime) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= options.endTime!)
    }

    // 限制返回数量
    if (options.limit) {
      filteredLogs = filteredLogs.slice(-options.limit)
    }

    return filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  /**
   * 获取日志统计
   */
  getLogStats(timeRange?: { start: Date; end: Date }) {
    let logs = this.logs

    if (timeRange) {
      logs = logs.filter(log => 
        log.timestamp >= timeRange.start && log.timestamp <= timeRange.end
      )
    }

    const stats = {
      total: logs.length,
      byLevel: {
        info: 0,
        warn: 0,
        error: 0,
        debug: 0
      },
      byChannel: {} as Record<string, number>,
      errorRate: 0,
      recentErrors: [] as LogEntry[]
    }

    logs.forEach(log => {
      stats.byLevel[log.level]++
      
      if (log.channel) {
        stats.byChannel[log.channel] = (stats.byChannel[log.channel] || 0) + 1
      }
    })

    stats.errorRate = stats.total > 0 ? (stats.byLevel.error / stats.total) * 100 : 0
    stats.recentErrors = logs
      .filter(log => log.level === 'error')
      .slice(-10)
      .reverse()

    return stats
  }

  /**
   * 清理旧日志
   */
  cleanup(olderThan: Date): number {
    const initialCount = this.logs.length
    this.logs = this.logs.filter(log => log.timestamp > olderThan)
    return initialCount - this.logs.length
  }

  /**
   * 导出日志
   */
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['timestamp', 'level', 'message', 'userId', 'notificationId', 'channel']
      const csvRows = [headers.join(',')]
      
      this.logs.forEach(log => {
        const row = [
          log.timestamp.toISOString(),
          log.level,
          `"${log.message.replace(/"/g, '""')}"`,
          log.userId || '',
          log.notificationId || '',
          log.channel || ''
        ]
        csvRows.push(row.join(','))
      })
      
      return csvRows.join('\n')
    } else {
      return JSON.stringify(this.logs, null, 2)
    }
  }

  /**
   * 设置日志级别
   */
  setLogLevel(level: LogEntry['level']): void {
    // 这里可以实现日志级别控制
    // 例如：只记录指定级别及以上的日志
  }

  /**
   * 记录性能指标
   */
  logPerformance(operation: string, duration: number, context?: Record<string, any>): void {
    this.info(`Performance: ${operation} took ${duration}ms`, {
      operation,
      duration,
      ...context
    })
  }

  /**
   * 记录通知发送事件
   */
  logNotificationEvent(
    event: 'created' | 'sent' | 'delivered' | 'failed' | 'retry',
    notificationId: string,
    context?: Record<string, any>
  ): void {
    this.info(`Notification ${event}: ${notificationId}`, {
      event,
      notificationId,
      ...context
    })
  }
}