'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, Phone, Wifi, Car, Coffee, Utensils, Star, Users, Calendar, Filter } from 'lucide-react'
import Image from 'next/image'
import MapComponent from '@/components/map/MapComponent'

// 添加自定义样式
const customStyles = `
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`

interface Accommodation {
  id: string
  name: string
  nameEn?: string
  address: string
  priceRange: string
  contact: string
  facilities: string[]
  images: string[]
  latitude?: number
  longitude?: number
  description?: string
  rating?: number
}

const mockAccommodations: Accommodation[] = [
  {
    id: '1',
    name: '海韵石厝民宿',
    nameEn: 'Haiyun Stone House',
    address: '平潭县澳前镇海滨路88号',
    priceRange: '¥280-380/晚',
    contact: '13800138001',
    facilities: ['免费WiFi', '停车场', '海景房', '早餐', '观景台'],
    images: ['/images/accommodations/haiyun-stone.jpg'],
    latitude: 25.5018,
    longitude: 119.7909,
    description: '坐落在海边的传统石厝民宿，融合现代舒适与古朴韵味，每间客房都能欣赏到壮丽的海景日出，是体验平潭海岛风情的理想选择。',
    rating: 4.8
  },
  {
    id: '2',
    name: '石厝文化主题民宿',
    nameEn: 'Stone Culture Guesthouse',
    address: '平潭县流水镇石厝村12号',
    priceRange: '¥320-450/晚',
    contact: '13900139002',
    facilities: ['免费WiFi', '传统建筑', '庭院', '茶室', '文化体验'],
    images: ['/images/accommodations/stone-culture.jpg'],
    latitude: 25.4892,
    longitude: 119.8156,
    description: '百年石厝精心改造，保留原有建筑风貌的同时融入现代设施。在这里可以品茶赏月，体验最地道的平潭传统文化生活。',
    rating: 4.6
  },
  {
    id: '3',
    name: '渔家乐海景民宿',
    nameEn: 'Fisherman Seaview Inn',
    address: '平潭县苏澳镇渔港路66号',
    priceRange: '¥200-320/晚',
    contact: '13700137003',
    facilities: ['免费WiFi', '海鲜餐厅', '渔船体验', '停车场', '烧烤区'],
    images: ['/images/accommodations/fisherman-inn.jpg'],
    latitude: 25.5234,
    longitude: 119.7654,
    description: '渔家风情浓郁的海边民宿，可参与出海捕鱼体验，品尝最新鲜的海鲜大餐，感受平潭渔民的淳朴生活。',
    rating: 4.4
  },
  {
    id: '4',
    name: '蓝眼泪度假村',
    nameEn: 'Blue Tears Resort',
    address: '平潭县北港村文创路15号',
    priceRange: '¥480-680/晚',
    contact: '13600136004',
    facilities: ['免费WiFi', '停车场', '海景房', '早餐', '健身房', 'SPA', '无边泳池'],
    images: ['/images/accommodations/blue-tears.jpg'],
    latitude: 25.5156,
    longitude: 119.7823,
    description: '高端海景度假村，以平潭著名的蓝眼泪奇观命名。设施齐全，服务优质，是商务出行和度假休闲的完美选择。',
    rating: 4.9
  },
  {
    id: '5',
    name: '古厝艺术客栈',
    nameEn: 'Ancient Art Inn',
    address: '平潭县流水镇古村落8号',
    priceRange: '¥260-380/晚',
    contact: '13500135005',
    facilities: ['免费WiFi', '传统建筑', '庭院', '茶室', '文化体验', '艺术展览'],
    images: ['/images/accommodations/ancient-art.jpg'],
    latitude: 25.4978,
    longitude: 119.8089,
    description: '将传统石厝与现代艺术完美融合，定期举办文化艺术展览。在这里不仅能体验平潭传统建筑之美，更能感受浓厚的艺术氛围。',
    rating: 4.7
  },
  {
    id: '6',
    name: '海上田园民宿',
    nameEn: 'Sea Garden B&B',
    address: '平潭县白青乡田美村28号',
    priceRange: '¥180-280/晚',
    contact: '13400134006',
    facilities: ['免费WiFi', '停车场', '田园风光', '有机蔬菜', '自行车租赁'],
    images: ['/images/accommodations/sea-garden.jpg'],
    latitude: 25.4756,
    longitude: 119.7432,
    description: '远离城市喧嚣的田园民宿，被绿色田野和蔚蓝大海环绕。提供有机蔬菜和自行车骑行服务，是亲近自然的理想之地。',
    rating: 4.3
  },
  {
    id: '7',
    name: '风车海岸客栈',
    nameEn: 'Windmill Coast Inn',
    address: '平潭县平原镇风车海岸5号',
    priceRange: '¥220-350/晚',
    contact: '13300133007',
    facilities: ['免费WiFi', '停车场', '海景房', '观景台', '咖啡厅'],
    images: ['/images/accommodations/windmill-coast.jpg'],
    latitude: 25.5345,
    longitude: 119.7123,
    description: '位于著名风车海岸景区旁，可观赏壮观的海上风车群。客栈设有观景台和咖啡厅，是摄影爱好者的天堂。',
    rating: 4.5
  }
]

