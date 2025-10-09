"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, DollarSign } from "lucide-react"
import Link from "next/link"

interface FoodCardProps {
  food: {
    id: number
    name: string
    category: string
    image: string
    rating: number
    reviews: number
    avgPrice: string
    distance: string
    tags: string[]
    description: string
    specialty: string
  }
}

export function FoodCard({ food }: FoodCardProps) {
  const [imgSrc, setImgSrc] = useState<string>(food.image || "/placeholder.jpg")
  return (
    <Card className="overflow-hidden border-border/50 hover:shadow-lg transition-all group">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={imgSrc}
          alt={food.name}
          fill
          sizes="(min-width:1280px) 33vw, (min-width:768px) 50vw, 100vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImgSrc("/placeholder.jpg")}
        />
        <div className="absolute top-3 right-3">
          <Badge className="bg-coral text-sand">{food.category}</Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="mb-2">
          <h3 className="text-lg font-semibold mb-1 text-foreground group-hover:text-ocean transition-colors">
            {food.name}
          </h3>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-coral text-coral" />
              <span className="font-medium text-foreground">{food.rating}</span>
              <span className="text-muted-foreground">({food.reviews}条评价)</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2 text-pretty">{food.description}</p>

        <div className="mb-3">
          <p className="text-xs text-muted-foreground mb-1">招牌菜</p>
          <p className="text-sm text-foreground font-medium line-clamp-1">{food.specialty}</p>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {food.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs bg-muted">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="space-y-1.5 mb-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{food.distance}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>人均 {food.avgPrice}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-border/50">
          <Link href={`/food/${food.id}`} className="flex-1">
            <Button size="sm" variant="outline" className="w-full bg-transparent">
              查看菜单
            </Button>
          </Link>
          <Link href={`/food/${food.id}`} className="flex-1">
            <Button size="sm" className="w-full bg-ocean hover:bg-ocean/90 text-sand">
              立即预订
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
