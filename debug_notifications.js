const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugNotifications() {
  try {
    console.log('=== 调试通知数据 ===\n')
    
    // 1. 检查特定用户的通知
    const userId = 'cmg04jlin0000s4nc4yrhs8ur' // 从日志中看到的用户ID
    
    console.log(`1. 检查用户 ${userId} 的通知:`)
    const userNotifications = await prisma.notification.findMany({
      where: {
        userId: userId,
        channel: 'IN_APP'
      },
      include: {
        user: {
          select: {
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`找到 ${userNotifications.length} 条通知:`)
    userNotifications.forEach((notif, index) => {
      console.log(`  ${index + 1}. ID: ${notif.id}`)
      console.log(`     标题: ${notif.title}`)
      console.log(`     内容: ${notif.content}`)
      console.log(`     类型: ${notif.type}`)
      console.log(`     状态: ${notif.status}`)
      console.log(`     渠道: ${notif.channel}`)
      console.log(`     用户: ${notif.user?.name} (${notif.user?.email})`)
      console.log(`     创建时间: ${notif.createdAt}`)
      if (notif.order) {
        console.log(`     关联订单: ${notif.order.id} (¥${notif.order.totalAmount})`)
      }
      console.log(`     元数据: ${JSON.stringify(notif.metadata, null, 2)}`)
      console.log('')
    })
    
    // 2. 检查所有应用内通知
    console.log('\n2. 检查所有应用内通知:')
    const allInAppNotifications = await prisma.notification.findMany({
      where: {
        channel: 'IN_APP'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })
    
    console.log(`总共有 ${allInAppNotifications.length} 条应用内通知:`)
    allInAppNotifications.forEach((notif, index) => {
      console.log(`  ${index + 1}. ${notif.title} - 用户: ${notif.user?.name} - 状态: ${notif.status}`)
    })
    
    // 3. 模拟API响应格式
    console.log('\n3. 模拟API响应格式:')
    const apiResponse = {
      success: true,
      notifications: userNotifications.map(notif => ({
        id: notif.id,
        title: notif.title,
        content: notif.content,
        type: notif.type,
        priority: notif.priority,
        status: notif.status,
        channel: notif.channel,
        userId: notif.userId,
        orderId: notif.orderId,
        createdAt: notif.createdAt,
        updatedAt: notif.updatedAt,
        metadata: notif.metadata,
        user: notif.user,
        order: notif.order
      })),
      total: userNotifications.length,
      page: 1,
      limit: 50
    }
    
    console.log('API响应格式预览:')
    console.log(JSON.stringify(apiResponse, null, 2))
    
  } catch (error) {
    console.error('调试过程中发生错误:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugNotifications()