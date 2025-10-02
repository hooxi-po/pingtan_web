"use client"

import { useMemo, useState, use as usePromise } from "react"
import Navigation from "@/components/ui/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, Bed, Star, MapPin, CreditCard, Apple, CheckCircle } from "lucide-react"
import Link from "next/link"

// 临时住宿数据（与 AccommodationShowcase 保持一致的结构，后续可抽离到数据源）
const accommodations = [
  {
    id: 1,
    name: "海景石头厝民宿",
    description: "传统石头厝改造的精品民宿，面朝大海，春暖花开",
    image:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><defs><linearGradient id='sunset' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' style='stop-color:%23ff7f50;stop-opacity:1' /><stop offset='100%' style='stop-color:%23ffd700;stop-opacity:1' /></linearGradient></defs><rect width='400' height='300' fill='url(%23sunset)'/><rect x='100' y='150' width='200' height='100' fill='%23696969' stroke='%232f2f2f' stroke-width='2'/><polygon points='100,150 200,100 300,150' fill='%23cd853f'/><rect x='150' y='180' width='30' height='40' fill='%23654321'/><rect x='220' y='180' width='30' height='40' fill='%23654321'/><circle cx='350' cy='80' r='30' fill='%23ffff00' opacity='0.8'/></svg>",
    type: "民宿",
    rating: 4.8,
    price: "¥288",
    location: "坛南湾",
  },
  {
    id: 2,
    name: "蓝眼泪度假酒店",
    description: "豪华海滨度假酒店，观赏蓝眼泪奇观的最佳位置，享受顶级度假体验",
    image: "/hotels/Gemini_Generated_Image_3.png",
    type: "酒店",
    rating: 4.9,
    price: "¥588",
    location: "坛南湾",
  },
  {
    id: 3,
    name: "渔村客栈",
    description: "体验渔民生活的特色客栈，品尝最新鲜的海鲜",
    image:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%2387ceeb'/><rect x='80' y='180' width='80' height='80' fill='%23deb887' stroke='%23cd853f' stroke-width='2'/><rect x='200' y='170' width='90' height='90' fill='%23f5deb3' stroke='%23cd853f' stroke-width='2'/><polygon points='80,180 120,150 160,180' fill='%23d2691e'/><polygon points='200,170 245,140 290,170' fill='%23daa520'/><path d='M50,260 Q100,250 150,255 T250,260 T350,255' stroke='%234169e1' stroke-width='3' fill='none'/></svg>",
    type: "客栈",
    rating: 4.6,
    price: "¥168",
    location: "流水镇",
  },
]

function parsePrice(priceStr: string) {
  return Number(priceStr.replace(/[¥,]/g, "")) || 0
}

