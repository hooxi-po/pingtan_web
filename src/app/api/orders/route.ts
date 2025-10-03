import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { BookingNotificationService } from "@/lib/notification/booking-notification"

// 类型与校验（简单内联校验，避免额外依赖）
const allowedTypes = ["ATTRACTION", "ACCOMMODATION", "RESTAURANT", "PACKAGE", "EXPERIENCE"] as const
const allowedStatuses = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "REFUNDED"] as const
const allowedPriorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const
const allowedUrgency = ["NORMAL", "TIME_SENSITIVE", "LAST_MINUTE", "VIP"] as const

function isAllowed<T extends readonly string[]>(val: string | undefined, list: T): val is T[number] {
  return !!val && (list as readonly string[]).includes(val)
}

// 自动优先级计算（可根据需要进一步抽象到 lib）
function computePriorityScore(order: any, user: any) {
  let score = 0
  const amount = order.totalAmount ?? 0
  // 金额权重
  if (amount >= 2000) score += 40
  else if (amount >= 1000) score += 25
  else if (amount >= 500) score += 15

  // 支付状态与订单状态
  if (order.paymentStatus === "PAID" && order.status === "PENDING") score += 20
  if (order.status === "CONFIRMED") score += 10

  // 用户积分或角色
  if (user?.points && user.points >= 500) score += 10
  if (user?.role === "VIP") score += 10 // 若未来有 VIP 角色，可额外加权

  // 时间敏感性：入住/游玩日期临近
  const now = Date.now()
  const target = order.checkInDate ? new Date(order.checkInDate).getTime() : (order.bookingDate ? new Date(order.bookingDate).getTime() : null)
  if (target) {
    const diffHours = Math.abs(target - now) / (1000 * 60 * 60)
    if (diffHours <= 24) score += 30
    else if (diffHours <= 72) score += 15
  }

  return score
}

function scoreToPriority(score: number): { priority: (typeof allowedPriorities)[number], urgencyLevel: (typeof allowedUrgency)[number], isPriority: boolean } {
  if (score >= 60) return { priority: "CRITICAL", urgencyLevel: "LAST_MINUTE", isPriority: true }
  if (score >= 45) return { priority: "HIGH", urgencyLevel: "TIME_SENSITIVE", isPriority: true }
  if (score >= 25) return { priority: "MEDIUM", urgencyLevel: "NORMAL", isPriority: true }
  return { priority: "LOW", urgencyLevel: "NORMAL", isPriority: false }
}

