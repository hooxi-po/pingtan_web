'use client'

import { MapPin, Utensils, Home, Car } from 'lucide-react'
import Link from 'next/link'

interface NavItem {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  description: string
}

const navItems: NavItem[] = [
  {
    id: 'attractions',
    title: '热门景点',
    icon: MapPin,
    href: '/attractions',
    description: '探索平潭美景'
  },
  {
    id: 'food',
    title: '特色美食',
    icon: Utensils,
    href: '/restaurants',
    description: '品味海岛风味'
  },
  {
    id: 'accommodation',
    title: '精品民宿',
    icon: Home,
    href: '/accommodations',
    description: '舒适住宿体验'
  },
  {
    id: 'transport',
    title: '交通指南',
    icon: Car,
    href: '/transport',
    description: '便捷出行攻略'
  }
]

export default function QuickNavigation() {
  return (
    <div className="animate-fade-in-up">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-500">
        <div className="flex space-x-4">
          {navItems.map((item, index) => {
            const IconComponent = item.icon
            return (
              <Link
                key={item.id}
                href={item.href}
                className="group flex flex-col items-center space-y-2 p-3 rounded-xl hover:bg-white/20 transition-all duration-300 min-w-[100px] hover:-translate-y-1"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className="bg-white/20 rounded-full p-3 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300 group-hover:rotate-3">
                  <IconComponent className="w-6 h-6 text-white group-hover:text-blue-200 transition-colors duration-300" />
                </div>
                <div className="text-center">
                  <h3 className="text-white font-medium text-sm group-hover:text-blue-200 transition-colors duration-300">{item.title}</h3>
                  <p className="text-white/70 text-xs mt-1 group-hover:text-white/90 transition-colors duration-300">{item.description}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}