import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

const categories = [
  { name: "海鲜大餐", image: "/category-seafood.jpg", count: 156 },
  { name: "闽南小吃", image: "/category-snacks.jpg", count: 89 },
  { name: "特色餐厅", image: "/category-restaurant.jpg", count: 124 },
  { name: "海鲜烧烤", image: "/category-bbq.jpg", count: 67 },
  { name: "甜品饮品", image: "/category-dessert.jpg", count: 78 },
  { name: "美食街区", image: "/category-food-street.jpg", count: 12 },
]

export function FoodCategories() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-foreground">美食分类</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <Card
            key={category.name}
            className="overflow-hidden border-border/50 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="relative h-24">
              <Image
                src={category.image || "/placeholder.svg"}
                alt={category.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <CardContent className="p-3 text-center">
              <h3 className="font-semibold text-sm mb-1 text-foreground">{category.name}</h3>
              <p className="text-xs text-muted-foreground">{category.count}家</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
