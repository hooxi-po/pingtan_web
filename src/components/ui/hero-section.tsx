"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Camera, Star, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"

export default function HeroSection() {
  // 自动轮播状态与图片数据（使用 public 目录下的规范命名图片路径）
  const slides = [
    "/hero-slide-1.png",
    "/hero-slide-2.png",
    "/hero-windmill.png",
  ]
  const [index, setIndex] = useState(0)

  const handlePrev = () => setIndex((i) => (i - 1 + slides.length) % slides.length)
  const handleNext = () => setIndex((i) => (i + 1) % slides.length)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 背景轮播图 */}
      <div className="absolute inset-0 z-0">
        <div className="relative w-full h-full">
          {slides.map((src, i) => (
            <Image
              key={i}
              src={src}
              alt={`首页轮播图 ${i + 1}`}
              fill
              priority={i === 0}
              className={`object-cover transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
            />
          ))}

          {/* 轻微遮罩以保证文字可读性 */}
          <div className="absolute inset-0 z-10 bg-black/30" />

          {/* 手动导航 - 左右切换按钮 */}
          <button
            aria-label="上一张"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/40 hover:bg-white/60 text-black rounded-full p-2 backdrop-blur"
            onClick={handlePrev}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            aria-label="下一张"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/40 hover:bg-white/60 text-black rounded-full p-2 backdrop-blur"
            onClick={handleNext}
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* 底部圆点导航 */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`跳转到第${i + 1}张`}
                onClick={() => setIndex(i)}
                className={`h-2.5 w-2.5 rounded-full transition-colors ${i === index ? "bg-white" : "bg-white/50 hover:bg-white/70"}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="relative z-20 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <Badge variant="secondary" className="mb-6 rounded-full bg-white/30 text-white border border-white/40 backdrop-blur-md px-3 py-1.5">
            <Star className="w-4 h-4 mr-2" />
            国家级海岛旅游度假区
          </Badge>

          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
            探索
            <span className="bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
              平潭
            </span>
            <br />
            海岛乡村之美
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-2xl mx-auto leading-relaxed">
            蓝眼泪奇观 · 石头厝古韵 · 环岛路风光
            <br />
            体验独特的海岛乡村文化与自然风光
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <Button size="lg" className="rounded-2xl text-lg px-8 py-6 shadow-md shadow-black/10 hover:shadow-lg hover:shadow-black/20 transition-all" asChild>
              <Link href="/attractions">
                <MapPin className="w-5 h-5 mr-2" />
                发现景点
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-2xl border-white/70 text-white bg-white/10 hover:bg-white/20 hover:text-white backdrop-blur-md text-lg px-8 py-6 transition-all" asChild>
              <Link href="/itinerary">
                <Calendar className="w-5 h-5 mr-2" />
                规划行程
              </Link>
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
              <div className="w-12 h-12 bg-blue-500/90 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-sm">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">蓝眼泪奇观</h3>
              <p className="text-blue-100 text-sm">
                4-8月最佳观赏期，体验大自然的神奇发光现象
              </p>
            </div>

            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
              <div className="w-12 h-12 bg-purple-500/90 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-sm">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">石头厝文化</h3>
              <p className="text-blue-100 text-sm">
                传统闽南建筑，感受海岛独特的历史文化底蕴
              </p>
            </div>

            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
              <div className="w-12 h-12 bg-green-500/90 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-sm">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">环岛自驾</h3>
              <p className="text-blue-100 text-sm">
                68公里海岸线，最美自驾路线尽览海岛风光
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-bounce" />
        </div>
      </div>
    </section>
  )
}