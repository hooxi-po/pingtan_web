import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NotificationStatus, NotificationChannel, NotificationType } from '@prisma/client'
import { NotificationService } from '@/lib/notification/service'
import { notificationLogger } from '@/lib/notification/notification-logger'
import { z } from 'zod'

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

// 查询统计数据请求验证模式
const statsQuerySchema = z.object({
  userId: z.string().optional(),
  startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  type: z.enum(['overview', 'detailed']).optional().default('overview')
})

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
    const queryParams = Object.fromEntries(searchParams.entries())
    
    // 验证查询参数
    const validatedQuery = statsQuerySchema.parse(queryParams)

    // 非管理员用户只能查看自己的统计数据
    let userId = validatedQuery.userId
    if (session.user.role !== 'ADMIN') {
      userId = session.user.id
    }

    // 使用 NotificationLogger 获取统计数据
    const stats = await notificationLogger.getNotificationStats(
      userId,
      validatedQuery.startDate,
      validatedQuery.endDate
    )

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('获取通知统计失败:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: '请求参数格式错误',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '获取通知统计失败' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/notifications/stats - 清理过期通知日志
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const daysToKeep = parseInt(searchParams.get('daysToKeep') || '90')

    if (daysToKeep < 1 || daysToKeep > 365) {
      return NextResponse.json(
        { error: '保留天数必须在1-365之间' },
        { status: 400 }
      )
    }

    const deletedCount = await notificationLogger.cleanupOldLogs(daysToKeep)

    return NextResponse.json({
      success: true,
      message: `成功清理 ${deletedCount} 条过期通知日志`,
      data: {
        deletedCount,
        daysToKeep
      }
    })

  } catch (error) {
    console.error('清理通知日志失败:', error)
    return NextResponse.json(
      { error: '清理通知日志失败' },
      { status: 500 }
    )
  }
}