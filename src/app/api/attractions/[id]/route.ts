import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/attractions/[id] - 获取单个景点详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const { searchParams } = new URL(request.url)
    const lang = searchParams.get('lang') || 'zh'
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '无效的景点ID' },
        { status: 400 }
      )
    }
    
    const attraction = await prisma.attraction.findUnique({
      where: { id },
      include: {
        userActions: {
          where: {
            actionType: 'review'
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        },
        _count: {
          select: {
            userActions: {
              where: {
                actionType: 'favorite'
              }
            }
          }
        }
      }
    })
    
    if (!attraction) {
      return NextResponse.json(
        { success: false, error: '景点不存在' },
        { status: 404 }
      )
    }
    
    // 根据语言返回相应字段
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
    
    // 计算平均评分
    const reviews = attraction.userActions.filter(action => action.rating)
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length
      : 0
    
    const formattedAttraction = {
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
      favoriteCount: attraction._count.userActions,
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: reviews.length,
      reviews: attraction.userActions.map(review => ({
        id: review.id,
        content: review.content,
        rating: review.rating,
        createdAt: review.createdAt,
        user: review.user
      })),
      createdAt: attraction.createdAt
    }
    
    return NextResponse.json({
      success: true,
      data: formattedAttraction
    })
    
  } catch (error) {
    console.error('获取景点详情失败:', error)
    return NextResponse.json(
      { success: false, error: '获取景点详情失败' },
      { status: 500 }
    )
  }
}

// PUT /api/attractions/[id] - 更新景点信息（管理员功能）
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '无效的景点ID' },
        { status: 400 }
      )
    }
    
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
    
    const attraction = await prisma.attraction.update({
      where: { id },
      data: {
        ...(nameZh && { nameZh }),
        ...(nameEn && { nameEn }),
        ...(nameJp && { nameJp }),
        ...(descriptionZh && { descriptionZh }),
        ...(descriptionEn && { descriptionEn }),
        ...(descriptionJp && { descriptionJp }),
        ...(latitude && { latitude: parseFloat(latitude) }),
        ...(longitude && { longitude: parseFloat(longitude) }),
        ...(openTime && { openTime }),
        ...(ticketPrice && { ticketPrice: parseFloat(ticketPrice) }),
        ...(images && { images }),
        ...(tags && { tags })
      }
    })
    
    return NextResponse.json({
      success: true,
      data: attraction
    })
    
  } catch (error) {
    console.error('更新景点失败:', error)
    return NextResponse.json(
      { success: false, error: '更新景点失败' },
      { status: 500 }
    )
  }
}

// DELETE /api/attractions/[id] - 删除景点（管理员功能）
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '无效的景点ID' },
        { status: 400 }
      )
    }
    
    await prisma.attraction.delete({
      where: { id }
    })
    
    return NextResponse.json({
      success: true,
      message: '景点删除成功'
    })
    
  } catch (error) {
    console.error('删除景点失败:', error)
    return NextResponse.json(
      { success: false, error: '删除景点失败' },
      { status: 500 }
    )
  }
}