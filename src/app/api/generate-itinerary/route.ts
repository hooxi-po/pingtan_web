import { NextRequest, NextResponse } from 'next/server'

interface GenerateItineraryRequest {
  days: number
  budget: number
  interests: string[]
  groupSize: number
  travelStyle: 'relaxed' | 'active' | 'cultural' | 'adventure'
  locale?: string
}

interface ItineraryItem {
  time: string
  activity: string
  location: string
  description: string
  estimatedCost: number
  duration: string
  tips?: string
}

interface GeneratedItinerary {
  title: string
  description: string
  totalBudget: number
  days: { [key: number]: ItineraryItem[] }
  recommendations: {
    accommodations: any[]
    restaurants: any[]
    transportation: string
  }
}

// 景点数据库
const attractions = {
  natural: [
    { id: 1, name: '石牌洋景区', nameEn: 'Shipaiyang Scenic Area', type: 'natural', cost: 30, duration: '2-3h', rating: 4.8, tags: ['photography', 'sightseeing'] },
    { id: 2, name: '坛南湾', nameEn: 'Tannan Bay', type: 'natural', cost: 0, duration: '2-3h', rating: 4.9, tags: ['sunset', 'photography', 'romantic'] },
    { id: 3, name: '东海仙境', nameEn: 'Donghai Fairyland', type: 'natural', cost: 25, duration: '2-3h', rating: 4.7, tags: ['adventure', 'photography'] },
    { id: 4, name: '将军山', nameEn: 'General Mountain', type: 'natural', cost: 20, duration: '3-4h', rating: 4.6, tags: ['hiking', 'panoramic'] }
  ],
  beach: [
    { id: 5, name: '龙凤头海滨浴场', nameEn: 'Longfengtou Beach', type: 'beach', cost: 0, duration: '3-4h', rating: 4.5, tags: ['swimming', 'relaxation', 'family'] },
    { id: 6, name: '长江澳风车田', nameEn: 'Changjiang Au Wind Farm', type: 'beach', cost: 0, duration: '1-2h', rating: 4.4, tags: ['photography', 'romantic'] }
  ],
  cultural: [
    { id: 7, name: '北港村', nameEn: 'Beigang Village', type: 'cultural', cost: 0, duration: '2-3h', rating: 4.6, tags: ['culture', 'architecture', 'photography'] },
    { id: 8, name: '海坛古城', nameEn: 'Haitan Ancient City', type: 'cultural', cost: 0, duration: '2-3h', rating: 4.3, tags: ['culture', 'food', 'shopping'] }
  ]
}

// 住宿推荐
const accommodations = {
  budget: [
    { name: '渔村风情民宿', nameEn: 'Fishing Village B&B', price: 120, rating: 4.2, tags: ['authentic', 'budget'] },
    { name: '青年旅社', nameEn: 'Youth Hostel', price: 80, rating: 4.0, tags: ['social', 'budget'] }
  ],
  mid: [
    { name: '石头厝特色民宿', nameEn: 'Stone House Heritage B&B', price: 220, rating: 4.5, tags: ['traditional', 'comfortable'] },
    { name: '海景度假民宿', nameEn: 'Ocean View Resort B&B', price: 280, rating: 4.7, tags: ['seaview', 'romantic'] }
  ],
  luxury: [
    { name: '现代精品民宿', nameEn: 'Modern Boutique B&B', price: 450, rating: 4.8, tags: ['luxury', 'modern'] },
    { name: '五星海景酒店', nameEn: '5-Star Ocean View Hotel', price: 680, rating: 4.9, tags: ['luxury', 'service'] }
  ]
}

// 美食推荐
const restaurants = {
  local: [
    { name: '时来运转', nameEn: 'Shi Lai Yun Zhuan', specialty: '海蛎煎', specialtyEn: 'Oyster Omelet', avgCost: 35, rating: 4.6 },
    { name: '鱼丸世家', nameEn: 'Fish Ball House', specialty: '鱼丸汤', specialtyEn: 'Fish Ball Soup', avgCost: 25, rating: 4.5 }
  ],
  seafood: [
    { name: '海鲜大排档', nameEn: 'Seafood Street Stall', specialty: '各类海鲜', specialtyEn: 'Various Seafood', avgCost: 80, rating: 4.4 },
    { name: '渔港海鲜', nameEn: 'Fishing Port Seafood', specialty: '新鲜海鲜', specialtyEn: 'Fresh Seafood', avgCost: 120, rating: 4.7 }
  ]
}

