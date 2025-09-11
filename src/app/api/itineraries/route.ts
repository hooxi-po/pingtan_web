import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/itineraries - 获取行程推荐列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const days = searchParams.get('days')
    const budget = searchParams.get('budget')
    const tags = searchParams.get('tags')?.split(',')
    
    const skip = (page - 1) * limit
    
    // 构建查询条件
    const where: any = {}
    
    if (days) {
      where.days = parseInt(days)
    }
    
    if (budget) {
      where.budget = {
        lte: parseFloat(budget)
      }
    }
    
    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags
      }
    }
    
    const itineraries = await prisma.itinerary.findMany({
      where,
      skip,
      take: limit,
      include: {
        items: {
          include: {
            attraction: {
              select: {
                id: true,
                nameZh: true,
                nameEn: true,
                images: true,
                latitude: true,
                longitude: true
              }
            }
          },
          orderBy: [
            { day: 'asc' },
            { order: 'asc' }
          ]
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    const total = await prisma.itinerary.count({ where })
    
    // 格式化返回数据
    const formattedItineraries = itineraries.map(itinerary => {
      // 按天分组景点
      const dayGroups: { [key: number]: any[] } = {}
      
      itinerary.items.forEach(item => {
        if (!dayGroups[item.day]) {
          dayGroups[item.day] = []
        }
        dayGroups[item.day].push({
          id: item.id,
          attraction: {
            id: item.attraction.id,
            name: item.attraction.nameZh,
            images: item.attraction.images,
            location: item.attraction.latitude && item.attraction.longitude ? 
              [item.attraction.latitude, item.attraction.longitude] : null
          },
          duration: item.duration,
          notes: item.notes,
          order: item.order
        })
      })
      
      return {
        id: itinerary.id,
        title: itinerary.title,
        description: itinerary.description,
        tags: itinerary.tags,
        days: itinerary.days,
        budget: itinerary.budget,
        dayGroups,
        attractionCount: itinerary.items.length,
        createdAt: itinerary.createdAt
      }
    })
    
    return NextResponse.json({
      success: true,
      data: formattedItineraries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
    
  } catch (error) {
    console.error('获取行程推荐失败:', error)
    return NextResponse.json(
      { success: false, error: '获取行程推荐失败' },
      { status: 500 }
    )
  }
}

// POST /api/itineraries - 创建新行程
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      tags,
      days,
      budget,
      createdBy,
      items // [{ attractionId, day, order, duration, notes }]
    } = body
    
    // 验证必填字段
    if (!title || !days) {
      return NextResponse.json(
        { success: false, error: '标题和天数为必填项' },
        { status: 400 }
      )
    }
    
    // 创建行程
    const itinerary = await prisma.itinerary.create({
      data: {
        title,
        description,
        tags: tags || [],
        days: parseInt(days),
        budget: budget ? parseFloat(budget) : null,
        // createdBy 字段在 schema 中不存在，已移除
      }
    })
    
    // 创建行程项目
    if (items && items.length > 0) {
      await prisma.itineraryItem.createMany({
        data: items.map((item: any) => ({
          itineraryId: itinerary.id,
          attractionId: parseInt(item.attractionId),
          day: parseInt(item.day),
          order: parseInt(item.order),
          duration: item.duration ? parseInt(item.duration) : null,
          notes: item.notes
        }))
      })
    }
    
    // 返回完整的行程数据
    const fullItinerary = await prisma.itinerary.findUnique({
      where: { id: itinerary.id },
      include: {
        items: {
          include: {
            attraction: {
              select: {
                id: true,
                nameZh: true,
                images: true,
                latitude: true,
                longitude: true
              }
            }
          },
          orderBy: [
            { day: 'asc' },
            { order: 'asc' }
          ]
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      data: fullItinerary
    }, { status: 201 })
    
  } catch (error) {
    console.error('创建行程失败:', error)
    return NextResponse.json(
      { success: false, error: '创建行程失败' },
      { status: 500 }
    )
  }
}