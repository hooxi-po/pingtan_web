"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Clock, Star, Users, Camera, Navigation as NavIcon, CreditCard } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

const featuredAttractions = [
  {
    id: 1,
    name: "蓝眼泪海滩",
    description: "平潭最著名的自然奇观，夜晚海浪泛起蓝色荧光，如梦如幻",
    image: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><defs><linearGradient id='night' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' style='stop-color:%23001122;stop-opacity:1' /><stop offset='100%' style='stop-color:%23003366;stop-opacity:1' /></linearGradient></defs><rect width='400' height='300' fill='url(%23night)'/><circle cx='100' cy='250' r='2' fill='%2300ffff' opacity='0.8'><animate attributeName='opacity' values='0.8;0.3;0.8' dur='2s' repeatCount='indefinite'/></circle><circle cx='200' cy='260' r='3' fill='%2300ffff' opacity='0.6'><animate attributeName='opacity' values='0.6;0.2;0.6' dur='3s' repeatCount='indefinite'/></circle><circle cx='300' cy='240' r='2' fill='%2300ffff' opacity='0.9'><animate attributeName='opacity' values='0.9;0.4;0.9' dur='2.5s' repeatCount='indefinite'/></circle></svg>",
    category: "自然奇观",
    rating: 4.9,
    visitors: "1.2万",
    duration: "2-3小时",
    bestTime: "4-8月夜晚",
    tags: ["蓝眼泪", "夜景", "摄影"],
    coords: { lng: 119.796, lat: 25.493 },
    locationName: "坛南湾"
  },
  {
    id: 2,
    name: "石头厝古村",
    description: "保存完好的传统闽南石头建筑群，体验海岛独特的建筑文化",
    image: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23f5f5dc'/><rect x='50' y='150' width='80' height='100' fill='%23696969' stroke='%232f2f2f' stroke-width='2'/><rect x='150' y='130' width='90' height='120' fill='%23708090' stroke='%232f2f2f' stroke-width='2'/><rect x='260' y='140' width='85' height='110' fill='%23778899' stroke='%232f2f2f' stroke-width='2'/><polygon points='50,150 90,120 130,150' fill='%23cd853f'/><polygon points='150,130 195,100 240,130' fill='%23d2691e'/><polygon points='260,140 302,110 345,140' fill='%23daa520'/></svg>",
    category: "历史文化",
    rating: 4.7,
    visitors: "8.5千",
    duration: "1-2小时",
    bestTime: "全年",
    tags: ["古建筑", "文化", "历史"],
    coords: { lng: 119.778, lat: 25.531 },
    locationName: "北港村"
  },
  {
    id: 3,
    name: "环岛路风光带",
    description: "68公里海岸线自驾路线，沿途风景如画，是摄影爱好者的天堂",
    image: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><defs><linearGradient id='sky' x1='0%' y1='0%' x2='0%' y2='100%'><stop offset='0%' style='stop-color:%2387ceeb;stop-opacity:1' /><stop offset='100%' style='stop-color:%23e0f6ff;stop-opacity:1' /></linearGradient></defs><rect width='400' height='300' fill='url(%23sky)'/><path d='M0,200 Q100,180 200,190 T400,200 L400,300 L0,300 Z' fill='%23228b22'/><path d='M0,250 Q100,240 200,245 T400,250 L400,300 L0,300 Z' fill='%234169e1'/><path d='M50,190 Q150,185 250,190 T350,195' stroke='%23696969' stroke-width='4' fill='none'/></svg>",
    category: "自然风光",
    rating: 4.8,
    visitors: "2.1万",
    duration: "半天-全天",
    bestTime: "春秋季",
    tags: ["自驾", "海景", "摄影"],
    coords: { lng: 119.800, lat: 25.500 },
    locationName: "环岛路"
  }
]

function calcDistanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (v: number) => (v * Math.PI) / 180
  const R = 6371 // km
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const sinDlat = Math.sin(dLat / 2)
  const sinDlon = Math.sin(dLon / 2)
  const c = 2 * Math.asin(Math.sqrt(sinDlat * sinDlat + Math.cos(lat1) * Math.cos(lat2) * sinDlon * sinDlon))
  return R * c
}

