"use client"

import { useEffect, useMemo, useState } from "react"
import { AccommodationCard } from "@/components/accommodation-card"

type Accommodation = {
  id: number
  name: string
  type: string
  location: string
  rating: number
  reviews: number
  price: number
  originalPrice: number
  image: string
  tags: string[]
  distance: string
}

type Filters = {
  priceRange: [number, number]
  types: string[]
  ratingMin: number
  amenities: string[]
  locations: string[]
}

const fallbackData: Accommodation[] = [
  {
    id: 1,
    name: "平潭海景度假酒店",
    type: "酒店",
    location: "龙凤头海滨浴场",
    rating: 4.8,
    reviews: 328,
    price: 688,
    originalPrice: 888,
    image: "/luxury-beach-hotel-ocean-view.jpg",
    tags: ["海景房", "免费WiFi", "含早餐", "免费停车"],
    distance: "距海滩 50米",
  },
  {
    id: 2,
    name: "石头厝特色民宿",
    type: "民宿",
    location: "北港村",
    rating: 4.9,
    reviews: 256,
    price: 468,
    originalPrice: 568,
    image: "/traditional-stone-house-guesthouse.jpg",
    tags: ["特色建筑", "免费WiFi", "管家服务"],
    distance: "距景区 200米",
  },
  {
    id: 3,
    name: "蓝眼泪海景别墅",
    type: "别墅",
    location: "坛南湾",
    rating: 5.0,
    reviews: 189,
    price: 1288,
    originalPrice: 1588,
    image: "/modern-beach-villa-sunset.jpg",
    tags: ["独栋别墅", "私人泳池", "海景房", "含早餐"],
    distance: "距海滩 100米",
  },
  {
    id: 4,
    name: "海坛古城精品客栈",
    type: "客栈",
    location: "海坛古城",
    rating: 4.7,
    reviews: 412,
    price: 388,
    originalPrice: 488,
    image: "/traditional-chinese-inn-courtyard.jpg",
    tags: ["古城内", "免费WiFi", "特色装修"],
    distance: "古城中心",
  },
  {
    id: 5,
    name: "平潭湾度假公寓",
    type: "公寓",
    location: "龙凤头海滨浴场",
    rating: 4.6,
    reviews: 298,
    price: 528,
    originalPrice: 628,
    image: "/modern-apartment-sea-view-balcony.jpg",
    tags: ["海景房", "厨房", "免费停车", "洗衣机"],
    distance: "距海滩 150米",
  },
  {
    id: 6,
    name: "石牌洋观景度假村",
    type: "度假村",
    location: "石牌洋景区",
    rating: 4.8,
    reviews: 367,
    price: 888,
    originalPrice: 1088,
    image: "/resort-hotel-tropical-beach.jpg",
    tags: ["度假村", "含早餐", "游泳池", "健身房"],
    distance: "景区内",
  },
]

type SortKey = "recommended" | "price_asc" | "price_desc" | "rating_desc" | "distance_asc"

function parseDistanceMeters(distance: string): number | null {
  const match = distance.match(/(\d+)/)
  return match ? parseInt(match[1], 10) : null
}

function applyClientSort(items: Accommodation[], sort: SortKey): Accommodation[] {
  const arr = [...items]
  switch (sort) {
    case "price_asc":
      arr.sort((a, b) => a.price - b.price)
      break
    case "price_desc":
      arr.sort((a, b) => b.price - a.price)
      break
    case "rating_desc":
      arr.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
      break
    case "distance_asc":
      arr.sort((a, b) => {
        const da = parseDistanceMeters(a.distance)
        const db = parseDistanceMeters(b.distance)
        if (da == null && db == null) return 0
        if (da == null) return 1
        if (db == null) return -1
        return da - db
      })
      break
    case "recommended":
    default:
      arr.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
  }
  return arr
}

function mapSortToApi(sort: SortKey): string | undefined {
  switch (sort) {
    case "price_asc":
      return "price_asc"
    case "price_desc":
      return "price_desc"
    case "rating_desc":
      return "rating_desc"
    default:
      return undefined
  }
}

export function AccommodationGrid({ filters }: { filters: Filters }) {
  const [items, setItems] = useState<Accommodation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sort, setSort] = useState<SortKey>("recommended")

  useEffect(() => {
    const controller = new AbortController()
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const apiSort = mapSortToApi(sort)
        const qs = apiSort ? `?sort=${apiSort}` : ""
        const res = await fetch(`/api/accommodations${qs}`, { signal: controller.signal })
        const data = (await res.json()) as Accommodation[]
        if (!Array.isArray(data)) {
          setItems(applyClientSort(fallbackData, sort))
        } else {
          setItems(data)
        }
      } catch (e) {
        setItems(applyClientSort(fallbackData, sort))
      } finally {
        setLoading(false)
      }
    }
    run()
    return () => controller.abort()
  }, [sort])

  const filtered = useMemo(() => {
    let arr = items
    // 类型筛选（多选）
    if (filters.types.length > 0) {
      arr = arr.filter((i) => filters.types.includes(i.type))
    }
    // 价格区间
    arr = arr.filter((i) => i.price >= filters.priceRange[0] && i.price <= filters.priceRange[1])
    // 最低评分
    if (filters.ratingMin > 0) {
      arr = arr.filter((i) => i.rating >= filters.ratingMin)
    }
    // 设施服务（多选且需全部包含）
    if (filters.amenities.length > 0) {
      arr = arr.filter((i) => filters.amenities.every((a) => i.tags.includes(a)))
    }
    // 位置区域（多选）
    if (filters.locations.length > 0) {
      arr = arr.filter((i) => filters.locations.includes(i.location))
    }
    // 应用客户端排序（保证过滤后顺序）
    arr = applyClientSort(arr, sort)
    return arr
  }, [items, filters, sort])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          找到 <span className="font-semibold text-foreground">{filtered.length}</span> 个住宿选择
        </p>
        <select
          className="text-sm border border-border rounded-lg px-3 py-2 bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
        >
          <option value="recommended">推荐排序</option>
          <option value="price_asc">价格从低到高</option>
          <option value="price_desc">价格从高到低</option>
          <option value="rating_desc">评分最高</option>
          <option value="distance_asc">距离最近</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading && filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">加载中...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">未找到符合条件的住宿</p>
        ) : (
          filtered.map((accommodation) => <AccommodationCard key={accommodation.id} {...accommodation} />)
        )}
      </div>

      <div className="mt-8 flex justify-center">
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors text-foreground">
            上一页
          </button>
          <button className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg">1</button>
          <button className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors text-foreground">
            2
          </button>
          <button className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors text-foreground">
            3
          </button>
          <button className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors text-foreground">
            下一页
          </button>
        </div>
      </div>
    </div>
  )
}
