'use client';


import FloatingChatAssistant from '@/components/home/FloatingChatAssistant'
import BottomNavigation from '@/components/home/BottomNavigation'
import HeroSection from '@/components/home/HeroSection'
import AttractionsSection from '@/components/home/AttractionsSection'
import BlueTearsSection from '@/components/home/BlueTearsSection'
import FoodSection from '@/components/home/FoodSection'



export default function Home() {

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 大图轮播 */}
      <HeroSection />
      
      {/* 景点展示区域 */}
      <AttractionsSection />
      
      {/* 蓝眼泪特色区域 */}
      <BlueTearsSection />
      
      {/* 美食推荐区域 */}
      <FoodSection />
      

      
      {/* 悬浮AI助手 */}
      <FloatingChatAssistant />
      
      {/* 底部导航菜单 */}
      <BottomNavigation />
    </div>
  )
}
