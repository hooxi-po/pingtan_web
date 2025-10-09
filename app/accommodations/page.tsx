"use client"
import { useState } from "react"
import { AccommodationHeader } from "@/components/accommodation-header"
import { AccommodationFilters } from "@/components/accommodation-filters"
import { AccommodationGrid } from "@/components/accommodation-grid"

type Filters = {
  priceRange: [number, number]
  types: string[]
  ratingMin: number
  amenities: string[]
  locations: string[]
}

export default function AccommodationsPage() {
  const [filters, setFilters] = useState<Filters>({
    priceRange: [200, 1500],
    types: [],
    ratingMin: 4,
    amenities: [],
    locations: [],
  })

  return (
    <div className="min-h-screen bg-background">
      <AccommodationHeader />
      <main className="container mx-auto px-4 py-8 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-balance mb-3 text-foreground">平潭住宿推荐</h1>
          <p className="text-lg text-muted-foreground text-pretty">
            探索平潭岛的精选住宿，从海景酒店到特色民宿，为您的海岛之旅找到完美的落脚点
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-80 flex-shrink-0">
            <AccommodationFilters filters={filters} onChange={setFilters} />
          </aside>

          <div className="flex-1">
            <AccommodationGrid filters={filters} />
          </div>
        </div>
      </main>
    </div>
  )
}