export default function FeaturedAttractions() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locating, setLocating] = useState(false)

  useEffect(() => {
    if (!("geolocation" in navigator)) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setUserLocation({ lat: latitude, lng: longitude })
        setLocating(false)
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }, [])

  const openBaiduDirection = (destinationName: string) => {
    const ak = process.env.NEXT_PUBLIC_BAIDU_MAP_JS_API_KEY
    const url = `https://map.baidu.com/search/${encodeURIComponent(destinationName + " 平潭")}${ak ? `?ak=${encodeURIComponent(ak)}` : ""}`
    window.open(url, "_blank")
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 rounded-full bg-white/60 text-gray-800 border border-black/5 backdrop-blur px-3 py-1.5">
            <Star className="w-4 h-4 mr-2" />
            精选推荐
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            平潭必游景点
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            探索平潭最具特色的自然奇观和人文景观，感受海岛独特的魅力
          </p>

          {/* LBS 距离提示 */}
          <div className="mt-6 inline-flex items-center rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2">
            <MapPin className="w-4 h-4 mr-2" />
            {userLocation ? (
              <span>已获取定位，正在为您计算距离与推荐</span>
            ) : (
              <span>{locating ? "正在获取您的位置…" : "开启定位以查看距离您最近的景点"}</span>
            )}
          </div>
        </div>

        {/* Attractions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredAttractions.map((attraction) => {
            const distanceText = userLocation
              ? `${calcDistanceKm(userLocation, attraction.coords).toFixed(1)} 公里`
              : null
            return (
              <Card key={attraction.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden rounded-2xl">
                <div className="relative overflow-hidden">
                  <div 
                    className="w-full h-48 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                    style={{ backgroundImage: `url('${attraction.image}')` }}
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-white/70 text-gray-900 border border-white/50 rounded-full backdrop-blur px-2.5 py-1 text-xs">
                      {attraction.category}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/70 border border-white/50 rounded-full p-2.5 backdrop-blur shadow-sm">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{attraction.rating}</span>
                    </div>
                  </div>

                  {distanceText && (
                    <div className="absolute bottom-4 left-4 inline-flex items-center rounded-full bg-white/80 backdrop-blur px-2.5 py-1 border border-white/60 text-gray-800 text-xs">
                      <MapPin className="w-3.5 h-3.5 mr-1" />
                      <span>
                        距您约 {distanceText}
                      </span>
                    </div>
                  )}
                </div>

                <CardHeader>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors tracking-tight">
                    {attraction.name}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {attraction.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      {attraction.visitors}人游览
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {attraction.duration}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">最佳时间：{attraction.bestTime}</p>
                    <div className="flex flex-wrap gap-2">
                      {attraction.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs rounded-full bg白/50 backdrop-blur border-white/60 text-gray-700">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-0">
                  <div className="flex gap-2 w-full">
                    <Button className="flex-1 group-hover:bg-primary group-hover:text-primary-foreground transition-all rounded-2xl shadow-sm hover:shadow-md" asChild>
                      <Link href={`/attractions/${attraction.id}`}>
                        <MapPin className="w-4 h-4 mr-2" />
                        了解更多
                      </Link>
                    </Button>
                    <Button variant="outline" className="flex-1 rounded-2xl" asChild>
                      <Link href={`/booking/${attraction.id}`}>
                        <CreditCard className="w-4 h-4 mr-2" />
                        立即预订
                      </Link>
                    </Button>
                    <Button variant="outline" className="rounded-2xl" onClick={() => openBaiduDirection(attraction.locationName)}>
                      <NavIcon className="w-4 h-4 mr-2" />
                      导航
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button size="lg" variant="outline" className="rounded-2xl bg-white/60 backdrop-blur hover:bg-white/80" asChild>
            <Link href="/attractions">
              <Camera className="w-5 h-5 mr-2" />
              查看更多景点
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}