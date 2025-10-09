"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Hotel, UtensilsCrossed, Search, Calendar, MapPin, Phone, ChevronLeft, Ticket } from "lucide-react"
import type { Order } from "@/lib/schema"

const STATUS_BADGE_CLASS: Record<Order["status"], string> = {
  "待付款": "bg-coral text-sand",
  "待使用": "bg-ocean text-sand",
  "已完成": "bg-emerald-100 text-emerald-700",
  "已取消": "bg-muted text-muted-foreground",
}

const STATUS_TAB_MAP: Record<"pending" | "upcoming" | "completed", Order["status"]> = {
  pending: "待付款",
  upcoming: "待使用",
  completed: "已完成",
}

const STORE_PHONE = "0591-12345678"
const DEFAULT_STREET_ADDR = "平潭县海坛街道中心大道88号"

function normalizeDate(value: string) {
  if (!value) return ""
  const normalized = value.includes("T") ? value : value.replace(" ", "T")
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

type DisplayOrder = {
  id: number
  type: Order["type"]
  name: string
  image: string
  status: Order["status"]
  orderDate: string
  totalPrice: number
  roomType?: string | null
  checkIn?: string
  checkOut?: string
  nights?: number | null
  guests?: number | null
  date?: string | null
  time?: string | null
  address?: string
  phone?: string
}

async function buildDisplayOrder(order: Order): Promise<DisplayOrder> {
  let name = order.itemName?.trim() ?? ""
  let image = order.image ?? ""
  let address = (order as any).address ?? ""
  let phone = (order as any).phone ?? ""

  if (!name || !image || !address || !phone) {
    const base = order.type === "accommodation" ? "accommodations" : order.type === "food" ? "restaurants" : "attractions"
    try {
      const res = await fetch(`/api/${base}/${order.itemId}`)
      if (res.ok) {
        const item = await res.json()
        name = item.name || name
        image = item.image || image
        address = item.address ?? address
        phone = item.phone ?? phone
      }
    } catch {
      // ignore enrich errors
    }
  }

  if (!name) {
    name = order.type === "accommodation" ? "住宿订单" : order.type === "food" ? "餐饮订单" : "景点订单"
  }

  return {
    id: order.id,
    type: order.type,
    name,
    image: image || "/placeholder.svg",
    status: order.status,
    orderDate: (order as any).orderDate ?? "",
    totalPrice: order.totalPrice,
    roomType: (order as any).roomType ?? null,
    checkIn: (order as any).checkIn ?? undefined,
    checkOut: (order as any).checkOut ?? undefined,
    nights: (order as any).nights ?? null,
    guests: (order as any).guests ?? null,
    date: (order as any).date ?? null,
    time: (order as any).time ?? null,
    address: address || DEFAULT_STREET_ADDR,
    phone: phone || (order.type === "food" ? STORE_PHONE : "未提供"),
  }
}

export function OrdersManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [orders, setOrders] = useState<Order[]>([])
  const [displayOrders, setDisplayOrders] = useState<DisplayOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/orders", { credentials: "include" })
      if (!res.ok) throw new Error("failed")
      const data: Order[] = await res.json()
      setOrders(data)
      const enriched = await Promise.all(data.map(buildDisplayOrder))
      setDisplayOrders(enriched)
    } catch {
      setOrders([])
      setDisplayOrders([])
      setError("加载订单失败，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const handleAction = async (id: number, action: "pay" | "use" | "cancel") => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action }),
      })
      if (!res.ok) return
      await loadOrders()
    } catch {
      // ignore errors, user can retry
    }
  }

  const getStatusActions = (order: DisplayOrder) => {
    switch (order.status) {
      case "待付款":
        return (
          <>
            <Button size="sm" className="bg-ocean hover:bg-ocean/90 text-sand" onClick={() => handleAction(order.id, "pay")}>
              立即支付
            </Button>
            <Button size="sm" variant="outline" className="bg-transparent" onClick={() => handleAction(order.id, "cancel")}>
              取消订单
            </Button>
          </>
        )
      case "待使用":
        return (
          <>
            <Button size="sm" variant="outline" className="bg-transparent">
              查看详情
            </Button>
            <Button size="sm" variant="outline" className="bg-transparent" onClick={() => handleAction(order.id, "use")}>
              标记已使用
            </Button>
          </>
        )
      case "已完成":
        return (
          <>
            <Button size="sm" variant="outline" className="bg-transparent">
              再次预订
            </Button>
            <Button size="sm" variant="outline" className="bg-transparent">
              评价
            </Button>
          </>
        )
      case "已取消":
        return (
          <Button size="sm" variant="outline" className="bg-transparent">
            删除订单
          </Button>
        )
      default:
        return null
    }
  }

  const filteredOrders = useMemo(() => {
    const byStatus =
      activeTab === "all"
        ? displayOrders
        : displayOrders.filter((order) => order.status === STATUS_TAB_MAP[activeTab as keyof typeof STATUS_TAB_MAP])

    if (!searchQuery) return byStatus
    const keyword = searchQuery.trim().toLowerCase()
    return byStatus.filter((order) => order.name.toLowerCase().includes(keyword))
  }, [displayOrders, activeTab, searchQuery])

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <Link href="/profile">
          <Button variant="ghost" className="gap-2 mb-4 bg-transparent">
            <ChevronLeft className="h-4 w-4" />
            返回个人中心
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-2">我的订单</h1>
        <p className="text-muted-foreground">管理您的所有预订订单。</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索订单..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="all">全部订单</TabsTrigger>
          <TabsTrigger value="pending">待付款</TabsTrigger>
          <TabsTrigger value="upcoming">待使用</TabsTrigger>
          <TabsTrigger value="completed">已完成</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">正在加载订单...</CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">{error}</CardContent>
            </Card>
          ) : filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground mb-4">暂无订单</p>
                <Link href="/">
                  <Button className="bg-ocean hover:bg-ocean/90 text-sand">开始预订</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden border-border/50">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between p-4 bg-muted/30 border-b border-border/50">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">订单号：{order.id}</span>
                      <span className="text-muted-foreground">下单时间：{normalizeDate(order.orderDate)}</span>
                    </div>
                    <Badge className={STATUS_BADGE_CLASS[order.status]}>{order.status}</Badge>
                  </div>

                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex gap-4 flex-1">
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                          <Image src={order.image || "/placeholder.svg"} alt={order.name} fill className="object-cover" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {order.type === "accommodation" ? (
                              <Hotel className="h-5 w-5 text-ocean" />
                            ) : order.type === "food" ? (
                              <UtensilsCrossed className="h-5 w-5 text-ocean" />
                            ) : (
                              <Ticket className="h-5 w-5 text-ocean" />
                            )}
                            <h3 className="text-lg font-semibold text-foreground">
                              {order.name}
                            </h3>
                          </div>

                          {order.type === "accommodation" ? (
                            <div className="space-y-2 text-sm">
                              <p className="text-muted-foreground">{order.roomType || "标准客房"}</p>
                              <div className="flex items-center gap-4 flex-wrap">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">
                                    {order.checkIn} 至 {order.checkOut}
                                  </span>
                                </div>
                                <span className="text-muted-foreground">{order.nights || 1} 晚</span>
                                <span className="text-muted-foreground">{order.guests || 2} 人</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">{order.address}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">{order.phone}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-4 flex-wrap">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">
                                    {order.date} {order.time}
                                  </span>
                                </div>
                                <span className="text-muted-foreground">{order.guests || 2} 人</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">{order.address}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">{order.phone}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between md:w-48">
                        <div className="text-right mb-4">
                          <p className="text-sm text-muted-foreground mb-1">订单总额</p>
                          <p className="text-2xl font-bold text-ocean">¥{order.totalPrice}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-end">
                          <Link href={`/profile/orders/${order.id}`}>
                            <Button size="sm" variant="outline" className="bg-transparent">
                              查看详情
                            </Button>
                          </Link>
                          {getStatusActions(order)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
