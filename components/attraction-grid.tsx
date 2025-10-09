"use client"

import { useEffect, useMemo, useState } from "react"
import { AttractionCard } from "@/components/attraction-card"

type Filters = {
  types: string[]
  prices: string[]
  durations: string[]
  ratingMin: number
  tags: string[]
  query: string
}

type Attraction = {
  id: number
  name: string
  type: string
  image: string
  rating: number
  reviews: number
  price: string
  duration: string
  distance: string
  tags: string[]
  description: string
}

const fallbackAttractions: Attraction[] = [
  { id: 1, name: "蓝眼泪观赏点", type: "自然景观", image: "/blue-tears-beach-night-glow.jpg", rating: 4.9, reviews: 2856, price: "免费", duration: "2-3小时", distance: "距市中心 8km", tags: ["适合拍照", "夜间观赏", "自然奇观"], description: "每年4-8月，海滩上出现的梦幻蓝色荧光现象，是平潭最著名的自然奇观" },
  { id: 2, name: "石头厝古村", type: "人文景观", image: "/stone-house-village-traditional.jpg", rating: 4.7, reviews: 1523, price: "免费", duration: "1-2小时", distance: "距市中心 12km", tags: ["历史文化", "适合拍照", "古建筑"], description: "独特的石头建筑群，展现平潭传统建筑艺术和海岛文化" },
  { id: 3, name: "龙凤头海滨浴场", type: "海滩沙滩", image: "/longfengtou-beach-resort.jpg", rating: 4.6, reviews: 3421, price: "免费", duration: "3-5小时", distance: "距市中心 5km", tags: ["海滩度假", "水上运动", "亲子游玩"], description: "平潭最大的天然海滨浴场，沙质细软，海水清澈，是夏季避暑胜地" },
  { id: 4, name: "海坛古城", type: "人文景观", image: "/haitan-ancient-city-architecture.jpg", rating: 4.5, reviews: 2134, price: "免费", duration: "2-4小时", distance: "距市中心 3km", tags: ["历史文化", "美食街", "夜景"], description: "以闽南文化为主题的仿古建筑群，集观光、美食、购物于一体" },
  { id: 5, name: "仙人井景区", type: "自然景观", image: "/xianrenjing-sea-erosion-landscape.jpg", rating: 4.8, reviews: 1876, price: "¥50", duration: "2-3小时", distance: "距市中心 15km", tags: ["海蚀地貌", "适合拍照", "自然奇观"], description: "壮观的海蚀地貌景观，巨大的天然海蚀竖井令人叹为观止" },
  { id: 6, name: "东海仙境", type: "自然景观", image: "/donghai-fairyland-coastal-cliffs.jpg", rating: 4.7, reviews: 2245, price: "¥60", duration: "2-3小时", distance: "距市中心 18km", tags: ["海蚀地貌", "悬崖峭壁", "适合拍照"], description: "奇特的海蚀地貌和悬崖景观，被誉为东海仙境" },
  { id: 7, name: "北港文创村", type: "人文景观", image: "/beigang-creative-village-art.jpg", rating: 4.6, reviews: 1654, price: "免费", duration: "1-2小时", distance: "距市中心 10km", tags: ["文艺小清新", "适合拍照", "民宿聚集"], description: "石头厝改造的文创村落，充满艺术气息和文艺范儿" },
  { id: 8, name: "坛南湾", type: "海滩沙滩", image: "/tannanwan-beach-sunset.jpg", rating: 4.8, reviews: 1987, price: "免费", duration: "2-4小时", distance: "距市中心 20km", tags: ["海滩度假", "日落观赏", "情侣约会"], description: "平潭最美的海湾之一，以绝美的日落景色而闻名" },
  { id: 9, name: "将军山", type: "自然景观", image: "/jiangjunshan-mountain-view.jpg", rating: 4.5, reviews: 1432, price: "免费", duration: "2-3小时", distance: "距市中心 7km", tags: ["登山徒步", "观景台", "日出观赏"], description: "平潭最高峰，登顶可俯瞰整个平潭岛和海峡风光" },
]

