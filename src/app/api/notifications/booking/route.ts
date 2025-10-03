import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { bookingNotificationService } from '@/lib/notification/booking-notification'
import { NotificationChannel, NotificationPriority } from '@prisma/client'

// 预订通知请求验证模式
const bookingNotificationSchema = z.object({
  userId: z.string().min(1, '用户ID不能为空'),
  orderId: z.string().min(1, '订单ID不能为空'),
  bookingData: z.object({
    confirmationNumber: z.string().min(1, '确认编号不能为空'),
    serviceName: z.string().min(1, '服务名称不能为空'),
    serviceType: z.enum(['attraction', 'accommodation', 'restaurant', 'package', 'experience']),
    serviceDescription: z.string().min(1, '服务描述不能为空'),
    bookingDate: z.string().min(1, '预订日期不能为空'),
    bookingTime: z.string().optional(),
    totalAmount: z.number().min(0, '金额必须大于等于0'),
    currency: z.string().default('CNY'),
    customerName: z.string().min(1, '客户姓名不能为空'),
    customerPhone: z.string().optional(),
    customerEmail: z.string().email().optional(),
    specialRequests: z.string().optional(),
    cancellationPolicy: z.string().optional(),
    contactInfo: z.object({
      phone: z.string(),
      email: z.string().email(),
      address: z.string().optional()
    }).optional()
  }),
  channel: z.nativeEnum(NotificationChannel).optional(),
  priority: z.nativeEnum(NotificationPriority).optional(),
  scheduledAt: z.string().datetime().optional()
})

// 多渠道通知请求验证模式
const multiChannelNotificationSchema = bookingNotificationSchema.extend({
  channels: z.array(z.nativeEnum(NotificationChannel)).min(1, '至少选择一个通知渠道')
})

/**
 * POST /api/notifications/booking
 * 发送预订确认通知
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证请求数据
    const validatedData = bookingNotificationSchema.parse(body)
    
    // 转换scheduledAt为Date对象
    const notificationRequest = {
      ...validatedData,
      scheduledAt: validatedData.scheduledAt ? new Date(validatedData.scheduledAt) : undefined
    }
    
    // 发送通知
    const result = await bookingNotificationService.sendBookingConfirmation(notificationRequest)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '预订确认通知发送成功',
        data: {
          externalId: result.externalId,
          deliveredAt: result.deliveredAt
        }
      }, { status: 200 })
    } else {
      return NextResponse.json({
        success: false,
        message: '预订确认通知发送失败',
        error: result.errorMessage
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('预订通知API错误:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: '请求参数验证失败',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      message: '服务器内部错误',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

/**
 * POST /api/notifications/booking/multi-channel
 * 发送多渠道预订确认通知
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证请求数据
    const validatedData = multiChannelNotificationSchema.parse(body)
    
    // 转换scheduledAt为Date对象
    const notificationRequest = {
      userId: validatedData.userId,
      orderId: validatedData.orderId,
      bookingData: validatedData.bookingData,
      channel: validatedData.channel,
      priority: validatedData.priority,
      scheduledAt: validatedData.scheduledAt ? new Date(validatedData.scheduledAt) : undefined
    }
    
    // 发送多渠道通知
    const results = await bookingNotificationService.sendMultiChannelBookingConfirmation(
      notificationRequest,
      validatedData.channels
    )
    
    // 统计发送结果
    const successCount = Object.values(results).filter(r => r.success).length
    const totalCount = Object.keys(results).length
    
    return NextResponse.json({
      success: successCount > 0,
      message: `多渠道通知发送完成，成功 ${successCount}/${totalCount} 个渠道`,
      data: {
        results,
        summary: {
          total: totalCount,
          success: successCount,
          failed: totalCount - successCount
        }
      }
    }, { status: 200 })
    
  } catch (error) {
    console.error('多渠道预订通知API错误:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: '请求参数验证失败',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      message: '服务器内部错误',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

/**
 * POST /api/notifications/booking/reminder
 * 发送预订提醒通知
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    
    const reminderSchema = z.object({
      orderId: z.string().min(1, '订单ID不能为空'),
      reminderTime: z.number().min(1).default(60) // 默认60分钟后提醒
    })
    
    const { orderId, reminderTime } = reminderSchema.parse(body)
    
    // 发送提醒通知
    const result = await bookingNotificationService.sendBookingReminder(orderId, reminderTime)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '预订提醒通知设置成功',
        data: {
          orderId,
          reminderTime,
          externalId: result.externalId
        }
      }, { status: 200 })
    } else {
      return NextResponse.json({
        success: false,
        message: '预订提醒通知设置失败',
        error: result.errorMessage
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('预订提醒通知API错误:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: '请求参数验证失败',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      message: '服务器内部错误',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}