// 智能行程生成算法
function generateSmartItinerary(params: GenerateItineraryRequest): GeneratedItinerary {
  const { days, budget, interests, groupSize, travelStyle, locale = 'zh' } = params
  const isZh = locale === 'zh'
  
  // 根据兴趣筛选景点
  const allAttractions = [...attractions.natural, ...attractions.beach, ...attractions.cultural]
  let selectedAttractions = allAttractions.filter(attr => 
    interests.some(interest => attr.tags.includes(interest))
  )
  
  // 如果筛选结果太少，添加高评分景点
  if (selectedAttractions.length < days * 2) {
    const remaining = allAttractions
      .filter(attr => !selectedAttractions.includes(attr))
      .sort((a, b) => b.rating - a.rating)
    selectedAttractions = [...selectedAttractions, ...remaining.slice(0, days * 2 - selectedAttractions.length)]
  }
  
  // 根据旅行风格调整
  if (travelStyle === 'relaxed') {
    selectedAttractions = selectedAttractions.filter(attr => !attr.tags.includes('adventure'))
  } else if (travelStyle === 'active') {
    selectedAttractions = selectedAttractions.filter(attr => 
      attr.tags.includes('hiking') || attr.tags.includes('adventure') || attr.tags.includes('swimming')
    )
  } else if (travelStyle === 'cultural') {
    selectedAttractions = selectedAttractions.filter(attr => 
      attr.type === 'cultural' || attr.tags.includes('culture')
    )
  }
  
  // 生成每日行程
  const dailyItinerary: { [key: number]: ItineraryItem[] } = {}
  let totalCost = 0
  
  for (let day = 1; day <= days; day++) {
    const dayAttractions = selectedAttractions.slice((day - 1) * 2, day * 2)
    dailyItinerary[day] = []
    
    // 上午景点
    if (dayAttractions[0]) {
      const morning = {
        time: '09:00-12:00',
        activity: isZh ? dayAttractions[0].name : dayAttractions[0].nameEn,
        location: isZh ? dayAttractions[0].name : dayAttractions[0].nameEn,
        description: isZh ? `游览${dayAttractions[0].name}，预计用时${dayAttractions[0].duration}` : `Visit ${dayAttractions[0].nameEn}, estimated duration ${dayAttractions[0].duration}`,
        estimatedCost: dayAttractions[0].cost * groupSize,
        duration: dayAttractions[0].duration,
        tips: isZh ? '建议早上前往，避开人流高峰' : 'Recommended to visit in the morning to avoid crowds'
      }
      dailyItinerary[day].push(morning)
      totalCost += morning.estimatedCost
    }
    
    // 午餐
    const lunchCost = budget > 200 ? 60 : 35
    const lunch = {
      time: '12:00-13:30',
      activity: isZh ? '品尝当地美食' : 'Taste Local Cuisine',
      location: isZh ? '当地餐厅' : 'Local Restaurant',
      description: isZh ? '享用平潭特色海鲜和小吃' : 'Enjoy Pingtan specialty seafood and snacks',
      estimatedCost: lunchCost * groupSize,
      duration: '1.5h'
    }
    dailyItinerary[day].push(lunch)
    totalCost += lunch.estimatedCost
    
    // 下午景点
    if (dayAttractions[1]) {
      const afternoon = {
        time: '14:00-17:00',
        activity: isZh ? dayAttractions[1].name : dayAttractions[1].nameEn,
        location: isZh ? dayAttractions[1].name : dayAttractions[1].nameEn,
        description: isZh ? `探索${dayAttractions[1].name}，感受独特魅力` : `Explore ${dayAttractions[1].nameEn}, feel its unique charm`,
        estimatedCost: dayAttractions[1].cost * groupSize,
        duration: dayAttractions[1].duration,
        tips: isZh ? '下午光线较好，适合拍照' : 'Good lighting in the afternoon, perfect for photography'
      }
      dailyItinerary[day].push(afternoon)
      totalCost += afternoon.estimatedCost
    }
    
    // 晚餐
    const dinnerCost = budget > 200 ? 80 : 50
    const dinner = {
      time: '18:00-19:30',
      activity: isZh ? '海鲜晚餐' : 'Seafood Dinner',
      location: isZh ? '海鲜餐厅' : 'Seafood Restaurant',
      description: isZh ? '品尝新鲜海鲜，体验渔港风情' : 'Taste fresh seafood, experience fishing port atmosphere',
      estimatedCost: dinnerCost * groupSize,
      duration: '1.5h'
    }
    dailyItinerary[day].push(dinner)
    totalCost += dinner.estimatedCost
  }
  
  // 住宿推荐
  let accommodationRecs = []
  if (budget <= 150) {
    accommodationRecs = accommodations.budget
  } else if (budget <= 300) {
    accommodationRecs = accommodations.mid
  } else {
    accommodationRecs = accommodations.luxury
  }
  
  // 餐厅推荐
  const restaurantRecs = budget > 200 ? restaurants.seafood : restaurants.local
  
  return {
    title: isZh ? `平潭${days}日${travelStyle === 'relaxed' ? '悠闲' : travelStyle === 'active' ? '活力' : travelStyle === 'cultural' ? '文化' : '探险'}之旅` : `Pingtan ${days}-Day ${travelStyle.charAt(0).toUpperCase() + travelStyle.slice(1)} Tour`,
    description: isZh ? `为您精心定制的${days}天平潭旅行计划，预算${budget}元/人，适合${groupSize}人出行` : `Carefully customized ${days}-day Pingtan travel plan, budget ¥${budget}/person, suitable for ${groupSize} people`,
    totalBudget: totalCost,
    days: dailyItinerary,
    recommendations: {
      accommodations: accommodationRecs,
      restaurants: restaurantRecs,
      transportation: isZh ? '建议租车或包车游览，岛内交通便利' : 'Recommend car rental or chartered car tours, convenient island transportation'
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateItineraryRequest = await request.json()
    const { days, budget, interests, groupSize, travelStyle, locale = 'zh' } = body

    // 参数验证
    if (!days || days < 1 || days > 7) {
      return NextResponse.json(
        { error: locale === 'zh' ? '天数必须在1-7天之间' : 'Days must be between 1-7' },
        { status: 400 }
      )
    }

    if (!budget || budget < 50) {
      return NextResponse.json(
        { error: locale === 'zh' ? '预算不能少于50元' : 'Budget cannot be less than ¥50' },
        { status: 400 }
      )
    }

    if (!groupSize || groupSize < 1 || groupSize > 20) {
      return NextResponse.json(
        { error: locale === 'zh' ? '人数必须在1-20人之间' : 'Group size must be between 1-20 people' },
        { status: 400 }
      )
    }

    // 生成行程
    const itinerary = generateSmartItinerary(body)

    return NextResponse.json({
      success: true,
      data: itinerary,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Generate itinerary API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Generate Itinerary API is running' },
    { status: 200 }
  )
}