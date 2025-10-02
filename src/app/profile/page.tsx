"use client"

import { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Navigation from "@/components/ui/navigation"
import { User, Mail, Phone, Edit, Save, X, Settings, Upload } from "lucide-react"
import { OrderManagement } from "@/components/ui/order-management"
import { Badge } from "@/components/ui/badge"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const devMode = process.env.NODE_ENV !== "production"

  const [editMode, setEditMode] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("profile")

  const user = session?.user

  // 订单管理：状态与筛选
  const [orders, setOrders] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [typeFilter, setTypeFilter] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [priorityFilter, setPriorityFilter] = useState<string>("")
  const [isPriorityFilter, setIsPriorityFilter] = useState<string>("")
  const [scopeAll, setScopeAll] = useState<boolean>(false)
  const [priorityStats, setPriorityStats] = useState<Record<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL", number>>({ LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 })
  const [statusStats, setStatusStats] = useState<Record<"PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "REFUNDED", number>>({ PENDING: 0, CONFIRMED: 0, CANCELLED: 0, COMPLETED: 0, REFUNDED: 0 })

  useEffect(() => {
    if (user) {
      setName(user.name ?? "")
      // @ts-ignore - next-auth's Session may include phone if we fetch later, default empty here
      setPhone((user as any).phone ?? "")
      setAvatarPreview(user.image ?? null)
    }
  }, [user])

  // 订单管理：数据获取与操作
  const fetchOrders = async () => {
    if (!user?.id && !devMode) return
    setOrdersLoading(true)
    try {
      const params = new URLSearchParams()
      if (typeFilter) params.set("type", typeFilter)
      if (statusFilter) params.set("status", statusFilter)
      if (priorityFilter) params.set("priority", priorityFilter)
      if (isPriorityFilter) params.set("isPriority", isPriorityFilter)
      if (scopeAll && user?.role === "ADMIN") params.set("scope", "all")

      const res = await fetch(`/api/orders?${params.toString()}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "获取订单失败")
      const list = data.orders || []
      setOrders(list)

      // 统计
      const ps: Record<string, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 }
      const ss: Record<string, number> = { PENDING: 0, CONFIRMED: 0, CANCELLED: 0, COMPLETED: 0, REFUNDED: 0 }
      for (const o of list) {
        const p = (o.priority || "LOW") as keyof typeof ps
        if (ps[p] !== undefined) ps[p]++
        const st = (o.status || "PENDING") as keyof typeof ss
        if (ss[st] !== undefined) ss[st]++
      }
      setPriorityStats({ LOW: ps.LOW, MEDIUM: ps.MEDIUM, HIGH: ps.HIGH, CRITICAL: ps.CRITICAL })
      setStatusStats({ PENDING: ss.PENDING, CONFIRMED: ss.CONFIRMED, CANCELLED: ss.CANCELLED, COMPLETED: ss.COMPLETED, REFUNDED: ss.REFUNDED })
      setMessage(null)
    } catch (e: any) {
      setMessage(e.message || "获取订单失败")
    } finally {
      setOrdersLoading(false)
    }
  }

  const handleUpdateOrder = async (payload: { orderId: string, priority?: string, isPriority?: boolean, urgencyLevel?: string, status?: string }) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "更新失败")
      setOrders((prev) => prev.map((o) => o.id === data.order.id ? data.order : o))
      setMessage("更新成功")
    } catch (e: any) {
      setMessage(e.message || "更新失败")
    }
  }

  const handleAutoIdentify = async (ids: string[]) => {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: ids, scope: scopeAll && user?.role === "ADMIN" ? "all" : "user" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "自动识别失败")
      const updatedMap = new Map((data.orders || []).map((o: any) => [o.id, o]))
      setOrders((prev) => prev.map((o) => updatedMap.get(o.id) || o))
      setMessage(`优先级识别完成，共更新 ${data.count || (data.orders?.length || 0)} 条`)
    } catch (e: any) {
      setMessage(e.message || "自动识别失败")
    }
  }

  const exportCSV = () => {
    const headers = ["id", "type", "status", "paymentStatus", "totalAmount", "priority", "isPriority", "urgencyLevel", "priorityScore", "createdAt", "updatedAt"]
    const lines = orders.map((o) => headers.map((h) => {
      const v = (o as any)[h]
      if (v == null) return ""
      if (typeof v === "boolean") return v ? "true" : "false"
      return String(v)
    }).join(","))
    const csv = [headers.join(","), ...lines].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    const now = new Date()
    a.download = `orders_${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // 数据获取：初次与筛选变化
  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, typeFilter, statusFilter, priorityFilter, isPriorityFilter, scopeAll])

  // 轮询：5秒刷新
  useEffect(() => {
    if (activeTab !== "orders") return
    const t = setInterval(fetchOrders, 5000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const initials = useMemo(() => {
    const n = name || user?.name || "U"
    return n.substring(0, 1).toUpperCase()
  }, [name, user?.name])

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setMessage("请上传图片文件")
      return
    }
    if (file.size > 1.5 * 1024 * 1024) {
      setMessage("图片大小需小于 1.5MB")
      return
    }

    try {
      setAvatarUploading(true)
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "头像上传失败")
      }
      setAvatarPreview(data.avatar)
      setMessage("头像已更新")
    } catch (err: any) {
      setMessage(err.message || "上传失败，请稍后重试")
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleSave = async () => {
    if (!user?.id) return
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: phone || undefined,
          avatar: avatarPreview || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "保存失败")
      }
      setMessage("资料已保存")
      setEditMode(false)
    } catch (err: any) {
      setMessage(err.message || "保存失败，请稍后重试")
    } finally {
      setSaving(false)
    }
  }

  if (status === "loading") {
    return (
      <main className="min-h-screen">
        <Navigation />
        <div className="pt-24 container mx-auto px-4">
          <Card>
            <CardContent className="py-10 text-center">加载中...</CardContent>
          </Card>
        </div>
      </main>
    )
  }

  if (!session && !devMode) {
    return (
      <main className="min-h-screen">
        <Navigation />
        <div className="pt-24 container mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle>未登录</CardTitle>
              <CardDescription>请先登录以访问个人中心</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <Button onClick={() => router.push("/auth/signin")}>前往登录</Button>
              <Link href="/" className="text-sm text-muted-foreground">返回首页</Link>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="pt-20 container mx-auto px-4">
        {!session && devMode && (
          <div className="mb-4 rounded-md border border-dashed border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-700">
            当前为开发模式，未登录状态下将使用测试账号进行数据联调。
          </div>
        )}
        {/* Tabs Navigation */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2">
            {[
              { key: "profile", label: "个人信息" },
              { key: "trip", label: "行程管理" },
              { key: "orders", label: "订单管理" },
              { key: "collections", label: "收藏" },
              { key: "points", label: "积分/会员" },
              { key: "messages", label: "消息中心" },
              { key: "history", label: "历史记录" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-full border transition-colors text-sm whitespace-nowrap ${
                  activeTab === tab.key ? "bg-primary text-white border-primary" : "bg-white/70 backdrop-blur border-white/40 text-foreground hover:bg-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Contents */}
        {activeTab === "profile" && (
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* 左侧：个人信息卡片 */}
            <Card className="w-full lg:w-2/5">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarPreview ?? undefined} alt="avatar" />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  {editMode && (
                    <label className="absolute -bottom-2 -right-2 cursor-pointer inline-flex items-center gap-1 rounded-full bg-primary text-white px-3 py-1 text-xs shadow">
                      <Upload className="h-3 w-3" /> 上传
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarFileChange} />
                    </label>
                  )}
                </div>
                <div>
                  <CardTitle className="text-xl">{user?.name ?? "用户"}</CardTitle>
                  <CardDescription>完善资料，获得更好体验</CardDescription>
                </div>
                <div className="ml-auto">
                  {!editMode ? (
                    <Button variant="outline" onClick={() => setEditMode(true)}>
                      <Edit className="mr-2 h-4 w-4" /> 编辑
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => setEditMode(false)}>
                        <X className="mr-2 h-4 w-4" /> 取消
                      </Button>
                      <Button onClick={handleSave} disabled={saving || avatarUploading}>
                        <Save className="mr-2 h-4 w-4" /> {saving ? "保存中..." : "保存"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {message && (
                  <div className="text-sm text-green-600">{message}</div>
                )}
                {!editMode ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{user?.name ?? "未设置"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{user?.email ?? "未设置"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {/* @ts-ignore */}
                      <span>{(user as any)?.phone ?? "未设置"}</span>
                    </div>
                  </div>
                ) : (
                  <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="text-sm font-medium">姓名</label>
                        <input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="请输入姓名"
                          className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="text-sm font-medium">电话</label>
                        <input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="可选"
                          className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* 右侧：设置与偏好 */}
            <Card className="w-full lg:flex-1">
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle>账户设置</CardTitle>
                  <CardDescription>管理语言偏好与账户相关选项</CardDescription>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/profile/settings">
                    <Settings className="mr-2 h-4 w-4" /> 进入设置
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="text-sm font-medium">语言偏好</div>
                  <div className="mt-2 max-w-sm">
                    <LanguageSelector />
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium">安全提示</div>
                  <p className="text-sm text-muted-foreground mt-2">建议定期更新密码并开启双重验证（即将推出）。</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "trip" && (
          <div>
            <TripPlanner />
          </div>
        )}

        {activeTab === "orders" && (
          <OrderManagement 
            orders={orders}
            onRefresh={fetchOrders}
            onUpdateOrder={handleUpdateOrder}
            onExportOrders={exportCSV}
          />
        )}
      </div>
    </main>
  )
}

function LanguageSelector() {
  const { data: session } = useSession()
  const [lang, setLang] = useState<string>("zh")
  const [saving, setSaving] = useState(false)
  const [info, setInfo] = useState<string | null>(null)

  useEffect(() => {
    // @ts-ignore
    const current = (session?.user as any)?.language ?? "zh"
    setLang(current)
  }, [session?.user])

  const updateLanguage = async (value: string) => {
    setSaving(true)
    setInfo(null)
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: value }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "语言更新失败")
      setInfo("语言偏好已更新")
    } catch (e: any) {
      setInfo(e.message || "更新失败")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-2">
      <select
        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        value={lang}
        onChange={(e) => { setLang(e.target.value); updateLanguage(e.target.value) }}
      >
        <option value="zh">简体中文</option>
        <option value="en">English</option>
        <option value="tw">繁體中文</option>
      </select>
      {info && <p className="text-xs text-muted-foreground">{info}</p>}
      {saving && <p className="text-xs">保存中...</p>}
    </div>
  )
}