function priceToNumber(price: string): number {
  if (price.includes("免费")) return 0
  const m = price.match(/\d+/)
  return m ? parseInt(m[0], 10) : NaN
}

function matchesPriceCategories(num: number, cats: string[]): boolean {
  if (!cats.length) return true
  return cats.some((c) => {
    if (c === "free") return num === 0
    if (c === "under50") return num > 0 && num < 50
    if (c === "50-100") return num >= 50 && num <= 100
    if (c === "over100") return num > 100
    return false
  })
}

function parseDuration(duration: string) {
  if (duration.includes("全天")) return { min: 24, max: 24, fullDay: true }
  const m = duration.match(/(\d+)(?:-(\d+))?小时/)
  const min = m ? parseInt(m[1], 10) : 0
  const max = m && m[2] ? parseInt(m[2], 10) : min
  return { min, max, fullDay: false }
}

function matchesDuration(dur: { min: number; max: number; fullDay: boolean }, cats: string[]): boolean {
  if (!cats.length) return true
  return cats.some((c) => {
    if (c === "fullday") return dur.fullDay
    if (c === "1hour") return !dur.fullDay && dur.max <= 1
    if (c === "1-3hours") return !dur.fullDay && dur.max <= 3
    if (c === "3-5hours") return !dur.fullDay && dur.min >= 3 && dur.max <= 5
    return false
  })
}

function matchesKeyword(a: Attraction, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const inName = a.name.toLowerCase().includes(q)
  const inDesc = a.description.toLowerCase().includes(q)
  const inType = a.type.toLowerCase().includes(q)
  const inTags = a.tags.some((t) => t.toLowerCase().includes(q))
  return inName || inDesc || inType || inTags
}

export function AttractionGrid({ filters }: { filters: Filters }) {
  const [items, setItems] = useState<Attraction[]>([])
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<"default" | "rating_desc" | "reviews_desc">("default")

  useEffect(() => {
    const controller = new AbortController()
    const fetchData = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        params.set("limit", "100")
        if (sortKey !== "default") params.set("sort", sortKey)
        const res = await fetch(`/api/attractions?${params.toString()}`, { signal: controller.signal })
        if (!res.ok) throw new Error("Failed to load attractions")
        const data = await res.json()
        const list: Attraction[] = Array.isArray(data) ? data : fallbackAttractions
        setItems(list)
      } catch (e) {
        setItems(fallbackAttractions)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    return () => controller.abort()
  }, [sortKey])

  const filtered = useMemo(() => {
    return items
      .filter((a) => (filters.types.length ? filters.types.includes(a.type) : true))
      .filter((a) => {
        const num = priceToNumber(a.price)
        return matchesPriceCategories(num, filters.prices)
      })
      .filter((a) => matchesDuration(parseDuration(a.duration), filters.durations))
      .filter((a) => a.rating >= filters.ratingMin)
      .filter((a) => (filters.tags.length ? a.tags.some((t) => filters.tags.includes(t)) : true))
      .filter((a) => matchesKeyword(a, filters.query))
  }, [items, filters])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground">{loading ? "正在加载景点..." : `找到 ${filtered.length} 个景点`}</p>
        <select
          className="px-4 py-2 rounded-md border border-border bg-background text-foreground text-sm"
          value={sortKey}
          onChange={(e) => {
            const v = e.target.value
            if (v === "评分最高") setSortKey("rating_desc")
            else if (v === "人气最高") setSortKey("reviews_desc")
            else setSortKey("default")
          }}
        >
          <option>综合排序</option>
          <option>评分最高</option>
          <option>人气最高</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((attraction) => (
          <AttractionCard key={attraction.id} attraction={attraction} />
        ))}
      </div>
    </div>
  )
}
