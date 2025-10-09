"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone } from "lucide-react"
import type { Order } from "@/lib/schema"

interface OrderDetailsProps {
  id: string
}

const STATUS_LABELS: Record<Order["status"], string> = {
  "待付款": "待付款",
  "待使用": "待使用",
  "已完成": "已完成",
  "已取消": "已取消",
}

const STATUS_BADGE_CLASS: Record<Order["status"], string> = {
  "待付款": "bg-coral text-sand",
  "待使用": "bg-ocean text-sand",
  "已完成": "bg-emerald-100 text-emerald-700",
  "已取消": "bg-muted text-muted-foreground",
}

function normalizeDate(value: string) {
  if (!value) return ""
  const normalized = value.includes("T") ? value : value.replace(" ", "T")
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

export function OrderDetails({ id }: OrderDetailsProps) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/orders/${id}`, { credentials: "include" })
        if (res.status === 404) {
          setError("订单不存在或无权限查询")
          setOrder(null)
          return
        }
        if (!res.ok) {
          setError("加载订单失败")
          setOrder(null)
          return
        }
        const data: Order = await res.json()
        setOrder(data)
      } catch {
        setError("网络异常，请稍后重试")
        setOrder(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/profile/orders">
          <Button variant="ghost" className="bg-transparent">
            返回订单列表
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">订单详情</h1>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">正在加载...</CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">{error}</CardContent>
        </Card>
      ) : order ? (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">订单号：{order.id}</div>
              <Badge className={STATUS_BADGE_CLASS[order.status]}>{STATUS_LABELS[order.status]}</Badge>
            </div>

            <div className="space-y-2">
              <div>
                订单类型：{order.type === "accommodation" ? "住宿" : order.type === "food" ? "美食" : "景点"}
              </div>
              <div>商品名称：{(order as any).itemName || "-"}</div>
              <div>商品 ID：{order.itemId}</div>
              {order.type === "accommodation" ? (
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>入住：{(order as any).checkIn || "-"}；退房：{(order as any).checkOut || "-"}</div>
                  <div>
                    晚数：{(order as any).nights ?? "-"}；房间：{(order as any).rooms ?? "-"}；客人：{(order as any).guests ?? "-"}
                  </div>
                  {(order as any).roomType && <div>房型：{(order as any).roomType}</div>}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground space-y-1">
                  {(order as any).date && <div>日期：{(order as any).date}</div>}
                  {(order as any).time && <div>时间：{(order as any).time}</div>}
                  {(order as any).guests && <div>人数：{(order as any).guests}</div>}
                </div>
              )}

              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>地址：{(order as any).address || "未提供"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>电话：{(order as any).phone || "未提供"}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <div className="text-muted-foreground">下单时间：{normalizeDate((order as any).orderDate)}</div>
              <div className="text-2xl font-bold text-ocean">¥{order.totalPrice}</div>
            </div>

            <div className="flex gap-2 justify-end">
              <Link
                href={
                  order.type === "accommodation"
                    ? `/accommodations/${order.itemId}`
                    : order.type === "food"
                    ? `/food/${order.itemId}`
                    : `/attractions/${order.itemId}`
                }
              >
                <Button variant="outline" className="bg-transparent">
                  查看商品
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
