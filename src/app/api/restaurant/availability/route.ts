import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/restaurant/availability?restaurantId=xxx&slotStart=ISO&slotEnd=ISO
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const restaurantId = searchParams.get("restaurantId") || undefined
    const slotStart = searchParams.get("slotStart") || undefined
    const slotEnd = searchParams.get("slotEnd") || undefined

    if (!restaurantId || !slotStart || !slotEnd) {
      return NextResponse.json({ error: "缺少必要参数：restaurantId, slotStart, slotEnd" }, { status: 400 })
    }

    const start = new Date(slotStart)
    const end = new Date(slotEnd)
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return NextResponse.json({ error: "时间参数不合法" }, { status: 400 })
    }

    // 默认容量（如需更精细可扩展到餐厅模型字段）
    const DEFAULT_CAPACITY = 40

    // 分别统计已确认与待处理的订单数量
    const [confirmedCount, pendingCount] = await Promise.all([
      prisma.order.count({
        where: {
          type: "RESTAURANT",
          restaurantId,
          bookingDate: { gte: start, lte: end },
          status: "CONFIRMED",
        },
      }),
      prisma.order.count({
        where: {
          type: "RESTAURANT",
          restaurantId,
          bookingDate: { gte: start, lte: end },
          status: "PENDING",
        },
      }),
    ])

    const capacity = DEFAULT_CAPACITY
    const used = confirmedCount + pendingCount
    const available = Math.max(capacity - used, 0)

    return NextResponse.json({
      restaurantId,
      slotStart: start.toISOString(),
      slotEnd: end.toISOString(),
      capacity,
      confirmedCount,
      pendingCount,
      available,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "查询失败" }, { status: 500 })
  }
}