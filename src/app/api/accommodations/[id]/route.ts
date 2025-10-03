import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * 获取单个住宿详情
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: accommodationId } = await params

    // 验证ID格式
    if (!accommodationId || accommodationId === 'undefined') {
      return NextResponse.json(
        { error: '无效的住宿ID' },
        { status: 400 }
      )
    }

    // 查询住宿详情
    const accommodation = await prisma.accommodation.findUnique({
      where: {
        id: accommodationId,
        isActive: true
      },
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
        policies: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!accommodation) {
      return NextResponse.json(
        { error: '住宿不存在或已下架' },
        { status: 404 }
      )
    }

    // 转换数据格式以兼容前端
    const formattedAccommodation = {
      id: accommodation.id,
      name: accommodation.name,
      nameEn: accommodation.nameEn,
      nameTw: accommodation.nameTw,
      description: accommodation.description,
      descriptionEn: accommodation.descriptionEn,
      descriptionTw: accommodation.descriptionTw,
      type: getTypeDisplayName(accommodation.type),
      location: accommodation.address,
      address: accommodation.address,
      latitude: accommodation.latitude,
      longitude: accommodation.longitude,
      images: accommodation.images || [],
      amenities: accommodation.amenities || [],
      roomTypes: accommodation.roomTypes || [],
      priceRange: accommodation.priceRange,
      rating: accommodation.rating,
      reviews: accommodation.reviewCount,
      reviewCount: accommodation.reviewCount,
      contactPhone: accommodation.contactPhone,
      contactEmail: accommodation.contactEmail,
      checkInTime: accommodation.checkInTime,
      checkOutTime: accommodation.checkOutTime,
      policies: accommodation.policies,
      createdAt: accommodation.createdAt,
      updatedAt: accommodation.updatedAt,
      // 兼容旧格式
      price: getPriceFromRange(accommodation.priceRange),
      popular: accommodation.reviewCount > 100,
      features: accommodation.amenities?.slice(0, 4) || [],
      maxGuests: getRoomCapacity(accommodation.roomTypes),
      bedrooms: getRoomCount(accommodation.roomTypes),
      category: getCategoryFromType(accommodation.type),
      image: accommodation.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'
    }

    return NextResponse.json({
      accommodation: formattedAccommodation
    })

  } catch (error) {
    console.error('获取住宿详情失败:', error)
    return NextResponse.json(
      { error: '获取住宿详情失败' },
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

// 辅助函数：从价格范围获取数字价格
function getPriceFromRange(priceRange: string): number {
  if (!priceRange) return 0
  const match = priceRange.match(/(\d+)/)
  return match ? parseInt(match[1]) : 0
}

// 辅助函数：从房型数据获取最大容量
function getRoomCapacity(roomTypes: any[]): number {
  if (!roomTypes || roomTypes.length === 0) return 2
  const maxCapacity = Math.max(...roomTypes.map((room: any) => room.maxGuests || 2))
  return maxCapacity
}

// 辅助函数：从房型数据获取房间数
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