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
  { src: "/blue-tears/Gemini_Generated_Image_f011rpf011rpf011.png", caption: "长曝光摄影下的蓝眼泪轨迹 · 50mm · f/1.8 · 15s · ISO1600" },
  { src: "/blue-tears/Gemini_Generated_Image_kaes1xkaes1xkaes.png", caption: "海浪拍岸瞬间发光 · 24mm · f/2.8 · 1/4s · ISO3200" },
  { src: "/blue-tears/Gemini_Generated_Image_m6r716m6r716m6r7.png", caption: "风车与荧蓝海线同框 · 35mm · f/2 · 8s · ISO2000" },
]

const CENTER = { lng: 119.7903, lat: 25.5043 }
const MARKERS = [
  { lng: 119.796, lat: 25.493, title: "坛南湾海滩(观赏点)" },
  { lng: 119.772, lat: 25.523, title: "龙凤头海滨(观赏点)" },
]

type Review = { id: number; name: string; rating: number; content: string; date: string }
const INITIAL_REVIEWS: Review[] = [
  { id: 1, name: "Lynn", rating: 5, content: "5月下旬来，涨潮后海浪翻涌时最亮，建议关灯慢走。", date: "2024-05-28" },
  { id: 2, name: "阿海", rating: 4, content: "风大有点冷，穿防风外套。夜拍建议三脚架+手电筒。", date: "2024-06-12" },
  { id: 3, name: "南屿", rating: 5, content: "周三人不多，步道暗处谨慎行走，环保不要下海踩踏。", date: "2024-06-19" },
  { id: 4, name: "Suki", rating: 4, content: "月光太强时不明显，等云遮月的间隙效果更好。", date: "2024-07-05" },
]

