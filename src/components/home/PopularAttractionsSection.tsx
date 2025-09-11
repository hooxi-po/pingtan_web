'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, MapPin, Clock, Heart } from 'lucide-react'
import { useLocale } from '../providers/LocaleProvider'

interface Attraction {
  id: string
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  image: string
  rating: number
  reviewCount: number
  tags: string[]
  estimatedTime: string
  location: string
}

export default function PopularAttractionsSection() {
  const { locale, t } = useLocale()
  const [attractions, setAttractions] = useState<Attraction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 模拟API调用
    const fetchAttractions = async () => {
      try {
        // 这里应该调用真实的API
        // const response = await fetch('/api/attractions?limit=6')
        // const data = await response.json()
        
        // 模拟数据
        const mockData: Attraction[] = [
          {
            id: '1',
            name: '坛南湾',
            nameEn: 'Tannan Bay',
            description: '平潭最美的海湾之一，拥有细腻的沙滩和清澈的海水',
            descriptionEn: 'One of the most beautiful bays in Pingtan with fine sand and clear water',
            image: '/images/attractions/tannan-bay.jpg',
            rating: 4.8,
            reviewCount: 256,
            tags: ['海滩', '摄影', '日出'],
            estimatedTime: '2-3小时',
            location: '平潭县坛南湾',
          },
          {
            id: '2',
            name: '石牌洋',
            nameEn: 'Shipaiyang',
            description: '平潭标志性景观，两座巨大的海蚀柱屹立在海中',
            descriptionEn: 'Iconic landmark of Pingtan, two giant sea stacks standing in the ocean',
            image: '/images/attractions/shipaiyang.jpg',
            rating: 4.9,
            reviewCount: 189,
            tags: ['地标', '摄影', '日落'],
            estimatedTime: '1-2小时',
            location: '平潭县看澳村',
          },
          {
            id: '3',
            name: '龙凤头海滨浴场',
            nameEn: 'Longfengtou Beach',
            description: '平潭最大的海滨浴场，是游泳和水上运动的理想场所',
            descriptionEn: 'The largest beach in Pingtan, ideal for swimming and water sports',
            image: '/images/attractions/longfengtou.jpg',
            rating: 4.6,
            reviewCount: 342,
            tags: ['海滩', '游泳', '水上运动'],
            estimatedTime: '半天',
            location: '平潭县龙凤头',
          },
          {
            id: '4',
            name: '北港村',
            nameEn: 'Beigang Village',
            description: '充满文艺气息的石头村落，保留着传统的闽南建筑风格',
            descriptionEn: 'Artistic stone village preserving traditional Minnan architectural style',
            image: '/images/attractions/beigang.jpg',
            rating: 4.7,
            reviewCount: 198,
            tags: ['文化', '建筑', '民宿'],
            estimatedTime: '2-4小时',
            location: '平潭县流水镇北港村',
          },
          {
            id: '5',
            name: '猴研岛',
            nameEn: 'Houyan Island',
            description: '神秘的无人岛屿，拥有独特的地质景观和丰富的海洋生物',
            descriptionEn: 'Mysterious uninhabited island with unique geological features and rich marine life',
            image: '/images/attractions/houyan.jpg',
            rating: 4.5,
            reviewCount: 87,
            tags: ['探险', '地质', '海洋'],
            estimatedTime: '全天',
            location: '平潭县猴研岛',
          },
          {
            id: '6',
            name: '海坛古城',
            nameEn: 'Haitan Ancient City',
            description: '仿古建筑群，展现了平潭的历史文化和传统工艺，售卖平潭特有纪念品',
            descriptionEn: 'Ancient-style architectural complex showcasing Pingtan\'s history and traditional crafts',
            image: '/images/attractions/ancient-city.jpg',
            rating: 4.4,
            reviewCount: 156,
            tags: ['历史', '文化', '购物'],
            estimatedTime: '2-3小时',
            location: '平潭县海坛古城',
          },
        ]
        
        setAttractions(mockData)
      } catch (error) {
        console.error('Failed to fetch attractions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAttractions()
  }, [])

  if (loading) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('attractions.title')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg" />
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('attractions.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            探索平潭岛最受欢迎的景点，每一处都有独特的魅力等待您的发现
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {attractions.map((attraction) => (
            <Card key={attraction.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={attraction.image}
                  alt={locale === 'zh' ? attraction.name : attraction.nameEn}
                  fill
                  unoptimized
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    // 如果图片加载失败，使用占位图
                    e.currentTarget.src = '/images/placeholder-attraction.jpg'
                  }}
                />
                <div className="absolute top-4 right-4">
                  <Button size="sm" variant="secondary" className="bg-white/80 backdrop-blur-sm hover:bg-white">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute bottom-4 left-4">
                  <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{attraction.rating}</span>
                    <span className="text-sm text-gray-200">({attraction.reviewCount})</span>
                  </div>
                </div>
              </div>
              
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {locale === 'zh' ? attraction.name : attraction.nameEn}
                </CardTitle>
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{attraction.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{attraction.estimatedTime}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <CardDescription className="text-gray-600 mb-4 line-clamp-2">
                  {locale === 'zh' ? attraction.description : attraction.descriptionEn}
                </CardDescription>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {attraction.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <Link href={`/attractions/${attraction.id}`}>
                  <Button className="w-full">
                    {t('attractions.viewDetails')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/attractions">
            <Button size="lg" variant="outline">
              {t('common.viewAll')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}