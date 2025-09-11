'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Clock, MapPin, ChefHat } from 'lucide-react'
import { useScrollReveal } from '@/hooks/useScrollReveal'

// 美食数据
const foods = [
  {
    id: 'oyster-pancake',
    name: '平潭海蛎饼',
    description: '外酥内嫩，海蛎鲜美，是平潭最具代表性的小吃之一',
    image: '/images/food/oyster-pancake.svg',
    price: '¥15-25',
    rating: 4.8,
    cookTime: '15分钟',
    location: '老街小吃店',
    specialty: '传统工艺'
  },
  {
    id: 'fish-balls',
    name: '平潭鱼丸',
    description: '选用新鲜海鱼制作，Q弹爽滑，汤汁鲜美',
    image: '/images/food/fish-balls.svg',
    price: '¥20-30',
    rating: 4.7,
    cookTime: '20分钟',
    location: '海鲜大排档',
    specialty: '手工制作'
  },
  {
    id: 'seafood-noodles',
    name: '海鲜面线',
    description: '面线爽滑，海鲜丰富，汤头浓郁香醇',
    image: '/images/food/seafood-noodles.svg',
    price: '¥25-35',
    rating: 4.6,
    cookTime: '25分钟',
    location: '渔家乐餐厅',
    specialty: '秘制汤底'
  },
  {
    id: 'sweet-potato-balls',
    name: '地瓜丸',
    description: '香甜软糯，外焦内嫩，是平潭人的童年回忆',
    image: '/images/food/sweet-potato-balls.svg',
    price: '¥10-18',
    rating: 4.5,
    cookTime: '10分钟',
    location: '街边小摊',
    specialty: '传统手艺'
  }
]

export default function FoodSection() {
  const [hoveredFood, setHoveredFood] = useState<string | null>(null)
  
  // 启用滚动动画
  useScrollReveal()

  return (
    <section id="food" className="py-16 md:py-24 bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-6">
        {/* 标题区域 */}
        <div className="text-center mb-16 scroll-reveal">
          <span className="text-orange-600 font-semibold text-sm uppercase tracking-wide">
            舌尖上的平潭
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
            品味海岛美食
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            从传统小吃到创新料理，平潭的美食文化融合了闽南风味与海岛特色，
            每一道菜都承载着渔民世代传承的智慧与情怀。
          </p>
        </div>

        {/* 美食网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {foods.map((food, index) => (
            <div
              key={food.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group scroll-reveal"
              style={{ transitionDelay: `${index * 100}ms` }}
              onMouseEnter={() => setHoveredFood(food.id)}
              onMouseLeave={() => setHoveredFood(null)}
            >
              {/* 图片区域 */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={food.image}
                  alt={food.name}
                  fill
                  className={`object-cover transition-transform duration-700 ${
                    hoveredFood === food.id ? 'scale-110' : 'scale-100'
                  }`}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                
                {/* 评分标签 */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-semibold text-gray-800">{food.rating}</span>
                </div>
                
                {/* 特色标签 */}
                <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  {food.specialty}
                </div>
                
                {/* 价格标签 */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                  <span className="text-orange-600 font-bold text-lg">{food.price}</span>
                </div>
              </div>

              {/* 内容区域 */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                  {food.name}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {food.description}
                </p>
                
                {/* 详细信息 */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-500 text-xs">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>制作时间: {food.cookTime}</span>
                  </div>
                  <div className="flex items-center text-gray-500 text-xs">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>推荐地点: {food.location}</span>
                  </div>
                </div>
                
                {/* 操作按钮 */}
                <Link href={`/food/${food.id}`}>
                  <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg">
                    查看详情
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        {/* 底部行动区域 */}
        <div className="text-center mt-16 scroll-reveal">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <ChefHat className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              探索更多平潭美食
            </h3>
            <p className="text-gray-600 mb-6">
              从街头小吃到高端餐厅，平潭有着丰富多样的美食选择，
              让您的味蕾体验一场难忘的海岛之旅。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/food">
                <button className="bg-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                  查看美食地图
                </button>
              </Link>
              <Link href="/restaurants">
                <button className="border-2 border-orange-500 text-orange-500 px-8 py-3 rounded-full font-semibold hover:bg-orange-500 hover:text-white transition-all duration-300 hover:scale-105">
                  推荐餐厅
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}