import type React from "react"
import { Navigation, Camera, Compass, Route } from "lucide-react"

export interface NearbyAttraction {
  id: number
  name: string
  distance: string
  walkTime: string
  rating: number
  category: string
  description: string
  isOpen: boolean
  phone?: string
}

export const nearbyAttractionsData: NearbyAttraction[] = [
  {
    id: 1,
    name: "坛南湾海滩",
    distance: "0.5km",
    walkTime: "6分钟",
    rating: 4.8,
    category: "海滩",
    description: "观赏蓝眼泪的最佳地点",
    isOpen: true,
    phone: "0591-12345678",
  },
  {
    id: 2,
    name: "石头厝古村",
    distance: "1.2km",
    walkTime: "15分钟",
    rating: 4.7,
    category: "文化古迹",
    description: "传统闽南建筑群",
    isOpen: true,
    phone: "0591-87654321",
  },
  {
    id: 3,
    name: "平潭海鲜市场",
    distance: "0.8km",
    walkTime: "10分钟",
    rating: 4.6,
    category: "美食购物",
    description: "新鲜海鲜和特产",
    isOpen: true,
    phone: "0591-11223344",
  },
]

export type LocationServiceItem = {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  action: string
}

export const locationServicesData: LocationServiceItem[] = [
  { icon: Navigation, title: "实时导航", description: "精准GPS导航，避开拥堵路段", action: "开始导航" },
  { icon: Camera, title: "AR实景", description: "增强现实景点介绍和拍照", action: "启动AR" },
  { icon: Compass, title: "周边探索", description: "发现附近隐藏的美景和美食", action: "开始探索" },
  { icon: Route, title: "路线规划", description: "智能规划最优游览路线", action: "规划路线" },
]