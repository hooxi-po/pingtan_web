"use client"

import Navigation from "@/components/ui/navigation"
import Image from "next/image"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useMemo, useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Star, MapPin, Clock, Wind, Navigation as NavIcon, Route } from "lucide-react"

const BaiduMap = dynamic(() => import("@/components/ui/baidu-map"), { ssr: false })

const IMAGES = [
  { src: "/stone-houses/Gemini_Generated_Image_ny81yuny81yuny81.png", caption: "传统石头厝建筑群 · 24mm · f/8 · 1/125s · ISO200" },
  { src: "/stone-houses/Gemini_Generated_Image_uqfq0euqfq0euqfq.png", caption: "石头厝内部结构 · 35mm · f/5.6 · 1/60s · ISO400" },
  { src: "/stone-houses/Gemini_Generated_Image_y59n1ty59n1ty59n.png", caption: "夕阳下的石头厝剪影 · 50mm · f/2.8 · 1/250s · ISO100" },
]

const CENTER = { lng: 119.7903, lat: 25.5043 }
const MARKERS = [
  { lng: 119.796, lat: 25.493, title: "北港村石头厝群" },
  { lng: 119.772, lat: 25.523, title: "东庠岛石头厝" },
]

type Review = { id: number; name: string; rating: number; content: string; date: string }
const INITIAL_REVIEWS: Review[] = [
  { id: 1, name: "小明", rating: 5, content: "石头厝建筑很有特色，历史感浓厚，值得细细品味。", date: "2024-05-15" },
  { id: 2, name: "阿华", rating: 4, content: "建筑保存完好，可以了解平潭传统建筑文化。", date: "2024-06-08" },
  { id: 3, name: "游客", rating: 5, content: "摄影爱好者必去，石头厝在夕阳下特别美。", date: "2024-06-20" },
  { id: 4, name: "文化爱好者", rating: 4, content: "建议请导游讲解，能更好地了解石头厝的历史。", date: "2024-07-02" },
]

