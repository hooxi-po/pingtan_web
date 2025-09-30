import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notificationMonitor } from '@/lib/notification/monitoring'

/**
 * GET /api/notifications/monitor - 获取监控数据
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'metrics' | 'alerts' | 'health' | 'rules'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined

    switch (type) {
      case 'metrics':
        const metricsHistory = notificationMonitor.getMetricsHistory(limit)
        return NextResponse.json({
          current: notificationMonitor.getCurrentMetrics(),
          history: metricsHistory
        })

      case 'alerts':
        const activeAlerts = notificationMonitor.getActiveAlerts()
        const alertHistory = notificationMonitor.getAlertHistory(limit)
        return NextResponse.json({
          active: activeAlerts,
          history: alertHistory
        })

      case 'health':
        const healthReport = notificationMonitor.generateHealthReport()
        return NextResponse.json(healthReport)

      case 'rules':
        const alertRules = notificationMonitor.getAlertRules()
        return NextResponse.json({ rules: alertRules })

      default:
        // 返回综合监控数据
        return NextResponse.json({
          metrics: {
            current: notificationMonitor.getCurrentMetrics(),
            history: notificationMonitor.getMetricsHistory(10)
          },
          alerts: {
            active: notificationMonitor.getActiveAlerts(),
            recent: notificationMonitor.getAlertHistory(5)
          },
          health: notificationMonitor.generateHealthReport()
        })
    }
  } catch (error) {
    console.error('Failed to fetch monitoring data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/notifications/monitor - 管理监控配置
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'start':
        const interval = data?.interval || 60000 // 默认1分钟
        notificationMonitor.start(interval)
        return NextResponse.json({
          success: true,
          message: 'Monitoring started',
          interval
        })

      case 'stop':
        notificationMonitor.stop()
        return NextResponse.json({
          success: true,
          message: 'Monitoring stopped'
        })

      case 'addRule':
        if (!data?.rule) {
          return NextResponse.json(
            { error: 'Rule data is required' },
            { status: 400 }
          )
        }
        notificationMonitor.addAlertRule(data.rule)
        return NextResponse.json({
          success: true,
          message: 'Alert rule added'
        })

      case 'updateRule':
        if (!data?.ruleId || !data?.updates) {
          return NextResponse.json(
            { error: 'Rule ID and updates are required' },
            { status: 400 }
          )
        }
        const updated = notificationMonitor.updateAlertRule(data.ruleId, data.updates)
        if (!updated) {
          return NextResponse.json(
            { error: 'Rule not found' },
            { status: 404 }
          )
        }
        return NextResponse.json({
          success: true,
          message: 'Alert rule updated'
        })

      case 'removeRule':
        if (!data?.ruleId) {
          return NextResponse.json(
            { error: 'Rule ID is required' },
            { status: 400 }
          )
        }
        const removed = notificationMonitor.removeAlertRule(data.ruleId)
        if (!removed) {
          return NextResponse.json(
            { error: 'Rule not found' },
            { status: 404 }
          )
        }
        return NextResponse.json({
          success: true,
          message: 'Alert rule removed'
        })

      case 'resolveAlert':
        if (!data?.alertId) {
          return NextResponse.json(
            { error: 'Alert ID is required' },
            { status: 400 }
          )
        }
        const resolved = notificationMonitor.resolveAlert(data.alertId)
        if (!resolved) {
          return NextResponse.json(
            { error: 'Alert not found or already resolved' },
            { status: 404 }
          )
        }
        return NextResponse.json({
          success: true,
          message: 'Alert resolved'
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Failed to manage monitoring:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}