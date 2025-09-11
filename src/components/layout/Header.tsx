'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'
import { Menu, X, Globe, MapPin, Home, Building2, UtensilsCrossed, Search, Waves } from 'lucide-react'
import { useLocale } from '../providers/LocaleProvider'

export default function Header() {
  const { locale, setLocale } = useLocale()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: locale === 'zh' ? '首页' : 'Home', href: '/', icon: Home },
    { name: locale === 'zh' ? '景点' : 'Attractions', href: '/attractions', icon: MapPin },
    { name: locale === 'zh' ? '民宿' : 'Accommodations', href: '/accommodations', icon: Building2 },
    { name: locale === 'zh' ? '美食地图' : 'Food Map', href: '/food', icon: UtensilsCrossed },
    { name: locale === 'zh' ? '蓝眼泪专区' : 'Blue Tears', href: '/blue-tears', icon: Waves },
    { name: locale === 'zh' ? '天气预报' : 'Weather', href: '/weather', icon: Globe },
    { name: locale === 'zh' ? '新闻资讯' : 'News', href: '/news', icon: Globe }
  ]

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <MapPin className="h-8 w-8 text-white" />
              <span className="text-xl font-bold text-white">
                {locale === 'zh' ? '平潭旅游' : 'Pingtan Tourism'}
              </span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-blue-300" />
              </div>
              <input
                type="text"
                placeholder={locale === 'zh' ? '搜索景点、美食、住宿...' : 'Search attractions, food, hotels...'}
                className="block w-full pl-10 pr-3 py-2 border border-blue-500 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList>
                {navigation.map((item) => (
                  <NavigationMenuItem key={item.name}>
                    <Link href={item.href} className="group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white focus:outline-none">
                      {item.name}
                    </Link>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-blue-500 text-blue-600 hover:bg-blue-100 hover:text-blue-700">
                  <Globe className="h-4 w-5 mr-2" />
                  {locale === 'zh' ? '中文' : 'EN'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setLocale?.('zh')}>
                  中文
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocale?.('en')}>
                  English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>



            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white hover:bg-white/10"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          {/* Mobile Search */}
          <div className="px-4 pt-2 pb-3 border-t border-blue-500">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-blue-300" />
              </div>
              <input
                type="text"
                placeholder={locale === 'zh' ? '搜索...' : 'Search...'}
                className="block w-full pl-10 pr-3 py-2 border border-blue-500 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
              />
            </div>
          </div>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigation.map((item, index) => {
              const IconComponent = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex items-center px-3 py-3 text-base font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <IconComponent className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </header>
  )
}