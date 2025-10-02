"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Users, Bed, Wifi, Car, Coffee, Heart, Eye, Calendar } from "lucide-react"
import Image from "next/image"

interface AccommodationShowcaseProps {
  searchQuery?: string
  selectedType?: string
  selectedLocation?: string
  priceRange?: string
  sortBy?: string
}

export default function AccommodationShowcase({
  searchQuery = "",
  selectedType = "all",
  selectedLocation = "all",
  priceRange = "all",
  sortBy = "rating"
}: AccommodationShowcaseProps) {
  const [favorites, setFavorites] = useState<number[]>([])

  const accommodations = [
    {
      id: 1,
      name: "海景石头厝民宿",
      type: "民宿",
      location: "平潭岛东部",
      price: 288,
      rating: 4.8,
      reviews: 156,
      image: "/hotels/Gemini_Generated_Image_3.png",
      features: ["海景房", "石头厝", "免费WiFi", "停车位"],
      description: "传统石头厝建筑，面朝大海，体验平潭特色民居文化",
      amenities: ["免费WiFi", "空调", "海景房", "停车场"],
      maxGuests: 4,
      bedrooms: 2,
      popular: true,
      category: "文化体验",
      priceRange: "中档"
    },
    {
      id: 2,
      name: "蓝眼泪度假酒店",
      type: "度假酒店",
      location: "坛南湾",
      price: 588,
      rating: 4.9,
      reviews: 203,
      image: "/hotels/Gemini_Generated_Image_1.png",
      features: ["蓝眼泪观赏", "海滨位置", "豪华设施", "SPA服务"],
      description: "豪华海滨度假酒店，观赏蓝眼泪奇观的最佳位置，享受顶级度假体验",
      amenities: ["海滨位置", "游泳池", "SPA", "餐厅", "健身房", "私人海滩"],
      maxGuests: 4,
      bedrooms: 2,
      popular: true,
      category: "度假休闲",
      priceRange: "高档"
    },
    {
      id: 3,
      name: "渔村客栈",
      type: "客栈",
      location: "流水镇",
      price: 168,
      rating: 4.6,
      reviews: 89,
      image: "/hotels/Gemini_Generated_Image_5.png",
      features: ["渔村风情", "经济实惠", "当地美食", "文化体验"],
      description: "体验渔村生活，品尝新鲜海鲜，感受淳朴民风",
      amenities: ["渔村体验", "海鲜餐厅", "免费WiFi", "自行车租赁"],
      maxGuests: 3,
      bedrooms: 1,
      popular: false,
      category: "民俗体验",
      priceRange: "经济"
    },
    {
      id: 4,
      name: "海景精品酒店",
      type: "精品酒店",
      location: "龙凤头海滨",
      price: 428,
      rating: 4.7,
      reviews: 134,
      image: "/hotels/Gemini_Generated_Image_4.png",
      features: ["文创设计", "艺术氛围", "摄影基地", "亲子友好"],
      description: "现代精品设计酒店，每间客房都配有私人海景阳台，艺术与舒适的完美结合",
      amenities: ["精品设计", "海景阳台", "管家服务", "商务中心", "艺术画廊", "儿童乐园"],
      maxGuests: 4,
      bedrooms: 2,
      popular: false,
      category: "商务出行",
      priceRange: "中高档"
    },
    {
      id: 5,
      name: "海边民宿小院",
      type: "民宿",
      location: "北港村",
      price: 228,
      rating: 4.5,
      reviews: 67,
      image: "/hotels/Gemini_Generated_Image_6.png",
      features: ["私人海滩", "全包服务", "水上运动", "高端设施"],
      description: "温馨小院，花园环绕，适合家庭度假和宠物出行",
      amenities: ["庭院花园", "BBQ设施", "宠物友好", "免费早餐"],
      maxGuests: 4,
      bedrooms: 2,
      popular: false,
      category: "家庭度假",
      priceRange: "中档"
    },
    {
      id: 6,
      name: "海景别墅",
      type: "别墅",
      location: "长江澳",
      price: 888,
      rating: 4.9,
      reviews: 45,
      image: "/hotels/Gemini_Generated_Image_2.png",
      features: ["家庭友好", "温馨服务", "经济实惠", "便利位置"],
      description: "奢华海景别墅，私人泳池和海滩，尊享私密度假体验",
      amenities: ["私人泳池", "独栋别墅", "管家服务", "私人海滩"],
      maxGuests: 5,
      bedrooms: 2,
      popular: true,
      category: "奢华度假",
      priceRange: "豪华"
    }
  ]

  // 筛选和排序逻辑
  const filteredAndSortedAccommodations = useMemo(() => {
    let filtered = accommodations.filter(accommodation => {
      const matchesSearch = accommodation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          accommodation.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          accommodation.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = selectedType === 'all' || accommodation.type === selectedType;
      const matchesLocation = selectedLocation === 'all' || accommodation.location === selectedLocation;
      
      // Price range filter
      let matchesPriceRange = true;
      if (priceRange !== "all") {
        const [min, max] = priceRange.split("-").map(p => p.replace("+", "")).map(Number)
        if (priceRange.includes("+")) {
          matchesPriceRange = accommodation.price >= min;
        } else {
          matchesPriceRange = accommodation.price >= min && accommodation.price <= max;
        }
      }
      
      return matchesSearch && matchesType && matchesLocation && matchesPriceRange;
    });

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'popular':
          return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedType, selectedLocation, priceRange, sortBy]);

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    )
  }

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50/50">
      <div className="container mx-auto px-4">
        {/* Results Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              找到 {filteredAndSortedAccommodations.length} 个住宿选择
            </h2>
            <p className="text-gray-600">
              {searchQuery && `搜索 "${searchQuery}" 的结果`}
              {selectedType !== "all" && ` · ${selectedType}`}
              {selectedLocation !== "all" && ` · ${selectedLocation}`}
            </p>
          </div>
        </div>

        {/* Accommodation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredAndSortedAccommodations.map((accommodation) => (
            <Card key={accommodation.id} className="group overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
              {/* Image Section */}
              <div className="relative overflow-hidden">
                <img
                  src={accommodation.image}
                  alt={accommodation.name}
                  className="w-full h-48 sm:h-56 lg:h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Overlay Elements */}
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                  {accommodation.popular && (
                    <Badge className="bg-red-500 text-white px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full">
                      热门推荐
                    </Badge>
                  )}
                </div>
                
                <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/80 backdrop-blur hover:bg-white/90 p-0"
                  >
                    <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
                  </Button>
                </div>
                
                {/* Quick View Button */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/90 backdrop-blur text-gray-900 hover:bg-white text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
                  >
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    快速查看
                  </Button>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-1 truncate">
                      {accommodation.name}
                    </h3>
                    <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{accommodation.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center ml-2 flex-shrink-0">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                    <span className="text-xs sm:text-sm font-medium text-gray-900 ml-1">
                      {accommodation.rating}
                    </span>
                  </div>
                </div>

                {/* Type and Price */}
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <Badge variant="outline" className="text-xs px-2 py-0.5 rounded-full">
                    {accommodation.type}
                  </Badge>
                  <div className="text-right">
                    <div className="text-lg sm:text-xl font-bold text-blue-600">
                      ¥{accommodation.price}
                    </div>
                    <div className="text-xs text-gray-500">每晚</div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                  {accommodation.description}
                </p>

                {/* Amenities */}
                <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6">
                  {accommodation.amenities.slice(0, 3).map((amenity, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                    >
                      {amenity}
                    </Badge>
                  ))}
                  {accommodation.amenities.length > 3 && (
                    <Badge
                      variant="secondary"
                      className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                    >
                      +{accommodation.amenities.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-full border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-xs sm:text-sm py-2"
                  >
                    查看详情
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm py-2"
                  >
                    立即预订
                  </Button>
                </div>

                {/* Reviews */}
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
                    <span>{accommodation.reviews} 条评价</span>
                    <span>最近预订: 2小时前</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredAndSortedAccommodations.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">🏨</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">暂无符合条件的住宿</h3>
            <p className="text-gray-500">请尝试调整筛选条件或搜索关键词</p>
          </div>
        )}

        {/* Load More Button */}
        {filteredAndSortedAccommodations.length > 0 && (
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              size="lg"
              className="px-8 py-3 rounded-full border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
            >
              加载更多住宿
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}