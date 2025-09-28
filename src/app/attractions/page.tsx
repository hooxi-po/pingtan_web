"use client"

import { useState } from "react"
import Navigation from "@/components/ui/navigation"
import FeaturedAttractions from "@/components/ui/featured-attractions"
import LocationServices from "@/components/ui/location-services"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, Phone, MapPin, Star, Camera, Sparkles, Cloud, Droplets, Compass, Wind } from "lucide-react"

export default function AttractionsPage() {
  const [lang, setLang] = useState<"zh" | "en" | "tw">("zh")
  const [feedback, setFeedback] = useState("")
  const [email, setEmail] = useState("")
  const [realtime, setRealtime] = useState({
    blueTears: {
      probability: 0.72,
      level: "中",
      bestTime: "20:00 - 23:00",
      spots: ["坛南湾", "长江澳"],
    },
    tides: {
      high: "05:42 / 18:12",
      low: "12:01",
    },
    weatherRoutes: [
      { name: "环岛路观景线", tip: "东南风稍强，建议逆时针行驶", status: "良好" },
      { name: "北港村文化线", tip: "午后有阵雨，备轻便雨具", status: "注意" },
    ],
  })

  const headerTexts: Record<typeof lang, { title: string; desc: string }> = {
    zh: { title: "平潭景点大全", desc: "探索平潭岛的自然奇观、历史文化和独特风光" },
    en: { title: "Pingtan Attractions", desc: "Explore Pingtan's natural wonders, heritage and coastal scenery" },
    tw: { title: "平潭景点大全", desc: "探索平潭岛的自然奇观、历史文化与独特风光" },
  }

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedback.trim()) {
      alert("请填写反馈内容")
      return
    }
    console.log("Feedback submit", { email, feedback })
    alert("反馈已提交，感谢您的建议！")
    setFeedback("")
    setEmail("")
  }

  const refreshRealtime = () => {
    // 模拟刷新：随机改变概率与状态
    const p = Math.max(0, Math.min(1, Math.round((Math.random() * 0.9 + 0.05) * 100) / 100))
    const level = p > 0.75 ? "高" : p > 0.45 ? "中" : "低"
    const status = p > 0.7 ? "推荐" : p > 0.4 ? "可观测" : "不稳定"
    setRealtime((prev) => ({
      ...prev,
      blueTears: {
        probability: p,
        level,
        bestTime: ["19:30 - 23:00", "20:00 - 23:30", "20:30 - 00:00"][Math.floor(Math.random() * 3)],
        spots: ["坛南湾", "长江澳", "澳前海域"].sort(() => 0.5 - Math.random()).slice(0, 2),
      },
      tides: {
        high: ["05:42 / 18:12", "06:10 / 18:40", "05:55 / 18:25"][Math.floor(Math.random() * 3)],
        low: ["12:01", "12:25", "11:48"][Math.floor(Math.random() * 3)],
      },
      weatherRoutes: [
        { name: "环岛路观景线", tip: status === "推荐" ? "视野通透，注意防晒" : status === "可观测" ? "沿海风稍大，建议逆时针行驶" : "风浪偏大，缩短停留时间", status },
        { name: "北港村文化线", tip: "午后或有阵雨，备轻便雨具", status: ["良好", "注意", "推荐"][Math.floor(Math.random() * 3)] },
      ],
    }))
  }

  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="pt-16">
        {/* Page Header */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-end mb-2">
              <Badge variant="secondary" className="bg-white/20 border-white/30 text-white rounded-full px-3 py-1">
                <Globe className="w-4 h-4 mr-2" />
                <select
                  aria-label="语言切换"
                  className="bg-transparent outline-none"
                  value={lang}
                  onChange={(e) => setLang(e.target.value as any)}
                >
                  <option value="zh">中文</option>
                  <option value="en">English</option>
                  <option value="tw">台語</option>
                </select>
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {headerTexts[lang].title}
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              {headerTexts[lang].desc}
            </p>
          </div>
        </section>
        
        {/* LBS & 附近推荐 */}
        <LocationServices />

        {/* 实时与实用信息（蓝眼泪 / 潮汐 / 天气线路） - 使用假数据 */}
        <section className="py-12 bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-semibold">蓝眼泪 · 潮汐 · 天气线路</h3>
                <p className="text-muted-foreground">基于示例数据的参考信息，供出行规划</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="rounded-full" onClick={refreshRealtime}>模拟刷新</Button>
                <Button variant="secondary" className="rounded-full" asChild>
                  <a href={`https://map.baidu.com/search/${encodeURIComponent("蓝眼泪 观测点 平潭")}`} target="_blank" rel="noopener noreferrer">
                    <MapPin className="w-4 h-4 mr-2" />观测点地图
                  </a>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 蓝眼泪预测 */}
              <Card className="rounded-2xl bg-white/70 backdrop-blur border border-white/40">
                <CardHeader>
                  <CardTitle className="flex items-center"><Sparkles className="w-5 h-5 mr-2 text-blue-600"/>蓝眼泪预测</CardTitle>
                  <CardDescription>仅供参考，实际受风浪/光污染/潮汐影响</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">概率</div>
                  <div className="text-3xl font-bold">{Math.round(realtime.blueTears.probability * 100)}%</div>
                  <div className="mt-2 text-sm">等级：<Badge className="rounded-full" variant="outline">{realtime.blueTears.level}</Badge></div>
                  <div className="mt-2 text-sm">最佳观测：{realtime.blueTears.bestTime}</div>
                  <div className="mt-2 text-sm">推荐海域：{realtime.blueTears.spots.join("、")}</div>
                </CardContent>
              </Card>
              {/* 潮汐信息 */}
              <Card className="rounded-2xl bg-white/70 backdrop-blur border border-white/40">
                <CardHeader>
                  <CardTitle className="flex items-center"><Droplets className="w-5 h-5 mr-2 text-cyan-600"/>今日潮汐</CardTitle>
                  <CardDescription>安排海边活动请注意涨落潮时间</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground">高潮</div>
                      <div className="text-lg font-semibold">{realtime.tides.high}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">低潮</div>
                      <div className="text-lg font-semibold">{realtime.tides.low}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* 天气线路建议 */}
              <Card className="rounded-2xl bg-white/70 backdrop-blur border border-white/40">
                <CardHeader>
                  <CardTitle className="flex items-center"><Cloud className="w-5 h-5 mr-2 text-slate-600"/>天气线路</CardTitle>
                  <CardDescription>根据风向/降雨的简要建议</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {realtime.weatherRoutes.map((r, i) => (
                      <div key={i} className="rounded-xl border p-3 bg-white/60">
                        <div className="flex items-center justify-between">
                          <div className="font-medium flex items-center"><Compass className="w-4 h-4 mr-2"/>{r.name}</div>
                          <Badge className="rounded-full" variant="outline">{r.status}</Badge>
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground flex items-center"><Wind className="w-4 h-4 mr-2"/>{r.tip}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* 精选卡片（新增导航/预订/距离显示） */}
        <div id="featured">
          <FeaturedAttractions />
        </div>

        {/* 互动与社区体验 */}
        <section className="py-16 bg-gradient-to-b from-white to-blue-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <Badge variant="secondary" className="rounded-full bg-white/60 border border-white/50 backdrop-blur px-3 py-1">
                <Star className="w-4 h-4 mr-2" /> 游客评价 & 游记
              </Badge>
              <h3 className="text-2xl font-semibold mt-3">真实体验，来自旅行者的声音</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {["蓝眼泪太震撼了！夜晚像星河洒在海面。","北港村的石头厝很有味道，照片随手出片。","环岛路自驾很惬意，沿途风景不断惊喜！"].map((text, i) => (
                <Card key={i} className="rounded-2xl bg-white/70 backdrop-blur border border-white/40 hover:shadow-lg transition">
                  <CardHeader>
                    <CardTitle className="text-lg">游客评价</CardTitle>
                    <CardDescription className="text-sm">@Traveler_{i + 1}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{text}</p>
                    <div className="mt-3">
                      <Badge variant="outline" className="rounded-full">#蓝眼泪实拍</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button className="rounded-full" asChild>
                <a href="/auth/signin">
                  <Camera className="w-4 h-4 mr-2" />
                  写游记 / 上传照片
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* 文化与特色融入 */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold">平潭文化小贴士</h3>
              <p className="text-muted-foreground">海坛焖饭、石头厝、渔船文化等在地元素</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "平潭色系", desc: "海蓝 + 沙滩黄，页面设计融入海岛色彩" },
                { title: "石头厝文化", desc: "体验传统闽南石头建筑的独特美学" },
                { title: "台味元素", desc: "台味美食与民宿，了解多元文化" }
              ].map((item, i) => (
                <Card key={i} className="rounded-2xl bg-white/70 backdrop-blur border border-white/40">
                  <CardHeader>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription>{item.desc}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 反馈入口 */}
        <section className="py-16 bg-gradient-to-b from-white to-blue-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold">反馈建议</h3>
              <p className="text-muted-foreground">您的意见将帮助我们持续优化体验</p>
            </div>
            <form onSubmit={handleSubmitFeedback} className="max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="email"
                  placeholder="邮箱 (可选)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl border px-3 py-2"
                />
              </div>
              <textarea
                placeholder="请写下您的建议..."
                rows={5}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 mb-4"
              />
              <div className="text-center">
                <Button type="submit" className="rounded-full">提交反馈</Button>
              </div>
            </form>
          </div>
        </section>

        {/* 浮动紧急按钮 */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button variant="destructive" className="rounded-full shadow-lg" asChild>
            <a href="tel:110" aria-label="紧急求助">
              <Phone className="w-5 h-5 mr-2" /> 紧急求助
            </a>
          </Button>
        </div>
      </div>
    </main>
  )
}