import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { restaurantCreateSchema } from '@/lib/validations'
import { createSuccessResponse, createErrorResponse, getLocalizedMessage } from '@/lib/api-utils'

// GET /api/restaurants - 获取餐厅列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const cuisine = searchParams.get('cuisine') || ''
    const priceRange = searchParams.get('priceRange') || ''
    const lang = searchParams.get('lang') || 'zh'

    const skip = (page - 1) * limit

    // 构建查询条件
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { specialties: { hasSome: [search] } }
      ]
    }
    
    if (cuisine) {
      where.cuisine = cuisine
    }
    
    if (priceRange) {
      where.priceRange = { contains: priceRange }
    }

    // 获取餐厅列表和总数
    const [restaurants, total] = await Promise.all([
      prisma.restaurant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.restaurant.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return createSuccessResponse({
      restaurants,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }, getLocalizedMessage('api.restaurants.fetchSuccess', lang))

  } catch (error) {
    console.error('获取餐厅列表失败:', error)
    return createErrorResponse(
      getLocalizedMessage('api.restaurants.fetchFailed', 'zh'),
      500
    )
  }
}

// POST /api/restaurants - 创建新餐厅
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const lang = searchParams.get('lang') || 'zh'

    // 验证请求数据
    const validation = restaurantCreateSchema.safeParse(body)
    if (!validation.success) {
      return createErrorResponse(
        getLocalizedMessage('api.error.validation', lang),
        400,
        validation.error.errors.map(err => err.message)
      )
    }

    const data = validation.data

    // 创建餐厅
    const restaurant = await prisma.restaurant.create({
      data: {
        name: data.name,
        nameEn: data.nameEn,
        address: data.address,
        cuisine: data.cuisine,
        priceRange: data.priceRange,
        openingHours: data.openingHours,
        specialties: data.specialties || [],
        contact: data.contact,
        images: data.images || [],
        latitude: data.latitude,
        longitude: data.longitude,
        description: data.description
      }
    })

    return createSuccessResponse(
      restaurant,
      getLocalizedMessage('api.restaurants.createSuccess', lang),
      201
    )

  } catch (error) {
    console.error('创建餐厅失败:', error)
    return createErrorResponse(
      getLocalizedMessage('api.restaurants.createFailed', 'zh'),
      500
    )
  }
}