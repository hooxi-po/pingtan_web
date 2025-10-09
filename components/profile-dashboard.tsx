"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Order } from "@/lib/schema"
import {
  Calendar,
  ChevronRight,
  Edit,
  Hotel,
  LogOut,
  MapPin,
  Phone,
  Settings,
  ShoppingBag,
  Ticket,
  UtensilsCrossed,
  Mail,
} from "lucide-react"

const STATUS_LABELS: Record<Order["status"], string> = {
  "\u5f85\u4ed8\u6b3e": "\u5f85\u4ed8\u6b3e",
  "\u5f85\u4f7f\u7528": "\u5f85\u4f7f\u7528",
  "\u5df2\u5b8c\u6210": "\u5df2\u5b8c\u6210",
  "\u5df2\u53d6\u6d88": "\u5df2\u53d6\u6d88",
}

const STATUS_BADGE_CLASS: Record<Order["status"], string> = {
  "\u5f85\u4ed8\u6b3e": "bg-coral text-sand",
  "\u5f85\u4f7f\u7528": "bg-ocean text-sand",
  "\u5df2\u5b8c\u6210": "bg-emerald-100 text-emerald-700",
  "\u5df2\u53d6\u6d88": "bg-muted text-muted-foreground",
}

type UserSummary = {
  id: number
  name: string
  email: string
  phone: string | null
}

type RecentOrder = {
  id: number
  type: Order["type"]
  name: string
  image: string
  orderDate: string
  status: Order["status"]
  totalPrice: number
}

