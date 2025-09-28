"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MapPin, Clock, Users, Car, Plane, Train, Star, Route } from "lucide-react"
import Link from "next/link"

const tripTemplates = [
  {
    id: 1,
    name: "蓝眼泪追寻之旅",
    duration: "2天1夜",
    season: "4-8月",
    difficulty: "简单",
    highlights: ["蓝眼泪观赏", "海滨夜景", "石头厝住宿"],
    itinerary: [
      { time: "第1天", activities: ["抵达平潭", "入住海景民宿", "坛南湾海滩", "蓝眼泪夜观"] },
      { time: "第2天", activities: ["石头厝古村", "环岛路自驾", "返程"] }
    ],
    price: "¥688",
    rating: 4.9
  },
  {
    id: 2,
    name: "文化探索深度游",
    duration: "3天2夜",
    season: "全年",
    difficulty: "中等",
    highlights: ["历史文化", "传统建筑", "民俗体验"],
    itinerary: [
      { time: "第1天", activities: ["平潭博物馆", "石头厝古村", "传统手工艺体验"] },
      { time: "第2天", activities: ["海坛古城", "妈祖文化园", "渔村生活体验"] },
      { time: "第3天", activities: ["环岛观光", "特产购买", "返程"] }
    ],
    price: "¥1288",
    rating: 4.7
  },
  {
    id: 3,
    name: "海岛度假休闲游",
    duration: "4天3夜",
    season: "春秋季",
    difficulty: "简单",
    highlights: ["海滨度假", "水上运动", "美食体验"],
    itinerary: [
      { time: "第1天", activities: ["抵达入住", "海滩漫步", "海鲜大餐"] },
      { time: "第2天", activities: ["水上运动", "SPA放松", "海滨烧烤"] },
      { time: "第3天", activities: ["环岛自驾", "景点打卡", "购物休闲"] },
      { time: "第4天", activities: ["自由活动", "返程"] }
    ],
    price: "¥2088",
    rating: 4.8
  }
]

const transportOptions = [
  { type: "飞机", icon: Plane, time: "2小时", price: "¥800-1500", description: "福州长乐机场转车" },
  { type: "高铁", icon: Train, time: "4小时", price: "¥300-600", description: "福州站转车" },
  { type: "自驾", icon: Car, time: "5-8小时", price: "¥400-800", description: "含油费过路费" }
]

export default function TripPlanner() {
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [customizing, setCustomizing] = useState(false)

  return (
    <section className="py-16 bg-gradient-to-b from-blue-50/50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 rounded-full bg-white/60 backdrop-blur px-3 py-1">
            <Route className="w-4 h-4 mr-2" />
            智能规划
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            AI行程规划助手
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            基于您的偏好和时间，为您量身定制最佳的平潭旅行方案
          </p>
        </div>

        {/* Transportation Options */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold mb-6 text-center">交通方式选择</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {transportOptions.map((transport, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow rounded-2xl bg-white/70 backdrop-blur border border-white/40">
                <CardHeader>
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                    <transport.icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{transport.type}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-center">
                      <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>约{transport.time}</span>
                    </div>
                    <div className="font-semibold text-primary">{transport.price}</div>
                    <p className="text-muted-foreground">{transport.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Trip Templates */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold mb-6 text-center">精选行程模板</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {tripTemplates.map((template) => (
              <Card 
                key={template.id} 
                className={`cursor-pointer rounded-2xl bg-white/70 backdrop-blur border border-white/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 ${
                  selectedTemplate === template.id ? 'ring-2 ring-primary shadow-lg' : ''
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline">{template.duration}</Badge>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="text-sm font-medium">{template.rating}</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl">{template.name}</CardTitle>
                  <CardDescription>
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <Calendar className="w-4 h-4 mr-2" />
                      最佳时间：{template.season}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="w-4 h-4 mr-2" />
                      难度：{template.difficulty}
                    </div>
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">行程亮点：</h4>
                    <div className="flex flex-wrap gap-2">
                      {template.highlights.map((highlight, index) => (
                        <Badge key={index} variant="secondary" className="text-xs rounded-full bg-white/60 backdrop-blur">
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium mb-2">详细行程：</h4>
                    <div className="space-y-2">
                      {template.itinerary.map((day, index) => (
                        <div key={index} className="text-sm">
                          <div className="font-medium text-primary">{day.time}</div>
                          <div className="text-muted-foreground ml-2">
                            {day.activities.join(" → ")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-white/40">
                    <div className="text-lg font-semibold text-primary">
                      {template.price}
                      <span className="text-sm text-muted-foreground ml-1">/人起</span>
                    </div>
                    <Button 
                      size="sm" 
                      variant={selectedTemplate === template.id ? "default" : "outline"}
                      className="rounded-full"
                    >
                      {selectedTemplate === template.id ? "已选择" : "选择方案"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Custom Planning */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-xl">个性化定制</CardTitle>
              <CardDescription>
                告诉我们您的偏好，我们为您量身定制专属行程
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="text-sm font-medium">出行时间</div>
                </div>
                <div className="text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="text-sm font-medium">人数预算</div>
                </div>
                <div className="text-center">
                  <MapPin className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="text-sm font-medium">兴趣偏好</div>
                </div>
                <div className="text-center">
                  <Star className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="text-sm font-medium">特殊需求</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button className="w-full" size="lg" asChild>
                  <Link href="/trip-planner/custom">
                    <Route className="w-5 h-5 mr-2" />
                    开始定制行程
                  </Link>
                </Button>
                
                {selectedTemplate && (
                  <Button variant="outline" className="w-full" size="lg" asChild>
                    <Link href={`/trip-planner/template/${selectedTemplate}`}>
                      基于选中模板定制
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}