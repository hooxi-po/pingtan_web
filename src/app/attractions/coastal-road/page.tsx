"use client"

import Navigation from "@/components/ui/navigation"
import Image from "next/image"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useMemo, useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Star, MapPin, Clock, Wind, Navigation as NavIcon, Route, Car, Camera, Compass } from "lucide-react"

const BaiduMap = dynamic(() => import("@/components/ui/baidu-map"), { ssr: false })

const IMAGES = [
  { src: "/coastal-road/Gemini_Generated_Image_csemzicsemzicsem.png", caption: "环岛路海岸风光 · 24mm · f/11 · 1/250s · ISO100" },
  { src: "/coastal-road/Gemini_Generated_Image_mz9ro7mz9ro7mz9r.png", caption: "沿海公路蜿蜒曲线 · 35mm · f/8 · 1/125s · ISO200" },
  { src: "/coastal-road/Gemini_Generated_Image_ws6p8sws6p8sws6p.png", caption: "黄昏时分的海岸线 · 50mm · f/5.6 · 1/60s · ISO400" },
]

const CENTER = { lng: 119.7903, lat: 25.5043 }
const MARKERS = [
  { lng: 119.796, lat: 25.493, title: "环岛路北段观景台" },
  { lng: 119.772, lat: 25.523, title: "环岛路南段海湾" },
  { lng: 119.785, lat: 25.510, title: "最佳拍摄点" },
]

type Review = { id: number; name: string; rating: number; content: string; date: string }
const INITIAL_REVIEWS: Review[] = [
  { id: 1, name: "自驾达人", rating: 5, content: "环岛路自驾体验绝佳，沿途海景美不胜收，是平潭必走的路线！", date: "2024-05-15" },
  { id: 2, name: "摄影师小王", rating: 5, content: "黄昏时分在环岛路拍照，光线和构图都很完美，出片率极高。", date: "2024-06-08" },
  { id: 3, name: "旅行者", rating: 4, content: "路况很好，风景优美，建议慢慢开，多停几个观景点。", date: "2024-06-20" },
  { id: 4, name: "海岛爱好者", rating: 5, content: "环岛路是感受平潭海岛魅力的最佳方式，强烈推荐！", date: "2024-07-02" },
]

