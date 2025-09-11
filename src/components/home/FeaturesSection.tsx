'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Route, Utensils, Camera, Star, Users } from 'lucide-react'
import { useLocale } from '../providers/LocaleProvider'

export default function FeaturesSection() {
  const { t } = useLocale()

  const features = [
    {
      icon: MapPin,
      title: t('home.features.attractions.title'),
      description: t('home.features.attractions.desc'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Route,
      title: t('home.features.itineraries.title'),
      description: t('home.features.itineraries.desc'),
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: Utensils,
      title: t('home.features.local.title'),
      description: t('home.features.local.desc'),
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      icon: Camera,
      title: '摄影指南',
      description: '专业摄影师推荐的最佳拍摄地点和时间',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Star,
      title: '用户评价',
      description: '真实用户分享的旅行体验和建议',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      icon: Users,
      title: '社区互动',
      description: '与其他旅行者交流分享旅行心得',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('home.features.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            我们为您提供全方位的平潭岛旅游服务，让您的旅行更加精彩难忘
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md"
              >
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 mx-auto rounded-full ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-center leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* 统计数据 */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">50+</div>
            <div className="text-gray-600">精选景点</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">100+</div>
            <div className="text-gray-600">推荐行程</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">1000+</div>
            <div className="text-gray-600">用户评价</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">5000+</div>
            <div className="text-gray-600">满意游客</div>
          </div>
        </div>
      </div>
    </section>
  )
}