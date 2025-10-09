"use client"

import { useMemo } from "react"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Star, Wifi, Waves, UtensilsCrossed, Car, Wind } from "lucide-react"

type Filters = {
  priceRange: [number, number]
  types: string[]
  ratingMin: number
  amenities: string[]
  locations: string[]
}

type Props = {
  filters: Filters
  onChange: (next: Filters) => void
}

export function AccommodationFilters({ filters, onChange }: Props) {
  const amenityOptions = useMemo(
    () => [
      { id: "wifi", label: "免费WiFi", icon: Wifi },
      { id: "seaview", label: "海景房", icon: Waves },
      { id: "breakfast", label: "含早餐", icon: UtensilsCrossed },
      { id: "parking", label: "免费停车", icon: Car },
      { id: "ac", label: "空调", icon: Wind },
    ],
    []
  )

  const typeOptions = useMemo(
    () => [
      { id: "酒店", label: "酒店" },
      { id: "民宿", label: "民宿" },
      { id: "别墅", label: "别墅" },
      { id: "公寓", label: "公寓" },
      { id: "度假村", label: "度假村" },
      { id: "客栈", label: "客栈" },
    ],
    []
  )

  const locationOptions = useMemo(
    () => ["龙凤头海滨浴场", "坛南湾", "北港村", "石牌洋景区", "海坛古城"],
    []
  )

  return (
    <Card className="p-6 sticky top-4">
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">价格区间</h3>
          <div className="space-y-4">
            <Slider
              value={filters.priceRange}
              onValueChange={(val) => onChange({ ...filters, priceRange: [val[0], val[1]] })}
              min={0}
              max={2000}
              step={50}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">¥{filters.priceRange[0]}</span>
              <span className="text-muted-foreground">¥{filters.priceRange[1]}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <h3 className="font-semibold text-foreground mb-4">住宿类型</h3>
          <div className="space-y-3">
            {typeOptions.map((type) => (
              <div key={type.id} className="flex items-center gap-2">
                <Checkbox
                  id={type.id}
                  checked={filters.types.includes(type.id)}
                  onCheckedChange={(checked) => {
                    const nextTypes = checked
                      ? [...filters.types, type.id]
                      : filters.types.filter((t) => t !== type.id)
                    onChange({ ...filters, types: nextTypes })
                  }}
                />
                <Label htmlFor={type.id} className="text-sm font-normal cursor-pointer text-foreground">
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <h3 className="font-semibold text-foreground mb-4">星级评分</h3>
          <div className="space-y-3">
            {[5, 4, 3].map((rating) => (
              <div key={rating} className="flex items-center gap-2">
                <Checkbox
                  id={`rating-${rating}`}
                  checked={filters.ratingMin === rating}
                  onCheckedChange={(checked) => {
                    const nextRating = checked ? rating : 0
                    onChange({ ...filters, ratingMin: nextRating })
                  }}
                />
                <Label
                  htmlFor={`rating-${rating}`}
                  className="text-sm font-normal cursor-pointer flex items-center gap-1 text-foreground"
                >
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-1">及以上</span>
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <h3 className="font-semibold text-foreground mb-4">设施服务</h3>
          <div className="space-y-3">
            {amenityOptions.map((amenity) => (
              <div key={amenity.id} className="flex items-center gap-2">
                <Checkbox
                  id={amenity.id}
                  checked={filters.amenities.includes(amenity.label)}
                  onCheckedChange={(checked) => {
                    const next = checked
                      ? [...filters.amenities, amenity.label]
                      : filters.amenities.filter((a) => a !== amenity.label)
                    onChange({ ...filters, amenities: next })
                  }}
                />
                <Label
                  htmlFor={amenity.id}
                  className="text-sm font-normal cursor-pointer flex items-center gap-2 text-foreground"
                >
                  <amenity.icon className="w-4 h-4 text-muted-foreground" />
                  {amenity.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <h3 className="font-semibold text-foreground mb-4">位置区域</h3>
          <div className="space-y-3">
            {locationOptions.map((location) => (
              <div key={location} className="flex items-center gap-2">
                <Checkbox
                  id={location}
                  checked={filters.locations.includes(location)}
                  onCheckedChange={(checked) => {
                    const next = checked
                      ? [...filters.locations, location]
                      : filters.locations.filter((l) => l !== location)
                    onChange({ ...filters, locations: next })
                  }}
                />
                <Label htmlFor={location} className="text-sm font-normal cursor-pointer text-foreground">
                  {location}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full bg-transparent"
          onClick={() => onChange({ priceRange: [200, 1500], types: [], ratingMin: 0, amenities: [], locations: [] })}
        >
          重置筛选
        </Button>
      </div>
    </Card>
  )
}
