import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createErrorResponse, createSuccessResponse, getLanguageFromRequest, logError } from '@/lib/api-utils'

// GET /api/attractions - 获取景点列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const lang = searchParams.get('lang') || 'zh'
    const search = searchParams.get('search')
    const tags = searchParams.get('tags')?.split(',')
    const near = searchParams.get('near') // 格式: "lat,lng"
    
    const skip = (page - 1) * limit
    
    // 构建查询条件
    const where: any = {}
    
    if (search) {
      where.OR = [
        { nameZh: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
        { descriptionZh: { contains: search, mode: 'insensitive' } },
        { descriptionEn: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags
      }
    }
    
    // 获取景点数据
    const attractions = await prisma.attraction.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        popularity: 'desc'
      },
      select: {
        id: true,
        nameZh: true,
        nameEn: true,
        nameJp: true,
        descriptionZh: true,
        descriptionEn: true,
        descriptionJp: true,
        latitude: true,
        longitude: true,
        openTime: true,
        ticketPrice: true,
        popularity: true,
        images: true,
        tags: true,
        createdAt: true
      }
    })
    
    // 获取总数
    const total = await prisma.attraction.count({ where })
    
    // 根据语言返回相应字段
    const formattedAttractions = attractions.map(attraction => {
      let name, description
      
      switch (lang) {
        case 'en':
          name = attraction.nameEn || attraction.nameZh
          description = attraction.descriptionEn || attraction.descriptionZh
          break
        case 'jp':
          name = attraction.nameJp || attraction.nameZh
          description = attraction.descriptionJp || attraction.descriptionZh
          break
        default:
          name = attraction.nameZh
          description = attraction.descriptionZh
      }
      
      return {
        id: attraction.id,
        name,
        description,
        location: attraction.latitude && attraction.longitude ? 
          [attraction.latitude, attraction.longitude] : null,
        openTime: attraction.openTime,
        ticketPrice: attraction.ticketPrice,
        popularity: attraction.popularity,
        images: attraction.images,
        tags: attraction.tags,
        createdAt: attraction.createdAt
      }
    })
    
    return NextResponse.json({
      success: true,
      data: formattedAttractions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
    
  } catch (error) {
    const lang = getLanguageFromRequest(request)
    logError(error, 'attractions list fetch', lang)
    return createErrorResponse('api.attractions.fetchFailed', 500, lang)
  }
}

// POST /api/attractions - 创建新景点（管理员功能）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      nameZh,
      nameEn,
      nameJp,
      descriptionZh,
      descriptionEn,
      descriptionJp,
      latitude,
      longitude,
      openTime,
      ticketPrice,
      images,
      tags
    } = body
    
    // 验证必填字段
    if (!nameZh) {
      const lang = getLanguageFromRequest(request)
      return createErrorResponse('api.attractions.nameRequired', 400, lang)
    }
    
    const attraction = await prisma.attraction.create({
      data: {
        nameZh,
        nameEn,
        nameJp,
        descriptionZh,
        descriptionEn,
        descriptionJp,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        openTime,
        ticketPrice: ticketPrice ? parseFloat(ticketPrice) : null,
        images: images || [],
        tags: tags || []
      }
    })
    
    return NextResponse.json({
      success: true,
      data: attraction
    }, { status: 201 })
    
  } catch (error) {
    const lang = getLanguageFromRequest(request)
    logError(error, 'attraction creation', lang)
    return createErrorResponse('api.attractions.createFailed', 500, lang)
  }
}