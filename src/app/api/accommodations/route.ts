import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 缓存配置
const CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存
let cachedData: any = null
let cacheTimestamp = 0

/**
 * GET /api/accommodations
 * 获取住宿列表，支持搜索和筛选（数据库版本）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const searchQuery = searchParams.get('search') || ''
    const type = searchParams.get('type') || 'all'
    const location = searchParams.get('location') || 'all'
    const priceRange = searchParams.get('priceRange') || 'all'
    const sortBy = searchParams.get('sortBy') || 'rating'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // 如果没有筛选条件且在缓存有效期内，返回缓存数据
    const hasFilters = searchQuery || type !== 'all' || location !== 'all' || priceRange !== 'all' || offset > 0
    const now = Date.now()
    
    if (!hasFilters && cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
      return NextResponse.json(cachedData)
    }

    // 构建查询条件
    const where: any = {
      isActive: true
    }

    // 搜索条件
    if (searchQuery) {
      where.OR = [
        { name: { contains: searchQuery, mode: 'insensitive' } },
        { description: { contains: searchQuery, mode: 'insensitive' } },
        { address: { contains: searchQuery, mode: 'insensitive' } }
      ]
    }

    // 类型筛选 - 映射前端类型到数据库枚举
    if (type !== 'all') {
      const typeMapping: { [key: string]: string } = {
        '度假酒店': 'RESORT',
        '精品酒店': 'BOUTIQUE_HOTEL',
        '别墅': 'STONE_HOUSE_HOMESTAY',
        '家庭旅馆': 'GUESTHOUSE',
        '民宿': 'FARMSTAY'
      }
      
      if (typeMapping[type]) {
        where.type = typeMapping[type]
      }
    }

    // 位置筛选（基于地址）
    if (location !== 'all') {
      where.address = { contains: location, mode: 'insensitive' }
    }

    // 价格范围筛选
    if (priceRange !== 'all') {
      where.priceRange = priceRange
    }

    // 排序条件
    let orderBy: any = {}
    switch (sortBy) {
      case 'price-low':
        orderBy = { priceRange: 'asc' }
        break
      case 'price-high':
        orderBy = { priceRange: 'desc' }
        break
      case 'rating':
        orderBy = { rating: 'desc' }
        break
      case 'popular':
        orderBy = { reviewCount: 'desc' }
        break
      default:
        orderBy = { rating: 'desc' }
    }

    // 执行数据库查询
    const accommodations = await prisma.accommodation.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
      select: {
        id: true,
        name: true,
        nameEn: true,
        nameTw: true,
        description: true,
        descriptionEn: true,
        descriptionTw: true,
        type: true,
        address: true,
        latitude: true,
        longitude: true,
        images: true,
        amenities: true,
        roomTypes: true,
        priceRange: true,
        rating: true,
        reviewCount: true,
        contactPhone: true,
        contactEmail: true,
        checkInTime: true,
        checkOutTime: true,
        policies: true
      }
    })

    // 并行查询总数（仅在需要时）
    const totalPromise = hasFilters ? prisma.accommodation.count({ where }) : Promise.resolve(accommodations.length)
    const total = await totalPromise

    // 转换数据格式以兼容前端
    const formattedAccommodations = accommodations.map(acc => ({
      id: acc.id,
      name: acc.name,
      description: acc.description,
      type: getTypeDisplayName(acc.type),
      location: acc.address,
      address: acc.address,
      images: acc.images || [],
      amenities: acc.amenities || [],
      roomTypes: acc.roomTypes || [],
      priceRange: acc.priceRange,
      rating: acc.rating,
      reviews: acc.reviewCount,
      reviewCount: acc.reviewCount,
      contactPhone: acc.contactPhone,
      contactEmail: acc.contactEmail,
      checkInTime: acc.checkInTime,
      checkOutTime: acc.checkOutTime,
      policies: acc.policies,
      // 兼容旧格式
      price: getPriceFromRange(acc.priceRange),
      popular: acc.reviewCount > 100,
      features: acc.amenities?.slice(0, 4) || [],
      maxGuests: getRoomCapacity(acc.roomTypes),
      bedrooms: getRoomCount(acc.roomTypes),
      category: getCategoryFromType(acc.type),
      // 添加图片字段兼容
      image: acc.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'
    }))

    const result = {
      data: formattedAccommodations,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    }

    // 如果没有筛选条件，缓存结果
    if (!hasFilters) {
      cachedData = result
      cacheTimestamp = now
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('获取住宿列表失败:', error)
    return NextResponse.json(
      { error: '获取住宿列表失败' },
      { status: 500 }
    )
  }
}

// 辅助函数：将数据库类型转换为显示名称
function getTypeDisplayName(type: string): string {
  const typeMapping: { [key: string]: string } = {
    'RESORT': '度假酒店',
    'BOUTIQUE_HOTEL': '精品酒店',
    'STONE_HOUSE_HOMESTAY': '别墅',
    'GUESTHOUSE': '家庭旅馆',
    'FARMSTAY': '民宿'
  }
  return typeMapping[type] || type
}

// 辅助函数：从价格范围字符串中提取价格
function getPriceFromRange(priceRange: string): number {
  if (!priceRange) return 0
  const match = priceRange.match(/(\d+)/)
  return match ? parseInt(match[1]) : 0
}

// 辅助函数：获取房间容量
function getRoomCapacity(roomTypes: any[]): number {
  if (!roomTypes || roomTypes.length === 0) return 2
  return Math.max(...roomTypes.map((room: any) => room.maxGuests || 2))
}

// 辅助函数：获取房间数量
function getRoomCount(roomTypes: any[]): number {
  if (!roomTypes || roomTypes.length === 0) return 1
  return roomTypes.length
}

// 辅助函数：从类型获取分类
function getCategoryFromType(type: string): string {
  const categoryMapping: { [key: string]: string } = {
    'RESORT': 'hotel',
    'BOUTIQUE_HOTEL': 'hotel',
    'STONE_HOUSE_HOMESTAY': 'villa',
    'GUESTHOUSE': 'guesthouse',
    'FARMSTAY': 'homestay'
  }
  return categoryMapping[type] || 'hotel'
}