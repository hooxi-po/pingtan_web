'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, MapPin, Building2, UtensilsCrossed, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLocale } from '../providers/LocaleProvider'
import WeatherWidget from '../weather/WeatherWidget'
import { Skeleton } from '@/components/ui/skeleton'

const heroImages = [
  '/images/hero-1.jpg',
  '/images/hero-2.jpg',
  '/images/hero-3.jpg',
]

export default function HeroSection() {
  const { t } = useLocale()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>(new Array(heroImages.length).fill(false))
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // 搜索建议数据
  const searchSuggestions = [
    '平潭岛', '石牌洋', '龙凤头海滨浴场', '坛南湾', '海坛古城',
    '北港村', '磹水风韵园', '君山', '将军山', '东海仙境',
    '平潭美食', '海鲜', '民宿', '酒店', '景点攻略'
  ]

  // 预加载图片
  useEffect(() => {
    heroImages.forEach((src, index) => {
      const img = new window.Image()
      img.onload = () => {
        setImagesLoaded(prev => {
          const newLoaded = [...prev]
          newLoaded[index] = true
          return newLoaded
        })
      }
      img.src = src
    })
  }, [])

  // 自动轮播
  useEffect(() => {
    if (isAutoPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
      }, 5000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isAutoPlaying])

  // 手动切换函数
  const goToSlide = (index: number) => {
    setCurrentImageIndex(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000) // 10秒后恢复自动播放
  }

  const nextSlide = () => {
    goToSlide((currentImageIndex + 1) % heroImages.length)
  }

  const prevSlide = () => {
    goToSlide((currentImageIndex - 1 + heroImages.length) % heroImages.length)
  }

  // 触摸事件处理
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    
    const distance = touchStartX.current - touchEndX.current
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      nextSlide()
    } else if (isRightSwipe) {
      prevSlide()
    }
  }

  // 搜索建议处理
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    
    if (value.trim()) {
      const filteredSuggestions = searchSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5)
      setSuggestions(filteredSuggestions)
      setShowSuggestions(filteredSuggestions.length > 0)
    } else {
      setShowSuggestions(false)
      setSuggestions([])
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion)
    setShowSuggestions(false)
    // 执行搜索
    performSearch(suggestion)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setShowSuggestions(false)
      performSearch(searchQuery)
    }
  }

  const performSearch = (query: string) => {
    // 跳转到搜索结果页面
    window.location.href = `/attractions?search=${encodeURIComponent(query)}`
  }

  // 点击外部关闭建议
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <section 
      className="relative h-[60vh] md:h-[80vh] flex items-center justify-center overflow-hidden group hero-bg"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 背景图片轮播 */}
      <div className="absolute inset-0 z-0">
        {heroImages.map((image, index) => (
          <div
            key={image}
            className={`absolute inset-0 transition-all duration-1000 ${
              index === currentImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            {imagesLoaded[index] ? (
            <Image
              src={image}
              alt={`平潭风景 ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
              quality={90}
            />
          ) : (
            <div className="w-full h-full">
              <Skeleton className="w-full h-full bg-gradient-to-br from-blue-400/20 to-blue-600/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white/60 text-lg font-medium animate-pulse">
                  加载中...
                </div>
              </div>
            </div>
          )}
            {/* 改进的渐变遮罩，参考HTML设计 */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/10" />
          </div>
        ))}
      </div>

      {/* 导航按钮 */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
        aria-label="上一张图片"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
        aria-label="下一张图片"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* 天气组件 */}
      <div className="absolute top-4 right-4 z-20 hidden md:block">
        <WeatherWidget className="bg-white/90 backdrop-blur-sm" />
      </div>

      {/* 内容 */}
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg animate-fade-in-up">
          风之岛，海之梦
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto drop-shadow mb-8 animate-fade-in-up animation-delay-200">
          探索中国的&ldquo;马尔代夫&rdquo;，感受石厝的温度，追逐传说中的蓝眼泪。
        </p>

        {/* 搜索框 */}
        <div className="max-w-2xl mx-auto mb-8 animate-fade-in-up animation-delay-400">
          <form onSubmit={handleSearch} className="flex">
            <div className="relative flex-1 group" ref={searchInputRef}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 transition-colors group-focus-within:text-blue-500" />
              <Input
                type="text"
                placeholder={t('attractions.searchPlaceholder')}
                value={searchQuery}
                onChange={handleSearchInputChange}
                onFocus={() => searchQuery.trim() && suggestions.length > 0 && setShowSuggestions(true)}
                className="pl-10 pr-4 py-3 text-lg bg-white/90 backdrop-blur-sm border-0 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 hover:bg-white/95 hover:shadow-lg"
              />
              
              {/* 搜索建议下拉列表 */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 z-50 max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors duration-200 flex items-center space-x-2 text-gray-700 hover:text-blue-600"
                    >
                      <Search className="w-4 h-4 text-gray-400" />
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button type="submit" size="lg" className="ml-2 px-8 hover:scale-105 active:scale-95 transition-all duration-200 hover:shadow-xl">
              {t('common.search')}
            </Button>
          </form>
        </div>

        {/* 主要行动按钮 */}
        <div className="mb-8 animate-fade-in-up animation-delay-600">
          <Link href="/attractions">
            <Button size="lg" className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-blue-700 transition-transform hover:scale-105 shadow-lg">
              开启探索之旅
            </Button>
          </Link>
        </div>
        
        {/* 快速导航 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto animate-fade-in-up animation-delay-600">
          <Link href="/attractions">
            <Button variant="outline" size="lg" className="w-full bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:scale-110 hover:shadow-lg transition-all duration-300 group">
              <MapPin className="mr-2 h-5 w-5 group-hover:animate-bounce" />
              热门景点
            </Button>
          </Link>
          <Link href="/accommodations">
            <Button variant="outline" size="lg" className="w-full bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:scale-110 hover:shadow-lg transition-all duration-300 group">
              <Building2 className="mr-2 h-5 w-5 group-hover:animate-pulse" />
              住宿服务
            </Button>
          </Link>
          <Link href="/restaurants">
            <Button variant="outline" size="lg" className="w-full bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:scale-110 hover:shadow-lg transition-all duration-300 group">
              <UtensilsCrossed className="mr-2 h-5 w-5 group-hover:animate-spin" />
              地道美食
            </Button>
          </Link>
        </div>
      </div>

      {/* 轮播指示器 */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentImageIndex
                ? 'bg-white scale-125'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`切换到第 ${index + 1} 张图片`}
          />
        ))}
      </div>

      {/* 滚动提示 */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  )
}