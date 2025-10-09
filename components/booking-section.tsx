"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Minus, Plus } from "lucide-react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface BookingSectionProps {
  type: "accommodation" | "food" | "attraction"
  itemId: number
}

export function BookingSection({ type, itemId }: BookingSectionProps) {
  const [checkIn, setCheckIn] = useState<Date>()
  const [checkOut, setCheckOut] = useState<Date>()
  const [guests, setGuests] = useState(2)
  const [rooms, setRooms] = useState(1)
  const [time, setTime] = useState<string>("")
  const [roomType, setRoomType] = useState<string>("")
  const [itemName, setItemName] = useState<string>("")
  const [image, setImage] = useState<string>("")
  const [price, setPrice] = useState<number>(0)
  const router = useRouter()

  const isAccommodation = type === "accommodation"
  const isFood = type === "food"

  useEffect(() => {
    const loadItem = async () => {
      const base = type === "accommodation" ? "accommodations" : type === "food" ? "restaurants" : "attractions"
      try {
        const res = await fetch(`/api/${base}/${itemId}`)
        if (!res.ok) return
        const data = await res.json()
        setItemName(data.name || "")
        setImage(data.image || "")
        if (type === "accommodation" && typeof data.price === "number") {
          setPrice(data.price)
        } else if (type === "food" && typeof data.avgPrice === "string") {
          const v = parseInt(String(data.avgPrice).replace(/[^0-9]/g, ""), 10)
          setPrice(Number.isNaN(v) ? 0 : v)
        } else if (type === "attraction" && typeof data.price === "string") {
          if (String(data.price).includes("免费")) setPrice(0)
          else {
            const v = parseInt(String(data.price).replace(/[^0-9]/g, ""), 10)
            setPrice(Number.isNaN(v) ? 0 : v)
          }
        }
      } catch {}
    }
    loadItem()
  }, [type, itemId])

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1
    const diff = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)))
    return diff
  }, [checkIn, checkOut])

  const total = useMemo(() => {
    if (isAccommodation) return (price || 588) * rooms * nights
    if (isFood) return (price || 298) * guests
    return (price || 0) * guests
  }, [isAccommodation, isFood, price, rooms, nights, guests])

  const submitOrder = async (paid: boolean) => {
    const payload: any = { type, itemId, totalPrice: total, paid }
    if (type === "accommodation") {
      payload.checkIn = checkIn ? format(checkIn, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")
      payload.checkOut = checkOut ? format(checkOut, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")
      payload.nights = nights
      payload.guests = guests
      payload.rooms = rooms
      payload.roomType = roomType || undefined
    } else if (type === "food") {
      payload.date = checkIn ? format(checkIn, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")
      payload.time = time || "18:00"
      payload.guests = guests
    } else {
      payload.date = checkIn ? format(checkIn, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")
      payload.guests = guests
    }

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })
      if (res.status === 401) {
        alert("请先登录后再预订")
        router.push("/login")
        return
      }
      if (!res.ok) {
        const err = await res
          .json()
          .catch(() => ({ message: "下单失败，请稍后重试" }))
        alert(err?.error || err?.message || "下单失败，请稍后重试")
        return
      }
      const data = await res.json()
      router.push(`/profile/orders/${data.id}`)
    } catch {
      alert("网络异常，请稍后重试")
    }
  }

  return (
    <div className="bg-muted/30 border-t border-border">
      <div className="container mx-auto px-4 py-8 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">
            {isAccommodation ? "预订信息" : isFood ? "预订餐位" : "预订门票"}
          </h2>

          <div className="bg-card border border-border rounded-lg p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>{isAccommodation ? "入住日期" : isFood ? "用餐日期" : "游玩日期"}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-11",
                        !checkIn && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkIn ? format(checkIn, "PPP", { locale: zhCN }) : "请选择日期"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={checkIn} onSelect={setCheckIn} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              {isAccommodation && (
                <div className="space-y-2">
                  <Label>退房日期</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-11",
                          !checkOut && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkOut ? format(checkOut, "PPP", { locale: zhCN }) : "请选择日期"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={checkOut} onSelect={setCheckOut} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {isFood && (
                <div className="space-y-2">
                  <Label>用餐时间</Label>
                  <Select onValueChange={(v) => setTime(v)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="请选择时间" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="11:00">11:00</SelectItem>
                      <SelectItem value="11:30">11:30</SelectItem>
                      <SelectItem value="12:00">12:00</SelectItem>
                      <SelectItem value="12:30">12:30</SelectItem>
                      <SelectItem value="17:30">17:30</SelectItem>
                      <SelectItem value="18:00">18:00</SelectItem>
                      <SelectItem value="18:30">18:30</SelectItem>
                      <SelectItem value="19:00">19:00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {isAccommodation && (
                <div className="space-y-2">
                  <Label>房间数量</Label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setRooms(Math.max(1, rooms - 1))}
                      className="h-11 w-11"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 text-center">
                      <span className="text-lg font-semibold">{rooms}</span>
                      <span className="text-sm text-muted-foreground ml-1">间</span>
                    </div>
                    <Button variant="outline" size="icon" onClick={() => setRooms(rooms + 1)} className="h-11 w-11">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>{isAccommodation ? "入住人数" : isFood ? "用餐人数" : "游玩人数"}</Label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    className="h-11 w-11"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 text-center">
                    <span className="text-lg font-semibold">{guests}</span>
                    <span className="text-sm text-muted-foreground ml-1">人</span>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => setGuests(guests + 1)} className="h-11 w-11">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {isAccommodation && (
              <div className="space-y-2">
                <Label>房型选择</Label>
                <Select onValueChange={(v) => setRoomType(v)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="选择房型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">标准海景房 - ¥588/晚</SelectItem>
                    <SelectItem value="deluxe">豪华海景房 - ¥788/晚</SelectItem>
                    <SelectItem value="suite">海景套房 - ¥1288/晚</SelectItem>
                    <SelectItem value="family">家庭房 - ¥988/晚</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>联系人姓名</Label>
              <Input placeholder="请输入您的姓名" className="h-11" />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>手机号码</Label>
                <Input type="tel" placeholder="请输入手机号" className="h-11" />
              </div>

              <div className="space-y-2">
                <Label>电子邮箱</Label>
                <Input type="email" placeholder="请输入邮箱" className="h-11" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>特殊要求（可选）</Label>
              <textarea
                className="w-full min-h-24 px-3 py-2 rounded-md border border-input bg-background text-sm"
                placeholder={
                  isAccommodation
                    ? "如需要加床、无烟房等特殊要求，请在此说明"
                    : "如有特殊饮食要求或其他需求，请在此说明"
                }
              />
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold">总计</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-ocean">¥{total}</div>
                  <p className="text-sm text-muted-foreground">
                    {isAccommodation ? `${rooms}间 × ${nights}晚` : `${guests}人`}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={() => submitOrder(true)} className="flex-1 h-12 text-base bg-ocean hover:bg-ocean/90 text-sand">
                  立即支付并预订
                </Button>
                <Button onClick={() => submitOrder(false)} variant="outline" className="flex-1 h-12 text-base bg-transparent">
                  确认预订（未支付）
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-4">
                点击预订即表示您同意我们的预订条款和取消政策
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
