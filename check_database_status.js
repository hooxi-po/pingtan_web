const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDatabaseStatus() {
  try {
    console.log('🔍 检查数据库状态...\n')

    // 1. 检查通知总数和状态分布
    const notificationStats = await prisma.notification.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    })

    const totalNotifications = await prisma.notification.count()
    console.log(`📊 通知统计:`)
    console.log(`   总数: ${totalNotifications}`)
    notificationStats.forEach(stat => {
      console.log(`   ${stat.status}: ${stat._count.id}`)
    })

    // 2. 检查通知渠道分布
    const channelStats = await prisma.notification.groupBy({
      by: ['channel'],
      _count: {
        id: true
      }
    })

    console.log(`\n📡 渠道分布:`)
    channelStats.forEach(stat => {
      console.log(`   ${stat.channel}: ${stat._count.id}`)
    })

    // 3. 查看最新的10条通知
    const latestNotifications = await prisma.notification.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
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
            type: true,
            status: true,
            totalAmount: true
          }
        }
      }
    })

    console.log(`\n📋 最新10条通知:`)
    latestNotifications.forEach((notif, index) => {
      console.log(`${index + 1}. [${notif.status}] ${notif.title}`)
      console.log(`   ID: ${notif.id}`)
      console.log(`   类型: ${notif.type}`)
      console.log(`   渠道: ${notif.channel}`)
      console.log(`   用户: ${notif.user?.name || '未知'} (${notif.user?.email || 'N/A'})`)
      console.log(`   创建时间: ${notif.createdAt.toLocaleString()}`)
      if (notif.order) {
        console.log(`   关联订单: ${notif.order.id} (${notif.order.type}, ¥${notif.order.totalAmount})`)
      }
      console.log(`   内容: ${notif.content.substring(0, 100)}...`)
      console.log('')
    })

    // 4. 检查用户数据
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            notifications: true,
            orders: true
          }
        }
      }
    })

    console.log(`👥 用户统计 (共${users.length}位):`)
    users.forEach(user => {
      console.log(`   ${user.name} (${user.email})`)
      console.log(`     ID: ${user.id}`)
      console.log(`     通知数: ${user._count.notifications}`)
      console.log(`     订单数: ${user._count.orders}`)
      console.log(`     注册时间: ${user.createdAt.toLocaleString()}`)
      console.log('')
    })

    // 5. 检查订单数据
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            notifications: true
          }
        }
      }
    })

    console.log(`📦 订单统计 (共${orders.length}个):`)
    orders.forEach(order => {
      console.log(`   订单 ${order.id}`)
      console.log(`     用户: ${order.user.name} (${order.user.email})`)
      console.log(`     类型: ${order.type}`)
      console.log(`     状态: ${order.status}`)
      console.log(`     金额: ¥${order.totalAmount}`)
      console.log(`     通知数: ${order._count.notifications}`)
      console.log(`     创建时间: ${order.createdAt.toLocaleString()}`)
      console.log('')
    })

    // 6. 测试API调用
    console.log(`🔧 模拟前端API调用测试:`)
    
    // 模拟获取应用内通知
    const inAppNotifications = await prisma.notification.findMany({
      where: {
        channel: 'IN_APP'
      },
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
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
            type: true,
            status: true
          }
        }
      }
    })

    console.log(`   应用内通知查询结果: ${inAppNotifications.length} 条`)
    inAppNotifications.forEach((notif, index) => {
      console.log(`   ${index + 1}. [${notif.status}] ${notif.title} (${notif.createdAt.toLocaleString()})`)
    })

    console.log('\n✅ 数据库检查完成')

  } catch (error) {
    console.error('❌ 数据库检查失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabaseStatus()