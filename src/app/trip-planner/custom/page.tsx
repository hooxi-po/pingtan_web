"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import type { BaiduMarker } from "@/components/ui/baidu-map"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, MapPin, Route, Clock, DollarSign, Star, Settings, Download, Navigation, Heart, Compass } from "lucide-react"

// 动态加载地图组件，避免 SSR 阶段加载外部脚本
const BaiduMap = dynamic(() => import("@/components/ui/baidu-map"), { ssr: false })

// 偏好与活动字典（简单示例，可后续接入后端算法）
const preferenceActivities: Record<string, string[]> = {
  自然风光: ["坛南湾海滩日落", "环岛路自驾拍照", "海边清晨漫步"],
  文化: ["石头厝古村走访", "海坛古城打卡", "地方博物馆参观"],
  美食: ["海鲜市场尝鲜", "海滨烧烤", "特色小吃街"] ,
  亲子: ["沙滩拾贝", "轻松环岛骑行", "乐园体验"],
  摄影: ["蓝眼泪夜拍", "海风栈道取景", "渔村人文记录"],
  休闲: ["SPA 放松", "海景咖啡", "慢生活书店"],
}

const transportMeta: Record<string, { time: string; desc: string }> = {
  飞机: { time: "约2小时", desc: "福州长乐机场转车" },
  高铁: { time: "约4小时", desc: "福州站转车" },
  自驾: { time: "约5-8小时", desc: "油费与过路费另计" },
}

export default function CustomTripPlannerPage() {
  const [startDate, setStartDate] = useState<string>("")
  const [days, setDays] = useState<number>(3)
  const [people, setPeople] = useState<number>(2)
  const [budget, setBudget] = useState<number>(1500)
  const [transport, setTransport] = useState<string>("高铁")
  const [preferences, setPreferences] = useState<string[]>(["自然风光", "美食"]) // 默认两个偏好
  const [itinerary, setItinerary] = useState<{ day: string; activities: string[] }[]>([])

  // 地图中心点（平潭近似坐标）
  const center = { lng: 119.78, lat: 25.53 }
  const markers: BaiduMarker[] = useMemo(() => {
    // 根据偏好简单生成两个示例点（真实项目可由后端返回更精准位置）
    const points: BaiduMarker[] = [
      { lng: 119.802, lat: 25.501, title: preferences.includes("自然风光") ? "环岛路风光带" : undefined },
      { lng: 119.778, lat: 25.531, title: preferences.includes("文化") ? "北港石头厝古村" : undefined },
    ].filter((p) => !!p.title)
    return points.length ? points : [{ lng: center.lng, lat: center.lat, title: "平潭" }]
  }, [preferences])

  const togglePref = (pref: string) => {
    setPreferences((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    )
  }

  const generateItinerary = () => {
    const daysArr: { day: string; activities: string[] }[] = []
    for (let i = 1; i <= days; i++) {
      // 每天取偏好对应的 2-3 个活动（循环使用）
      const acts: string[] = []
      preferences.forEach((pref) => {
        const dict = preferenceActivities[pref] || []
        if (dict.length) {
          const baseIndex = (i - 1) % dict.length
          acts.push(dict[baseIndex])
        }
      })
      // 保底活动
      if (!acts.length) acts.push("自由活动与海边漫步")
      daysArr.push({ day: `第${i}天`, activities: acts.slice(0, 3) })
    }
    setItinerary(daysArr)
  }

  const exportJSON = () => {
    const payload = {
      startDate,
      days,
      people,
      budget,
      transport,
      preferences,
      itinerary,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `行程方案_${startDate || "未设置日期"}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const openBaiduDirection = (destinationName: string) => {
    const ak = process.env.NEXT_PUBLIC_BAIDU_MAP_JS_API_KEY
    if (!ak) {
      window.open(`https://map.baidu.com/search/${encodeURIComponent(destinationName + " 平潭")}`, "_blank")
      return
    }
    const origin = `${center.lat},${center.lng}`
    const url = `https://api.map.baidu.com/direction?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destinationName)}&mode=walking&region=${encodeURIComponent("平潭")}&output=html&src=pingtan-web&ak=${encodeURIComponent(ak)}`
    window.open(url, "_blank")
  }

  useEffect(() => {
    // 首次进入自动生成初版行程
    generateItinerary()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className="min-h-screen">
      {/* 顶部导航建议复用已有组件 */}
      <div className="container mx-auto px-4 pt-16 pb-8">
        {/* Header */}
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-4 rounded-full bg-white/60 backdrop-blur px-3 py-1 text-xs">
            <Route className="w-4 h-4 mr-2" />
            个性化定制
          </Badge>
          <h1 className="text-2xl md:text-3xl font-bold mb-3">自定义行程规划</h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            选择出行信息与偏好，快速生成贴合您需求的行程方案，并可预览地图与导出保存
          </p>
        </div>

        {/* 基本信息 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="rounded-2xl bg-white/70 backdrop-blur border border-white/40">
            <CardHeader>
              <CardTitle className="text-lg">出行信息</CardTitle>
              <CardDescription>填写日期、天数与人数预算</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium flex items-center gap-2"><Calendar className="w-4 h-4" /> 出发日期</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/40 bg-white/70 px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium flex items-center gap-2"><Clock className="w-4 h-4" /> 天数</label>
                  <div className="mt-2 flex items-center gap-2">
                    {[1,2,3,4,5].map((d) => (
                      <Button key={d} size="sm" variant={days === d ? "default" : "outline"} className="rounded-full" onClick={() => setDays(d)}>
                        {d}天
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium flex items-center gap-2"><Users className="w-4 h-4" /> 人数</label>
                  <input
                    type="number"
                    min={1}
                    value={people}
                    onChange={(e) => setPeople(Number(e.target.value))}
                    className="mt-2 w-full rounded-xl border border-white/40 bg-white/70 px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium flex items-center gap-2"><DollarSign className="w-4 h-4" /> 人均预算（¥）</label>
                  <input
                    type="range"
                    min={200}
                    max={5000}
                    step={100}
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="mt-2 w-full"
                  />
                  <div className="text-xs text-muted-foreground mt-1">当前约 ¥{budget}/人</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl bg-white/70 backdrop-blur border border-white/40">
            <CardHeader>
              <CardTitle className="text-lg">出行方式</CardTitle>
              <CardDescription>选择交通方式</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.keys(transportMeta).map((t) => (
                  <Button key={t} size="sm" variant={transport === t ? "default" : "outline"} className="rounded-full" onClick={() => setTransport(t)}>
                    {t}
                  </Button>
                ))}
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {transportMeta[transport].time}</span>
                <span className="ml-3 inline-flex items-center gap-1"><Navigation className="w-3 h-3" /> {transportMeta[transport].desc}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl bg-white/70 backdrop-blur border border-white/40">
            <CardHeader>
              <CardTitle className="text-lg">兴趣偏好</CardTitle>
              <CardDescription>点击选择或取消偏好</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {["自然风光","文化","美食","亲子","摄影","休闲"].map((pref) => (
                  <Badge
                    key={pref}
                    variant={preferences.includes(pref) ? "secondary" : "outline"}
                    className={`cursor-pointer rounded-full px-3 py-1 ${preferences.includes(pref) ? "bg-primary/20" : ""}`}
                    onClick={() => togglePref(pref)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {pref === "自然风光" && <Compass className="w-3 h-3" />}
                      {pref === "美食" && <Heart className="w-3 h-3" />}
                      {pref}
                    </span>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 行程生成与预览 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="rounded-2xl bg-white/70 backdrop-blur border border-white/40">
            <CardHeader>
              <CardTitle className="text-lg">行程方案</CardTitle>
              <CardDescription>基于偏好自动生成方案，可再次点击更新</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {itinerary.map((d, idx) => (
                  <div key={idx} className="rounded-xl border border-white/40 bg-white/60 p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-primary inline-flex items-center gap-2"><Star className="w-4 h-4" /> {d.day}</div>
                      <span className="text-xs text-muted-foreground">约 {Math.max(6, Math.min(10, preferences.length * 2))} 小时</span>
                    </div>
                    <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground">
                      {d.activities.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                ))}

                <div className="flex items-center gap-3">
                  <Button className="rounded-full" onClick={generateItinerary}><Settings className="w-4 h-4 mr-2" /> 重新生成</Button>
                  <Button variant="outline" className="rounded-full" onClick={exportJSON}><Download className="w-4 h-4 mr-2" /> 导出为 JSON</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl bg-white/70 backdrop-blur border border-white/40">
            <CardHeader>
              <CardTitle className="text-lg">地图预览</CardTitle>
              <CardDescription>查看偏好对应的主要区域与路线</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-80 md:h-96 w-full rounded-xl overflow-hidden">
                <BaiduMap center={center} zoom={12} markers={markers} />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => openBaiduDirection("平潭旅游服务中心")}> 
                  <Navigation className="w-4 h-4 mr-1" />
                  开始导航
                </Button>
                <Button size="sm" className="rounded-full" asChild>
                  <Link href="/trip-planner">
                    <Route className="w-4 h-4 mr-1" />
                    返回规划首页
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 温馨提示 */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto rounded-2xl bg-white/70 backdrop-blur border border-white/40">
            <CardHeader>
              <CardTitle className="text-lg">提示</CardTitle>
              <CardDescription>行程为参考建议，请结合天气与实时状况调整</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">后续将支持登录后保存行程、多人协同与更智能的路线优化。</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}