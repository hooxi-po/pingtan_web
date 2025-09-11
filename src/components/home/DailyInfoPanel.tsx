'use client'

import { useState, useEffect } from 'react'
import { Star, Clock, MapPin, Calendar, Sunrise, Sunset } from 'lucide-react'
import Link from 'next/link'

interface RecommendedSpot {
  id: string
  name: string
  image: string
  rating: number
  duration: string
  distance: string
  weather_suitable: boolean
  description: string
}

interface DailyActivity {
  id: string
  title: string
  time: string
  type: 'sunrise' | 'sunset' | 'event' | 'festival'
  location: string
  description: string
}

const mockSpots: RecommendedSpot[] = [
  {
    id: '1',
    name: '坛南湾海滩',
    image: '/images/hero-1.jpg',
    rating: 4.8,
    duration: '2-3小时',
    distance: '5.2km',
    weather_suitable: true,
    description: '金色沙滩，适合日出观赏'
  },
  {
    id: '2',
    name: '海坛古城',
    image: '/images/hero-2.jpg',
    rating: 4.6,
    duration: '3-4小时',
    distance: '8.1km',
    weather_suitable: true,
    description: '闽南建筑风情，文化体验'
  },
  {
    id: '3',
    name: '北港村',
    image: '/images/hero-3.jpg',
    rating: 4.7,
    duration: '1-2小时',
    distance: '12.3km',
    weather_suitable: true,
    description: '石头厝民居，渔村风光'
  }
]

const mockActivities: DailyActivity[] = [
  {
    id: '1',
    title: '日出观赏',
    time: '06:15',
    type: 'sunrise',
    location: '坛南湾',
    description: '最佳观日出地点'
  },
  {
    id: '2',
    title: '海鲜市场',
    time: '08:00-11:00',
    type: 'event',
    location: '流水码头',
    description: '新鲜海货采购'
  },
  {
    id: '3',
    title: '日落晚霞',
    time: '18:30',
    type: 'sunset',
    location: '龙凤头海滩',
    description: '绝美日落景观'
  }
]

export default function DailyInfoPanel() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [spots] = useState(mockSpots)
  const [activities] = useState(mockActivities)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // 每分钟更新一次

    return () => clearInterval(timer)
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sunrise':
        return Sunrise
      case 'sunset':
        return Sunset
      case 'event':
      case 'festival':
        return Calendar
      default:
        return Clock
    }
  }

  return (
    <div className="p-6">
      {/* 标题区域 */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          今日平潭 · {currentTime.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
        </h2>
        <p className="text-gray-600 text-sm">
          发现最适合今天的景点和活动
        </p>
      </div>

      {/* 推荐景点 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-blue-600" />
          今日推荐
        </h3>
        <div className="space-y-3">
          {spots.slice(0, 2).map((spot) => (
            <Link
              key={spot.id}
              href={`/attractions/${spot.id}`}
              className="group block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-gray-900 font-medium group-hover:text-blue-600">{spot.name}</h4>
                <div className="flex items-center space-x-1 text-yellow-500">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="text-xs font-medium">{spot.rating}</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-2">{spot.description}</p>
              <div className="flex justify-between text-xs text-gray-500">
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {spot.duration}
                </span>
                <span>{spot.distance}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 今日活动 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-blue-600" />
          今日活动
        </h3>
        <div className="space-y-3">
          {activities.map((activity) => {
            const IconComponent = getActivityIcon(activity.type)
            return (
              <div
                key={activity.id}
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 rounded-full p-2 mt-1">
                    <IconComponent className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-gray-900 font-medium">{activity.title}</h4>
                      <span className="text-gray-500 text-sm">{activity.time}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-1">{activity.location}</p>
                    <p className="text-gray-500 text-xs">{activity.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}