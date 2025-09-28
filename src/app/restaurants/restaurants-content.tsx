"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Navigation as NavIcon, Search, Utensils, MapPin } from "lucide-react"
import BaiduMap, { BaiduMarker } from "@/components/ui/baidu-map"

function useQueryRestaurants(initialQuery = "特色美食", initialRegion = "平潭") {
  const [query, setQuery] = useState(initialQuery)
  const [region, setRegion] = useState(initialRegion)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<any[]>([])
  const [total, setTotal] = useState<number>(0)

  // 支持分页与半径搜索
  const fetchData = async (params?: {
    q?: string
    r?: string
    pageSize?: number
    pageNum?: number
    location?: { lng: number; lat: number } | null
    radius?: number | null
  }) => {
    const q = params?.q ?? query
    const r = params?.r ?? region
    const pageSize = params?.pageSize ?? 10
    const pageNum = params?.pageNum ?? 0
    const location = params?.location ?? null
    const radius = params?.radius ?? null

    setLoading(true)
    setError(null)
    try {
      const url = new URL("/api/map/search", window.location.origin)
      url.searchParams.set("query", q)
      url.searchParams.set("tag", "美食")
      url.searchParams.set("region", r)
      url.searchParams.set("page_size", String(pageSize))
      url.searchParams.set("page_num", String(pageNum))
      url.searchParams.set("scope", "2")
      if (location) {
        url.searchParams.set("location", `${location.lat},${location.lng}`)
      }
      if (radius) {
        url.searchParams.set("radius", String(radius))
      }
      const resp = await fetch(url.toString())
      const json = await resp.json()
      if (!resp.ok || !json?.ok) {
        throw new Error(json?.error || "加载失败")
      }
      const items = json?.data?.results || []
      setResults(items)
      setTotal(json?.data?.total ?? items.length)
    } catch (e: any) {
      setError(e?.message || "加载失败")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { query, setQuery, region, setRegion, loading, error, results, total, refresh: fetchData }
}

export default function RestaurantsContent() {
  const { query, setQuery, region, setRegion, loading, error, results, total, refresh } = useQueryRestaurants()

  // 位置与筛选
  const DEFAULT_CENTER = { lng: 119.790168, lat: 25.507135 }
  const [coords, setCoords] = useState<{ lng: number; lat: number } | null>(null)
  const [useMyLocation, setUseMyLocation] = useState(false)

  const [pageNum, setPageNum] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const [radius, setRadius] = useState<number | null>(null) // m，null 表示不限
  const [minRating, setMinRating] = useState<number | null>(null)
  const [priceMin, setPriceMin] = useState<number | null>(null)
  const [priceMax, setPriceMax] = useState<number | null>(null)

  useEffect(() => {
    if (!useMyLocation) return
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setCoords({ lng: longitude, lat: latitude })
      },
      () => {
        // 获取失败则回退到默认中心
        setCoords(null)
      }
    )
  }, [useMyLocation])

  // 根据筛选与分页刷新
  const doRefresh = () => {
    refresh({
      q: query,
      r: region,
      pageNum,
      pageSize,
      location: useMyLocation ? coords : DEFAULT_CENTER,
      radius,
    })
  }

  // 首次或筛选变化时刷新
  useEffect(() => {
    doRefresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNum, pageSize, radius, useMyLocation, coords])

  // 客户端进一步过滤评分与价格
  const filteredResults = useMemo(() => {
    return (results || []).filter((it) => {
      const info = it?.detail_info || {}
      // 评分
      if (minRating != null) {
        const r = parseFloat(info?.overall_rating ?? info?.overall_rating_num ?? info?.rating ?? "0")
        if (isFinite(r) && r < minRating) return false
      }
      // 价格
      const price = info?.price != null ? Number(info.price) : null
      if (priceMin != null && (price == null || price < priceMin)) return false
      if (priceMax != null && (price == null || price > priceMax)) return false
      return true
    })
  }, [results, minRating, priceMin, priceMax])

  const markers: BaiduMarker[] = useMemo(() => {
    return filteredResults
      .map((it) => {
        const loc = it?.location
        if (!loc) return null
        return { lng: loc?.lng, lat: loc?.lat, title: it?.name }
      })
      .filter(Boolean) as BaiduMarker[]
  }, [filteredResults])

  const handleNavigate = (name: string) => {
    const ak = process.env.NEXT_PUBLIC_BAIDU_MAP_JS_API_KEY
    const url = `https://map.baidu.com/search/${encodeURIComponent(name + " " + region)}${ak ? `?ak=${encodeURIComponent(ak)}` : ""}`
    window.open(url, "_blank")
  }

  // 降级体验：直接打开百度地图搜索当前关键词+地区
  const handleOpenGlobalSearch = () => {
    const text = `${query} ${region}`.trim()
    const url = `https://map.baidu.com/search/${encodeURIComponent(text)}`
    window.open(url, "_blank")
  }

  const canPrev = pageNum > 0
  const canNext = (pageNum + 1) * pageSize < (total || 0)

  return (
    <section className="py-16 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="rounded-full bg-white/60 border border-white/50 backdrop-blur px-3 py-1">
            <Utensils className="w-4 h-4 mr-2" /> 特色美食
          </Badge>
          <h3 className="text-2xl font-semibold mt-3">平潭餐厅与小吃</h3>
          <p className="text-sm text-muted-foreground">探索附近的海鲜餐厅与地方小吃，支持搜索、筛选与导航</p>
        </div>

        {/* 搜索栏 */}
        <div className="max-w-3xl mx-auto mb-6">
          <div className="rounded-2xl bg-white/70 backdrop-blur border border-white/40 p-4 flex flex-wrap gap-2 items-center">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              className="flex-1 min-w-[180px] bg-transparent outline-none text-sm"
              placeholder="搜索餐厅，如 海鲜、烧烤、特色小吃"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <input
              className="w-36 bg-transparent outline-none text-sm"
              placeholder="地区，如 平潭、福州"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            />
            <Button className="rounded-full" onClick={() => { setPageNum(0); doRefresh(); }}>搜索</Button>
          </div>
        </div>

        {/* 筛选栏 */}
        <div className="max-w-5xl mx-auto mb-6">
          <div className="rounded-2xl bg-white/70 backdrop-blur border border-white/40 p-4 grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
            {/* 距离 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">距离</span>
              <select
                className="text-sm bg-white/60 rounded-xl px-2 py-1 border border-white/50"
                value={radius ?? ""}
                onChange={(e) => { setPageNum(0); setRadius(e.target.value ? Number(e.target.value) : null); }}
                title="筛选最大距离"
              >
                <option value="">不限</option>
                <option value={1000}>1 公里</option>
                <option value={3000}>3 公里</option>
                <option value={5000}>5 公里</option>
                <option value={10000}>10 公里</option>
              </select>
              <Button size="sm" variant={useMyLocation ? "default" : "outline"} className="rounded-full" onClick={() => setUseMyLocation((v) => !v)}>
                {useMyLocation ? "已使用我的位置" : "使用我的位置"}
              </Button>
            </div>

            {/* 评分 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">评分</span>
              <select
                className="text-sm bg-white/60 rounded-xl px-2 py-1 border border-white/50"
                value={minRating ?? ""}
                onChange={(e) => setMinRating(e.target.value ? Number(e.target.value) : null)}
                title="最低评分"
              >
                <option value="">不限</option>
                <option value={3.0}>3.0+</option>
                <option value={3.5}>3.5+</option>
                <option value={4.0}>4.0+</option>
                <option value={4.5}>4.5+</option>
              </select>
            </div>

            {/* 价格范围 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">人均</span>
              <input
                className="w-20 text-sm bg-white/60 rounded-xl px-2 py-1 border border-white/50"
                placeholder="最低"
                inputMode="numeric"
                value={priceMin ?? ""}
                onChange={(e) => setPriceMin(e.target.value === "" ? null : Number(e.target.value))}
              />
              <span className="text-muted-foreground">-</span>
              <input
                className="w-20 text-sm bg-white/60 rounded-xl px-2 py-1 border border-white/50"
                placeholder="最高"
                inputMode="numeric"
                value={priceMax ?? ""}
                onChange={(e) => setPriceMax(e.target.value === "" ? null : Number(e.target.value))}
              />
              <span className="text-xs text-muted-foreground">(元)</span>
            </div>

            {/* 分页大小 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">每页</span>
              <select
                className="text-sm bg-white/60 rounded-xl px-2 py-1 border border-white/50"
                value={pageSize}
                onChange={(e) => { setPageNum(0); setPageSize(Number(e.target.value)); }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>

            {/* 操作 */}
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" className="rounded-full" onClick={() => { setMinRating(null); setPriceMin(null); setPriceMax(null); setRadius(null); setUseMyLocation(false); setPageNum(0); doRefresh(); }}>重置</Button>
              <Button className="rounded-full" onClick={() => { setPageNum(0); doRefresh(); }}>应用</Button>
            </div>
          </div>
        </div>

        {/* 地图 + 列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 rounded-2xl overflow-hidden h-[560px]">
            <BaiduMap
              center={useMyLocation && coords ? coords : DEFAULT_CENTER}
              zoom={12}
              markers={markers}
            />
          </div>

          <div className="space-y-4 max-h-[560px] overflow-y-auto pr-2">
            {loading && (
              <Card className="rounded-2xl">
                <CardContent className="p-4 text-sm text-muted-foreground">加载中…</CardContent>
              </Card>
            )}

            {error && (
              <Card className="rounded-2xl border-red-200 bg-red-50">
                <CardContent className="p-4 text-sm text-red-700">
                  <div className="space-y-3">
                    <p>加载失败：{error}</p>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => doRefresh()}>重试</Button>
                      <Button size="sm" variant="outline" onClick={handleOpenGlobalSearch}>打开百度地图搜索</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {!loading && !error && filteredResults.length === 0 && (
              <Card className="rounded-2xl">
                <CardContent className="p-4 text-sm text-muted-foreground">
                  <div className="space-y-3">
                    <p>暂无结果，请更换关键词或地区。</p>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => doRefresh()}>重试</Button>
                      <Button size="sm" variant="outline" onClick={handleOpenGlobalSearch}>打开百度地图搜索</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {filteredResults.map((item) => (
              <Card key={item?.uid || item?.name} className="rounded-2xl bg-white/70 backdrop-blur border border-white/40 hover:shadow-lg transition">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><MapPin className="w-4 h-4" />{item?.name}</CardTitle>
                  <CardDescription className="text-sm">{item?.address}</CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-1">
                  {item?.telephone && <p>电话：{item.telephone}</p>}
                  {item?.detail_info?.tag && <p>标签：{item.detail_info.tag}</p>}
                  {item?.detail_info?.price && <p>人均：¥{item.detail_info.price}</p>}
                  {item?.detail_info?.distance && <p>距离：{item.detail_info.distance} 米</p>}
                  {item?.detail_info?.overall_rating && <p>评分：{item.detail_info.overall_rating}</p>}
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="flex gap-2 w-full">
                    <Button className="flex-1 rounded-2xl" variant="outline" onClick={() => handleNavigate(item?.name)}>
                      <NavIcon className="w-4 h-4 mr-2" /> 导航
                    </Button>
                    <Button className="flex-1 rounded-2xl" asChild>
                      <Link href={`/booking/${item?.uid || item?.name}`}>
                        立即预订
                      </Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}

            {/* 分页 */}
            <div className="sticky bottom-0 bg-gradient-to-t from-white/90 to-white/0 pt-4">
              <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/70 backdrop-blur border border-white/40 p-3">
                <Button variant="outline" className="rounded-full" disabled={!canPrev || loading} onClick={() => { if (!canPrev) return; setPageNum((p) => Math.max(0, p - 1)); }}>
                  上一页
                </Button>
                <div className="text-xs text-muted-foreground">
                  第 <span className="font-medium">{pageNum + 1}</span> 页 / 共 <span className="font-medium">{Math.max(1, Math.ceil((total || 0) / pageSize))}</span> 页
                </div>
                <Button className="rounded-full" disabled={!canNext || loading} onClick={() => { if (!canNext) return; setPageNum((p) => p + 1); }}>
                  下一页
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}