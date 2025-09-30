import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { NotificationService } from '@/lib/notification/service'
import { CreateNotificationRequest, NotificationQueryParams } from '@/lib/notification/types'
import { z } from 'zod'

const prisma = new PrismaClient()

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

// 创建通知请求验证schema
const createNotificationSchema = z.object({
  userId: z.string().optional(),
  orderId: z.string().optional(),
  type: z.enum([
    'PAYMENT_SUCCESS',
    'PAYMENT_FAILED', 
    'ORDER_CONFIRMED',
    'ORDER_CANCELLED',
    'ORDER_REFUNDED',
    'BOOKING_REMINDER',
    'SYSTEM_ANNOUNCEMENT',
    'PROMOTIONAL',
    'SECURITY_ALERT'
  ]),
  channel: z.enum(['SMS', 'EMAIL', 'IN_APP', 'PUSH']),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(1000),
  templateId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  scheduledAt: z.string().datetime().optional()
})

// 查询参数验证schema
const queryParamsSchema = z.object({
  userId: z.string().optional(),
  type: z.string().optional(),
  channel: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional()
})

/**
 * GET /api/notifications - 查询通知列表
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const queryParams = queryParamsSchema.parse(Object.fromEntries(searchParams))

    // 构建查询条件
    const where: any = {}
    
    // 非管理员只能查看自己的通知
    if (session.user.role !== 'ADMIN') {
      where.userId = session.user.id
    } else if (queryParams.userId) {
      where.userId = queryParams.userId
    }

    if (queryParams.type) {
      where.type = queryParams.type
    }
    if (queryParams.channel) {
      where.channel = queryParams.channel
    }
    if (queryParams.status) {
      where.status = queryParams.status
    }
    if (queryParams.priority) {
      where.priority = queryParams.priority
    }
    if (queryParams.startDate || queryParams.endDate) {
      where.createdAt = {}
      if (queryParams.startDate) {
        where.createdAt.gte = new Date(queryParams.startDate)
      }
      if (queryParams.endDate) {
        where.createdAt.lte = new Date(queryParams.endDate)
      }
    }

    const page = queryParams.page || 1
    const limit = Math.min(queryParams.limit || 20, 100) // 最大100条
    const skip = (page - 1) * limit

    // 查询通知列表
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          order: {
            select: {
              id: true,
              totalAmount: true,
              status: true
            }
          },
          template: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),
      prisma.notification.count({ where })
    ])

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/notifications - 创建并发送通知
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = createNotificationSchema.parse(body)

    // 如果没有指定userId，使用当前用户ID
    const userId = data.userId || session.user.id

    // 非管理员只能为自己创建通知
    if (session.user.role !== 'ADMIN' && userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 构建通知请求
    const notificationRequest: CreateNotificationRequest = {
      userId,
      orderId: data.orderId,
      type: data.type,
      channel: data.channel,
      priority: data.priority,
      title: data.title,
      content: data.content,
      templateId: data.templateId,
      metadata: data.metadata,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined
    }

    // 创建并发送通知
    const notificationId = await notificationService.createAndSendNotification(notificationRequest)

    // 获取创建的通知详情
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        order: {
          select: {
            id: true,
            totalAmount: true,
            status: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      notification
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create notification:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/notifications - 批量操作通知
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, notificationIds, userId } = body

    if (!action || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    // 构建查询条件
    const where: any = {
      id: { in: notificationIds }
    }

    // 非管理员只能操作自己的通知
    if (session.user.role !== 'ADMIN') {
      where.userId = session.user.id
    } else if (userId) {
      where.userId = userId
    }

    let result
    switch (action) {
      case 'markAsRead':
        result = await prisma.notification.updateMany({
          where: {
            ...where,
            channel: 'IN_APP',
            readAt: null
          },
          data: {
            readAt: new Date()
          }
        })
        break

      case 'delete':
        result = await prisma.notification.deleteMany({
          where
        })
        break

      case 'retry':
        // 只有管理员可以重试失败的通知
        if (session.user.role !== 'ADMIN') {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
        
        result = await prisma.notification.updateMany({
          where: {
            ...where,
            status: 'FAILED'
          },
          data: {
            status: 'PENDING',
            scheduledAt: new Date(),
            retryCount: 0,
            errorMessage: null
          }
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      affected: result.count
    })
  } catch (error) {
    console.error('Failed to update notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}