export default function FeaturedBlueTearsPage() {
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
    if (h >= 20 && h <= 22) return { level: "中-高", color: "text-amber-600", tip: "黄金观赏时段，建议提前抵达。" }
    if (h >= 23 || h <= 1) return { level: "中", color: "text-green-700", tip: "较从容，可耐心等待海浪。" }
    return { level: "低", color: "text-green-700", tip: "白天难以观测，建议夜间造访。" }
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
              <span className="text-foreground">蓝眼泪奇观</span>
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
                <div className="absolute inset-0 bg-black/20" />
              </div>
            ))}
          </div>
          
          {/* 轮播控制 */}
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors z-10">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors z-10">
            <ChevronRight className="w-6 h-6" />
          </button>
          
          {/* 指示器 */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
            {IMAGES.map((_, i) => (
              <button key={i} onClick={() => setIndex(i)} className={`w-3 h-3 rounded-full transition-colors ${i === index ? "bg-white" : "bg-white/50"}`} />
            ))}
          </div>
          
          {/* 图片说明 */}
          <div className="absolute bottom-20 left-4 right-4 text-white z-10">
            <p className="text-sm bg-black/50 backdrop-blur px-4 py-2 rounded-lg">{IMAGES[index].caption}</p>
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
                  <h1 className="text-3xl font-bold">蓝眼泪奇观</h1>
                  <Badge variant="secondary">自然奇观</Badge>
                  <Badge variant="outline">夜间观赏</Badge>
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">4.8</span>
                    <span>(1,234条评价)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>坛南湾海滩</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>21:00-23:00最佳</span>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  海浪拍岸瞬间泛起荧蓝光辉，如银河坠入海面；在黑夜中，微光汇聚成一条流动的海线。"蓝眼泪"是甲藻类在扰动下发出的冷光发生现象，海水受拍击时产生短暂荧蓝闪光，形成独特的夜间观光体验。
                </p>
              </div>

              {/* 详细介绍 */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-3">观赏指南</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">最佳时段</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span>观赏季节</span>
                          <span className="font-medium">4-8月</span>
                        </div>
                        <div className="flex justify-between">
                          <span>最佳时间</span>
                          <span className="font-medium">21:00-23:00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>潮汐条件</span>
                          <span className="font-medium">涨潮前后</span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">摄影建议</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <p>• 相机：光圈优先/手动模式</p>
                        <p>• 参数：f/1.4-2.8 · 6-20s · ISO1600-3200</p>
                        <p>• 对焦：手动对焦无穷远</p>
                        <p>• 建议：三脚架+快门线+RAW格式</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">注意事项</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      "需暗场避强光",
                      "涨潮后浪花更亮", 
                      "建议三脚架长曝",
                      "无月/少云更佳",
                      "保护海洋生态",
                      "勿涉水踩踏"
                    ].map((tip, i) => (
                      <Badge key={i} variant="secondary" className="rounded-full justify-center py-2">
                        {tip}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* 地图 */}
                <div>
                  <h2 className="text-xl font-semibold mb-3">位置地图</h2>
                  <div className="h-80 w-full rounded-2xl overflow-hidden border">
                    <BaiduMap center={CENTER} zoom={12} markers={MARKERS} />
                  </div>
                </div>

                {/* 游客评价 */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-semibold">游客评价</h2>
                    <div className="text-sm text-muted-foreground">共{reviews.length}条 · 平均{(reviews.reduce((a,b)=>a+b.rating,0)/reviews.length).toFixed(1)}分</div>
                  </div>
                  <div className="space-y-4">
                    {view.map(r=> (
                      <Card key={r.id}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{r.name}</CardTitle>
                            <div className="flex items-center text-amber-500">{Array.from({length:5}).map((_,i)=> <Star key={i} className={`w-4 h-4 ${i<r.rating?"fill-amber-400":""}`}/>)}</div>
                          </div>
                          <CardDescription>{r.date}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">{r.content}</CardContent>
                      </Card>
                    ))}
                  </div>
                  <div className="flex justify-center gap-2 mt-4">
                    <Button size="sm" variant="outline" className="rounded-full" onClick={()=>setPage(p=>Math.max(1,p-1))}>上一页</Button>
                    <div className="text-sm self-center">{page}/{pages}</div>
                    <Button size="sm" variant="outline" className="rounded-full" onClick={()=>setPage(p=>Math.min(pages,p+1))}>下一页</Button>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧信息栏 */}
            <div className="space-y-6">
              {/* 实时信息 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Wind className="w-4 h-4 mr-2" />
                    实时信息
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">当前人流</span>
                      <Badge variant={crowd.level === "低" ? "secondary" : crowd.level === "中" ? "default" : "destructive"}>
                        {crowd.level}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{crowd.tip}</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">天气状况</span>
                      <span className="text-sm">
                        {weatherLoading && "加载中…"}
                        {!weatherLoading && weatherError && "加载失败"}
                        {!weatherLoading && !weatherError && (
                          <span>{weather?.now?.text ?? "暂无"}</span>
                        )}
                      </span>
                    </div>
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
                      <span className="text-sm">坛南湾海滩</span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openBaiduDirection("坛南湾海滩")}
                      >
                        导航
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">龙凤头海滨</span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openBaiduDirection("龙凤头海滨")}
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
                  <CardTitle className="text-lg">未来5天天气</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  {weatherLoading && <p className="text-muted-foreground">正在加载预报…</p>}
                  {!weatherLoading && weatherError && <p className="text-muted-foreground">预报加载失败</p>}
                  {!weatherLoading && !weatherError && Array.isArray(weather?.forecasts) ? (
                    <div className="space-y-2">
                      {weather?.forecasts?.slice(0,3).map((d: any, i: number) => (
                        <div key={i} className="flex justify-between items-center py-1 border-b last:border-0">
                          <div>
                            <div className="font-medium text-xs">{d?.date}（{d?.week}）</div>
                            <div className="text-xs text-muted-foreground">{d?.text_day ?? "-"}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs">{d?.high ?? "-"}°/{d?.low ?? "-"}°</div>
                            <div className="text-xs text-muted-foreground">{d?.wc_day ?? "-"}</div>
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
                  <CardDescription>分享你的观赏体验</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="称呼" className="w-full px-3 py-2 rounded-xl border bg-background" />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">评分：</span>
                    {Array.from({length:5}).map((_,i)=> (
                      <button key={i} onClick={()=>setForm({...form, rating:i+1})}><Star className={`w-5 h-5 ${i<form.rating?"fill-amber-400 text-amber-500":"text-muted-foreground"}`} /></button>
                    ))}
                  </div>
                  <textarea value={form.content} onChange={e=>setForm({...form, content:e.target.value})} placeholder="写下你的建议或小贴士…" className="w-full px-3 py-2 rounded-xl border bg-background h-24" />
                  <Button className="rounded-full w-full" onClick={()=>{
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
                { href: "/attractions/stone-houses", title: "石头厝古村", desc: "海岛人文风貌", img: "/stone-houses/Gemini_Generated_Image_ny81yuny81yuny81.png" },
                { href: "/attractions/coastal-road", title: "环岛路", desc: "最美海岸自驾", img: "/coastal-road/Gemini_Generated_Image_csemzicsemzicsem.png" },
                { href: "/attractions", title: "坛南湾海滩", desc: "蓝眼泪热门点位", img: "/file.svg" },
              ].map((a,i)=> (
                <Link key={i} href={a.href} className="group rounded-2xl overflow-hidden border bg-white/70 backdrop-blur hover:shadow-lg transition-all">
                  <div className="relative h-40 w-full bg-gradient-to-br from-blue-100 to-blue-200">
                    <Image src={a.img} alt={a.title} fill className="object-cover" />
                  </div>
                  <div className="p-4">
                    <div className="font-medium group-hover:text-primary">{a.title}</div>
                    <div className="text-sm text-muted-foreground">{a.desc}</div>
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