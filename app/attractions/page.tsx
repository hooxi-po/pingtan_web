"use client"
import { useState } from "react"
import { AttractionHero } from "@/components/attraction-hero"
import { AttractionFilters } from "@/components/attraction-filters"
import { AttractionGrid } from "@/components/attraction-grid"

type Filters = {
  types: string[]
  prices: string[] // free | under50 | 50-100 | over100
  durations: string[] // 1hour | 1-3hours | 3-5hours | fullday
  ratingMin: number
  tags: string[]
  query: string
}

export default function AttractionsPage() {
  const [filters, setFilters] = useState<Filters>({
    types: [],
    prices: [],
    durations: [],
    ratingMin: 4,
    tags: [],
    query: "",
  })

  return (
    <div className="min-h-screen bg-background">
      <AttractionHero
        query={filters.query}
        onQueryChange={(q) => setFilters((f) => ({ ...f, query: q }))}
        onSubmit={() => {
          /* 受控搜索，提交时无需额外操作，列表会根据 query 自动过滤 */
        }}
      />
      <main className="container mx-auto px-4 py-8 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-balance mb-3 text-foreground">平潭景点推荐</h1>
          <p className="text-lg text-muted-foreground text-pretty">
            探索平潭岛的自然奇观与人文景观，从蓝眼泪到石头厝，体验独特的海岛风情
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-80 flex-shrink-0">
            <AttractionFilters filters={filters} onChange={setFilters} />
          </aside>

          <div className="flex-1">
            <AttractionGrid filters={filters} />
          </div>
        </div>
      </main>
    </div>
  )
}
