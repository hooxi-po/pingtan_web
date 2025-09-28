"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Wifi, Car, Coffee, Star, Users, Bed } from "lucide-react"
import Link from "next/link"

const accommodations = [
  {
    id: 1,
    name: "海景石头厝民宿",
    description: "传统石头厝改造的精品民宿，面朝大海，春暖花开",
    image: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><defs><linearGradient id='sunset' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' style='stop-color:%23ff7f50;stop-opacity:1' /><stop offset='100%' style='stop-color:%23ffd700;stop-opacity:1' /></linearGradient></defs><rect width='400' height='300' fill='url(%23sunset)'/><rect x='100' y='150' width='200' height='100' fill='%23696969' stroke='%232f2f2f' stroke-width='2'/><polygon points='100,150 200,100 300,150' fill='%23cd853f'/><rect x='150' y='180' width='30' height='40' fill='%23654321'/><rect x='220' y='180' width='30' height='40' fill='%23654321'/><circle cx='350' cy='80' r='30' fill='%23ffff00' opacity='0.8'/></svg>",
    type: "民宿",
    rating: 4.8,
    price: "¥288",
    location: "坛南湾",
    rooms: 8,
    amenities: ["海景", "WiFi", "停车场", "早餐"],
    features: ["石头厝", "海景房", "传统文化"]
  },
  {
    id: 2,
    name: "蓝眼泪度假酒店",
    description: "现代化海滨度假酒店，观赏蓝眼泪的最佳位置",
    image: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><defs><linearGradient id='modern' x1='0%' y1='0%' x2='0%' y2='100%'><stop offset='0%' style='stop-color:%234169e1;stop-opacity:1' /><stop offset='100%' style='stop-color:%2300bfff;stop-opacity:1' /></linearGradient></defs><rect width='400' height='300' fill='url(%23modern)'/><rect x='50' y='100' width='300' height='150' fill='%23f0f8ff' stroke='%234169e1' stroke-width='3'/><rect x='80' y='130' width='40' height='30' fill='%234169e1'/><rect x='140' y='130' width='40' height='30' fill='%234169e1'/><rect x='200' y='130' width='40' height='30' fill='%234169e1'/><rect x='260' y='130' width='40' height='30' fill='%234169e1'/></svg>",
    type: "酒店",
    rating: 4.9,
    price: "¥588",
    location: "龙凤头海滨",
    rooms: 120,
    amenities: ["海景", "WiFi", "停车场", "餐厅", "健身房", "SPA"],
    features: ["现代化", "蓝眼泪观赏", "度假村"]
  },
  {
    id: 3,
    name: "渔村客栈",
    description: "体验渔民生活的特色客栈，品尝最新鲜的海鲜",
    image: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='%2387ceeb'/><rect x='80' y='180' width='80' height='80' fill='%23deb887' stroke='%23cd853f' stroke-width='2'/><rect x='200' y='170' width='90' height='90' fill='%23f5deb3' stroke='%23cd853f' stroke-width='2'/><polygon points='80,180 120,150 160,180' fill='%23d2691e'/><polygon points='200,170 245,140 290,170' fill='%23daa520'/><path d='M50,260 Q100,250 150,255 T250,260 T350,255' stroke='%234169e1' stroke-width='3' fill='none'/></svg>",
    type: "客栈",
    rating: 4.6,
    price: "¥168",
    location: "流水镇",
    rooms: 12,
    amenities: ["WiFi", "停车场", "海鲜餐厅"],
    features: ["渔村体验", "海鲜美食", "民俗文化"]
  }
]

export default function AccommodationShowcase() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 rounded-full bg-white/60 text-gray-800 border border-black/5 backdrop-blur px-3 py-1.5">
            <Bed className="w-4 h-4 mr-2" />
            精选住宿
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            特色住宿推荐
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            从传统石头厝到现代度假酒店，为您提供多样化的住宿选择
          </p>
        </div>

        {/* Accommodations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {accommodations.map((accommodation) => (
            <Card key={accommodation.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden rounded-2xl">
              <div className="relative overflow-hidden">
                <div 
                  className="w-full h-48 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundImage: `url('${accommodation.image}')` }}
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-white/70 text-gray-900 border border-white/50 rounded-full backdrop-blur px-2.5 py-1 text-xs">
                    {accommodation.type}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4 bg-white/70 border border-white/50 rounded-full p-2.5 backdrop-blur shadow-sm">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{accommodation.rating}</span>
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 bg-white/80 text-gray-900 border border-white/60 px-3 py-1.5 rounded-full backdrop-blur shadow-sm">
                  <span className="font-semibold">{accommodation.price}</span>
                  <span className="text-xs ml-1">/晚</span>
                </div>
              </div>

              <CardHeader>
                <CardTitle className="text-xl group-hover:text-primary transition-colors tracking-tight">
                  {accommodation.name}
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {accommodation.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <MapPin className="w-4 h-4 mr-2" />
                  {accommodation.location}
                  <span className="mx-2">•</span>
                  <Users className="w-4 h-4 mr-1" />
                  {accommodation.rooms}间客房
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">设施服务：</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {accommodation.amenities.map((amenity, index) => (
                      <Badge key={index} variant="outline" className="text-xs rounded-full bg-white/50 backdrop-blur border-white/60 text-gray-700">
                        {amenity === "WiFi" && <Wifi className="w-3 h-3 mr-1" />}
                        {amenity === "停车场" && <Car className="w-3 h-3 mr-1" />}
                        {amenity === "早餐" && <Coffee className="w-3 h-3 mr-1" />}
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                  
                  <p className="text-sm font-medium mb-2">特色标签：</p>
                  <div className="flex flex-wrap gap-2">
                    {accommodation.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs rounded-full">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-0">
                <div className="w-full space-y-2">
                  <Button className="w-full rounded-2xl shadow-sm hover:shadow-md transition-all" asChild>
                    <Link href={`/accommodations/${accommodation.id}`}>
                      查看详情
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full rounded-2xl bg-white/60 backdrop-blur hover:bg-white/80" asChild>
                    <Link href={`/booking/${accommodation.id}`}>
                      立即预订
                    </Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button size="lg" variant="outline" className="rounded-2xl bg-white/60 backdrop-blur hover:bg-white/80" asChild>
            <Link href="/accommodations">
              <Bed className="w-5 h-5 mr-2" />
              查看更多住宿
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}