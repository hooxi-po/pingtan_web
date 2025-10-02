"use client"

import { useState } from "react"
import Navigation from "@/components/ui/navigation"
import AccommodationShowcase from "@/components/ui/accommodation-showcase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter, MapPin, Star, Bed, Users, Calendar, Heart } from "lucide-react"

export default function AccommodationsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [priceRange, setPriceRange] = useState("all")
  const [sortBy, setSortBy] = useState("rating")

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50/30 to-white">
      <Navigation />
      <div className="pt-16">
        {/* Enhanced Page Header */}
        <section className="relative py-12 sm:py-16 md:py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/20 blur-xl"></div>
            <div className="absolute top-32 right-20 w-24 h-24 rounded-full bg-white/15 blur-lg"></div>
            <div className="absolute bottom-20 left-1/3 w-40 h-40 rounded-full bg-white/10 blur-2xl"></div>
          </div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <Badge variant="secondary" className="mb-4 sm:mb-6 rounded-full bg-white/20 text-white border border-white/30 backdrop-blur px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
              <Bed className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              精选住宿体验
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 tracking-tight px-4">
              平潭住宿推荐
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed px-4">
              从传统石头厝到现代度假酒店，为您提供舒适难忘的住宿体验
            </p>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 mt-8 sm:mt-10 md:mt-12 px-4">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold mb-1">50+</div>
                <div className="text-blue-200 text-xs sm:text-sm">精选住宿</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold mb-1">4.8</div>
                <div className="text-blue-200 text-xs sm:text-sm">平均评分</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold mb-1">10k+</div>
                <div className="text-blue-200 text-xs sm:text-sm">满意客户</div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Search & Filter Section */}
        <section className="py-6 sm:py-8 bg-white/80 backdrop-blur border-b border-gray-100">
          <div className="container mx-auto px-4">
            <Card className="rounded-2xl bg-white/70 backdrop-blur border border-white/60 shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
                  {/* Search Input */}
                  <div className="sm:col-span-2 lg:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="搜索住宿名称或位置..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-10 sm:h-11 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  {/* Type Filter */}
                  <div>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="h-10 sm:h-11 rounded-xl border-gray-200 text-sm sm:text-base">
                        <SelectValue placeholder="住宿类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部类型</SelectItem>
                        <SelectItem value="民宿">民宿</SelectItem>
                        <SelectItem value="酒店">酒店</SelectItem>
                        <SelectItem value="客栈">客栈</SelectItem>
                        <SelectItem value="度假村">度假村</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger className="h-10 sm:h-11 rounded-xl border-gray-200 text-sm sm:text-base">
                        <SelectValue placeholder="位置区域" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部区域</SelectItem>
                        <SelectItem value="坛南湾">坛南湾</SelectItem>
                        <SelectItem value="龙凤头海滨">龙凤头海滨</SelectItem>
                        <SelectItem value="流水镇">流水镇</SelectItem>
                        <SelectItem value="北港村">北港村</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <Select value={priceRange} onValueChange={setPriceRange}>
                      <SelectTrigger className="h-10 sm:h-11 rounded-xl border-gray-200 text-sm sm:text-base">
                        <SelectValue placeholder="价格区间" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部价格</SelectItem>
                        <SelectItem value="0-200">¥0-200</SelectItem>
                        <SelectItem value="200-400">¥200-400</SelectItem>
                        <SelectItem value="400-600">¥400-600</SelectItem>
                        <SelectItem value="600+">¥600+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="h-10 sm:h-11 rounded-xl border-gray-200 text-sm sm:text-base">
                        <SelectValue placeholder="排序方式" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rating">评分最高</SelectItem>
                        <SelectItem value="price-low">价格最低</SelectItem>
                        <SelectItem value="price-high">价格最高</SelectItem>
                        <SelectItem value="popular">最受欢迎</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Quick Filter Tags */}
                <div className="flex flex-wrap gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                  <span className="text-xs sm:text-sm text-gray-600 mr-1 sm:mr-2 mb-1">热门标签:</span>
                  {["海景房", "石头厝", "蓝眼泪观赏", "亲子友好", "宠物友好", "免费WiFi"].map((tag) => (
                    <Button
                      key={tag}
                      variant="outline"
                      size="sm"
                      className="rounded-full text-xs h-6 sm:h-7 px-2 sm:px-3 hover:bg-blue-50 hover:border-blue-200"
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Enhanced Accommodation Showcase */}
        <AccommodationShowcase 
          searchQuery={searchQuery}
          selectedType={selectedType}
          selectedLocation={selectedLocation}
          priceRange={priceRange}
          sortBy={sortBy}
        />

        {/* Additional Features Section */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 px-4">为什么选择我们？</h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
                我们致力于为您提供最优质的住宿体验和贴心服务
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <Card className="text-center p-4 sm:p-6 rounded-2xl bg-white/70 backdrop-blur border border-white/60 hover:shadow-lg transition-all">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Star className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">精选品质</h3>
                <p className="text-sm sm:text-base text-gray-600">严格筛选，只推荐高品质住宿</p>
              </Card>
              
              <Card className="text-center p-4 sm:p-6 rounded-2xl bg-white/70 backdrop-blur border border-white/60 hover:shadow-lg transition-all">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">贴心服务</h3>
                <p className="text-sm sm:text-base text-gray-600">24小时客服，随时为您解答</p>
              </Card>
              
              <Card className="text-center p-4 sm:p-6 rounded-2xl bg-white/70 backdrop-blur border border-white/60 hover:shadow-lg transition-all sm:col-span-2 lg:col-span-1">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">灵活预订</h3>
                <p className="text-sm sm:text-base text-gray-600">免费取消，灵活变更预订</p>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}