function normalizeDate(value: string) {
  if (!value) return ""
  const normalized = value.includes("T") ? value : value.replace(" ", "T")
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

function parseOrderDate(value: string) {
  if (!value) return 0
  const normalized = value.includes("T") ? value : value.replace(" ", "T")
  const time = Date.parse(normalized)
  return Number.isNaN(time) ? 0 : time
}

function getOrderIcon(type: Order["type"]) {
  switch (type) {
    case "accommodation":
      return <Hotel className="h-4 w-4 text-ocean" />
    case "food":
      return <UtensilsCrossed className="h-4 w-4 text-ocean" />
    default:
      return <Ticket className="h-4 w-4 text-ocean" />
  }
}

async function enrichOrder(order: Order): Promise<RecentOrder> {
  let name = order.itemName?.trim() ?? ""
  let image = order.image ?? ""

  if (!name || !image) {
    const base = order.type === "accommodation" ? "accommodations" : order.type === "food" ? "restaurants" : "attractions"
    try {
      const response = await fetch(`/api/${base}/${order.itemId}`)
      if (response.ok) {
        const item = await response.json()
        name = item.name || name
        image = item.image || image
      }
    } catch {
      // ignore enrich errors and fall back to stored snapshot
    }
  }

  if (!name) {
    name = order.type === "accommodation" ? "\u4f4f\u5bbf\u8ba2\u5355" : order.type === "food" ? "\u9910\u996e\u8ba2\u5355" : "\u666f\u70b9\u8ba2\u5355"
  }

  return {
    id: order.id,
    type: order.type,
    name,
    image: image || "/placeholder.svg",
    orderDate: order.orderDate,
    status: order.status,
    totalPrice: order.totalPrice,
  }
}

export function ProfileDashboard() {
  const router = useRouter()

  const [user, setUser] = useState<UserSummary | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)

  const [orders, setOrders] = useState<Order[]>([])
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState<string | null>(null)
  const [logoutLoading, setLogoutLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" })
        if (res.status === 401) {
          if (!cancelled) router.push("/login")
          return
        }
        if (!res.ok) throw new Error("failed")
        const data = await res.json()
        if (!cancelled) setUser(data.user as UserSummary)
      } catch {
        // keep user as null and redirect handled elsewhere
      } finally {
        if (!cancelled) setLoadingUser(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [router])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setOrdersLoading(true)
      setOrdersError(null)
      try {
        const res = await fetch("/api/orders", { credentials: "include" })
        if (res.status === 401) {
          if (!cancelled) router.push("/login")
          return
        }
        if (!res.ok) throw new Error("failed")
        const data: Order[] = await res.json()
        if (cancelled) return
        setOrders(data)
        const sorted = [...data].sort((a, b) => parseOrderDate(b.orderDate) - parseOrderDate(a.orderDate))
        const top = sorted.slice(0, 4)
        const enriched = await Promise.all(top.map(enrichOrder))
        if (!cancelled) setRecentOrders(enriched)
      } catch {
        if (!cancelled) {
          setOrders([])
          setRecentOrders([])
          setOrdersError("\u52a0\u8f7d\u8ba2\u5355\u5931\u8d25，请稍后重试")
        }
      } finally {
        if (!cancelled) setOrdersLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [router])

  const orderStats = useMemo(() => {
    const totals = {
      total: orders.length,
      pending: 0,
      upcoming: 0,
      completed: 0,
      cancelled: 0,
    }
    orders.forEach((order) => {
      switch (order.status) {
        case "\u5f85\u4ed8\u6b3e":
          totals.pending += 1
          break
        case "\u5f85\u4f7f\u7528":
          totals.upcoming += 1
          break
        case "\u5df2\u5b8c\u6210":
          totals.completed += 1
          break
        case "\u5df2\u53d6\u6d88":
          totals.cancelled += 1
          break
        default:
          break
      }
    })
    return totals
  }, [orders])

  const latestOrderDate = useMemo(() => {
    if (!orders.length) return "\u6682\u65e0"
    const sorted = [...orders].sort((a, b) => parseOrderDate(b.orderDate) - parseOrderDate(a.orderDate))
    return normalizeDate(sorted[0].orderDate)
  }, [orders])

  const quickActions = useMemo(() => [
    {
      label: "\u6211\u7684\u8ba2\u5355",
      icon: ShoppingBag,
      href: "/profile/orders",
      badge: orderStats.total ? String(orderStats.total) : undefined,
    },
    {
      label: "\u4e2a\u4eba\u8bbe\u7f6e",
      icon: Settings,
      href: "/profile/settings",
    },
  ], [orderStats.total])

  const statsCards = useMemo(() => [
    { label: "\u5f85\u4ed8\u6b3e", value: orderStats.pending, icon: ShoppingBag, color: "text-coral" },
    { label: "\u5f85\u4f7f\u7528", value: orderStats.upcoming, icon: Ticket, color: "text-ocean" },
    { label: "\u5df2\u5b8c\u6210", value: orderStats.completed, icon: Calendar, color: "text-emerald-500" },
    { label: "\u5df2\u53d6\u6d88", value: orderStats.cancelled, icon: MapPin, color: "text-muted-foreground" },
  ], [orderStats.pending, orderStats.upcoming, orderStats.completed, orderStats.cancelled])

  const handleLogout = async () => {
    setLogoutLoading(true)
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch {
      // ignore network errors, still attempt to redirect
    } finally {
      setLogoutLoading(false)
      router.push("/login")
      router.refresh()
    }
  }

  if (loadingUser) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card className="mb-8 border-border/50">
          <CardContent className="p-6 space-y-4">
            <div className="h-6 w-40 bg-muted rounded" />
            <div className="h-4 w-64 bg-muted rounded" />
            <div className="h-4 w-56 bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Card className="mb-8 border-border/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <Image src="/placeholder.svg" alt={user.name} width={100} height={100} className="rounded-full" />
              <Badge className="absolute bottom-0 right-0 bg-ocean text-sand">普通会员</Badge>
            </div>

            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
                  <Link href="/profile/settings">
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <Edit className="h-4 w-4" />
                      编辑资料
                    </Button>
                  </Link>
                </div>
                <Button variant="outline" className="gap-2 bg-transparent" onClick={handleLogout} disabled={logoutLoading}>
                  <LogOut className="h-4 w-4" />
                  {logoutLoading ? "正在退出..." : "退出登录"}
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{user.phone || "未填写"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>最近订单：{orderStats.total} 笔</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>最新订单时间：{latestOrderDate}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statsCards.map((stat) => (
          <Card key={stat.label} className="border-border/50 hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <stat.icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
              <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>最近订单</span>
                <Link href="/profile/orders">
                  <Button variant="ghost" size="sm" className="gap-1">
                    查看全部
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ordersLoading ? (
                <div className="text-center text-muted-foreground">正在加载最近订单...</div>
              ) : ordersError ? (
                <div className="text-center text-muted-foreground">{ordersError}</div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center text-muted-foreground">暂无最近订单</div>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <div className="relative w-20 h-20 rounded overflow-hidden flex-shrink-0 bg-muted">
                      <Image src={order.image || "/placeholder.svg"} alt={order.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getOrderIcon(order.type)}
                        <h4 className="font-medium text-foreground truncate">{order.name}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{normalizeDate(order.orderDate)}</p>
                      <div className="flex items-center gap-2">
                        <Badge className={STATUS_BADGE_CLASS[order.status]}>{STATUS_LABELS[order.status]}</Badge>
                        <span className="text-sm font-medium text-ocean">¥{order.totalPrice}</span>
                      </div>
                    </div>
                    <Link href={`/profile/orders/${order.id}`}>
                      <Button variant="outline" size="sm" className="bg-transparent">
                        查看详情
                      </Button>
                    </Link>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>快捷操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((action) => (
                <Link key={action.label} href={action.href}>
                  <Button variant="ghost" className="w-full justify-between hover:bg-muted/50 bg-transparent" size="lg">
                    <div className="flex items-center gap-3">
                      <action.icon className="h-5 w-5 text-ocean" />
                      <span>{action.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {action.badge && (
                        <Badge variant="secondary" className="bg-coral text-sand">
                          {action.badge}
                        </Badge>
                      )}
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>会员特权</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>升级会员即可解锁专属折扣、优先预订和生日礼遇。</p>
              <Button variant="outline" className="w-full bg-transparent">
                了解会员权益
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
