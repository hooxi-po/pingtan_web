import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
import { GeminiService } from '@/lib/gemini'
import { prisma } from '@/lib/db'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatRequest {
  message: string
  history?: ChatMessage[]
  locale?: string
}

// 景点推荐数据
const attractionsData = {
  zh: [
    { name: '石牌洋景区', type: '自然景观', description: '海上双塔奇观，平潭标志性景点' },
    { name: '龙凤头海滨浴场', type: '海滩', description: '优质沙滩，适合游泳和日光浴' },
    { name: '坛南湾', type: '海湾', description: '绝美日落观赏地，摄影爱好者天堂' },
    { name: '北港村', type: '古村落', description: '石头厝建筑群，体验闽南传统文化' },
    { name: '东海仙境', type: '自然景观', description: '海蚀地貌奇观，仙境般的自然美景' },
    { name: '将军山', type: '山岳', description: '登高望远，俯瞰平潭全景' },
    { name: '海坛古城', type: '文化景区', description: '仿古建筑群，品尝地道小吃' }
  ],
  en: [
    { name: 'Shipaiyang Scenic Area', type: 'Natural Landscape', description: 'Twin towers on the sea, iconic attraction of Pingtan' },
    { name: 'Longfengtou Beach', type: 'Beach', description: 'Quality beach perfect for swimming and sunbathing' },
    { name: 'Tannan Bay', type: 'Bay', description: 'Stunning sunset viewing spot, paradise for photographers' },
    { name: 'Beigang Village', type: 'Ancient Village', description: 'Stone house architecture, experience traditional Minnan culture' },
    { name: 'Donghai Fairyland', type: 'Natural Landscape', description: 'Sea erosion landforms, fairyland-like natural beauty' },
    { name: 'General Mountain', type: 'Mountain', description: 'Climb high for panoramic views of Pingtan' },
    { name: 'Haitan Ancient City', type: 'Cultural Area', description: 'Antique architecture complex, taste authentic local snacks' }
  ]
}

// 民宿推荐数据
const accommodationsData = {
  zh: [
    { name: '海景度假民宿', type: '海景房', price: '200-400', description: '面朝大海，春暖花开的浪漫体验' },
    { name: '石头厝特色民宿', type: '传统建筑', price: '150-300', description: '体验当地传统石头建筑文化' },
    { name: '现代精品民宿', type: '现代风格', price: '300-500', description: '现代化设施，舒适便利' },
    { name: '渔村风情民宿', type: '渔村体验', price: '100-250', description: '感受淳朴的渔村生活' }
  ],
  en: [
    { name: 'Ocean View Resort B&B', type: 'Sea View', price: '¥200-400', description: 'Romantic experience facing the sea with spring blooms' },
    { name: 'Stone House Heritage B&B', type: 'Traditional', price: '¥150-300', description: 'Experience local traditional stone architecture culture' },
    { name: 'Modern Boutique B&B', type: 'Modern Style', price: '¥300-500', description: 'Modern facilities, comfortable and convenient' },
    { name: 'Fishing Village B&B', type: 'Village Experience', price: '¥100-250', description: 'Feel the simple fishing village life' }
  ]
}

// 美食推荐数据
const restaurantsData = {
  zh: [
    { name: '时来运转', type: '传统小吃', specialty: '海蛎煎', description: '平潭最著名的传统小吃' },
    { name: '鱼丸世家', type: '海鲜', specialty: '鱼丸汤', description: '新鲜鱼肉制作的Q弹鱼丸' },
    { name: '海鲜大排档', type: '海鲜', specialty: '各类海鲜', description: '新鲜捕捞的各种海鲜' },
    { name: '紫菜汤馆', type: '汤品', specialty: '紫菜汤', description: '当地特色紫菜制作的营养汤品' }
  ],
  en: [
    { name: 'Shi Lai Yun Zhuan', type: 'Traditional Snack', specialty: 'Oyster Omelet', description: 'Most famous traditional snack in Pingtan' },
    { name: 'Fish Ball House', type: 'Seafood', specialty: 'Fish Ball Soup', description: 'Bouncy fish balls made from fresh fish' },
    { name: 'Seafood Street Stall', type: 'Seafood', specialty: 'Various Seafood', description: 'Freshly caught various seafood' },
    { name: 'Seaweed Soup House', type: 'Soup', specialty: 'Seaweed Soup', description: 'Nutritious soup made from local seaweed' }
  ]
}

