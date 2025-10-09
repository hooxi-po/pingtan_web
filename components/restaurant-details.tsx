"use client"

import { useEffect, useState } from "react"
import { Star, MapPin, Clock, Phone, DollarSign, Users, Utensils } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import type { Restaurant } from "@/lib/schema"

const defaultFeatures = [
  { icon: Users, label: "可容纳100人" },
  { icon: Utensils, label: "包厢可预订" },
  { icon: Clock, label: "营业至晚上10点" },
]

const defaultMenu = [
  {
    category: "招牌菜",
    dishes: [
      { name: "清蒸石斑鱼", price: "时价", description: "新鲜石斑鱼，清蒸保留原味" },
      { name: "爆炒花蛤", price: "¥58", description: "本地花蛤，鲜嫩多汁" },
      { name: "红烧鲍鱼", price: "¥88", description: "精选鲍鱼，红烧入味" },
      { name: "椒盐皮皮虾", price: "¥68", description: "现捞皮皮虾，椒盐香脆" },
    ],
  },
  {
    category: "特色小吃",
    dishes: [
      { name: "海蛎煎", price: "¥38", description: "平潭特色小吃" },
      { name: "鱼丸汤", price: "¥28", description: "手工鱼丸，Q弹爽口" },
      { name: "炸紫菜", price: "¥25", description: "本地紫菜，香脆可口" },
    ],
  },
]

export function RestaurantDetails({ id }: { id: string }) {
  const [item, setItem] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        // 先尝试详情接口；若后端未配置数据库，回退使用列表接口匹配 id
        const res = await fetch(`/api/restaurants/${id}`, { signal: controller.signal })
        if (res.status === 503) {
          const list = await fetch(`/api/restaurants`, { signal: controller.signal })
          const items = (await list.json()) as Restaurant[]
          const found = items.find((x) => String(x.id) === String(id)) || null
          setItem(found)
        } else if (res.ok) {
          const data = (await res.json()) as Restaurant
          setItem(data)
        } else {
          setItem(null)
          setError(`加载失败(${res.status})`)
        }
      } catch (e) {
        setError("加载失败")
        setItem(null)
      } finally {
        setLoading(false)
      }
    }
    run()
    return () => controller.abort()
  }, [id])

  if (loading) {
    return <div className="container mx-auto px-4 py-8 lg:px-8">加载中...</div>
  }
  if (!item) {
    return <div className="container mx-auto px-4 py-8 lg:px-8">未找到该餐厅</div>
  }

  const images = [
    item.image || "/placeholder.jpg",
    "/pingtan-beach-coastline-blue-ocean.jpg",
    "/pingtan-scenic-coastline-panorama.jpg",
  ]

  return (
    <div className="container mx-auto px-4 py-8 lg:px-8">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {images.map((image, index) => (
              <img
                key={index}
                src={image || "/placeholder.svg"}
                alt={`${item.name} ${index + 1}`}
                className="w-full h-64 object-cover rounded-lg"
              />
            ))}
          </div>

          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-foreground">{item.name}</h1>
                  <Badge className="bg-coral text-sand">{item.category}</Badge>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{"平潭"}</span>
                  </div>
                  <span>·</span>
                  <span>{item.distance}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span className="text-xl font-bold">{item.rating}</span>
                <span className="text-muted-foreground">({item.reviews}条评价)</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-ocean" />
                <div>
                  <p className="text-muted-foreground text-xs">人均消费</p>
                  <p className="font-medium">{item.avgPrice}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-ocean" />
                <div>
                  <p className="text-muted-foreground text-xs">营业时间</p>
                  <p className="font-medium">{"10:00 - 22:00"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-ocean" />
                <div>
                  <p className="text-muted-foreground text-xs">联系电话</p>
                  <p className="font-medium">{"0591-12345678"}</p>
                </div>
              </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">概览</TabsTrigger>
                <TabsTrigger value="menu">菜单</TabsTrigger>
                <TabsTrigger value="reviews">评价</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">餐厅介绍</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">招牌菜</h3>
                  <p className="text-muted-foreground">{item.specialty}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">餐厅特色</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {defaultFeatures.map((feature) => (
                      <div key={feature.label} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                        <feature.icon className="w-5 h-5 text-ocean" />
                        <span className="text-sm">{feature.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="menu" className="mt-6">
                <div className="space-y-6">
                  {defaultMenu.map((section) => (
                    <div key={section.category}>
                      <h3 className="text-lg font-semibold mb-4">{section.category}</h3>
                      <div className="space-y-3">
                        {section.dishes.map((dish) => (
                          <Card key={dish.name} className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium mb-1">{dish.name}</h4>
                                <p className="text-sm text-muted-foreground">{dish.description}</p>
                              </div>
                              <span className="text-lg font-semibold text-ocean ml-4">{dish.price}</span>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <h3 className="text-lg font-semibold mb-4">用户评价</h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((review) => (
                    <div key={review} className="p-4 rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-ocean/10 flex items-center justify-center">
                            <span className="text-ocean font-semibold">食{review}</span>
                          </div>
                          <div>
                            <p className="font-medium">美食家{review}</p>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">2024-01-{15 + review}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        海鲜非常新鲜，清蒸石斑鱼肉质鲜嫩，爆炒花蛤味道一绝！服务态度很好，环境也不错，推荐！
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-bold text-ocean">{item.avgPrice}</span>
                </div>
                <p className="text-sm text-muted-foreground">人均消费</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">选择用餐时间和人数以完成预订</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