export default function CoastalRoadPage() {
  const [index, setIndex] = useState(0)
  const touch = useRef<{ x: number; y: number } | null>(null)
  // 天气相关状态
  const [weather, setWeather] = useState<any | null>(null)
  const [weatherLoading, setWeatherLoading] = useState<boolean>(true)
  const [weatherError, setWeatherError] = useState<string | null>(null)
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS)
  const [page, setPage] = useState(1)
  const [form, setForm] = useState({ name: "", rating: 5, content: "" })
  const pageSize = 3
  const pages = Math.max(1, Math.ceil(reviews.length / pageSize))
  const view = useMemo(() => reviews.slice((page - 1) * pageSize, page * pageSize), [reviews, page])

  const crowd = useMemo(() => {
    const h = new Date().getHours()
    if (h >= 8 && h <= 10) return { level: "低", color: "text-green-700", tip: "清晨时光，空气清新，适合自驾。" }
    if (h >= 16 && h <= 18) return { level: "中-高", color: "text-amber-600", tip: "黄昏时分，最佳拍摄时间。" }
    if (h >= 10 && h <= 16) return { level: "中", color: "text-amber-600", tip: "白天光线充足，适合观光。" }
    return { level: "低", color: "text-green-700", tip: "夜晚较少车辆，注意安全驾驶。" }
  }, [])

  const openBaiduDirection = (destinationName: string) => {
    const ak = process.env.NEXT_PUBLIC_BAIDU_MAP_JS_API_KEY
    const url = `https://map.baidu.com/search/${encodeURIComponent(destinationName + " 平潭")}${ak ? `?ak=${encodeURIComponent(ak)}` : ""}`
    window.open(url, "_blank")
  }

  const prev = () => setIndex((i) => (i - 1 + IMAGES.length) % IMAGES.length)
  const next = () => setIndex((i) => (i + 1) % IMAGES.length)

  // 拉取百度天气（行政区划：平潭县 222405，返回全部数据）
  useEffect(() => {
    const url = `/api/weather?district_id=222405&data_type=all`
    const abort = new AbortController()
    fetch(url, { signal: abort.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setWeather(data?.result ?? null)
        setWeatherError(null)
      })
      .catch((err: any) => {
        if (err?.name === "AbortError") return
        console.error("加载天气失败:", err)
        setWeatherError("天气数据加载失败，请稍后重试")
      })
      .finally(() => setWeatherLoading(false))
    return () => abort.abort()
  }, [])

  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="pt-16">
        {/* 面包屑 + 返回 */}
        <div className="sticky top-14 z-30 bg-background/60 backdrop-blur border-b">
          <div className="container mx-auto px-4 flex items-center justify-between py-2">
            <div className="text-sm text-muted-foreground space-x-2">
              <Link href="/" className="hover:text-foreground">首页</Link>
              <span>/</span>
              <Link href="/attractions" className="hover:text-foreground">景点</Link>
              <span>/</span>
              <span className="text-foreground">环岛路风光带</span>
            </div>
            <Button asChild variant="outline" size="sm" className="rounded-full"><Link href="/attractions"><ChevronLeft className="w-4 h-4 mr-1"/>返回</Link></Button>
          </div>
        </div>

        {/* 全屏轮播图 */}
        <section className="relative h-screen overflow-hidden">
          <div className="relative w-full h-full">
            {IMAGES.map((img, i) => (
              <div key={i} className={`absolute inset-0 transition-transform duration-700 ease-in-out ${i === index ? "translate-x-0" : i < index ? "-translate-x-full" : "translate-x-full"}`}>
                <Image src={img.src} alt={img.caption} fill className="object-cover" priority={i === 0} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            ))}
          </div>

          {/* 轮播控制 */}
          <Button onClick={prev} variant="ghost" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 text-white border-white/20">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button onClick={next} variant="ghost" size="icon" className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 text-white border-white/20">
            <ChevronRight className="w-6 h-6" />
          </Button>

          {/* 图片说明 */}
          <div className="absolute bottom-6 left-6 right-6 z-20">
            <div className="bg-black/40 backdrop-blur rounded-2xl p-4 text-white">
              <p className="text-sm font-medium">{IMAGES[index].caption}</p>
            </div>
          </div>

          {/* 指示器 */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
            {IMAGES.map((_, i) => (
              <button key={i} onClick={() => setIndex(i)} className={`w-2 h-2 rounded-full transition-all ${i === index ? "bg-white" : "bg-white/50"}`} />
            ))}
          </div>
        </section>

        {/* 主内容区域 */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左侧主内容 */}
            <div className="lg:col-span-2 space-y-8">
              {/* 标题和基本信息 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold">环岛路风光带</h1>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="ml-2 text-sm text-muted-foreground">(4.8分)</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center"><MapPin className="w-4 h-4 mr-1" />平潭环岛路全线</div>
                  <div className="flex items-center"><Clock className="w-4 h-4 mr-1" />全天开放</div>
                  <div className="flex items-center"><Car className="w-4 h-4 mr-1" />自驾推荐</div>
                </div>
              </div>

              {/* 自驾指南 */}
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Car className="w-5 h-5 mr-2" />
                    自驾指南
                  </CardTitle>
                  <CardDescription>最美海岸自驾路线，沿途风景不断</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="rounded-full">最佳时段</Badge>
                      <span className="text-sm">日出日落时分</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="rounded-full">路线长度</Badge>
                      <span className="text-sm">约68公里环岛</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="rounded-full">驾驶时间</Badge>
                      <span className="text-sm">2-3小时（含停留）</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="rounded-full">路况</Badge>
                      <span className="text-sm">柏油路面，路况良好</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="rounded-full">停车</Badge>
                      <span className="text-sm">多个观景台可停车</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="rounded-full">油费</Badge>
                      <span className="text-sm">约30-50元</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 摄影建议 */}
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Camera className="w-5 h-5 mr-2" />
                    摄影建议
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { title: "黄金时段", desc: "日出前30分钟至日出后1小时", icon: "🌅" },
                      { title: "最佳机位", desc: "各观景台制高点，俯拍海岸线", icon: "📸" },
                      { title: "构图建议", desc: "利用公路引导线，突出海岸曲线", icon: "🎨" },
                    ].map((tip, i) => (
                      <div key={i} className="text-center p-4 rounded-xl bg-gradient-to-b from-blue-50 to-transparent">
                        <div className="text-2xl mb-2">{tip.icon}</div>
                        <h4 className="font-medium mb-1">{tip.title}</h4>
                        <p className="text-sm text-muted-foreground">{tip.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 注意事项 */}
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle>注意事项</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {["注意行车安全，勿疲劳驾驶", "观景时请将车辆停在指定区域", "海边风大，注意保暖", "携带充足的水和食物", "关注天气变化，避免恶劣天气出行"].map((note, i) => (
                      <Badge key={i} variant="outline" className="rounded-full">{note}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 位置地图 */}
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Compass className="w-5 h-5 mr-2" />
                    位置地图
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 rounded-xl overflow-hidden">
                    <BaiduMap center={CENTER} markers={MARKERS} />
                  </div>
                </CardContent>
              </Card>

              {/* 游客评价 */}
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Star className="w-5 h-5 mr-2" />
                      游客评价
                    </span>
                    <span className="text-sm text-muted-foreground">共{reviews.length}条评价</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {view.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{review.name}</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className={`w-4 h-4 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">{review.date}</span>
                      </div>
                      <p className="text-sm">{review.content}</p>
                    </div>
                  ))}
                  {pages > 1 && (
                    <div className="flex justify-center space-x-2 pt-4">
                      {Array.from({ length: pages }, (_, i) => (
                        <Button key={i} variant={page === i + 1 ? "default" : "outline"} size="sm" onClick={() => setPage(i + 1)}>
                          {i + 1}
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 右侧信息栏 */}
            <div className="space-y-6">
              {/* 实时信息 */}
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg">实时信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">当前人流</span>
                      <Badge variant="secondary" className={`rounded-full ${crowd.color}`}>{crowd.level}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{crowd.tip}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">天气状况</span>
                      <Wind className="w-4 h-4 text-muted-foreground" />
                    </div>
                    {weatherLoading && <p className="text-xs text-muted-foreground">正在加载…</p>}
                    {!weatherLoading && weatherError && <p className="text-xs text-muted-foreground">加载失败</p>}
                    {!weatherLoading && !weatherError && weather?.now && (
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>温度：{weather.now.temp ?? "-"}℃ · 体感：{weather.now.feels_like ?? "-"}℃</p>
                        <p>风力：{weather.now.wind_class ?? "未知"} · {weather.now.wind_dir ?? ""}</p>
                        <p>湿度：{weather.now.rh ?? "-"}% · 能见度：{weather.now.vis ?? "-"}m</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 交通指南 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Route className="w-4 h-4 mr-2" />
                    交通指南
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">环岛路北段</span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openBaiduDirection("环岛路北段观景台")}
                      >
                        导航
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">环岛路南段</span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openBaiduDirection("环岛路南段海湾")}
                      >
                        导航
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 天气预报 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">未来3天天气</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  {weatherLoading && <p className="text-muted-foreground">正在加载预报…</p>}
                  {!weatherLoading && weatherError && <p className="text-muted-foreground">预报加载失败</p>}
                  {!weatherLoading && !weatherError && Array.isArray(weather?.forecasts) ? (
                    <div className="space-y-2">
                      {weather?.forecasts?.slice(0,3).map((d: any, i: number) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b last:border-b-0">
                          <div>
                            <div className="font-medium">{d.date}</div>
                            <div className="text-xs text-muted-foreground">{d.text_day}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{d.high}°/{d.low}°</div>
                            <div className="text-xs text-muted-foreground">{d.wind_direction} {d.wind_scale}级</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">暂无预报数据</p>
                  )}
                </CardContent>
              </Card>

              {/* 提交评价 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">提交评价</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="您的昵称" 
                    value={form.name} 
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">评分：</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`w-4 h-4 cursor-pointer ${star <= form.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                          onClick={() => setForm({...form, rating: star})}
                        />
                      ))}
                    </div>
                  </div>
                  <textarea 
                    placeholder="分享您的自驾体验..." 
                    value={form.content} 
                    onChange={(e) => setForm({...form, content: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm h-20 resize-none"
                  />
                  <Button size="sm" className="w-full" onClick={() => {
                    if(!form.name || !form.content) return alert("请填写完整信息")
                    const newR: Review = { id: Date.now(), name: form.name, rating: form.rating, content: form.content, date: new Date().toISOString().slice(0,10) }
                    setReviews([newR, ...reviews]); setForm({ name:"", rating:5, content:""}); setPage(1)
                  }}>提交</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* 相关景点推荐 */}
        <section className="py-12 bg-gradient-to-b from-white to-blue-50/50">
          <div className="container mx-auto px-4">
            <h3 className="text-xl font-semibold mb-6">相关景点</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { href: "/attractions/featured", title: "蓝眼泪海滩", desc: "神秘海洋奇观", img: "/blue-tears/Gemini_Generated_Image_dlhqfedlhqfedlhq.png" },
                { href: "/attractions/stone-houses", title: "石头厝古村", desc: "海岛人文风貌", img: "/stone-houses/Gemini_Generated_Image_ny81yuny81yuny81.png" },
                { href: "/attractions", title: "坛南湾海滩", desc: "蓝眼泪热门点位", img: "/file.svg" },
              ].map((a,i)=> (
                <Link key={i} href={a.href} className="group rounded-2xl overflow-hidden border bg-white/70 backdrop-blur hover:shadow-lg transition-all">
                  <div className="aspect-video relative overflow-hidden">
                    <Image src={a.img} alt={a.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold mb-1">{a.title}</h4>
                    <p className="text-sm text-muted-foreground">{a.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}