// 行程推荐模板
const itineraryTemplates = {
  zh: {
    '1day': {
      title: '平潭一日游',
      schedule: [
        { time: '09:00-11:00', activity: '石牌洋景区', description: '欣赏海上双塔奇观' },
        { time: '11:30-12:30', activity: '海坛古城', description: '品尝地道小吃' },
        { time: '14:00-16:00', activity: '龙凤头海滨浴场', description: '海滩休闲' },
        { time: '16:30-18:00', activity: '坛南湾', description: '观赏日落' }
      ]
    },
    '2day': {
      title: '平潭两日游',
      day1: [
        { time: '09:00-11:00', activity: '石牌洋景区', description: '海上奇观' },
        { time: '14:00-17:00', activity: '龙凤头海滨浴场', description: '海滩活动' },
        { time: '17:30-19:00', activity: '坛南湾', description: '日落晚餐' }
      ],
      day2: [
        { time: '09:00-11:30', activity: '北港村', description: '石头厝文化' },
        { time: '14:00-16:00', activity: '东海仙境', description: '自然奇观' },
        { time: '16:30-18:00', activity: '将军山', description: '登高望远' }
      ]
    },
    '3day': {
      title: '平潭三日深度游',
      day1: [
        { time: '09:00-11:00', activity: '石牌洋景区', description: '标志性景点打卡' },
        { time: '14:00-17:00', activity: '龙凤头海滨浴场', description: '海滩休闲娱乐' },
        { time: '17:30-19:00', activity: '海坛古城', description: '品尝美食，夜游古城' }
      ],
      day2: [
        { time: '08:30-11:00', activity: '北港村', description: '体验石头厝文化' },
        { time: '14:00-16:30', activity: '东海仙境', description: '探索海蚀地貌' },
        { time: '17:00-18:30', activity: '坛南湾', description: '观赏绝美日落' }
      ],
      day3: [
        { time: '09:00-11:00', activity: '将军山', description: '登山观景' },
        { time: '14:00-16:00', activity: '猴研岛', description: '海岛探险' },
        { time: '16:30-18:00', activity: '返程购物', description: '采购特产纪念品' }
      ]
    }
  },
  en: {
    '1day': {
      title: 'Pingtan One-Day Tour',
      schedule: [
        { time: '09:00-11:00', activity: 'Shipaiyang Scenic Area', description: 'Admire the twin towers on the sea' },
        { time: '11:30-12:30', activity: 'Haitan Ancient City', description: 'Taste authentic local snacks' },
        { time: '14:00-16:00', activity: 'Longfengtou Beach', description: 'Beach leisure' },
        { time: '16:30-18:00', activity: 'Tannan Bay', description: 'Watch the sunset' }
      ]
    },
    '2day': {
      title: 'Pingtan Two-Day Tour',
      day1: [
        { time: '09:00-11:00', activity: 'Shipaiyang Scenic Area', description: 'Sea wonders' },
        { time: '14:00-17:00', activity: 'Longfengtou Beach', description: 'Beach activities' },
        { time: '17:30-19:00', activity: 'Tannan Bay', description: 'Sunset dinner' }
      ],
      day2: [
        { time: '09:00-11:30', activity: 'Beigang Village', description: 'Stone house culture' },
        { time: '14:00-16:00', activity: 'Donghai Fairyland', description: 'Natural wonders' },
        { time: '16:30-18:00', activity: 'General Mountain', description: 'Climb for views' }
      ]
    },
    '3day': {
      title: 'Pingtan Three-Day Deep Tour',
      day1: [
        { time: '09:00-11:00', activity: 'Shipaiyang Scenic Area', description: 'Iconic attraction check-in' },
        { time: '14:00-17:00', activity: 'Longfengtou Beach', description: 'Beach leisure and entertainment' },
        { time: '17:30-19:00', activity: 'Haitan Ancient City', description: 'Taste food, night tour of ancient city' }
      ],
      day2: [
        { time: '08:30-11:00', activity: 'Beigang Village', description: 'Experience stone house culture' },
        { time: '14:00-16:30', activity: 'Donghai Fairyland', description: 'Explore sea erosion landforms' },
        { time: '17:00-18:30', activity: 'Tannan Bay', description: 'Watch stunning sunset' }
      ],
      day3: [
        { time: '09:00-11:00', activity: 'General Mountain', description: 'Mountain climbing and sightseeing' },
        { time: '14:00-16:00', activity: 'Houyan Island', description: 'Island adventure' },
        { time: '16:30-18:00', activity: 'Return shopping', description: 'Buy specialty souvenirs' }
      ]
    }
  }
}

