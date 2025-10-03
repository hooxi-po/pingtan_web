import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { BookingNotificationService } from '@/lib/notification/booking-notification'
import { notificationLogger } from '@/lib/notification/notification-logger'
import { prisma } from '@/lib/prisma'
import { NotificationChannel, NotificationPriority, OrderType, OrderStatus } from '@prisma/client'

/**
 * 测试预订通知集成功能
 * POST /api/test/booking-integration
 */
export async function POST(request: NextRequest) {
  try {
    // 在开发环境中跳过身份验证，便于测试
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Skipping authentication for test endpoint')
    } else {
      const session = await getServerSession(authOptions)
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const body = await request.json()
    const { testType = 'full', orderId, channels = ['IN_APP'] } = body

    // 获取用户ID，开发环境使用测试用户ID
    let userId = 'test-user-123'
    if (process.env.NODE_ENV !== 'development') {
      const session = await getServerSession(authOptions)
      userId = session?.user?.id || 'test-user-123'
    }

    // 创建测试订单数据
    const testOrder = {
      id: orderId || `test-order-${Date.now()}`,
      type: OrderType.ATTRACTION,
      status: OrderStatus.PENDING,
      amount: 299.00,
      currency: 'CNY',
      paymentStatus: 'PENDING' as const,
      bookingDate: new Date(),
      contactName: '测试用户',
      contactPhone: '13800138000',
      contactEmail: 'test@example.com',
      priority: NotificationPriority.NORMAL,
      userId: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const bookingService = new BookingNotificationService()
    const testResults: any = {
      testType,
      orderId: testOrder.id,
      results: []
    }

    try {
      if (testType === 'confirmation' || testType === 'full') {
        // 测试预订确认通知
        console.log('测试预订确认通知...')
        
        // 确保channels是数组
        const channelArray = Array.isArray(channels) ? channels : [channels]
        const notificationChannels = channelArray.map(ch => 
          typeof ch === 'string' ? NotificationChannel[ch as keyof typeof NotificationChannel] : ch
        ).filter(Boolean)
        
        const confirmationRequest = {
          userId: testOrder.userId,
          orderId: testOrder.id,
          bookingData: {
            confirmationNumber: `CF${Date.now()}`,
            serviceName: '鼓浪屿门票',
            serviceType: 'attraction' as const,
            serviceDescription: '鼓浪屿风景区门票 - 成人票',
            bookingDate: testOrder.bookingDate.toISOString().split('T')[0],
            bookingTime: '09:00-17:00',
            totalAmount: testOrder.amount,
            currency: testOrder.currency,
            customerName: testOrder.contactName,
            customerPhone: testOrder.contactPhone,
            customerEmail: testOrder.contactEmail
          },
          priority: testOrder.priority
        }

        const confirmationResult = await bookingService.sendMultiChannelBookingConfirmation(
          confirmationRequest,
          notificationChannels
        )

        testResults.results.push({
          type: 'confirmation',
          success: true,
          notifications: confirmationResult,
          timestamp: new Date().toISOString()
        })

        // 等待一秒，模拟真实场景
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      if (testType === 'status_change' || testType === 'full') {
        // 测试状态变更通知
        console.log('测试预订状态变更通知...')
        
        // 确保channels是数组
        const channelArray = Array.isArray(channels) ? channels : [channels]
        const notificationChannels = channelArray.map(ch => 
          typeof ch === 'string' ? NotificationChannel[ch as keyof typeof NotificationChannel] : ch
        ).filter(Boolean)
        
        const statusChangeRequest = {
          userId: testOrder.userId,
          orderId: testOrder.id,
          bookingData: {
            confirmationNumber: `CF${Date.now()}`,
            serviceName: '鼓浪屿门票',
            serviceType: 'attraction' as const,
            serviceDescription: '鼓浪屿风景区门票 - 成人票',
            bookingDate: testOrder.bookingDate.toISOString().split('T')[0],
            totalAmount: testOrder.amount,
            currency: testOrder.currency,
            customerName: testOrder.contactName,
            customerPhone: testOrder.contactPhone,
            customerEmail: testOrder.contactEmail,
            oldStatus: OrderStatus.PENDING,
            newStatus: OrderStatus.CONFIRMED
          },
          priority: testOrder.priority
        }

        const statusChangeResult = await bookingService.sendMultiChannelStatusChange(
          statusChangeRequest,
          notificationChannels
        )

        testResults.results.push({
          type: 'status_change',
          success: true,
          notifications: statusChangeResult,
          timestamp: new Date().toISOString()
        })

        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      if (testType === 'reminder' || testType === 'full') {
        // 测试预订提醒通知
        console.log('测试预订提醒通知...')
        
        const reminderResult = await bookingService.sendBookingReminder(
          testOrder.id,
          60 // 60分钟后提醒
        )

        testResults.results.push({
          type: 'reminder',
          success: true,
          notification: reminderResult,
          timestamp: new Date().toISOString()
        })
      }

      // 获取测试期间的通知日志
      const logs = await notificationLogger.queryNotificationLogs({
        userId: testOrder.userId,
        orderId: testOrder.id,
        startDate: new Date(Date.now() - 5 * 60 * 1000), // 最近5分钟
        limit: 50
      })

      testResults.logs = logs
      testResults.summary = {
        totalNotifications: testResults.results.reduce((sum: number, result: any) => {
          if (result.notifications) {
            return sum + result.notifications.length
          } else if (result.notification) {
            return sum + 1
          }
          return sum
        }, 0),
        successfulTests: testResults.results.filter((r: any) => r.success).length,
        totalTests: testResults.results.length
      }

      return NextResponse.json({
        success: true,
        message: '预订通知集成测试完成',
        data: testResults
      })

    } catch (notificationError) {
      console.error('通知发送失败:', notificationError)
      
      testResults.results.push({
        type: 'error',
        success: false,
        error: notificationError instanceof Error ? notificationError.message : '未知错误',
        timestamp: new Date().toISOString()
      })

      return NextResponse.json({
        success: false,
        message: '预订通知测试部分失败',
        data: testResults
      }, { status: 207 }) // 207 Multi-Status
    }

  } catch (error) {
    console.error('预订通知集成测试失败:', error)
    return NextResponse.json(
      { 
        error: '预订通知集成测试失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}

/**
 * 获取测试历史记录
 * GET /api/test/booking-integration
 */
export async function GET(request: NextRequest) {
  try {
    // 在开发环境下跳过身份验证
    let userId: string | undefined
    if (process.env.NODE_ENV === 'development') {
      userId = 'test-user-123'
    } else {
      const session = await getServerSession(authOptions)
      if (!session?.user?.id) {
        return NextResponse.json({ error: '未授权' }, { status: 401 })
      }
      userId = session.user.id
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')

    // 获取通知日志（不过滤用户ID，获取所有记录用于测试）
    const logs = await notificationLogger.queryNotificationLogs({
      page,
      limit,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })

    // 获取统计数据
    const stats = await notificationLogger.getNotificationStats();

    return NextResponse.json({
      success: true,
      data: {
        logs: logs.logs,
        total: logs.total,
        page: logs.page,
        limit: logs.limit,
        totalPages: logs.totalPages,
        stats
      }
    })

  } catch (error) {
    console.error('获取测试历史失败:', error)
    return NextResponse.json(
      { error: '获取测试历史失败' },
      { status: 500 }
    )
  }
}