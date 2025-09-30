import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// 更新通知请求验证schema
const updateNotificationSchema = z.object({
  status: z.enum(['PENDING', 'SENT', 'DELIVERED', 'FAILED', 'CANCELLED']).optional(),
  readAt: z.string().datetime().optional(),
  deliveredAt: z.string().datetime().optional(),
  errorMessage: z.string().optional()
})

/**
 * GET /api/notifications/[id] - 获取单个通知详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const notificationId = id

    // 构建查询条件
    const where: any = { id: notificationId }
    
    // 非管理员只能查看自己的通知
    if (session.user.role !== 'ADMIN') {
      where.userId = session.user.id
    }

    const notification = await prisma.notification.findFirst({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        order: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
            paymentStatus: true,
            bookingDate: true
          }
        },
        template: {
          select: {
            id: true,
            name: true,
            type: true,
            channel: true
          }
        }
      }
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ notification })
  } catch (error) {
    console.error('Failed to fetch notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/notifications/[id] - 更新通知状态
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const notificationId = id
    const body = await request.json()
    const data = updateNotificationSchema.parse(body)

    // 构建查询条件
    const where: any = { id: notificationId }
    
    // 非管理员只能更新自己的通知
    if (session.user.role !== 'ADMIN') {
      where.userId = session.user.id
    }

    // 检查通知是否存在
    const existingNotification = await prisma.notification.findFirst({
      where
    })

    if (!existingNotification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    // 构建更新数据
    const updateData: any = {}
    
    if (data.status !== undefined) {
      updateData.status = data.status
    }
    
    if (data.readAt !== undefined) {
      updateData.readAt = new Date(data.readAt)
    }
    
    if (data.deliveredAt !== undefined) {
      updateData.deliveredAt = new Date(data.deliveredAt)
    }
    
    if (data.errorMessage !== undefined) {
      updateData.errorMessage = data.errorMessage
    }

    // 更新通知
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: updateData,
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
      notification: updatedNotification
    })
  } catch (error) {
    console.error('Failed to update notification:', error)
    
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
 * DELETE /api/notifications/[id] - 删除通知
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const notificationId = id

    // 构建查询条件
    const where: any = { id: notificationId }
    
    // 非管理员只能删除自己的通知
    if (session.user.role !== 'ADMIN') {
      where.userId = session.user.id
    }

    // 检查通知是否存在
    const existingNotification = await prisma.notification.findFirst({
      where
    })

    if (!existingNotification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    // 删除通知
    await prisma.notification.delete({
      where: { id: notificationId }
    })

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}