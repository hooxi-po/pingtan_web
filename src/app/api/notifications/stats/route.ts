import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NotificationStatus, NotificationChannel, NotificationType } from '@prisma/client'
import { NotificationService } from '@/lib/notification/service'

// 通知服务配置
const notificationConfig = {
  sms: {
    provider: 'aliyun' as const,
    apiKey: process.env.SMS_API_KEY || '',
    apiSecret: process.env.SMS_API_SECRET || '',
    signName: process.env.SMS_SIGN_NAME || '平潭旅游',
    templateCode: process.env.SMS_TEMPLATE_CODE || ''
  },
  email: {
    provider: 'smtp' as const,
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    username: process.env.SMTP_USERNAME,
    password: process.env.SMTP_PASSWORD,
    from: process.env.EMAIL_FROM || 'noreply@pingtan-travel.com'
  },
  push: {
    provider: 'fcm' as const,
    apiKey: process.env.FCM_API_KEY || '',
    apiSecret: process.env.FCM_API_SECRET || '',
    bundleId: process.env.APP_BUNDLE_ID || ''
  }
}

const notificationService = new NotificationService(prisma, notificationConfig)

/**
 * GET /api/notifications/stats - 获取通知统计信息
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const type = searchParams.get('type') // 'overview' | 'detailed'

    // 确定要查询的用户ID
    let targetUserId: string | undefined = undefined
    if (session.user.role !== 'ADMIN') {
      targetUserId = session.user.id
    } else if (userId) {
      targetUserId = userId
    }

    // 构建时间范围条件
    const dateFilter: any = {}
    if (startDate) {
      dateFilter.gte = new Date(startDate)
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate)
    }

    const whereCondition: any = {}
    if (targetUserId) {
      whereCondition.userId = targetUserId
    }
    if (Object.keys(dateFilter).length > 0) {
      whereCondition.createdAt = dateFilter
    }

    if (type === 'detailed') {
      // 详细统计
      const [
        totalNotifications,
        statusStats,
        channelStats,
        typeStats,
        priorityStats,
        dailyStats
      ] = await Promise.all([
        // 总通知数
        prisma.notification.count({ where: whereCondition }),
        
        // 按状态统计
        prisma.notification.groupBy({
          by: ['status'],
          where: whereCondition,
          _count: { id: true }
        }),
        
        // 按渠道统计
        prisma.notification.groupBy({
          by: ['channel'],
          where: whereCondition,
          _count: { id: true }
        }),
        
        // 按类型统计
        prisma.notification.groupBy({
          by: ['type'],
          where: whereCondition,
          _count: { id: true }
        }),
        
        // 按优先级统计
        prisma.notification.groupBy({
          by: ['priority'],
          where: whereCondition,
          _count: { id: true }
        }),
        
        // 按日期统计（最近30天）
        prisma.$queryRaw`
          SELECT 
            DATE(createdAt) as date,
            COUNT(*) as count,
            status
          FROM Notification 
          WHERE ${targetUserId ? `userId = '${targetUserId}' AND` : ''} 
            createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
          GROUP BY DATE(createdAt), status
          ORDER BY date DESC
        `
      ])

      return NextResponse.json({
        overview: {
          total: totalNotifications,
          byStatus: statusStats.reduce((acc, item) => {
            acc[item.status] = item._count.id
            return acc
          }, {} as Record<string, number>),
          byChannel: channelStats.reduce((acc, item) => {
            acc[item.channel] = item._count.id
            return acc
          }, {} as Record<string, number>),
          byType: typeStats.reduce((acc, item) => {
            acc[item.type] = item._count.id
            return acc
          }, {} as Record<string, number>),
          byPriority: priorityStats.reduce((acc, item) => {
            acc[item.priority] = item._count.id
            return acc
          }, {} as Record<string, number>)
        },
        trends: {
          daily: dailyStats
        }
      })
    } else {
      // 简单概览统计
      const [
        totalNotifications,
        pendingCount,
        sentCount,
        failedCount,
        deliveredCount
      ] = await Promise.all([
        prisma.notification.count({ where: whereCondition }),
        prisma.notification.count({ 
          where: { ...whereCondition, status: 'PENDING' } 
        }),
        prisma.notification.count({ 
          where: { ...whereCondition, status: 'SENT' } 
        }),
        prisma.notification.count({ 
          where: { ...whereCondition, status: 'FAILED' } 
        }),
        prisma.notification.count({ 
          where: { ...whereCondition, status: 'DELIVERED' } 
        })
      ])

      // 计算成功率
      const successRate = totalNotifications > 0 
        ? ((sentCount + deliveredCount) / totalNotifications * 100).toFixed(2)
        : '0.00'

      return NextResponse.json({
        total: totalNotifications,
        pending: pendingCount,
        sent: sentCount,
        failed: failedCount,
        delivered: deliveredCount,
        successRate: parseFloat(successRate)
      })
    }
  } catch (error) {
    console.error('Failed to fetch notification stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/notifications/stats/service - 获取通知服务统计
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 获取通知服务统计
    const stats = await notificationService.getNotificationStats()

    return NextResponse.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('Failed to fetch service stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}