// 开发环境下的游客/测试用户回退
async function getEffectiveUser(session: any) {
  let currentUserId = session?.user?.id || null
  let currentUserRole = session?.user?.role || "USER"

  if (!currentUserId) {
    if (process.env.NODE_ENV !== "production") {
      const devEmail = "dev.tester@local"
      const devUser = await prisma.user.upsert({
        where: { email: devEmail },
        update: {},
        create: { email: devEmail, password: "dev", name: "开发测试用户", role: "USER" },
      })
      currentUserId = devUser.id
      currentUserRole = devUser.role
    }
  }

  return { currentUserId, currentUserRole }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { currentUserId, currentUserRole } = await getEffectiveUser(session)
    if (!currentUserId) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const url = new URL(req.url)
    const type = url.searchParams.get("type") || undefined
    const status = url.searchParams.get("status") || undefined
    const priority = url.searchParams.get("priority") || undefined
    const isPriority = url.searchParams.get("isPriority")
    const scope = url.searchParams.get("scope") || "user" // admin 可查看全部
    // 新增筛选：餐厅与时间段（用于实时剩余桌位计算）
    const restaurantIdParam = url.searchParams.get("restaurantId") || undefined
    const slotStart = url.searchParams.get("slotStart") || undefined
    const slotEnd = url.searchParams.get("slotEnd") || undefined

    const where: any = {}
    if (scope !== "all" || currentUserRole !== "ADMIN") {
      where.userId = currentUserId
    }
    if (isAllowed(type, allowedTypes)) where.type = type
    if (isAllowed(status, allowedStatuses)) where.status = status
    if (isAllowed(priority, allowedPriorities)) where.priority = priority
    if (isPriority === "true") where.isPriority = true
    if (isPriority === "false") where.isPriority = false
    if (restaurantIdParam) where.restaurantId = restaurantIdParam
    if (slotStart || slotEnd) {
      where.bookingDate = {}
      if (slotStart) where.bookingDate.gte = new Date(slotStart)
      if (slotEnd) where.bookingDate.lte = new Date(slotEnd)
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      select: {
        id: true, type: true, status: true, totalAmount: true,
        paymentStatus: true, bookingDate: true, checkInDate: true, checkOutDate: true,
        priority: true, isPriority: true, urgencyLevel: true, priorityScore: true,
        createdAt: true, updatedAt: true,
        // 新增选取字段，便于前端展示与修改
        guestCount: true, contactName: true, contactPhone: true, contactEmail: true,
        specialRequests: true, restaurantId: true,
      }
    })

    return NextResponse.json({ orders })
  } catch (e: any) {
    console.error("Fetch orders error:", e)
    return NextResponse.json({ error: "获取订单失败" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { currentUserId, currentUserRole } = await getEffectiveUser(session)
    if (!currentUserId) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const body = await req.json()
    const { orderId, priority, isPriority, urgencyLevel, status, bookingDate: newBookingDate, guestCount: newGuestCount, specialRequests: newSpecialRequests } = body || {}
    if (!orderId) return NextResponse.json({ error: "参数缺失：orderId" }, { status: 400 })

    // 权限：普通用户仅允许更新自己的订单；ADMIN 可更新全部
    const order = await prisma.order.findUnique({ where: { id: orderId }, select: { userId: true } })
    if (!order) return NextResponse.json({ error: "订单不存在" }, { status: 404 })
    if (currentUserRole !== "ADMIN" && order.userId !== currentUserId) {
      return NextResponse.json({ error: "无权限" }, { status: 403 })
    }

    const data: any = {}
    if (priority && isAllowed(priority, allowedPriorities)) data.priority = priority
    if (typeof isPriority === "boolean") data.isPriority = isPriority
    if (urgencyLevel && isAllowed(urgencyLevel, allowedUrgency)) data.urgencyLevel = urgencyLevel
    if (status && isAllowed(status, allowedStatuses)) data.status = status
    // 新增允许修改：就餐时间、人数、座位偏好/备注
    if (newBookingDate) data.bookingDate = new Date(newBookingDate)
    if (typeof newGuestCount === "number" && newGuestCount > 0) data.guestCount = newGuestCount
    if (typeof newSpecialRequests === "string") data.specialRequests = newSpecialRequests

    const updated = await prisma.order.update({
      where: { id: orderId },
      data,
      select: {
        id: true, type: true, status: true, totalAmount: true,
        paymentStatus: true, bookingDate: true, checkInDate: true, checkOutDate: true,
        priority: true, isPriority: true, urgencyLevel: true, priorityScore: true,
        createdAt: true, updatedAt: true,
        guestCount: true, contactName: true, contactPhone: true, contactEmail: true,
        specialRequests: true, restaurantId: true,
      }
    })

    return NextResponse.json({ message: "更新成功", order: updated })
  } catch (e: any) {
    console.error("Update order error:", e)
    return NextResponse.json({ error: "更新失败" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { currentUserId, currentUserRole } = await getEffectiveUser(session)
    if (!currentUserId) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const body = await req.json()
    const { mode, action } = body || {}
    const op = mode || action || "auto"

    const user = await prisma.user.findUnique({ where: { id: currentUserId }, select: { id: true, points: true, role: true } })
    if (!user) return NextResponse.json({ error: "用户不存在" }, { status: 404 })

    // 创建订单
    if (op === "create") {
      const {
        type,
        totalAmount,
        paymentMethod,
        paymentStatus,
        bookingDate,
        checkInDate,
        checkOutDate,
        guestCount,
        specialRequests,
        contactName,
        contactPhone,
        contactEmail,
        attractionId,
        accommodationId,
        roomId,
        restaurantId,
        status,
      } = body || {}

      if (!isAllowed(type, allowedTypes)) return NextResponse.json({ error: "参数错误：type" }, { status: 400 })
      if (typeof totalAmount !== "number" || totalAmount <= 0) return NextResponse.json({ error: "参数错误：totalAmount" }, { status: 400 })
      if (!contactName || !contactPhone) return NextResponse.json({ error: "联系人信息缺失" }, { status: 400 })

      const orderDraft: any = {
        userId: currentUserId,
        type,
        status: isAllowed(status, ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "REFUNDED"]) ? status : "PENDING",
        totalAmount,
        paymentMethod,
        paymentStatus: isAllowed(paymentStatus, ["PENDING", "PAID", "FAILED", "REFUNDED"]) ? paymentStatus : "PAID",
        bookingDate: bookingDate ? new Date(bookingDate) : new Date(),
        checkInDate: checkInDate ? new Date(checkInDate) : null,
        checkOutDate: checkOutDate ? new Date(checkOutDate) : null,
        guestCount: typeof guestCount === "number" ? guestCount : null,
        specialRequests: specialRequests || null,
        contactName,
        contactPhone,
        contactEmail: contactEmail || null,
        attractionId: attractionId || null,
        accommodationId: accommodationId || null,
        roomId: roomId || null,
        restaurantId: restaurantId || null,
      }

      const score = computePriorityScore(orderDraft, user)
      const mapped = scoreToPriority(score)
      orderDraft.priorityScore = score
      orderDraft.priority = mapped.priority
      orderDraft.urgencyLevel = mapped.urgencyLevel
      orderDraft.isPriority = mapped.isPriority

      const created = await prisma.order.create({
        data: orderDraft,
        select: {
          id: true, type: true, status: true, totalAmount: true,
          paymentStatus: true, bookingDate: true, checkInDate: true, checkOutDate: true,
          priority: true, isPriority: true, urgencyLevel: true, priorityScore: true,
          createdAt: true, updatedAt: true,
          contactName: true, contactPhone: true, contactEmail: true,
          guestCount: true, specialRequests: true,
          attractionId: true, accommodationId: true, roomId: true, restaurantId: true,
        }
      })

      // 发送预订确认通知
      try {
        const bookingNotificationService = new BookingNotificationService()
        
        // 映射订单类型到服务类型
        const serviceTypeMap: Record<string, 'attraction' | 'accommodation' | 'restaurant' | 'package' | 'experience'> = {
          'ATTRACTION': 'attraction',
          'ACCOMMODATION': 'accommodation', 
          'RESTAURANT': 'restaurant',
          'PACKAGE': 'package',
          'EXPERIENCE': 'experience'
        }
        
        const mappedServiceType = serviceTypeMap[created.type] || 'attraction'
        
        const bookingData = {
          confirmationNumber: `PT${created.id.slice(-8).toUpperCase()}`,
          serviceName: getServiceName(created.type, created),
          serviceType: mappedServiceType,
          serviceDescription: getServiceDescription(created.type, created),
          bookingDate: created.bookingDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
          bookingTime: created.checkInDate ? created.checkInDate.toISOString().split('T')[1].slice(0, 5) : '12:00',
          totalAmount: created.totalAmount,
          currency: 'CNY',
          customerName: created.contactName || '客户',
          customerPhone: created.contactPhone || undefined,
          customerEmail: created.contactEmail || undefined,
          specialRequests: created.specialRequests || undefined,
          contactInfo: created.contactPhone && created.contactEmail ? {
            phone: created.contactPhone,
            email: created.contactEmail
          } : undefined
        }
        
        console.log('发送预订确认通知:', {
          userId: currentUserId,
          orderId: created.id,
          bookingData
        })
        
        await bookingNotificationService.sendBookingConfirmation({
          userId: currentUserId,
          orderId: created.id,
          bookingData
        })
      } catch (notificationError) {
        console.error('Failed to send booking confirmation notification:', notificationError)
        // 不影响订单创建，只记录错误
      }

      return NextResponse.json({ message: "订单创建成功", order: created })
    }

    // 生成测试数据（种子）
    if (op === "seed") {
      const count = typeof body?.count === "number" && body.count > 0 ? Math.min(body.count, 50) : 5
      const tx = [] as any[]
      for (let i = 0; i < count; i++) {
        const amount = Math.round(200 + Math.random() * 2000)
        const today = new Date()
        const checkIn = new Date(today.getTime() + (1 + Math.floor(Math.random() * 7)) * 24 * 60 * 60 * 1000)
        const checkOut = new Date(checkIn.getTime() + (1 + Math.floor(Math.random() * 5)) * 24 * 60 * 60 * 1000)

        const draft: any = {
          userId: currentUserId,
          type: "ACCOMMODATION",
          status: "PENDING",
          totalAmount: amount,
          paymentMethod: "card",
          paymentStatus: "PAID",
          bookingDate: today,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          guestCount: 2,
          specialRequests: null,
          contactName: "测试用户",
          contactPhone: "13800138000",
          contactEmail: null,
        }
        const score = computePriorityScore(draft, user)
        const mapped = scoreToPriority(score)
        draft.priorityScore = score
        draft.priority = mapped.priority
        draft.urgencyLevel = mapped.urgencyLevel
        draft.isPriority = mapped.isPriority

        tx.push(prisma.order.create({
          data: draft,
          select: {
            id: true, type: true, status: true, totalAmount: true,
            paymentStatus: true, bookingDate: true, checkInDate: true, checkOutDate: true,
            priority: true, isPriority: true, urgencyLevel: true, priorityScore: true,
            createdAt: true, updatedAt: true,
          }
        }))
      }

      const createdOrders = await prisma.$transaction(tx)
      return NextResponse.json({ message: "种子数据创建成功", count: createdOrders.length, orders: createdOrders })
    }

    // 默认：自动优先级识别
    const { orderIds, scope } = body || {}

    // 待评估订单集合
    let targetOrders: any[] = []
    if (Array.isArray(orderIds) && orderIds.length > 0) {
      targetOrders = await prisma.order.findMany({
        where: {
          id: { in: orderIds },
          ...(currentUserRole !== "ADMIN" ? { userId: currentUserId } : {}),
        },
      })
    } else {
      // 默认评估当前用户近期订单；ADMIN+scope=all 可评估全部
      const where: any = {}
      if (scope === "all" && currentUserRole === "ADMIN") {
        // no user filter
      } else {
        where.userId = currentUserId
      }
      targetOrders = await prisma.order.findMany({ where })
    }

    const updates = [] as any[]
    for (const o of targetOrders) {
      const score = computePriorityScore(o, user)
      const mapped = scoreToPriority(score)
      updates.push(prisma.order.update({
        where: { id: o.id },
        data: { priorityScore: score, priority: mapped.priority, urgencyLevel: mapped.urgencyLevel, isPriority: mapped.isPriority },
        select: {
          id: true, type: true, status: true, totalAmount: true,
          paymentStatus: true, bookingDate: true, checkInDate: true, checkOutDate: true,
          priority: true, isPriority: true, urgencyLevel: true, priorityScore: true,
          createdAt: true, updatedAt: true,
        }
      }))
    }

    const updatedOrders = updates.length > 0 ? await prisma.$transaction(updates) : []

    return NextResponse.json({ message: "优先级识别完成", count: updatedOrders.length, orders: updatedOrders })
  } catch (e: any) {
    console.error("Auto priority error:", e)
    return NextResponse.json({ message: "自动识别失败" }, { status: 500 })
  }
}

// 辅助函数：获取服务名称
function getServiceName(type: string, order: any): string {
  switch (type) {
    case 'ATTRACTION':
      return '景点门票'
    case 'ACCOMMODATION':
      return '住宿预订'
    case 'RESTAURANT':
      return '餐厅预订'
    case 'PACKAGE':
      return '旅游套餐'
    case 'EXPERIENCE':
      return '体验项目'
    default:
      return '预订服务'
  }
}

// 辅助函数：获取服务描述
function getServiceDescription(type: string, order: any): string {
  const serviceName = getServiceName(type, order)
  const guestInfo = order.guestCount ? `${order.guestCount}人` : ''
  const specialRequests = order.specialRequests ? `，特殊要求：${order.specialRequests}` : ''
  
  return `${serviceName}${guestInfo ? ` (${guestInfo})` : ''}${specialRequests}`
}

// 辅助函数：获取持续时间
function getDuration(type: string, order: any): string {
  if (type === 'ACCOMMODATION' && order.checkInDate && order.checkOutDate) {
    const checkIn = new Date(order.checkInDate)
    const checkOut = new Date(order.checkOutDate)
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    return `${nights}晚`
  }
  
  switch (type) {
    case 'RESTAURANT':
      return '2小时'
    case 'ATTRACTION':
      return '全天'
    case 'EXPERIENCE':
      return '半天'
    case 'PACKAGE':
      return '多天'
    default:
      return '待定'
  }
}

// 辅助函数：获取位置信息
function getLocation(type: string, order: any): string {
  // 这里可以根据实际的关联ID查询具体位置
  // 暂时返回通用位置信息
  return '平潭岛'
}