// AI 回复生成函数 - 使用 Gemini AI
async function generateAIResponse(message: string, locale: string = 'zh'): Promise<string> {
  try {
    const lowerMessage = message.toLowerCase()
    const isZh = locale === 'zh'
    
    // 根据消息类型选择合适的 Gemini 服务方法
    if (lowerMessage.includes(isZh ? '景点' : 'attraction') || 
        lowerMessage.includes(isZh ? '推荐' : 'recommend') && lowerMessage.includes(isZh ? '地方' : 'place')) {
      return await GeminiService.generateAttractionRecommendation(message)
    }
  
    // 民宿推荐
    if (lowerMessage.includes(isZh ? '民宿' : 'accommodation') || 
        lowerMessage.includes(isZh ? '住宿' : 'stay') || 
        lowerMessage.includes('hotel')) {
      return await GeminiService.generateAccommodationRecommendation()
    }
  
    // 美食推荐
    if (lowerMessage.includes(isZh ? '美食' : 'food') || 
        lowerMessage.includes(isZh ? '吃' : 'eat') || 
        lowerMessage.includes('restaurant')) {
      return await GeminiService.generateFoodRecommendation(message)
    }
  
    // 行程规划
    if (lowerMessage.includes(isZh ? '行程' : 'itinerary') || 
        lowerMessage.includes(isZh ? '计划' : 'plan') || 
        lowerMessage.includes(isZh ? '天' : 'day')) {
      
      let days: number | undefined
      if (lowerMessage.includes('1') || lowerMessage.includes(isZh ? '一天' : 'one day')) days = 1
      else if (lowerMessage.includes('2') || lowerMessage.includes(isZh ? '两天' : 'two day')) days = 2
      else if (lowerMessage.includes('3') || lowerMessage.includes(isZh ? '三天' : 'three day')) days = 3
      
      return await GeminiService.generateItineraryRecommendation(days, message)
    }
  
    // 对于其他所有问题，使用 Gemini AI 生成智能回复
    return await GeminiService.generateResponse(message)
    
  } catch (error) {
    console.error('AI回复生成失败:', error)
    const isZh = locale === 'zh'
    return isZh 
      ? '抱歉，智能助手暂时不可用，请稍后再试。'
      : 'Sorry, the AI assistant is temporarily unavailable. Please try again later.'
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { message, locale = 'zh' } = body

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: locale === 'zh' ? '消息不能为空' : 'Message cannot be empty' },
        { status: 400 }
      )
    }

    // 生成AI回复
    const response = await generateAIResponse(message, locale)
    
    // 生成建议
    const suggestions = locale === 'zh' 
      ? ['查看景点详情', '寻找附近民宿', '推荐特色美食', '制定行程计划']
      : ['View attraction details', 'Find nearby accommodations', 'Recommend specialties', 'Plan itinerary']

    return NextResponse.json({
      response,
      suggestions,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Chat API is running' },
    { status: 200 }
  )
}