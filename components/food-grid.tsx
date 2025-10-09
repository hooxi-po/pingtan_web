"use client"

import { useEffect, useMemo, useState } from "react"
import { FoodCard } from "@/components/food-card"
import type { Restaurant } from "@/lib/schema"

type Filters = {
  types: string[]
  prices: string[]
  features: string[]
  scenes: string[]
  ratingMin: number
}

// 动态从接口加载，确保与详情页使用同一来源的 id
const useRestaurants = () => {
  const [items, setItems] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/restaurants`, { signal: controller.signal })
        if (!res.ok) throw new Error(`status ${res.status}`)
        const data = (await res.json()) as Restaurant[]
        setItems(Array.isArray(data) ? data : [])
      } catch (e) {
        setError("加载失败")
        setItems([])
      } finally {
        setLoading(false)
      }
    }
    run()
    return () => controller.abort()
  }, [])
  return { items, loading, error }
}

const parsePrice = (price: string) => {
  const n = Number(String(price).replace(/[^\d.]/g, ""))
  return Number.isFinite(n) ? n : 0
}

const categoryMatch = (category: string, types: string[]) => {
  if (types.length === 0) return true
  const c = category.toLowerCase()
  const checks: Record<string, boolean> = {
    seafood: /海鲜/.test(category),
    minnan: /闽南/.test(category),
    snacks: /小吃/.test(category),
    bbq: /烧烤/.test(category),
    hotpot: /火锅/.test(category),
    dessert: /甜品/.test(category),
  }
  return types.some((t) => checks[t])
}

const priceMatch = (price: number, ranges: string[]) => {
  if (ranges.length === 0) return true
  const inRange = (id: string) => {
    if (id === "under50") return price < 50
    if (id === "50-100") return price >= 50 && price <= 100
    if (id === "100-200") return price > 100 && price <= 200
    if (id === "over200") return price > 200
    return true
  }
  return ranges.some(inRange)
}

const includesAll = (tags: string[], selected: string[]) => {
  if (selected.length === 0) return true
  return selected.every((s) => {
    const map: Record<string, string> = {
      seaview: "海景",
      local: "本地特色",
      chain: "连锁",
      private: "包厢",
      family: "家庭聚餐",
      friends: "朋友聚会",
      date: "情侣约会",
      business: "商务宴请",
    }
    const keyword = map[s]
    return keyword ? tags.some((t) => t.includes(keyword)) : true
  })
}

export function FoodGrid({ filters }: { filters: Filters }) {
  const { items, loading, error } = useRestaurants()
  const filtered = useMemo(() => {
    return items.filter((f) => {
      const price = parsePrice(f.avgPrice)
      return (
        f.rating >= filters.ratingMin &&
        categoryMatch(f.category, filters.types) &&
        priceMatch(price, filters.prices) &&
        includesAll(f.tags, filters.features) &&
        includesAll(f.tags, filters.scenes)
      )
    })
  }, [items, filters])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground">找到 {filtered.length} 家餐厅</p>
        <select className="px-4 py-2 rounded-md border border-border bg-background text-foreground text-sm">
          <option>综合排序</option>
          <option>评分最高</option>
          <option>距离最近</option>
          <option>人气最高</option>
          <option>价格最低</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading && filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">加载中...</p>
        ) : error ? (
          <p className="text-sm text-destructive">加载失败，请稍后重试</p>
        ) : (
          filtered.map((food) => <FoodCard key={food.id} food={food} />)
        )}
      </div>
    </div>
  )
}