const facilityIcons: { [key: string]: any } = {
  '免费WiFi': Wifi,
  '停车场': Car,
  '早餐': Coffee,
  '海鲜餐厅': Utensils,
  '海景房': MapPin,
  '传统建筑': MapPin,
  '庭院': MapPin,
  '茶室': Coffee,
  '渔船体验': MapPin,
  '观景台': MapPin,
  '文化体验': MapPin,
  'SPA': MapPin,
  '无边泳池': MapPin,
  '健身房': MapPin,
  '艺术展览': MapPin,
  '田园风光': MapPin,
  '有机蔬菜': MapPin,
  '自行车租赁': MapPin,
  '烧烤区': MapPin,
  '咖啡厅': Coffee
}

export default function AccommodationsPage() {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [priceFilter, setPriceFilter] = useState('')
  const [guestCount, setGuestCount] = useState(2)
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null)

  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      setAccommodations(mockAccommodations)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredAccommodations = accommodations.filter(accommodation => {
    const matchesSearch = accommodation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         accommodation.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPrice = !priceFilter || accommodation.priceRange.includes(priceFilter)
    return matchesSearch && matchesPrice
  })

  // 准备地图标记数据
  const mapMarkers = filteredAccommodations.map(accommodation => ({
    id: accommodation.id,
    position: [accommodation.longitude || 119.7909, accommodation.latitude || 25.5018] as [number, number],
    title: accommodation.name,
    content: `${accommodation.description || ''}<br/>价格: ${accommodation.priceRange}<br/>评分: ${accommodation.rating} ⭐`,
    type: 'accommodation' as const
  }))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <style jsx>{customStyles}</style>
      <div className="min-h-screen bg-white text-gray-900 relative overflow-hidden">
         {/* 背景装饰 */}
         <div className="absolute inset-0 opacity-5">
           <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 rounded-full blur-3xl"></div>
           <div className="absolute top-40 right-20 w-24 h-24 bg-cyan-200 rounded-full blur-2xl"></div>
           <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-blue-300 rounded-full blur-3xl"></div>
         </div>
      
      {/* 顶部搜索栏 */}
       <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 p-4 backdrop-blur-sm relative z-10 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-800">平潭特色民宿 | 海岛度假住宿</h1>
            </div>
            
            <div className="flex flex-1 gap-4 items-center flex-wrap">
              <div className="flex items-center gap-2 bg-white/80 rounded-lg px-3 py-2 backdrop-blur-sm border border-gray-200">
                <Calendar className="w-4 h-4 text-gray-600" />
                <input 
                  type="date" 
                  className="bg-transparent text-sm text-gray-700 border-none outline-none"
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="flex items-center gap-2 bg-white/80 rounded-lg px-3 py-2 backdrop-blur-sm border border-gray-200">
                <Users className="w-4 h-4 text-gray-600" />
                <select 
                  value={guestCount} 
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="bg-transparent text-sm text-gray-700 border-none outline-none"
                >
                  <option value={1}>1人</option>
                  <option value={2}>2人</option>
                  <option value={3}>3人</option>
                  <option value={4}>4人</option>
                  <option value={5}>5人</option>
                  <option value={6}>6人</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2 bg-white/80 rounded-lg px-3 py-2 backdrop-blur-sm border border-gray-200">
                <Input
                  placeholder="搜索民宿名称或地址..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none text-gray-700 placeholder-gray-500 text-sm w-48"
                />
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <button className="px-3 py-2 bg-white/80 text-gray-700 rounded-lg text-sm hover:bg-white transition-colors backdrop-blur-sm border border-gray-200">
                  评分排序
                </button>
                <button className="px-3 py-2 bg-white/80 text-gray-700 rounded-lg text-sm hover:bg-white transition-colors backdrop-blur-sm border border-gray-200">
                  价格排序
                </button>
                <button className="px-3 py-2 bg-white/80 text-gray-700 rounded-lg text-sm hover:bg-white transition-colors backdrop-blur-sm border border-gray-200">
                  海景房
                </button>
                <button className="px-3 py-2 bg-white/80 text-gray-700 rounded-lg text-sm hover:bg-white transition-colors backdrop-blur-sm border border-gray-200">
                  石厝特色
                </button>
                <button className="px-3 py-2 bg-white/80 text-gray-700 rounded-lg text-sm hover:bg-white transition-colors backdrop-blur-sm border border-gray-200">
                  渔家体验
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex h-[calc(100vh-60px)] relative z-10">
        {/* 左侧民宿列表 */}
        <div className="w-1/2 bg-white/90 backdrop-blur-sm overflow-y-auto border-r border-gray-200 shadow-sm">
          <div className="p-4">
            <div className="mb-4 text-center">
              <p className="text-gray-600 text-sm">为您找到 {filteredAccommodations.length} 家特色民宿</p>
            </div>
            {filteredAccommodations.map((accommodation) => (
              <div 
                key={accommodation.id} 
                className={`bg-white rounded-xl p-5 mb-4 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 hover:scale-[1.02] border border-gray-200 ${
                  selectedAccommodation?.id === accommodation.id ? 'ring-2 ring-blue-400 shadow-lg shadow-blue-500/30' : ''
                }`}
                onClick={() => setSelectedAccommodation(accommodation)}
              >
                <div className="flex gap-4">
                  <div className="relative w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
                    <Image
                      src={accommodation.images[0] || '/images/placeholder-accommodation.svg'}
                      alt={accommodation.name}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-110"
                      unoptimized
                    />
                    <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-white font-medium">{accommodation.rating}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{accommodation.name}</h3>
                        <p className="text-sm text-blue-600 mb-1">{accommodation.nameEn}</p>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{accommodation.address}</span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-xl font-bold text-blue-600">{accommodation.priceRange}</div>
                        <div className="text-xs text-gray-500">含税费</div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{accommodation.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {accommodation.facilities.slice(0, 4).map((facility, index) => {
                        const IconComponent = facilityIcons[facility] || MapPin
                        return (
                          <div key={index} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs border border-blue-200">
                            <IconComponent className="w-3 h-3" />
                            <span>{facility}</span>
                          </div>
                        )
                      })}
                      {accommodation.facilities.length > 4 && (
                        <div className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                          <span>+{accommodation.facilities.length - 4}项设施</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${
                              i < Math.floor(accommodation.rating || 0) 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                        <span className="text-sm text-gray-500 ml-2">({Math.floor(Math.random() * 200) + 100}条评价)</span>
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1 text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          // 预订逻辑
                        }}
                      >
                        立即预订
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredAccommodations.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">没有找到符合条件的民宿</p>
              </div>
            )}
          </div>
        </div>

        {/* 右侧地图 */}
        <div className="w-1/2 relative">
          <MapComponent 
            markers={mapMarkers}
            config={{
              center: [119.7906, 25.5018],
              zoom: 13
            }}
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
    </>
  )
}