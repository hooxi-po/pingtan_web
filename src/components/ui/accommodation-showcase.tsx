'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, Eye, Star, MapPin, Users, Bed, Wifi, Car, Coffee, Waves } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'
import Link from 'next/link'

// 住宿数据接口 - 适配数据库返回格式
interface Accommodation {
  id: string
  name: string
  description: string
  type: string
  location: string
  address: string
  images: string[]
  amenities: string[]
  roomTypes: any[]
  priceRange: string
  rating: number
  reviews: number
  reviewCount: number
  contactPhone?: string
  contactEmail?: string
  checkInTime?: string
  checkOutTime?: string
  policies?: string
  // 兼容旧格式
  price: number
  popular: boolean
  features: string[]
  maxGuests: number
  bedrooms: number
  category: string
  image: string
}

// 骨架屏组件
const AccommodationSkeleton = () => (
  <Card className="overflow-hidden">
    <div className="relative">
      <Skeleton className="h-48 w-full" />
      <div className="absolute top-2 left-2">
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="absolute top-2 right-2 flex gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
    <CardContent className="p-4">
      <div className="space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </CardContent>
  </Card>
)

// 加载状态组件
const LoadingIndicator = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
    <p className="text-gray-600">正在加载住宿数据...</p>
  </div>
)

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
  const [favorites, setFavorites] = useState<string[]>([])
  const [accommodations, setAccommodations] = useState<Accommodation[]>([])
  const [loading, setLoading] = useState(true)

  // 获取住宿数据（从 API）
  useEffect(() => {
    console.log('AccommodationShowcase: Loading data from API...');
    
    const fetchAccommodations = async () => {
      setLoading(true)
      
      try {
        // 构建查询参数
        const params = new URLSearchParams()
        if (searchQuery) params.append('search', searchQuery)
        if (selectedType !== 'all') params.append('type', selectedType)
        if (selectedLocation !== 'all') params.append('location', selectedLocation)
        if (priceRange !== 'all') params.append('priceRange', priceRange)
        if (sortBy) params.append('sortBy', sortBy)
        
        const response = await fetch(`/api/accommodations?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch accommodations')
        }
        
        const result = await response.json()
        console.log('AccommodationShowcase: API data loaded:', result.data?.length || 0, 'items');
        console.log('AccommodationShowcase: First item:', result.data?.[0]);
        
        setAccommodations(result.data || [])
      } catch (error) {
        console.error('AccommodationShowcase: Error loading data:', error)
        setAccommodations([])
      } finally {
        setLoading(false)
      }
    }

    fetchAccommodations()
  }, [searchQuery, selectedType, selectedLocation, priceRange, sortBy]) // 依赖筛选条件

  // 由于数据已在 API 层进行筛选和排序，这里直接使用返回的数据
  const filteredAndSortedAccommodations = useMemo(() => {
    console.log('AccommodationShowcase: Using API filtered data:', accommodations.length, 'items');
    return accommodations;
  }, [accommodations]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    )
  }

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50/50">
      <div className="container mx-auto px-4">
        {/* Loading State with Skeleton */}
        {loading && (
          <div>
            <div className="mb-8">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <AccommodationSkeleton key={index} />
              ))}
            </div>
          </div>
        )}



        {/* Results Header */}
        {!loading && (
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
        )}

        {/* Accommodation Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredAndSortedAccommodations.map((accommodation) => (
            <Card key={accommodation.id} className="group overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
              {/* Image Section */}
              <div className="relative overflow-hidden">
                <img
                  src={accommodation.images?.[0] || accommodation.image || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'}
                  alt={accommodation.name}
                  className="w-full h-48 sm:h-56 lg:h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'
                  }}
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
                    onClick={() => toggleFavorite(accommodation.id)}
                  >
                    <Heart 
                      className={`w-4 h-4 transition-colors ${
                        favorites.includes(accommodation.id) 
                          ? 'text-red-500 fill-red-500' 
                          : 'text-gray-600 hover:text-red-500'
                      }`} 
                    />
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
                        {accommodation.priceRange || `¥${accommodation.price}`}
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
                    asChild
                  >
                    <Link href={`/booking/${accommodation.id}`}>
                      立即预订
                    </Link>
                  </Button>
                </div>

                {/* Reviews */}
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
                    <span>{accommodation.reviewCount || accommodation.reviews || 0} 条评价</span>
                    <span>最近预订: 2小时前</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        )}

        {/* No Results */}
        {!loading && filteredAndSortedAccommodations.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">🏨</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">暂无符合条件的住宿</h3>
            <p className="text-gray-500">请尝试调整筛选条件或搜索关键词</p>
          </div>
        )}

        {/* Load More Button */}
        {!loading && filteredAndSortedAccommodations.length > 0 && (
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