'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, Phone, Clock, Star, Eye, Moon, Waves, Map, List, Shield, AlertTriangle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { mockBlueTearSpots, spotTypeColors, BlueTearSpot, convertToMapMarkers } from '@/data/blue-tears'
import MapComponent from '@/components/map/MapComponent'
import { MapMarker } from '@/components/map/MapComponent'

export default function BlueTearSpotsPage() {
  const [blueTearSpots, setBlueTearSpots] = useState<BlueTearSpot[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [spotTypeFilter, setSpotTypeFilter] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')

  useEffect(() => {
    setTimeout(() => {
      setBlueTearSpots(mockBlueTearSpots)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredSpots = blueTearSpots.filter(spot => {
    const matchesSearch = spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         spot.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         spot.features.some(f => f.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesSpotType = !spotTypeFilter || spot.spotType === spotTypeFilter
    const matchesDifficulty = !difficultyFilter || spot.difficulty === difficultyFilter
    return matchesSearch && matchesSpotType && matchesDifficulty
  })

  const uniqueSpotTypes = Array.from(new Set(blueTearSpots.map(s => s.spotType)))
  const uniqueDifficulties = Array.from(new Set(blueTearSpots.map(s => s.difficulty)))

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero 区 */}
      <div className="relative h-64 md:h-80 lg:h-96 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/blue-tears/hero-bg.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-cyan-300 rounded-full animate-ping"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse delay-300"></div>
          <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-indigo-300 rounded-full animate-ping delay-700"></div>
        </div>
        <div className="relative container mx-auto px-4 py-8 md:py-12 lg:py-16 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-4 flex items-center justify-center gap-2 md:gap-3">
            <Waves className="h-8 w-8 md:h-12 md:w-12 lg:h-16 lg:w-16 text-blue-400" />
            平潭蓝眼泪专区
          </h1>
          <p className="text-base md:text-xl lg:text-2xl text-blue-100 mb-4 md:mb-6 px-2">探寻神秘蓝眼泪，感受大自然的奇迹光芒</p>
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 md:p-6 max-w-2xl mx-auto">
            <h3 className="text-base md:text-lg font-semibold mb-3 flex items-center justify-center gap-2">
              <Shield className="h-5 w-5 text-yellow-400" />
              观赏须知
            </h3>
            <div className="grid md:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-blue-300" />
                <span>最佳观赏时间：晚上8点-凌晨2点</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                <span>注意夜间安全，建议结伴前往</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-green-300" />
                <span>最佳季节：4月-8月</span>
              </div>
              <div className="flex items-center gap-2">
                <Waves className="h-4 w-4 text-cyan-300" />
                <span>避免强光干扰，保护海洋环境</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          {/* 视图切换按钮 */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">观赏点总览</h2>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="h-4 w-4" />
                列表视图
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  viewMode === 'map'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Map className="h-4 w-4" />
                地图视图
              </button>
            </div>
          </div>
        
        {/* 搜索和筛选 */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="搜索观赏点名称、地址或特色..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="md:w-40">
            <select
              value={spotTypeFilter}
              onChange={(e) => setSpotTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">所有类型</option>
              {uniqueSpotTypes.map(spotType => (
                <option key={spotType} value={spotType}>{spotType}</option>
              ))}
            </select>
          </div>
          <div className="md:w-40">
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">所有难度</option>
              {uniqueDifficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>{difficulty}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
       {viewMode === 'list' ? (
         /* 蓝眼泪观赏点列表 */
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredSpots.map((spot) => (
          <Card key={spot.id} className="overflow-hidden hover:shadow-lg transition-shadow transform hover:scale-[1.02] transition-transform">
            <div className="relative h-48">
              <Image
                src={spot.images[0] || '/images/placeholder-blue-tears.jpg'}
                alt={spot.name}
                fill
                className="object-cover"
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+"
              />
              {spot.rating && (
                <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-md shadow">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{spot.rating}</span>
                  </div>
                </div>
              )}
              <div className="absolute top-2 left-2">
                <Badge className={spotTypeColors[spot.spotType] || 'bg-gray-100 text-gray-800'}>
                  {spot.spotType}
                </Badge>
              </div>
              <div className="absolute bottom-2 right-2">
                <Badge variant="secondary" className="bg-black/50 text-white">
                  <Moon className="h-3 w-3 mr-1" />
                  {spot.difficulty}
                </Badge>
              </div>
            </div>
            
            <CardHeader>
              <CardTitle className="text-lg md:text-xl line-clamp-2">
                {spot.name}
                {spot.nameEn && (
                  <span className="block text-sm font-normal text-gray-500 mt-1">
                    {spot.nameEn}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-4 md:p-6">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{spot.address}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">最佳时间: {spot.bestTime}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">最佳季节: {spot.bestSeason}</span>
                </div>
                
                {spot.contact && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{spot.contact}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-600">交通: {spot.transportation}</span>
                </div>
                
                {spot.description && (
                  <p className="text-sm md:text-base text-gray-600 line-clamp-2 md:line-clamp-3">{spot.description}</p>
                )}
                
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <Waves className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700">特色:</span>
                  </div>
                  <div className="flex flex-wrap gap-1 md:gap-2">
                    {spot.features.slice(0, 3).map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs px-2 md:px-3">
                        {feature}
                      </Badge>
                    ))}
                    {spot.features.length > 3 && (
                      <Badge variant="outline" className="text-xs px-2 md:px-3">
                        +{spot.features.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                   <Link href={`/blue-tears/${spot.id}`} className="flex-1">
                     <Button className="w-full text-sm md:text-base">
                       查看详情
                     </Button>
                   </Link>
                   <Button variant="outline" size="sm" className="px-3 text-sm md:text-base">
                     <Shield className="h-4 w-4" />
                   </Button>
                 </div>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      ) : (
        /* 地图视图 */
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <MapComponent
            config={{
              center: [119.7906, 25.4444], // 平潭岛中心坐标
              zoom: 11
            }}
            markers={convertToMapMarkers(filteredSpots).map(marker => ({
              ...marker,
              onClick: () => {
                // 点击地图标记时可以跳转到详情页或显示更多信息
                console.log('点击蓝眼泪观赏点:', marker.title);
              }
            } as MapMarker))}
            height="60vh"
            className="w-full"
            showControls={true}
            showScale={true}
            onMarkerClick={(marker) => {
              console.log('地图标记点击:', marker);
            }}
          />
        </div>
      )}
      
      {filteredSpots.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">没有找到符合条件的蓝眼泪观赏点</p>
        </div>
      )}
      </div>
    </div>
  )
}