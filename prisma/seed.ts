import { PrismaClient, NotificationType, NotificationChannel, NotificationStatus, NotificationPriority, AccommodationType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('开始数据库种子初始化...')

  // 创建测试用户
  const hashedPassword = await bcrypt.hash('123456', 10)
  
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: '测试用户',
      password: hashedPassword,
      role: 'USER',
      phone: '13800138000',
      avatar: 'https://via.placeholder.com/150',
    },
  })

  console.log('创建测试用户:', testUser)

  // 创建管理员用户
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: '管理员',
      password: hashedPassword,
      role: 'ADMIN',
      phone: '13900139000',
      avatar: 'https://via.placeholder.com/150',
    },
  })

  console.log('创建管理员用户:', adminUser)

  // 创建通知模板
  const templates = [
    {
      name: 'payment_success',
      type: NotificationType.PAYMENT_SUCCESS,
      channel: NotificationChannel.IN_APP,
      title: '支付成功通知',
      content: '您的订单 {{orderId}} 支付成功，金额 {{amount}} 元。',
      variables: ['orderId', 'amount'],
    },
    {
      name: 'order_confirmed',
      type: NotificationType.ORDER_CONFIRMED,
      channel: NotificationChannel.IN_APP,
      title: '订单确认通知',
      content: '您的订单 {{orderId}} 已确认，预计 {{date}} 开始服务。',
      variables: ['orderId', 'date'],
    },
    {
      name: 'system_announcement',
      type: NotificationType.SYSTEM_ANNOUNCEMENT,
      channel: NotificationChannel.IN_APP,
      title: '系统公告',
      content: '{{content}}',
      variables: ['content'],
    },
  ]

  for (const template of templates) {
    await prisma.notificationTemplate.upsert({
      where: { name: template.name },
      update: template,
      create: template,
    })
  }

  console.log('创建通知模板完成')

  // 创建用户通知配置
  const channels = [NotificationChannel.SMS, NotificationChannel.EMAIL, NotificationChannel.IN_APP, NotificationChannel.PUSH] as const
  
  for (const user of [testUser, adminUser]) {
    for (const channel of channels) {
      await prisma.notificationConfig.upsert({
        where: {
          userId_channel: {
            userId: user.id,
            channel: channel,
          },
        },
        update: {},
        create: {
          userId: user.id,
          channel: channel,
          isEnabled: true,
          preferences: {
            quiet_hours: {
              enabled: false,
              start: '22:00',
              end: '08:00',
            },
            frequency: 'immediate',
          },
        },
      })
    }
  }

  console.log('创建用户通知配置完成')

  // 创建一些测试通知
  const notifications = [
    {
      userId: testUser.id,
      type: NotificationType.SYSTEM_ANNOUNCEMENT,
      channel: NotificationChannel.IN_APP,
      status: NotificationStatus.DELIVERED,
      priority: NotificationPriority.NORMAL,
      title: '欢迎使用平潭旅游系统',
      content: '欢迎您使用平潭旅游系统！我们为您提供最优质的旅游服务。',
      sentAt: new Date(),
      deliveredAt: new Date(),
    },
    {
      userId: testUser.id,
      type: NotificationType.PROMOTIONAL,
      channel: NotificationChannel.IN_APP,
      status: NotificationStatus.SENT,
      priority: NotificationPriority.LOW,
      title: '春节特惠活动',
      content: '春节期间，所有景点门票8折优惠，快来预订吧！',
      sentAt: new Date(),
    },
    {
      userId: adminUser.id,
      type: NotificationType.SYSTEM_ANNOUNCEMENT,
      channel: NotificationChannel.IN_APP,
      status: NotificationStatus.PENDING,
      priority: NotificationPriority.HIGH,
      title: '系统维护通知',
      content: '系统将于今晚23:00-01:00进行维护，期间可能影响部分功能使用。',
    },
  ]

  for (const notification of notifications) {
    await prisma.notification.create({
      data: notification,
    })
  }

  console.log('创建测试通知完成')

  // 创建住宿数据
  const accommodations = [
    {
      id: '1',
      name: '海景石头厝民宿',
      nameEn: 'Seaview Stone House B&B',
      nameTw: '海景石頭厝民宿',
      description: '传统石头厝建筑，面朝大海，春暖花开。体验最地道的平潭渔村生活。',
      descriptionEn: 'Traditional stone house architecture facing the sea. Experience authentic Pingtan fishing village life.',
      descriptionTw: '傳統石頭厝建築，面朝大海，春暖花開。體驗最地道的平潭漁村生活。',
      type: AccommodationType.STONE_HOUSE_HOMESTAY,
      address: '平潭县流水镇北港村',
      latitude: 25.5034,
      longitude: 119.7909,
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'
      ],
      amenities: ['免费WiFi', '空调', '热水器', '洗衣机', '厨房', '停车位'],
      roomTypes: [
        {
          name: '海景大床房',
          price: 288,
          maxGuests: 2,
          bedType: '大床',
          size: 25,
          amenities: ['海景', '阳台', '独立卫浴']
        },
        {
          name: '家庭套房',
          price: 388,
          maxGuests: 4,
          bedType: '双床',
          size: 35,
          amenities: ['客厅', '厨房', '独立卫浴']
        }
      ],
      priceRange: '200-400',
      rating: 4.8,
      reviewCount: 156,
      contactPhone: '0591-12345678',
      contactEmail: 'seaview@example.com',
      checkInTime: '15:00',
      checkOutTime: '12:00',
      policies: '入住需提供身份证，禁止吸烟，禁止携带宠物。'
    },
    {
      id: '2',
      name: '蓝眼泪精品酒店',
      nameEn: 'Blue Tears Boutique Hotel',
      nameTw: '藍眼淚精品酒店',
      description: '现代化精品酒店，位于坛南湾畔，是观赏蓝眼泪奇观的最佳住宿选择。',
      descriptionEn: 'Modern boutique hotel located by Tannan Bay, the best accommodation choice for viewing the blue tears phenomenon.',
      descriptionTw: '現代化精品酒店，位於壇南灣畔，是觀賞藍眼淚奇觀的最佳住宿選擇。',
      type: AccommodationType.BOUTIQUE_HOTEL,
      address: '平潭县潭城镇坛南湾',
      latitude: 25.4978,
      longitude: 119.7856,
      images: [
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800'
      ],
      amenities: ['免费WiFi', '空调', '24小时前台', '餐厅', '健身房', '停车场', '接送服务'],
      roomTypes: [
        {
          name: '豪华海景房',
          price: 588,
          maxGuests: 2,
          bedType: '大床',
          size: 40,
          amenities: ['海景', '阳台', '浴缸', '迷你吧']
        },
        {
          name: '行政套房',
          price: 888,
          maxGuests: 3,
          bedType: '大床+沙发床',
          size: 60,
          amenities: ['客厅', '工作区', '浴缸', '迷你吧']
        }
      ],
      priceRange: '500-1000',
      rating: 4.6,
      reviewCount: 89,
      contactPhone: '0591-87654321',
      contactEmail: 'bluetears@example.com',
      checkInTime: '14:00',
      checkOutTime: '12:00',
      policies: '提供24小时前台服务，可安排接送服务，欢迎携带宠物（需额外收费）。'
    },
    {
      id: '3',
      name: '渔家乐客栈',
      nameEn: 'Fisherman\'s Inn',
      nameTw: '漁家樂客棧',
      description: '体验渔家生活，品尝新鲜海鲜，感受平潭独特的海岛文化。',
      descriptionEn: 'Experience fisherman\'s life, taste fresh seafood, and feel the unique island culture of Pingtan.',
      descriptionTw: '體驗漁家生活，品嚐新鮮海鮮，感受平潭獨特的海島文化。',
      type: AccommodationType.GUESTHOUSE,
      address: '平潭县苏澳镇东美村',
      latitude: 25.5123,
      longitude: 119.8012,
      images: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'
      ],
      amenities: ['免费WiFi', '空调', '餐厅', '海鲜加工', '渔船体验', '停车位'],
      roomTypes: [
        {
          name: '标准双人房',
          price: 188,
          maxGuests: 2,
          bedType: '双床',
          size: 20,
          amenities: ['独立卫浴', '空调', '电视']
        },
        {
          name: '三人间',
          price: 258,
          maxGuests: 3,
          bedType: '三床',
          size: 25,
          amenities: ['独立卫浴', '空调', '电视']
        }
      ],
      priceRange: '150-300',
      rating: 4.3,
      reviewCount: 234,
      contactPhone: '0591-23456789',
      contactEmail: 'fisherman@example.com',
      checkInTime: '14:00',
      checkOutTime: '11:00',
      policies: '可提供海鲜加工服务，安排渔船出海体验，欢迎团体预订。'
    },
    {
      id: '4',
      name: '半山海景度假村',
      nameEn: 'Hillside Seaview Resort',
      nameTw: '半山海景度假村',
      description: '坐落在半山腰的度假村，拥有绝佳的海景视野和完善的度假设施。',
      descriptionEn: 'A resort located on the hillside with excellent sea views and complete resort facilities.',
      descriptionTw: '坐落在半山腰的度假村，擁有絕佳的海景視野和完善的度假設施。',
      type: AccommodationType.RESORT,
      address: '平潭县平原镇红岩山',
      latitude: 25.5089,
      longitude: 119.7723,
      images: [
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
        'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800'
      ],
      amenities: ['免费WiFi', '空调', '游泳池', 'SPA中心', '健身房', '餐厅', '会议室', '停车场'],
      roomTypes: [
        {
          name: '山景标准房',
          price: 468,
          maxGuests: 2,
          bedType: '大床',
          size: 35,
          amenities: ['山景', '阳台', '独立卫浴', '迷你吧']
        },
        {
          name: '海景别墅',
          price: 1288,
          maxGuests: 6,
          bedType: '三卧室',
          size: 120,
          amenities: ['私人泳池', '花园', '厨房', '客厅', '多个卫浴']
        }
      ],
      priceRange: '400-1500',
      rating: 4.7,
      reviewCount: 67,
      contactPhone: '0591-34567890',
      contactEmail: 'hillside@example.com',
      checkInTime: '15:00',
      checkOutTime: '12:00',
      policies: '提供度假村全套服务，包含SPA、游泳池等设施，适合家庭度假。'
    },
    {
      id: '5',
      name: '古城文化客栈',
      nameEn: 'Ancient City Cultural Inn',
      nameTw: '古城文化客棧',
      description: '位于平潭古城区，融合传统文化与现代舒适，体验平潭深厚的历史底蕴。',
      descriptionEn: 'Located in Pingtan ancient city area, combining traditional culture with modern comfort, experience the profound historical heritage of Pingtan.',
      descriptionTw: '位於平潭古城區，融合傳統文化與現代舒適，體驗平潭深厚的歷史底蘊。',
      type: AccommodationType.BOUTIQUE_HOTEL,
      address: '平潭县潭城镇古城街',
      latitude: 25.5012,
      longitude: 119.7889,
      images: [
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
        'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800'
      ],
      amenities: ['免费WiFi', '空调', '茶艺室', '书吧', '文化展厅', '庭院', '停车位'],
      roomTypes: [
        {
          name: '文化主题房',
          price: 328,
          maxGuests: 2,
          bedType: '大床',
          size: 28,
          amenities: ['文化装饰', '茶具', '独立卫浴', '书桌']
        },
        {
          name: '古典套房',
          price: 528,
          maxGuests: 3,
          bedType: '大床+榻榻米',
          size: 45,
          amenities: ['客厅', '茶室', '独立卫浴', '古典家具']
        }
      ],
      priceRange: '300-600',
      rating: 4.5,
      reviewCount: 123,
      contactPhone: '0591-45678901',
      contactEmail: 'cultural@example.com',
      checkInTime: '14:00',
      checkOutTime: '12:00',
      policies: '提供文化体验活动，茶艺表演，适合文化爱好者入住。'
    },
    {
      id: '6',
      name: '海滨青年旅舍',
      nameEn: 'Seaside Youth Hostel',
      nameTw: '海濱青年旅舍',
      description: '经济实惠的青年旅舍，距离海滩仅50米，是背包客和年轻旅行者的理想选择。',
      descriptionEn: 'An affordable youth hostel just 50 meters from the beach, ideal for backpackers and young travelers.',
      descriptionTw: '經濟實惠的青年旅舍，距離海灘僅50米，是背包客和年輕旅行者的理想選擇。',
      type: AccommodationType.GUESTHOUSE,
      address: '平潭县潭城镇海滨路',
      latitude: 25.4956,
      longitude: 119.7834,
      images: [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
        'https://images.unsplash.com/photo-1586611292717-f828b167408c?w=800'
      ],
      amenities: ['免费WiFi', '空调', '公共厨房', '洗衣房', '公共休息区', '自行车租赁'],
      roomTypes: [
        {
          name: '6人间床位',
          price: 68,
          maxGuests: 1,
          bedType: '单人床',
          size: 20,
          amenities: ['共用卫浴', '储物柜', '床帘']
        },
        {
          name: '双人间',
          price: 158,
          maxGuests: 2,
          bedType: '双床',
          size: 15,
          amenities: ['独立卫浴', '空调', '储物柜']
        }
      ],
      priceRange: '60-200',
      rating: 4.2,
      reviewCount: 298,
      contactPhone: '0591-56789012',
      contactEmail: 'seaside@example.com',
      checkInTime: '15:00',
      checkOutTime: '11:00',
      policies: '提供背包客友好服务，公共设施齐全，适合预算有限的旅行者。'
    }
  ]

  for (const accommodation of accommodations) {
    await prisma.accommodation.upsert({
      where: { id: accommodation.id },
      update: {},
      create: accommodation,
    })
  }

  console.log('创建住宿数据完成')

  console.log('数据库种子初始化完成！')
}

main()
  .catch((e) => {
    console.error('种子初始化失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })