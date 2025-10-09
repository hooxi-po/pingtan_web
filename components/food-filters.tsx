"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"

type Filters = {
  types: string[]
  prices: string[]
  features: string[]
  scenes: string[]
  ratingMin: number
}

type Props = {
  filters: Filters
  onChange: (next: Filters) => void
}

const toggle = (list: string[], value: string) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value]

export function FoodFilters({ filters, onChange }: Props) {
  return (
    <Card className="sticky top-20 border-border/50">
      <CardHeader>
        <CardTitle className="text-foreground">筛选条件</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-3 text-foreground">美食类型</h3>
          <div className="space-y-2">
            {[
              { id: "seafood", label: "海鲜" },
              { id: "minnan", label: "闽南菜" },
              { id: "snacks", label: "小吃" },
              { id: "bbq", label: "烧烤" },
              { id: "hotpot", label: "火锅" },
              { id: "dessert", label: "甜品" },
            ].map((type) => (
              <div key={type.id} className="flex items-center space-x-2">
                <Checkbox
                  id={type.id}
                  checked={filters.types.includes(type.id)}
                  onCheckedChange={() =>
                    onChange({ ...filters, types: toggle(filters.types, type.id) })
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
          <h3 className="font-semibold mb-3 text-foreground">人均消费</h3>
          <div className="space-y-2">
            {[
              { id: "under50", label: "50元以下" },
              { id: "50-100", label: "50-100元" },
              { id: "100-200", label: "100-200元" },
              { id: "over200", label: "200元以上" },
            ].map((price) => (
              <div key={price.id} className="flex items-center space-x-2">
                <Checkbox
                  id={price.id}
                  checked={filters.prices.includes(price.id)}
                  onCheckedChange={() =>
                    onChange({ ...filters, prices: toggle(filters.prices, price.id) })
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
          <h3 className="font-semibold mb-3 text-foreground">餐厅特色</h3>
          <div className="space-y-2">
            {[
              { id: "seaview", label: "海景餐厅" },
              { id: "local", label: "本地特色" },
              { id: "chain", label: "连锁品牌" },
              { id: "private", label: "包厢雅座" },
            ].map((feature) => (
              <div key={feature.id} className="flex items-center space-x-2">
                <Checkbox
                  id={feature.id}
                  checked={filters.features.includes(feature.id)}
                  onCheckedChange={() =>
                    onChange({ ...filters, features: toggle(filters.features, feature.id) })
                  }
                />
                <Label htmlFor={feature.id} className="text-sm cursor-pointer text-foreground">
                  {feature.label}
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
          <h3 className="font-semibold mb-3 text-foreground">适合场景</h3>
          <div className="space-y-2">
            {[
              { id: "family", label: "家庭聚餐" },
              { id: "friends", label: "朋友聚会" },
              { id: "date", label: "情侣约会" },
              { id: "business", label: "商务宴请" },
            ].map((scene) => (
              <div key={scene.id} className="flex items-center space-x-2">
                <Checkbox
                  id={scene.id}
                  checked={filters.scenes.includes(scene.id)}
                  onCheckedChange={() =>
                    onChange({ ...filters, scenes: toggle(filters.scenes, scene.id) })
                  }
                />
                <Label htmlFor={scene.id} className="text-sm cursor-pointer text-foreground">
                  {scene.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full bg-transparent"
          onClick={() => onChange({ types: [], prices: [], features: [], scenes: [], ratingMin: 4 })}
        >
          重置筛选
        </Button>
      </CardContent>
    </Card>
  )
}