function getNights(checkin?: string, checkout?: string) {
  if (!checkin || !checkout) return 0
  const start = new Date(checkin)
  const end = new Date(checkout)
  const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(diff, 0)
}

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const p = usePromise(params) as { id: string }
  const accommodation = useMemo(() => {
    const idNum = Number(p?.id)
    return accommodations.find((a) => a.id === idNum)
  }, [p?.id])
  const isRestaurant = !accommodation

  const [checkin, setCheckin] = useState<string>("")
  const [checkout, setCheckout] = useState<string>("")
  const [guests, setGuests] = useState<number>(2)
  const [rooms, setRooms] = useState<number>(1)
  const [paymentMethod, setPaymentMethod] = useState<string>("apple-pay")
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false)
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false)

  // 新增：餐饮预订相关状态
  const [reservationDate, setReservationDate] = useState<string>("") // YYYY-MM-DD
  const [reservationTime, setReservationTime] = useState<string>("") // HH:mm
  const [seatingPref, setSeatingPref] = useState<string>("无偏好")
  const [contactName, setContactName] = useState<string>("")
  const [contactPhone, setContactPhone] = useState<string>("")
  const [availability, setAvailability] = useState<{ capacity: number, confirmedCount: number, pendingCount: number, available: number } | null>(null)
  const [checkingAvailability, setCheckingAvailability] = useState<boolean>(false)

  const nights = getNights(checkin, checkout)
  const unitPrice = parsePrice(accommodation?.price || "0")
  const restaurantUnitPrice = 50
  const total = useMemo(() => {
    if (isRestaurant) {
      return restaurantUnitPrice * guests
    }
    if (!nights) return 0
    return unitPrice * nights * rooms
  }, [isRestaurant, restaurantUnitPrice, guests, unitPrice, nights, rooms])

  const devMode = process.env.NODE_ENV !== "production"
  // 新增：确认支付时创建订单（餐饮/住宿）
  const handleConfirmPayment = async () => {
    try {
      if (isRestaurant) {
        // 基本校验
        if (!reservationDate) { alert("请选择就餐日期"); return }
        const phoneOk = /^1[3-9]\d{9}$/.test(contactPhone)
        if (!contactName || !phoneOk) { alert("请填写有效联系人姓名与手机号"); return }
        const dt = new Date(`${reservationDate}T${reservationTime || "12:00"}:00`)
        const payload = {
          mode: "create",
          type: "RESTAURANT",
          totalAmount: total,
          paymentMethod,
          paymentStatus: "PAID",
          bookingDate: dt.toISOString(),
          checkInDate: null,
          checkOutDate: null,
          guestCount: guests,
          specialRequests: seatingPref,
          contactName,
          contactPhone,
          contactEmail: null,
          restaurantId: devMode ? undefined : String(p?.id),
          status: "PENDING",
        }
        const res = await fetch(`/api/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const txt = await res.text()
          let msg = "下单失败，请稍后重试或检查登录状态"
          try { const j = JSON.parse(txt); if (j?.error) msg = j.error } catch {}
          console.error("Create restaurant order failed", txt)
          alert(msg)
          return
        }
        setPaymentSuccess(true)
        return
      }

      // 住宿下单前校验，避免 totalAmount=0 导致后端拒绝
      if (!checkin || !checkout) { alert("请选择入住和离店日期"); return }
      if (nights <= 0) { alert("离店日期需晚于入住日期"); return }
      if (total <= 0) { alert("价格计算异常，请检查选择的日期与房间数"); return }

      const payload = {
        mode: "create",
        type: "ACCOMMODATION",
        totalAmount: total,
        paymentMethod,
        paymentStatus: "PAID",
        bookingDate: new Date().toISOString(),
        checkInDate: checkin || null,
        checkOutDate: checkout || null,
        guestCount: guests,
        specialRequests: null,
        contactName: "线上用户",
        contactPhone: "13800138000",
        contactEmail: null,
        accommodationId: devMode ? undefined : String(p?.id),
        status: "PENDING",
      }
      const res = await fetch(`/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const txt = await res.text()
        let msg = "下单失败，请稍后重试或检查登录状态"
        try { const j = JSON.parse(txt); if (j?.error) msg = j.error } catch {}
        console.error("Create order failed", txt)
        alert(msg)
        return
      }
      setPaymentSuccess(true)
      // 可选：关闭弹窗，或跳转到个人中心
      // setShowPaymentModal(false)
    } catch (e) {
      console.error(e)
      alert("网络错误：下单失败")
    }
  }

  // 新增：检查餐饮余位
  const handleCheckAvailability = async () => {
    if (!isRestaurant) return
    if (!reservationDate) { alert("请选择就餐日期"); return }
    setCheckingAvailability(true)
    setAvailability(null)
    try {
      const dt = new Date(`${reservationDate}T${reservationTime || "12:00"}:00`)
      const start = new Date(dt.getTime() - 60 * 60 * 1000) // 提前1小时
      const end = new Date(dt.getTime() + 60 * 60 * 1000) // 延后1小时
      const url = `/api/restaurant/availability?restaurantId=${encodeURIComponent(String(p?.id))}&slotStart=${encodeURIComponent(start.toISOString())}&slotEnd=${encodeURIComponent(end.toISOString())}`
      const res = await fetch(url)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "查询失败")
      setAvailability(data)
    } catch (e: any) {
      alert(e.message || "余位查询失败")
    } finally {
      setCheckingAvailability(false)
    }
  }

  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="pt-16">
        {/* Header */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="secondary" className="mb-4 rounded-full bg-white/30 text-white border border-white/30 backdrop-blur px-3 py-1.5">
              {/* 修改标题徽章 */}
              {isRestaurant ? (
                <><Calendar className="w-4 h-4 mr-2" /> 餐饮预订</>
              ) : (
                <><Bed className="w-4 h-4 mr-2" /> 在线预订</>
              )}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
              {accommodation ? accommodation.name : (isRestaurant ? "餐厅预订" : "住宿预订")}
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              {isRestaurant ? "请选择就餐日期与人数，系统将为您完成下单与通知" : "请选择入住日期与人数，系统将为您计算价格并完成支付"}
            </p>
          </div>
        </section>

        {/* Booking Form */}
        <section className="py-12">
          <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Info */}
            <Card className="lg:col-span-2 rounded-2xl bg-white/70 backdrop-blur border border-white/60 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl tracking-tight">
                      预订信息
                    </CardTitle>
                    <CardDescription className="mt-1">
                      <span className="inline-flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        {accommodation?.location || "平潭"}
                      </span>
                    </CardDescription>
                  </div>
                  {accommodation && (
                    <div className="flex items-center rounded-full bg-white/60 border border-white/50 px-3 py-1.5 backdrop-blur">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-sm font-medium text-gray-900">
                        {accommodation.rating}
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* 住宿预订表单 */}
                {!isRestaurant && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">入住日期</label>
                      <div className="flex items-center rounded-2xl bg-white/70 backdrop-blur border border-white/60 px-3 py-2">
                        <Calendar className="w-5 h-5 text-muted-foreground mr-2" />
                        <input
                          type="date"
                          value={checkin}
                          onChange={(e) => setCheckin(e.target.value)}
                          className="w-full bg-transparent outline-none text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">退房日期</label>
                      <div className="flex items-center rounded-2xl bg-white/70 backdrop-blur border border-white/60 px-3 py-2">
                        <Calendar className="w-5 h-5 text-muted-foreground mr-2" />
                        <input
                          type="date"
                          value={checkout}
                          onChange={(e) => setCheckout(e.target.value)}
                          className="w-full bg-transparent outline-none text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">入住人数</label>
                      <div className="flex items-center rounded-2xl bg-white/70 backdrop-blur border border-white/60 px-3 py-2">
                        <Users className="w-5 h-5 text-muted-foreground mr-2" />
                        <input
                          type="number"
                          min={1}
                          value={guests}
                          onChange={(e) => setGuests(Number(e.target.value))}
                          className="w-full bg-transparent outline-none text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">房间数量</label>
                      <div className="flex items-center rounded-2xl bg-white/70 backdrop-blur border border-white/60 px-3 py-2">
                        <Bed className="w-5 h-5 text-muted-foreground mr-2" />
                        <input
                          type="number"
                          min={1}
                          value={rooms}
                          onChange={(e) => setRooms(Number(e.target.value))}
                          className="w-full bg-transparent outline-none text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 餐饮预订表单 */}
                {isRestaurant && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">就餐日期</label>
                      <div className="flex items-center rounded-2xl bg-white/70 backdrop-blur border border-white/60 px-3 py-2">
                        <Calendar className="w-5 h-5 text-muted-foreground mr-2" />
                        <input
                          type="date"
                          value={reservationDate}
                          onChange={(e) => setReservationDate(e.target.value)}
                          className="w-full bg-transparent outline-none text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">就餐时间</label>
                      <div className="flex items-center rounded-2xl bg-white/70 backdrop-blur border border-white/60 px-3 py-2">
                        <Calendar className="w-5 h-5 text-muted-foreground mr-2" />
                        <input
                          type="time"
                          value={reservationTime}
                          onChange={(e) => setReservationTime(e.target.value)}
                          className="w-full bg-transparent outline-none text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">就餐人数</label>
                      <div className="flex items-center rounded-2xl bg-white/70 backdrop-blur border border-white/60 px-3 py-2">
                        <Users className="w-5 h-5 text-muted-foreground mr-2" />
                        <input
                          type="number"
                          min={1}
                          value={guests}
                          onChange={(e) => setGuests(Number(e.target.value))}
                          className="w-full bg-transparent outline-none text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">座位偏好</label>
                      <div className="flex items-center rounded-2xl bg-white/70 backdrop-blur border border-white/60 px-3 py-2">
                        <select className="w-full bg-transparent outline-none text-sm" value={seatingPref} onChange={(e) => setSeatingPref(e.target.value)}>
                          <option>无偏好</option>
                          <option>靠窗</option>
                          <option>大厅</option>
                          <option>包间</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">联系人姓名</label>
                      <div className="flex items-center rounded-2xl bg-white/70 backdrop-blur border border-white/60 px-3 py-2">
                        <input
                          type="text"
                          placeholder="请输入姓名"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className="w-full bg-transparent outline-none text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">联系人手机号</label>
                      <div className="flex items-center rounded-2xl bg-white/70 backdrop-blur border border-white/60 px-3 py-2">
                        <input
                          type="tel"
                          placeholder="请输入手机号"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          className="w-full bg-transparent outline-none text-sm"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <Button className="rounded-2xl" variant="outline" onClick={handleCheckAvailability} disabled={checkingAvailability}>
                        {checkingAvailability ? "查询中..." : "检查余位"}
                      </Button>
                      {availability && (
                        <p className="text-xs text-muted-foreground mt-2">
                          余位：{availability.available}（总容量 {availability.capacity}，已确认 {availability.confirmedCount}，待处理 {availability.pendingCount}）
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Method */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-3">支付方式</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Button
                      variant={paymentMethod === "apple-pay" ? "default" : "outline"}
                      className="w-full rounded-2xl"
                      onClick={() => setPaymentMethod("apple-pay")}
                    >
                      <Apple className="w-4 h-4 mr-2" /> Apple Pay
                    </Button>
                    <Button
                      variant={paymentMethod === "card" ? "default" : "outline"}
                      className="w-full rounded-2xl"
                      onClick={() => setPaymentMethod("card")}
                    >
                      <CreditCard className="w-4 h-4 mr-2" /> 银行卡
                    </Button>
                    <Button
                      variant={paymentMethod === "wallet" ? "default" : "outline"}
                      className="w-full rounded-2xl"
                      onClick={() => setPaymentMethod("wallet")}
                    >
                      数字钱包
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right: Summary */}
            <Card className="rounded-2xl bg-white/70 backdrop-blur border border-white/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl tracking-tight">价格摘要</CardTitle>
                <CardDescription>{isRestaurant ? "按人数计算，实际以商家结算为准" : "根据所选日期和房间数量计算"}</CardDescription>
              </CardHeader>
              <CardContent>
                {!isRestaurant ? (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span>房型</span><span>{accommodation?.name || "标准间"}</span></div>
                    <div className="flex justify-between"><span>单价</span><span>{accommodation?.price || "¥0"}/晚</span></div>
                    <div className="flex justify-between"><span>晚数</span><span>{nights} 晚</span></div>
                    <div className="flex justify-between"><span>房间</span><span>{rooms} 间</span></div>
                  </div>
                ) : (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span>餐厅</span><span>{String(p?.id)}</span></div>
                    <div className="flex justify-between"><span>人均</span><span>¥{restaurantUnitPrice}</span></div>
                    <div className="flex justify-between"><span>人数</span><span>{guests} 人</span></div>
                    <div className="flex justify-between"><span>就餐时间</span><span>{reservationDate || "-"} {reservationTime || "-"}</span></div>
                  </div>
                )}
                <div className="mt-4 p-3 rounded-2xl bg-white/80 border border-white/60 backdrop-blur">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-medium">合计</span>
                    <span className="text-2xl font-bold text-primary">¥{total}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">不含税费与服务费，实际以商家结算为准</p>
                </div>
                <Button
                  disabled={isRestaurant ? (guests <= 0 || !reservationDate || !contactName || !contactPhone) : (total <= 0)}
                  className="w-full mt-4 rounded-2xl shadow-sm hover:shadow-md"
                  onClick={() => setShowPaymentModal(true)}
                >
                  立即支付
                </Button>
                <Button variant="outline" className="w-full mt-2 rounded-2xl bg-white/60 backdrop-blur" asChild>
                  <Link href={isRestaurant ? "/restaurants" : "/accommodations"}>{isRestaurant ? "返回餐厅列表" : "返回住宿列表"}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 模拟支付弹层 */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-white/90 border border-white/60 shadow-xl">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <CreditCard className="w-5 h-5 text-primary mr-2" />
                  <h3 className="text-lg font-semibold">支付确认</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>支付方式</span><span>{paymentMethod === "apple-pay" ? "Apple Pay" : paymentMethod === "card" ? "银行卡" : "数字钱包"}</span></div>
                  <div className="flex justify-between"><span>支付金额</span><span className="font-semibold text-primary">¥{total}</span></div>
                </div>
                {!paymentSuccess ? (
                  <Button className="w-full mt-4 rounded-2xl" onClick={handleConfirmPayment}>
                    确认支付
                  </Button>
                ) : (
                  <div className="mt-4 p-3 rounded-2xl bg-white/80 border border白/60 backdrop-blur text-center">
                    <div className="inline-flex items-center text-green-600 font-medium">
                      <CheckCircle className="w-5 h-5 mr-1" /> 支付成功
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">订单已创建，稍后可在个人中心查看</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Button variant="outline" className="rounded-2xl" onClick={() => setShowPaymentModal(false)}>
                    关闭
                  </Button>
                  <Button variant="outline" className="rounded-2xl" asChild>
                    <Link href="/">返回首页</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}