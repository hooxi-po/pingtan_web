import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notificationLogger } from '@/lib/notification/notification-logger'
import { z } from 'zod'
import { NotificationType, NotificationChannel, NotificationStatus, NotificationPriority } from '@prisma/client'

// 查询通知日志请求验证模式
const queryLogsSchema = z.object({
  userId: z.string().optional(),
  orderId: z.string().optional(),
  type: z.nativeEnum(NotificationType).optional(),
  channel: z.nativeEnum(NotificationChannel).optional(),
  status: z.nativeEnum(NotificationStatus).optional(),
  priority: z.nativeEnum(NotificationPriority).optional(),
  startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
  sortBy: z.enum(['createdAt', 'sentAt', 'deliveredAt', 'readAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
})

/**
 * 查询通知日志
 * GET /api/notifications/logs
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
    const validatedQuery = queryLogsSchema.parse(queryParams)

    // 非管理员用户只能查看自己的通知日志
    if (session.user.role !== 'ADMIN' && !validatedQuery.userId) {
      validatedQuery.userId = session.user.id
    } else if (session.user.role !== 'ADMIN' && validatedQuery.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const result = await notificationLogger.queryNotificationLogs(validatedQuery)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('查询通知日志失败:', error)
    
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
      { error: '查询通知日志失败' },
      { status: 500 }
    )
  }
}

/**
 * 更新通知状态（标记为已读等）
 * PATCH /api/notifications/logs
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { notificationId, status, errorMessage } = body

    if (!notificationId || !status) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 验证状态值
    if (!Object.values(NotificationStatus).includes(status)) {
      return NextResponse.json(
        { error: '无效的状态值' },
        { status: 400 }
      )
    }

    const updatedNotification = await notificationLogger.updateNotificationStatus(
      notificationId,
      status,
      errorMessage
    )

    return NextResponse.json({
      success: true,
      message: '通知状态更新成功',
      data: updatedNotification
    })

  } catch (error) {
    console.error('更新通知状态失败:', error)
    return NextResponse.json(
      { error: '更新通知状态失败' },
      { status: 500 }
    )
  }
}