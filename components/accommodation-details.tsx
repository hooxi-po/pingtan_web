"use client"

import { useEffect, useState } from "react"
import { Star, MapPin, Wifi, Car, Coffee, Waves, Shield, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Accommodation } from "@/lib/schema"

const defaultAmenities = [
  { icon: Wifi, label: "免费WiFi" },
  { icon: Car, label: "免费停车" },
  { icon: Coffee, label: "早餐" },
  { icon: Waves, label: "海景房" },
  { icon: Shield, label: "24小时安保" },
  { icon: Users, label: "家庭房" },
]
const defaultHighlights = ["位置优越", "设施完善", "亲子友好"]

export function AccommodationDetails({ id }: { id: string }) {
  const [item, setItem] = useState<Accommodation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/accommodations/${id}`, { signal: controller.signal })
        if (!res.ok) throw new Error(`status ${res.status}`)
        const data = (await res.json()) as Accommodation
        setItem(data)
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
    return <div className="container mx-auto px-4 py-8 lg:px-8">未找到该住宿</div>
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
            <div className="md:col-span-2">
              <img
                src={images[0] || "/placeholder.svg"}
                alt={item.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
            {images.slice(1).map((image, index) => (
              <img
                key={index}
                src={image || "/placeholder.svg"}
                alt={`${item.name} ${index + 2}`}
                className="w-full h-48 object-cover rounded-lg"
              />
            ))}
          </div>

          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-foreground">{item.name}</h1>
                  <Badge className="bg-ocean text-sand">{item.type}</Badge>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{item.location}</span>
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
              {defaultHighlights.map((highlight) => (
                <Badge key={highlight} variant="secondary">
                  {highlight}
                </Badge>
              ))}
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">概览</TabsTrigger>
                <TabsTrigger value="amenities">设施</TabsTrigger>
                <TabsTrigger value="reviews">评价</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">酒店介绍</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    欢迎入住 {item.name}。位于 {item.location || "平潭"}，提供舒适的 {item.type} 住宿与便捷服务。
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="amenities" className="mt-6">
                <h3 className="text-lg font-semibold mb-4">酒店设施</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {defaultAmenities.map((amenity) => (
                    <div key={amenity.label} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                      <amenity.icon className="w-5 h-5 text-ocean" />
                      <span className="text-sm">{amenity.label}</span>
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
                            <span className="text-ocean font-semibold">用{review}</span>
                          </div>
                          <div>
                            <p className="font-medium">用户{review}</p>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">2024-01-{10 + review}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        酒店位置很好，就在海边，房间干净整洁，服务态度也很好。晚上可以看到蓝眼泪，非常浪漫！
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
                  <span className="text-3xl font-bold text-ocean">¥{item.price}</span>
                  {item.originalPrice ? (
                    <span className="text-muted-foreground line-through">¥{item.originalPrice}</span>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">每晚价格</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">选择入住日期和房型以完成预订</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
