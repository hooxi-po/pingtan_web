import { Star, MapPin, Heart } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface AccommodationCardProps {
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

export function AccommodationCard({
  id,
  name,
  type,
  location,
  rating,
  reviews,
  price,
  originalPrice,
  image,
  tags,
  distance,
}: AccommodationCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative">
        <img
          src={image || "/placeholder.svg"}
          alt={name}
          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors">
          <Heart className="w-5 h-5 text-foreground" />
        </button>
        <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">{type}</Badge>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-foreground text-balance group-hover:text-primary transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-semibold text-foreground">{rating}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
          <span>·</span>
          <span>{distance}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">¥{price}</span>
              <span className="text-sm text-muted-foreground line-through">¥{originalPrice}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{reviews} 条评价</p>
          </div>
          <Link href={`/accommodations/${String(id)}`}>
            <Button size="sm" className="px-6">
              查看详情
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}
