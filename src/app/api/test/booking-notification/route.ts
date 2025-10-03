import { NextRequest, NextResponse } from "next/server"
import { BookingNotificationService } from "@/lib/notification/booking-notification"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

/**
 * 测试预订通知发送的API端点
 * 用于验证通知系统的功能和重试机制
 */
export async function POST(req: NextRequest) {
  try {
    // 在开发环境下允许测试，不需要认证
    if (process.env.NODE_ENV !== 'development') {
      const session = await getServerSession(authOptions)
      if (!session) {
        return NextResponse.json({ error: "未授权" }, { status: 401 })
      }
    }

    const body = await req.json()
    const { 
      testType = "basic", 
      userId = "cmgakl3u10000s4vghyr2342b", // 使用数据库中存在的用户ID
      orderId,
      channels = ["in_app"],
      forceError = false 
    } = body

    console.log('收到通知测试请求:', { testType, userId, orderId, channels })

    const bookingNotificationService = new BookingNotificationService()
    const prisma = new PrismaClient()

    // 如果没有提供orderId，创建一个测试订单
    let actualOrderId = orderId
    if (!actualOrderId) {
      const testOrder = await prisma.order.create({
        data: {
          userId,
          type: 'ACCOMMODATION',
          status: 'CONFIRMED',
          totalAmount: 1288,
          contactName: '测试用户',
          contactPhone: '13800138000',
          contactEmail: 'test@example.com',
          bookingDate: new Date(),
          checkInDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 明天
          checkOutDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 后天
          guestCount: 2
        }
      })
      actualOrderId = testOrder.id
      console.log('创建测试订单:', testOrder.id)
    }

    // 模拟订单数据 - 符合BookingConfirmationData接口
    const mockOrderData = {
      userId,
      orderId: actualOrderId,
      bookingData: {
        confirmationNumber: `CF${Date.now()}`,
        serviceName: "海景度假酒店",
        serviceType: "accommodation" as const,
        serviceDescription: "豪华海景房 (2人)，特殊要求：高层房间",
        bookingDate: new Date().toISOString().split('T')[0],
        bookingTime: "15:00",
        totalAmount: 1288,
        currency: "CNY",
        customerName: "测试用户",
        customerPhone: "13800138000",
        customerEmail: "test@example.com",
        specialRequests: "高层房间，海景视野",
        cancellationPolicy: "入住前24小时可免费取消",
        contactInfo: {
          phone: "13800138000",
          email: "test@example.com"
        }
      }
    }

    let result
     
     if (forceError) {
       result = { success: false, error: "强制错误测试" }
     } else {
       switch (testType) {
         case "basic":
           result = await bookingNotificationService.sendBookingConfirmation(mockOrderData)
           break
         case "batch":
           // 批量测试 - 发送多个通知
           const batchResults = []
           for (let i = 0; i < 3; i++) {
             const batchOrderData = {
               ...mockOrderData,
               bookingData: {
                 ...mockOrderData.bookingData,
                 confirmationNumber: `CF${Date.now()}-${i}`
               }
             }
             const batchResult = await bookingNotificationService.sendBookingConfirmation(batchOrderData)
             batchResults.push(batchResult)
           }
           result = { success: true, batchResults }
           break
         case "reminder":
           result = await bookingNotificationService.sendBookingReminder(actualOrderId, 60)
           break
         case "cancellation":
           // 使用状态变更通知来模拟取消
           const cancellationData = {
             userId,
             orderId: actualOrderId,
             bookingData: {
               confirmationNumber: mockOrderData.bookingData.confirmationNumber,
               serviceName: mockOrderData.bookingData.serviceName,
               serviceType: mockOrderData.bookingData.serviceType,
               serviceDescription: mockOrderData.bookingData.serviceDescription,
               bookingDate: mockOrderData.bookingData.bookingDate,
               bookingTime: mockOrderData.bookingData.bookingTime,
               totalAmount: mockOrderData.bookingData.totalAmount,
               currency: mockOrderData.bookingData.currency,
               customerName: mockOrderData.bookingData.customerName,
               customerPhone: mockOrderData.bookingData.customerPhone,
               customerEmail: mockOrderData.bookingData.customerEmail,
               oldStatus: "CONFIRMED",
               newStatus: "CANCELLED",
               changeReason: "用户主动取消",
               refundAmount: mockOrderData.bookingData.totalAmount,
               contactInfo: mockOrderData.bookingData.contactInfo
             }
           }
           result = await bookingNotificationService.sendBookingStatusChange(cancellationData)
           break
         default:
           result = { success: false, error: "未知的测试类型" }
       }
     }

    // 清理：删除测试订单（如果是我们创建的）
    if (!orderId && actualOrderId) {
      await prisma.order.delete({
        where: { id: actualOrderId }
      })
      console.log('删除测试订单:', actualOrderId)
    }

    await prisma.$disconnect()

    return NextResponse.json({
      success: true,
      testType,
      result,
      timestamp: new Date().toISOString(),
      orderId: actualOrderId
    })

  } catch (error: any) {
    console.error("Booking notification test failed:", error)
    
    return NextResponse.json({
      success: false,
      error: error.message || "通知测试失败",
      timestamp: new Date().toISOString(),
      details: {
        name: error.name,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined
      }
    }, { status: 500 })
  }
}

/**
 * 获取通知测试状态和统计信息
 */
export async function GET(req: NextRequest) {
  try {
    // 开发环境下允许测试，不需要认证
    const isDev = process.env.NODE_ENV === 'development'
    
    if (!isDev) {
      const session = await getServerSession(authOptions)
      if (!session?.user?.id) {
        return NextResponse.json({ error: "未授权" }, { status: 401 })
      }
    }

    // 这里可以添加获取通知发送统计的逻辑
    // 暂时返回模拟数据
    const stats = {
      totalSent: 156,
      successRate: 0.95,
      failedCount: 8,
      retryCount: 12,
      averageDeliveryTime: "2.3s",
      lastTestTime: new Date().toISOString(),
      availableTestTypes: [
        "basic",
        "multi-channel", 
        "reminder",
        "error-simulation",
        "batch"
      ]
    }

    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
      message: "获取通知测试统计成功"
    })

  } catch (error) {
    console.error('获取通知测试统计失败:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '未知错误' 
      },
      { status: 500 }
    )
  }
}