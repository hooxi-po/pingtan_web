"use client"

import { useState } from "react"
import { FoodHero } from "@/components/food-hero"
import { FoodFilters } from "@/components/food-filters"
import { FoodGrid } from "@/components/food-grid"
import { FoodCategories } from "@/components/food-categories"

type Filters = {
  types: string[]
  prices: string[]
  features: string[]
  scenes: string[]
  ratingMin: number
}

export function FoodPageClient() {
  const [filters, setFilters] = useState<Filters>({
    types: [],
    prices: [],
    features: [],
    scenes: [],
    ratingMin: 4,
  })

  return (
    <>
      <FoodHero />
      <main className="container mx-auto px-4 py-8 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-balance mb-3 text-foreground">平潭美食推荐</h1>
          <p className="text-lg text-muted-foreground text-pretty">
            品尝平潭地道海鲜和闽南特色美食，探索海岛独特的饮食文化
          </p>
        </div>

        <FoodCategories />

        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          <aside className="lg:w-80 flex-shrink-0">
            <FoodFilters filters={filters} onChange={setFilters} />
          </aside>

          <div className="flex-1">
            <FoodGrid filters={filters} />
          </div>
        </div>
      </main>
    </>
  )
}