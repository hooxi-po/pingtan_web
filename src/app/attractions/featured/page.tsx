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
  { src: "/hero-slide-1.png", caption: "长曝光摄影下的蓝眼泪轨迹 · 50mm · f/1.8 · 15s · ISO1600" },
  { src: "/hero-slide-2.png", caption: "海浪拍岸瞬间发光 · 24mm · f/2.8 · 1/4s · ISO3200" },
  { src: "/hero-windmill.png", caption: "风车与荧蓝海线同框 · 35mm · f/2 · 8s · ISO2000" },
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
          <div className="container mx-auto px-4 overflow-x-auto hide-scrollbar">
            <div className="flex gap-4 py-2 text-sm">
              <a href="#gallery" className="px-3 py-1 rounded-full bg-muted hover:bg-accent">视觉</a>
              <a href="#details" className="px-3 py-1 rounded-full bg-muted hover:bg-accent">详情</a>
              <a href="#info" className="px-3 py-1 rounded-full bg-muted hover:bg-accent">实用</a>
              <a href="#map" className="px-3 py-1 rounded-full bg-muted hover:bg-accent">地图交通</a>
              <a href="#reviews" className="px-3 py-1 rounded-full bg-muted hover:bg-accent">评价</a>
              <a href="#reco" className="px-3 py-1 rounded-full bg-muted hover:bg-accent">推荐</a>
            </div>
          </div>
        </div>

        {/* 1 主标题区 */}
        <section className="py-14 bg-gradient-to-r from-blue-600 to-blue-800 text-white" id="hero">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-3">蓝眼泪奇观</h1>
            <p className="text-blue-100 max-w-2xl mx-auto">海浪拍岸瞬间泛起荧蓝光辉，如银河坠入海面；在黑夜中，微光汇聚成一条流动的海线。</p>
          </div>
        </section>

        {/* 2 视觉展示区 */}
        <section id="gallery" className="py-10">
          <div className="container mx-auto px-4">
            <div className="relative overflow-hidden rounded-2xl bg-black/5">
              <div
                className="flex transition-transform duration-500"
                style={{ transform: `translateX(-${index * 100}%)`, touchAction: "pan-y" }}
                onTouchStart={(e) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }}
                onTouchMove={(e) => {
                  if (!touch.current) return
                  const dx = e.touches[0].clientX - touch.current.x
                  if (Math.abs(dx) > 24) { dx > 0 ? prev() : next(); touch.current = null }
                }}
                onMouseDown={(e) => { touch.current = { x: e.clientX, y: e.clientY } }}
                onMouseUp={(e) => { if (!touch.current) return; const dx = e.clientX - touch.current.x; if (Math.abs(dx) > 40) { dx > 0 ? prev() : next() } touch.current = null }}
              >
                {IMAGES.map((img, i) => (
                  <div key={i} className="relative shrink-0 w-full aspect-[16/9]">
                    <Image src={img.src} alt={img.caption} fill priority={i===0} className="object-cover" sizes="(max-width:768px) 100vw, 980px" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-xs md:text-sm bg-gradient-to-t from-black/60 to-transparent text-white">{img.caption}</div>
                  </div>
                ))}
              </div>
              <button aria-label="prev" onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 shadow"><ChevronLeft className="w-5 h-5"/></button>
              <button aria-label="next" onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 shadow"><ChevronRight className="w-5 h-5"/></button>
            </div>
          </div>
        </section>

        {/* 3 内容详情模块 */}
        <section id="details" className="py-12 bg-gradient-to-b from-white to-blue-50/50">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="text-2xl font-semibold mb-4">关于蓝眼泪</h2>
              <p className="text-muted-foreground mb-3">“蓝眼泪”是甲藻类在扰动下发出的冷光发生现象，海水受拍击时产生短暂荧蓝闪光，形成独特的夜间观光体验。</p>
              <p className="text-muted-foreground">观赏以无月/少云、暗场、微风、小浪为佳；请勿涉水踩踏或用桶搅动，保护海洋生态。</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  "4-8月活跃高峰",
                  "21:00-23:00更显著",
                  "需暗场避强光",
                  "涨潮后浪花更亮",
                  "建议三脚架长曝",
                ].map((t,i)=> (
                  <Badge key={i} variant="secondary" className="rounded-full">{t}</Badge>
                ))}
              </div>
            </div>
            <Card className="rounded-2xl bg-white/70 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg">摄影建议</CardTitle>
                <CardDescription>关闭手电直射海面，采用长曝光与低色温白平衡</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>相机：光圈优先/手动模式；三脚架+快门线。</p>
                <p>参数：f/1.4-2.8 · 6-20s · ISO1600-3200 · RAW。</p>
                <p>对焦：手动对焦无穷远，或借远处灯标预对焦。</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 4 实用信息区 */}
        <section id="info" className="py-12">
          <div className="container mx-auto px-4 grid md:grid-cols-3 gap-6">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center"><Clock className="w-4 h-4 mr-2"/>最佳时段</CardTitle>
                <CardDescription>4-8月 · 21:00-23:00 · 涨潮前后</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">新月期观赏更佳；节假日人多，工作日体验更舒适。</CardContent>
            </Card>
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center"><Wind className="w-4 h-4 mr-2"/>天气条件</CardTitle>
                <CardDescription>
                  {weatherLoading && "加载中…"}
                  {!weatherLoading && weatherError && "加载失败"}
                  {!weatherLoading && !weatherError && (
                    <span>
                      {weather?.now?.text ?? "暂无"} · 风力{weather?.now?.wind_class ?? "未知"} · {weather?.now?.wind_dir ?? ""}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                {!weatherLoading && !weatherError && weather?.now ? (
                  <>
                    <p>当前温度：{weather?.now?.temp ?? "-"}℃，体感：{weather?.now?.feels_like ?? "-"}℃</p>
                    <p>相对湿度：{weather?.now?.rh ?? "-"}% · 云量：{weather?.now?.clouds ?? "-"}% · 能见度：{weather?.now?.vis ?? "-"}m</p>
                    <p>1小时降水：{weather?.now?.prec_1h ?? "-"}mm · 空气质量指数：{weather?.now?.aqi ?? "-"}</p>
                    {weather?.uptime && <p>更新时间：{weather?.uptime}</p>}
                  </>
                ) : (
                  <p>风浪过大或强降雨会抑制亮度；避开全月夜。</p>
                )}
              </CardContent>
            </Card>
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center"><Star className="w-4 h-4 mr-2"/>人流预测</CardTitle>
                <CardDescription>当前：
                  <span className={crowd.color}>{crowd.level}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{crowd.tip} 本提示基于时段估计，仅供参考。</CardContent>
            </Card>
          </div>

          {/* 未来5天天气预报 */}
          <div className="container mx-auto px-4 mt-6">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg">未来5天天气预报</CardTitle>
                <CardDescription>数据来源：百度地图天气服务</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {weatherLoading && <p>正在加载预报…</p>}
                {!weatherLoading && weatherError && <p>预报加载失败：{weatherError}</p>}
                {!weatherLoading && !weatherError && Array.isArray(weather?.forecasts) ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {weather?.forecasts?.slice(0,5).map((d: any, i: number) => (
                      <div key={i} className="rounded-xl border p-3 bg-background/60">
                        <div className="font-medium">{d?.date}（{d?.week}）</div>
                        <div className="mt-1">白天：{d?.text_day ?? "-"} · {d?.high ?? "-"}℃</div>
                        <div className="">夜间：{d?.text_night ?? "-"} · {d?.low ?? "-"}℃</div>
                        <div className="text-xs text-muted-foreground mt-1">风力：{d?.wc_day ?? "-"}/{d?.wc_night ?? "-"} · 风向：{d?.wd_day ?? "-"}/{d?.wd_night ?? "-"}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>暂无预报数据</p>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 5 地理交通模块 */}
        <section id="map" className="py-12 bg-gradient-to-b from-white to-blue-50/50">
          <div className="container mx-auto px-4 grid lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2">
              <div className="h-80 w-full rounded-2xl overflow-hidden border">
                <BaiduMap center={CENTER} zoom={12} markers={MARKERS} />
              </div>
            </div>
            <div className="space-y-4">
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center"><Route className="w-4 h-4 mr-2"/>交通指南</CardTitle>
                  <CardDescription>自驾 / 公交 / 步行</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>自驾：导航搜索“坛南湾停车场”，步行约8-12分钟至海滩暗场。</p>
                  <p>公交：乘至“坛南湾”站，下车沿指示步行前往观赏点。</p>
                  <p>步行：沿海步道注意潮位与防滑，勿翻越警戒线。</p>
                  <Button onClick={()=>openBaiduDirection("坛南湾海滩")} className="rounded-full mt-2" variant="outline"><NavIcon className="w-4 h-4 mr-2"/>打开百度导航</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* 6 互动评价区 */}
        <section id="reviews" className="py-12">
          <div className="container mx-auto px-4 grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-semibold">游客评价</h3>
                <div className="text-sm text-muted-foreground">共{reviews.length}条 · 平均{(reviews.reduce((a,b)=>a+b.rating,0)/reviews.length).toFixed(1)}分</div>
              </div>
              <div className="space-y-4">
                {view.map(r=> (
                  <Card key={r.id} className="rounded-2xl">
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
            <Card className="rounded-2xl">
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
        </section>

        {/* 7 智能推荐栏 */}
        <section id="reco" className="py-12 bg-gradient-to-b from-white to-blue-50/50">
          <div className="container mx-auto px-4">
            <h3 className="text-xl font-semibold mb-6">相关景点</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { href: "/attractions/stone-houses", title: "石头厝古村", desc: "海岛人文风貌", img: "/window.svg" },
                { href: "/attractions/coastal-road", title: "环岛路", desc: "最美海岸自驾", img: "/globe.svg" },
                { href: "/attractions", title: "坛南湾海滩", desc: "蓝眼泪热门点位", img: "/file.svg" },
              ].map((a,i)=> (
                <Link key={i} href={a.href} className="group rounded-2xl overflow-hidden border bg-white/70 backdrop-blur hover:shadow-lg transition-all">
                  <div className="relative h-40 w-full bg-gradient-to-br from-blue-100 to-blue-200">
                    <Image src={a.img} alt={a.title} fill className="object-contain p-6" />
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

      {/* 固定返回按钮 */}
      <Link href="/attractions" className="fixed left-4 bottom-6 z-40">
        <span className="inline-flex items-center px-3 py-2 rounded-full bg-white/90 border shadow"><ChevronLeft className="w-4 h-4 mr-1"/>返回</span>
      </Link>
    </main>
  )
}