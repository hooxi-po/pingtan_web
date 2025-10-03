import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { BookingNotificationService } from '@/lib/notification/booking-notification'
import { NotificationChannel, NotificationPriority } from '@prisma/client'

// 订单状态更新请求验证模式
const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REFUNDED']),
  changeReason: z.string().optional(),
  refundAmount: z.number().optional(),
  notifyUser: z.boolean().default(true),
  channels: z.array(z.enum(['IN_APP', 'EMAIL', 'SMS', 'PUSH'])).default(['IN_APP', 'EMAIL'])
})

/**
 * 更新订单状态并发送通知
 * PATCH /api/orders/[id]/status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params
    const body = await request.json()
    
    // 验证请求数据
    const validatedData = updateOrderStatusSchema.parse(body)
    const { status, changeReason, refundAmount, notifyUser, channels } = validatedData

    // 查找订单
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        attraction: true,
        accommodation: true,
        restaurant: true
      }
    })

    if (!existingOrder) {
      return NextResponse.json(
        { error: '订单不存在' },
        { status: 404 }
      )
    }

    const oldStatus = existingOrder.status

    // 更新订单状态
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        updatedAt: new Date()
      },
      include: {
        user: true,
        attraction: true,
        accommodation: true,
        restaurant: true
      }
    })

    // 如果需要发送通知且状态确实发生了变化
    if (notifyUser && oldStatus !== status) {
      try {
        const bookingNotificationService = new BookingNotificationService()
        
        // 构建预订状态变更数据
        const serviceTypeMap = {
          'ATTRACTION': 'attraction' as const,
          'ACCOMMODATION': 'accommodation' as const,
          'RESTAURANT': 'restaurant' as const,
          'PACKAGE': 'package' as const,
          'EXPERIENCE': 'experience' as const
        }

        const serviceType = serviceTypeMap[updatedOrder.type] || 'package'
        
        // 获取服务名称和描述
        let serviceName = '平潭旅游服务'
        let serviceDescription = '旅游服务预订'
        
        if (updatedOrder.attraction) {
          serviceName = updatedOrder.attraction.name
          serviceDescription = updatedOrder.attraction.description || '景点门票预订'
        } else if (updatedOrder.accommodation) {
          serviceName = updatedOrder.accommodation.name
          serviceDescription = updatedOrder.accommodation.description || '住宿预订'
        } else if (updatedOrder.restaurant) {
          serviceName = updatedOrder.restaurant.name
          serviceDescription = updatedOrder.restaurant.description || '餐厅预订'
        }

        const statusChangeData = {
          confirmationNumber: updatedOrder.id,
          serviceName,
          serviceType,
          serviceDescription,
          bookingDate: updatedOrder.bookingDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
          totalAmount: updatedOrder.totalAmount,
          currency: 'CNY',
          customerName: updatedOrder.contactName || updatedOrder.user.name || '用户',
          customerEmail: updatedOrder.contactEmail || updatedOrder.user.email || '',
          customerPhone: updatedOrder.contactPhone || updatedOrder.user.phone || '',
          oldStatus,
          newStatus: status,
          changeReason,
          refundAmount
        }

        const statusChangeRequest = {
          userId: updatedOrder.userId,
          orderId: updatedOrder.id,
          bookingData: statusChangeData,
          channel: NotificationChannel.IN_APP,
          priority: NotificationPriority.HIGH
        }

        // 发送多渠道状态变更通知
        const notificationChannels = channels.map(ch => NotificationChannel[ch as keyof typeof NotificationChannel])
        await bookingNotificationService.sendMultiChannelStatusChange(
          statusChangeRequest,
          notificationChannels
        )

        console.log(`订单 ${orderId} 状态变更通知已发送，从 ${oldStatus} 变更为 ${status}`)
      } catch (notificationError) {
        console.error('发送状态变更通知失败:', notificationError)
        // 通知发送失败不影响订单状态更新
      }
    }

    return NextResponse.json({
      success: true,
      message: '订单状态更新成功',
      data: {
        orderId: updatedOrder.id,
        oldStatus,
        newStatus: status,
        updatedAt: updatedOrder.updatedAt,
        notificationSent: notifyUser && oldStatus !== status
      }
    })

  } catch (error) {
    console.error('更新订单状态失败:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: '请求数据格式错误',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '更新订单状态失败' },
      { status: 500 }
    )
  }
}

/**
 * 获取订单状态历史
 * GET /api/orders/[id]/status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params

    // 查找订单
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        type: true,
        totalAmount: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: '订单不存在' },
        { status: 404 }
      )
    }

    // 查找相关的通知记录
    const notifications = await prisma.notification.findMany({
      where: {
        orderId: orderId,
        type: {
          in: ['ORDER_CONFIRMED', 'ORDER_CANCELLED', 'ORDER_REFUNDED']
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        type: true,
        status: true,
        channel: true,
        title: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        order,
        notifications,
        statusHistory: [
          {
            status: order.status,
            timestamp: order.updatedAt,
            isCurrentStatus: true
          }
        ]
      }
    })

  } catch (error) {
    console.error('获取订单状态失败:', error)
    return NextResponse.json(
      { error: '获取订单状态失败' },
      { status: 500 }
    )
  }
}