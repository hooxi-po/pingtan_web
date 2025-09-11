'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Clock, MapPin, Calendar } from 'lucide-react'
import { useScrollReveal } from '@/hooks/useScrollReveal'

export default function BlueTearsSection() {
  // 启用滚动动画
  useScrollReveal()

  return (
    <section id="blue-tears" className="py-16 md:py-24 bg-gray-900 text-white">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
        <div className="md:w-1/2 scroll-reveal">
          <span className="text-blue-400 font-semibold text-sm uppercase tracking-wide">
            自然奇观
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
            追逐奇幻蓝眼泪
          </h2>
          <p className="text-gray-300 leading-relaxed mb-6 text-lg">
            每年4月至8月，平潭的海域便会上演一场视觉盛宴。夜光藻汇聚在海岸线，随着波浪发出幽蓝色的光芒，如同星辰坠入大海，梦幻而神秘。
          </p>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-start space-x-4">
              <Clock className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-white mb-1">最佳观赏期</h4>
                <p className="text-gray-400">4月 - 8月，农历初一、十五前后</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <MapPin className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-white mb-1">最佳观赏地点</h4>
                <p className="text-gray-400">坛南湾、龙凤头海滨浴场、北港村海岸</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <Calendar className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-white mb-1">观赏时间</h4>
                <p className="text-gray-400">晚上8点至凌晨2点，无月夜最佳</p>
              </div>
            </div>
          </div>
          
          <Link href="/attractions/blue-tears">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
              了解更多
            </button>
          </Link>
        </div>
        
        <div className="md:w-1/2 h-64 md:h-80 rounded-lg overflow-hidden shadow-2xl scroll-reveal" style={{ transitionDelay: '150ms' }}>
          <div className="relative w-full h-full">
            <Image
              src="/images/attractions/blue-tears.svg"
              alt="平潭蓝眼泪奇观"
              fill
              className="object-cover hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent" />
            
            {/* 装饰性光效 */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4">
                <p className="text-white text-sm font-medium">
                  "海上生明月，天涯共此时" - 平潭蓝眼泪
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 底部装饰波浪 */}
      <div className="mt-16 relative">
        <svg className="w-full h-16 text-white" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="currentColor"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="currentColor"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="currentColor"></path>
        </svg>
      </div>
    </section>
  )
}