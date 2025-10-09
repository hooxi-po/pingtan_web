export type Accommodation = {
  id: number
  name: string
  type: string
  location: string
  rating: number
  reviews: number
  price: number
  originalPrice: number
  image: string
  tags: string[]
  distance: string
  address?: string
  phone?: string
}

export type Attraction = {
  id: number
  name: string
  type: string
  image: string
  rating: number
  reviews: number
  price: string
  duration: string
  distance: string
  tags: string[]
  description: string
}

export type Restaurant = {
  id: number
  name: string
  category: string
  image: string
  rating: number
  reviews: number
  avgPrice: string
  distance: string
  tags: string[]
  description: string
  specialty: string
  address?: string
  phone?: string
}

export type User = {
  id: number
  name: string
  email: string
  phone: string | null
}

export type Session = {
  token: string
  userId: number
  expiresAt: Date
}

// 订单类型定义
export type OrderBase = {
  id: number
  userId: number
  type: "accommodation" | "food" | "attraction"
  itemId: number
  itemName: string
  image?: string
  status: "待付款" | "待使用" | "已完成" | "已取消"
  totalPrice: number
  orderDate: string
  address?: string
  phone?: string
}

export type AccommodationOrder = OrderBase & {
  type: "accommodation"
  roomType?: string
  checkIn: string
  checkOut: string
  nights: number
  guests: number
  rooms: number
}

export type FoodOrder = OrderBase & {
  type: "food"
  date: string
  time: string
  guests: number
}

export type AttractionOrder = OrderBase & {
  type: "attraction"
  date: string
  guests: number
}

export type Order = AccommodationOrder | FoodOrder | AttractionOrder