"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Star,
  MapPin,
  Clock,
  Calendar,
  Phone,
  Navigation,
  Camera,
  Users,
  Ticket,
  Info,
  Heart,
  Share2,
} from "lucide-react"

interface AttractionDetailsProps {
  id: string
}

export function AttractionDetails({ id }: AttractionDetailsProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  type BaseAttraction = {
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

  type EnhancedAttraction = BaseAttraction & {
    address: string
    phone: string
    openTime: string
    images: string[]
    highlights: string[]
    tips: string[]
    facilities: string[]
    transportation: string
  }

  const [attraction, setAttraction] = useState<EnhancedAttraction | null>(null)

  function enhance(base: BaseAttraction): EnhancedAttraction {
    const fallbackImages = [
      "/pingtan-scenic-coastline-panorama.jpg",
      "/pingtan-beach-coastline-blue-ocean.jpg",
    ]
    return {
      ...base,
      address: `${base.type} · ${base.distance}`,
      phone: "0591-00000000",
      openTime: "08:00-18:00",
      images: [base.image, ...fallbackImages],
      highlights: ["景色优美", "适合拍照", "周边配套完善"],
      tips: ["注意安全", "错峰出行", "提前规划路线"],
      facilities: ["停车场", "洗手间", "便利店"],
      transportation: "公交可达，步行可至景点入口",
    }
  }

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/attractions/${id}`)
        if (!res.ok) {
          throw new Error(`请求失败：${res.status}`)
        }
        const data: BaseAttraction = await res.json()
        if (!cancelled) {
          setAttraction(enhance(data))
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "加载失败")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => {
      cancelled = true
    }
  }, [id])

  const images = useMemo(() => attraction?.images ?? ["/placeholder.svg"], [attraction])

  const reviews = [
    {
      id: 1,
      user: "张三",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 5,
      date: "2024-05-15",
      content: "太美了！第一次看到蓝眼泪，真的像梦境一样。建议大家选择农历初一前后去，月光不会太亮，蓝眼泪会更明显。",
      images: ["/placeholder.svg?height=100&width=100"],
    },
    {
      id: 2,
      user: "李四",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4,
      date: "2024-05-10",
      content: "景色很美，但是人比较多。建议工作日去，周末人太多了。停车也比较方便。",
      images: [],
    },
    {
      id: 3,
      user: "王五",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 5,
      date: "2024-05-08",
      content: "摄影爱好者的天堂！带了三脚架拍了很多好照片。工作人员很友好，还会告诉你最佳拍摄位置。",
      images: ["/placeholder.svg?height=100&width=100", "/placeholder.svg?height=100&width=100"],
    },
  ]

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <p className="text-muted-foreground">正在加载景点详情...</p>
      </div>
    )
  }

  if (error || !attraction) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <p className="text-destructive">未找到景点或请求失败。</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* 图片画廊 */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden">
          <Image
            src={images[selectedImage] || "/placeholder.svg"}
            alt={attraction.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className={`relative h-[190px] md:h-[240px] rounded-lg overflow-hidden cursor-pointer ${
                selectedImage === index ? "ring-2 ring-ocean" : ""
              }`}
              onClick={() => setSelectedImage(index)}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`${attraction.name} ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* 主要内容 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 基本信息 */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-ocean text-sand">{attraction.type}</Badge>
                  {attraction.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <h1 className="text-3xl font-bold mb-2 text-foreground">{attraction.name}</h1>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-coral text-coral" />
                    <span className="font-semibold text-foreground">{attraction.rating}</span>
                    <span className="text-muted-foreground">({attraction.reviews}条评价)</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{attraction.distance}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed text-pretty">{attraction.description}</p>
          </div>

          {/* 详细信息标签页 */}
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">景点信息</TabsTrigger>
              <TabsTrigger value="guide">游玩攻略</TabsTrigger>
              <TabsTrigger value="reviews">游客评价</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4 mt-6">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-ocean mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground mb-1">游玩时长</p>
                        <p className="text-sm text-muted-foreground">{attraction.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Ticket className="h-5 w-5 text-ocean mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground mb-1">门票价格</p>
                        <p className="text-sm text-muted-foreground">{attraction.price}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-ocean mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground mb-1">开放时间</p>
                        <p className="text-sm text-muted-foreground">{attraction.openTime}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-ocean mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground mb-1">联系电话</p>
                        <p className="text-sm text-muted-foreground">{attraction.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-ocean mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground mb-1">景点地址</p>
                        <p className="text-sm text-muted-foreground mb-2">{attraction.address}</p>
                        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                          <Navigation className="h-4 w-4" />
                          导航到这里
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-ocean mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground mb-2">配套设施</p>
                        <div className="flex flex-wrap gap-2">
                          {attraction.facilities.map((facility) => (
                            <Badge key={facility} variant="secondary">
                              {facility}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-start gap-3">
                      <Navigation className="h-5 w-5 text-ocean mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground mb-1">交通指南</p>
                        <p className="text-sm text-muted-foreground">{attraction.transportation}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="guide" className="space-y-4 mt-6">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Camera className="h-5 w-5 text-ocean" />
                      <h3 className="font-semibold text-foreground">景点亮点</h3>
                    </div>
                    <ul className="space-y-2">
                      {attraction.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-ocean mt-1">•</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <Info className="h-5 w-5 text-ocean" />
                      <h3 className="font-semibold text-foreground">游玩贴士</h3>
                    </div>
                    <ul className="space-y-2">
                      {attraction.tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-ocean mt-1">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4 mt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">游客评价</h3>
                  <p className="text-sm text-muted-foreground">{attraction.reviews} 条评价</p>
                </div>
                <Button variant="outline">写评价</Button>
              </div>

              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Image
                          src={review.avatar || "/placeholder.svg"}
                          alt={review.user}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium text-foreground">{review.user}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating ? "fill-coral text-coral" : "text-muted"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-muted-foreground">{review.date}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 text-pretty">{review.content}</p>
                          {review.images.length > 0 && (
                            <div className="flex gap-2">
                              {review.images.map((image, index) => (
                                <div key={index} className="relative w-20 h-20 rounded overflow-hidden">
                                  <Image
                                    src={image || "/placeholder.svg"}
                                    alt={`评价图片 ${index + 1}`}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* 侧边栏 */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">门票价格</p>
                <p className="text-3xl font-bold text-ocean">{attraction.price}</p>
              </div>

              <div className="space-y-2 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">建议游玩：</span>
                  <span className="font-medium text-foreground">{attraction.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">今日已有</span>
                  <span className="font-medium text-foreground">328人</span>
                  <span className="text-muted-foreground">浏览</span>
                </div>
              </div>

              <Button className="w-full bg-ocean hover:bg-ocean/90 text-sand" size="lg">
                <Navigation className="h-4 w-4 mr-2" />
                立即导航
              </Button>

              <Button variant="outline" className="w-full bg-transparent" size="lg">
                <Phone className="h-4 w-4 mr-2" />
                联系咨询
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
