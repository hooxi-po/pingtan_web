'use client'

import { Home, MapPin, Utensils, Building2, Calendar, Phone, Info, FileText, Waves } from 'lucide-react'
import Link from 'next/link'

interface NavItem {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  color: string
}

const navItems: NavItem[] = [
  {
    id: 'home',
    title: '首页',
    icon: Home,
    href: '/',
    color: 'text-blue-600'
  },
  {
    id: 'attractions',
    title: '景点推荐',
    icon: MapPin,
    href: '/attractions',
    color: 'text-green-600'
  },
  {
    id: 'blue-tears',
    title: '蓝眼泪专区',
    icon: Waves,
    href: '/blue-tears',
    color: 'text-cyan-600'
  },
  {
    id: 'accommodations',
    title: '住宿服务',
    icon: Building2,
    href: '/accommodations',
    color: 'text-purple-600'
  },
  {
    id: 'itinerary',
    title: '行程规划',
    icon: Calendar,
    href: '/itinerary',
    color: 'text-pink-600'
  },
  {
    id: 'news',
    title: '旅游资讯',
    icon: FileText,
    href: '/news',
    color: 'text-indigo-600'
  },
  {
    id: 'contact',
    title: '联系我们',
    icon: Phone,
    href: '/contact',
    color: 'text-red-600'
  },
  {
    id: 'about',
    title: '关于平潭',
    icon: Info,
    href: '/about',
    color: 'text-teal-600'
  }
]

export default function BottomNavigation() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="bg-white/90 backdrop-blur-md border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-4 lg:grid-cols-8 gap-1 py-3">
            {navItems.map((item) => {
              const IconComponent = item.icon
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-100/80 transition-all duration-300 min-h-[70px]"
                >
                  <div className="mb-1 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className={`w-5 h-5 ${item.color} group-hover:opacity-80`} />
                  </div>
                  <span className="text-xs text-gray-700 group-hover:text-gray-900 text-center leading-tight">
                    {item.title}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}