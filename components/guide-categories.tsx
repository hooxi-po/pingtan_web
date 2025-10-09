"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, Map, Utensils, Camera, Wallet, Info } from "lucide-react"

const categories = [
  { id: "all", name: "全部攻略", icon: Info },
  { id: "itinerary", name: "行程规划", icon: Calendar },
  { id: "routes", name: "路线推荐", icon: Map },
  { id: "food", name: "美食攻略", icon: Utensils },
  { id: "photo", name: "摄影指南", icon: Camera },
  { id: "budget", name: "省钱攻略", icon: Wallet },
]

export function GuideCategories() {
  const [selected, setSelected] = useState("all")

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <Button
              key={category.id}
              variant={selected === category.id ? "default" : "outline"}
              className={
                selected === category.id ? "bg-ocean hover:bg-ocean/90 text-sand" : "bg-transparent hover:bg-muted"
              }
              onClick={() => setSelected(category.id)}
            >
              <Icon className="h-4 w-4 mr-2" />
              {category.name}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
