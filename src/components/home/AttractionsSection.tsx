'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { useScrollReveal } from '@/hooks/useScrollReveal'

// 景点数据
const attractions = [
  {
    id: '1',
    title: '北港村',
    description: '面朝大海的石头厝，文艺青年的聚集地。在这里，听风看海，享受慢生活。',
    image: '/images/attractions/beigang.jpg',
    category: '文艺村落',
    href: '/attractions/beigang'
  },
  {
    id: '2',
    title: '坛南湾',
    description: '绵长的海岸线，洁白的沙滩，是追逐"蓝眼泪"的最佳地点之一。',
    image: '/images/attractions/tannanwan.jpg',
    category: '海滩度假',
    href: '/attractions/tannanwan'
  },
  {
    id: '3',
    title: '环岛路',
    description: '被誉为中国最美环岛路之一，骑行或自驾，一路皆是无敌海景。',
    image: '/images/attractions/huandaolu.jpg',
    category: '风景道路',
    href: '/attractions/huandaolu'
  }
]

export default function AttractionsSection() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  
  // 启用滚动动画
  useScrollReveal()

  return (
    <section id="attractions" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 scroll-reveal">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            必游景点
          </h2>
          <p className="text-gray-500 text-lg">
            领略平潭的独特风光与人文魅力
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {attractions.map((attraction, index) => (
            <Link key={attraction.id} href={attraction.href}>
              <div 
                className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-all duration-300 cursor-pointer scroll-reveal group"
                style={{ transitionDelay: `${index * 100}ms` }}
                onMouseEnter={() => setHoveredCard(attraction.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={attraction.image}
                    alt={attraction.title}
                    fill
                    className={`object-cover transition-transform duration-500 ${
                      hoveredCard === attraction.id ? 'scale-110' : 'scale-100'
                    }`}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />

                  <div className="absolute top-4 left-4">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {attraction.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                    {attraction.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {attraction.description}
                  </p>
                  <div className="flex items-center text-blue-600 font-medium text-sm group-hover:text-blue-700 transition-colors duration-300">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>查看详情</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link href="/attractions">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
              查看更多景点
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}