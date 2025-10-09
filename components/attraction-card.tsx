import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Clock } from "lucide-react"

interface AttractionCardProps {
  attraction: {
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
}

export function AttractionCard({ attraction }: AttractionCardProps) {
  return (
    <Card className="overflow-hidden border-border/50 hover:shadow-lg transition-all group">
      <Link href={`/attractions/${attraction.id}`}>
        <div className="relative h-48 overflow-hidden">
          <Image
            src={attraction.image || "/placeholder.svg"}
            alt={attraction.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3">
            <Badge className="bg-ocean text-sand">{attraction.type}</Badge>
          </div>
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="mb-2">
          <Link href={`/attractions/${attraction.id}`}>
            <h3 className="text-lg font-semibold mb-1 text-foreground group-hover:text-ocean transition-colors">
              {attraction.name}
            </h3>
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-coral text-coral" />
              <span className="font-medium text-foreground">{attraction.rating}</span>
              <span className="text-muted-foreground">({attraction.reviews}条评价)</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2 text-pretty">{attraction.description}</p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {attraction.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs bg-muted">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="space-y-1.5 mb-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{attraction.distance}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>建议游玩 {attraction.duration}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div>
            <span className="text-xs text-muted-foreground">门票</span>
            <p className="text-lg font-bold text-ocean">{attraction.price}</p>
          </div>
          <Link href={`/attractions/${attraction.id}`}>
            <Button size="sm" className="bg-ocean hover:bg-ocean/90 text-sand">
              查看详情
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
