'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLocale } from '@/components/providers/LocaleProvider'

interface CarouselSlide {
  id: number
  image: string
  title: string
  subtitle: string
  description: string
}

const slides: CarouselSlide[] = [
  {
    id: 1,
    image: '/images/hero-1.jpg',
    title: '平潭美景',
    subtitle: 'Pingtan Scenery',
    description: '探索平潭的自然之美'
  },
  {
    id: 2,
    image: '/images/hero-2.jpg',
    title: '海岛风光',
    subtitle: 'Island Views',
    description: '感受海岛独特的魅力'
  },
  {
    id: 3,
    image: '/images/hero-3.jpg',
    title: '旅游胜地',
    subtitle: 'Tourist Destination',
    description: '发现平潭的精彩之处'
  }
]

export default function HeroCarousel() {
  const { t } = useLocale()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // 自动轮播
  useEffect(() => {
    if (!isAutoPlaying) return
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    // 3秒后恢复自动播放
    setTimeout(() => setIsAutoPlaying(true), 3000)
  }

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 3000)
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 3000)
  }

  return (
    <div className="relative w-full h-9 overflow-hidden">
      {/* 大图轮播 */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-105'
            }`}
          >
            <div className="relative w-full h-full">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover transition-transform duration-[10000ms] hover:scale-110"
                priority={index === 0}
                sizes="100vw"
              />
              {/* 轻微渐变遮罩用于文字可读性 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>
          </div>
        ))}
      </div>

      {/* 简化的标题区域 */}
      <div className="absolute bottom-32 left-8 right-8 md:left-16 md:right-16">
        <div className="text-white">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-2 drop-shadow-2xl">
            {slides[currentSlide].title}
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl opacity-90 drop-shadow-lg">
            {slides[currentSlide].subtitle}
          </p>
        </div>
      </div>

      {/* 大图轮播导航按钮 */}
      <div className="group">
        <button
          onClick={goToPrevious}
          className="absolute left-8 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full p-4 transition-all duration-300 opacity-0 group-hover:opacity-100"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-8 h-8 text-white hover:scale-110 transition-transform" />
        </button>
        
        <button
          onClick={goToNext}
          className="absolute right-8 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full p-4 transition-all duration-300 opacity-0 group-hover:opacity-100"
          aria-label="Next slide"
        >
          <ChevronRight className="w-8 h-8 text-white hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* 大图轮播指示器 */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex space-x-4">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 ${
              index === currentSlide
                ? 'w-12 h-1 bg-white rounded-full'
                : 'w-4 h-4 bg-white/60 hover:bg-white/80 rounded-full'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* 向下滚动提示 */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/80 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </div>
  )
}