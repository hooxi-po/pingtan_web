"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"

type Filters = {
  types: string[]
  prices: string[]
  durations: string[]
  ratingMin: number
  tags: string[]
}

export function AttractionFilters({
  filters,
  onChange,
}: {
  filters: Filters
  onChange: (next: Filters) => void
}) {
  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value]

  const typeOptions = [
    { id: "natural", label: "自然景观" },
    { id: "cultural", label: "人文景观" },
    { id: "beach", label: "海滩沙滩" },
    { id: "historical", label: "历史遗迹" },
    { id: "village", label: "古村古镇" },
    { id: "park", label: "公园广场" },
  ]

  const priceOptions = [
    { id: "free", label: "免费" },
    { id: "under50", label: "50元以下" },
    { id: "50-100", label: "50-100元" },
    { id: "over100", label: "100元以上" },
  ]

  const durationOptions = [
    { id: "1hour", label: "1小时以内" },
    { id: "1-3hours", label: "1-3小时" },
    { id: "3-5hours", label: "3-5小时" },
    { id: "fullday", label: "全天" },
  ]

  const tagOptions = [
    { id: "photo", label: "适合拍照" },
    { id: "family", label: "亲子游玩" },
    { id: "romantic", label: "情侣约会" },
    { id: "adventure", label: "探险刺激" },
  ]

  return (
    <Card className="sticky top-20 border-border/50">
      <CardHeader>
        <CardTitle className="text-foreground">筛选条件</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-3 text-foreground">景点类型</h3>
          <div className="space-y-2">
            {typeOptions.map((type) => (
              <div key={type.id} className="flex items-center space-x-2">
                <Checkbox
                  id={type.id}
                  checked={filters.types.includes(type.label)}
                  onCheckedChange={() =>
                    onChange({
                      ...filters,
                      types: toggle(filters.types, type.label),
                    })
                  }
                />
                <Label htmlFor={type.id} className="text-sm cursor-pointer text-foreground">
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3 text-foreground">门票价格</h3>
          <div className="space-y-2">
            {priceOptions.map((price) => (
              <div key={price.id} className="flex items-center space-x-2">
                <Checkbox
                  id={price.id}
                  checked={filters.prices.includes(price.id)}
                  onCheckedChange={() =>
                    onChange({
                      ...filters,
                      prices: toggle(filters.prices, price.id),
                    })
                  }
                />
                <Label htmlFor={price.id} className="text-sm cursor-pointer text-foreground">
                  {price.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3 text-foreground">游玩时长</h3>
          <div className="space-y-2">
            {durationOptions.map((duration) => (
              <div key={duration.id} className="flex items-center space-x-2">
                <Checkbox
                  id={duration.id}
                  checked={filters.durations.includes(duration.id)}
                  onCheckedChange={() =>
                    onChange({
                      ...filters,
                      durations: toggle(filters.durations, duration.id),
                    })
                  }
                />
                <Label htmlFor={duration.id} className="text-sm cursor-pointer text-foreground">
                  {duration.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3 text-foreground">评分</h3>
          <Slider
            value={[filters.ratingMin]}
            max={5}
            step={0.5}
            className="mb-2"
            onValueChange={(v) => onChange({ ...filters, ratingMin: v[0] ?? 4 })}
          />
          <p className="text-sm text-muted-foreground">{filters.ratingMin.toFixed(1)}分及以上</p>
        </div>

        <div>
          <h3 className="font-semibold mb-3 text-foreground">特色标签</h3>
          <div className="space-y-2">
            {tagOptions.map((tag) => (
              <div key={tag.id} className="flex items-center space-x-2">
                <Checkbox
                  id={tag.id}
                  checked={filters.tags.includes(tag.label)}
                  onCheckedChange={() =>
                    onChange({
                      ...filters,
                      tags: toggle(filters.tags, tag.label),
                    })
                  }
                />
                <Label htmlFor={tag.id} className="text-sm cursor-pointer text-foreground">
                  {tag.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full bg-transparent"
          onClick={() =>
            onChange({ types: [], prices: [], durations: [], ratingMin: 4, tags: [] })
          }
        >
          重置筛选
        </Button>
      </CardContent>
    </Card>
  )
}