export default function StoneHousesPage() {
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
    if (h >= 9 && h <= 11) return { level: "中", color: "text-amber-600", tip: "上午光线较好，适合拍照。" }
    if (h >= 16 && h <= 18) return { level: "中-高", color: "text-amber-600", tip: "黄昏时分，石头厝最美。" }
    return { level: "低", color: "text-green-700", tip: "人流较少，可以安静欣赏。" }
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
              <span className="text-foreground">石头厝建筑</span>
            </div>
            <Button asChild variant="outline" size="sm" className="rounded-full"><Link href="/attractions"><ChevronLeft className="w-4 h-4 mr-1"/>返回</Link></Button>
          </div>
        </div>

        {/* 轮播图 */}
        <section className="relative h-[60vh] overflow-hidden">
          <div className="relative w-full h-full">
            {IMAGES.map((img, i) => (
              <div key={i} className={`absolute inset-0 transition-transform duration-700 ease-in-out ${i === index ? "translate-x-0" : i < index ? "-translate-x-full" : "translate-x-full"}`}>
                <Image src={img.src} alt={img.caption} fill className="object-cover" priority={i === 0} />
                <div className="absolute inset-0 bg-black/20" />
              </div>
            ))}
          </div>
          
          {/* 轮播控制 */}
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors">
            <ChevronRight className="w-6 h-6" />
          </button>
          
          {/* 指示器 */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {IMAGES.map((_, i) => (
              <button key={i} onClick={() => setIndex(i)} className={`w-3 h-3 rounded-full transition-colors ${i === index ? "bg-white" : "bg-white/50"}`} />
            ))}
          </div>
          
          {/* 图片说明 */}
          <div className="absolute bottom-16 left-4 right-4 text-white">
            <p className="text-sm bg-black/50 backdrop-blur px-3 py-2 rounded-lg">{IMAGES[index].caption}</p>
          </div>
        </section>

        {/* 主要内容 */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* 左侧主要内容 */}
            <div className="lg:col-span-2 space-y-8">
              {/* 标题和基本信息 */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-3xl font-bold">石头厝建筑群</h1>
                  <Badge variant="secondary">文化遗产</Badge>
                  <Badge variant="outline">建筑艺术</Badge>
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">4.6</span>
                    <span>({reviews.length}条评价)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>平潭县北港村</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>全天开放</span>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  石头厝是平潭岛独特的传统建筑，以当地花岗岩为主要建材，具有防风抗震的特点。这些建筑见证了平潭人民与海洋和谐共生的历史，是闽东建筑文化的重要组成部分。
                </p>
              </div>

              {/* 实时信息卡片 */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* 人流状况 */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Wind className="w-5 h-5" />
                      当前人流
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold">人流量</span>
                      <Badge variant={crowd.level === "高" ? "destructive" : crowd.level.includes("中") ? "default" : "secondary"}>
                        {crowd.level}
                      </Badge>
                    </div>
                    <p className={`text-sm ${crowd.color}`}>{crowd.tip}</p>
                  </CardContent>
                </Card>

                {/* 天气信息 */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Wind className="w-5 h-5" />
                      天气状况
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {weatherLoading ? (
                      <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded mb-2"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                      </div>
                    ) : weatherError ? (
                      <p className="text-sm text-muted-foreground">{weatherError}</p>
                    ) : weather?.now ? (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl font-bold">{weather.now.temp}°C</span>
                          <Badge variant="outline">{weather.now.text}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          体感 {weather.now.feelsLike}°C · 湿度 {weather.now.humidity}%
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">暂无天气数据</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* 详细介绍 */}
              <Card>
                <CardHeader>
                  <CardTitle>建筑特色</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">建筑材料</h4>
                    <p className="text-muted-foreground">
                      石头厝主要使用平潭当地的花岗岩石材，这些石材质地坚硬，能够抵御海风侵蚀。墙体厚实，具有良好的保温和隔热效果。
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">建筑结构</h4>
                    <p className="text-muted-foreground">
                      采用传统的干砌工艺，不使用水泥，完全依靠石材的重量和巧妙的结构设计保持稳定。屋顶多为人字形，利于排水防风。
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">文化价值</h4>
                    <p className="text-muted-foreground">
                      石头厝不仅是建筑艺术的体现，更承载着平潭人民的生活智慧和文化传承，是研究闽东海岛建筑文化的重要实物资料。
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 游客评价 */}
              <Card>
                <CardHeader>
                  <CardTitle>游客评价</CardTitle>
                  <CardDescription>来自 {reviews.length} 位游客的真实评价</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {view.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{review.name}</span>
                            <div className="flex">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">{review.date}</span>
                        </div>
                        <p className="text-muted-foreground">{review.content}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* 分页 */}
                  {pages > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
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

            {/* 右侧边栏 */}
            <div className="space-y-6">
              {/* 地图 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    位置导航
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 rounded-lg overflow-hidden mb-4">
                    <BaiduMap center={CENTER} markers={MARKERS} zoom={13} />
                  </div>
                  <div className="space-y-2">
                    {MARKERS.map((marker, i) => (
                      <Button key={i} variant="outline" size="sm" className="w-full justify-start" onClick={() => openBaiduDirection(marker.title)}>
                        <Route className="w-4 h-4 mr-2" />
                        {marker.title}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 参观建议 */}
              <Card>
                <CardHeader>
                  <CardTitle>参观建议</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">最佳时间</p>
                      <p className="text-sm text-muted-foreground">上午9-11点，下午4-6点光线最佳</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <NavIcon className="w-5 h-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">交通方式</p>
                      <p className="text-sm text-muted-foreground">建议自驾或包车前往，公共交通不便</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Star className="w-5 h-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">拍照提示</p>
                      <p className="text-sm text-muted-foreground">夕阳西下时石头厝剪影效果最佳</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}