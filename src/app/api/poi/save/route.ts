import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse, getLocalizedMessage } from '@/lib/api-utils';

// POI数据接口定义
interface POIData {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: 'restaurant' | 'attraction' | 'accommodation';
  phone?: string;
  rating?: number;
  price?: string;
  openingHours?: string;
  description?: string;
  images?: string[];
  tags?: string[];
  source: 'baidu' | 'manual'; // 数据来源
  baiduPlaceId?: string; // 百度地图POI ID
  cuisine?: string[]; // 餐厅菜系
  category?: string; // 景点分类
  facilities?: string[]; // 住宿设施
}

// POST /api/poi/save - 保存POI搜索数据到数据库
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'zh';

    // 验证必需字段
    const { pois }: { pois: POIData[] } = body;
    
    if (!pois || !Array.isArray(pois) || pois.length === 0) {
      return createErrorResponse(
        getLocalizedMessage('api.error.validation', lang),
        400,
        ['POI数据不能为空']
      );
    }

    const savedResults = {
      restaurants: 0,
      attractions: 0,
      accommodations: 0,
      errors: [] as string[]
    };

    // 批量处理POI数据
    for (const poi of pois) {
      try {
        // 验证必需字段
        if (!poi.name || !poi.address || !poi.type) {
          savedResults.errors.push(`POI数据不完整: ${poi.name || '未知名称'}`);
          continue;
        }

        // 检查是否已存在（基于名称和地址）
        const existingCheck = await checkExistingPOI(poi);
        if (existingCheck.exists) {
          console.log(`POI已存在，跳过: ${poi.name}`);
          continue;
        }

        // 根据类型保存到对应表
        switch (poi.type) {
          case 'restaurant':
            await saveRestaurant(poi);
            savedResults.restaurants++;
            break;
          case 'attraction':
            await saveAttraction(poi);
            savedResults.attractions++;
            break;
          case 'accommodation':
            await saveAccommodation(poi);
            savedResults.accommodations++;
            break;
          default:
            savedResults.errors.push(`未知POI类型: ${poi.type}`);
        }
      } catch (error) {
        console.error(`保存POI失败: ${poi.name}`, error);
        savedResults.errors.push(`保存失败: ${poi.name} - ${error instanceof Error ? error.message : '未知错误'}`);
      }
    }

    return createSuccessResponse(
      savedResults,
      `成功保存 ${savedResults.restaurants + savedResults.attractions + savedResults.accommodations} 个POI数据`,
      201
    );

  } catch (error) {
    console.error('保存POI数据失败:', error);
    return createErrorResponse(
      '保存POI数据失败',
      500
    );
  }
}

// 检查POI是否已存在
async function checkExistingPOI(poi: POIData): Promise<{ exists: boolean; id?: number }> {
  try {
    let existing = null;
    
    switch (poi.type) {
      case 'restaurant':
        existing = await prisma.restaurant.findFirst({
          where: {
            OR: [
              { name: poi.name },
              {
                AND: [
                  { address: { contains: poi.address.substring(0, 20) } },
                  { latitude: { gte: poi.latitude - 0.001, lte: poi.latitude + 0.001 } },
                  { longitude: { gte: poi.longitude - 0.001, lte: poi.longitude + 0.001 } }
                ]
              }
            ]
          }
        });
        break;
      case 'attraction':
        existing = await prisma.attraction.findFirst({
          where: {
            OR: [
              { name: poi.name },
              {
                AND: [
                  { address: { contains: poi.address.substring(0, 20) } },
                  { latitude: { gte: poi.latitude - 0.001, lte: poi.latitude + 0.001 } },
                  { longitude: { gte: poi.longitude - 0.001, lte: poi.longitude + 0.001 } }
                ]
              }
            ]
          }
        });
        break;
      case 'accommodation':
        existing = await prisma.accommodation.findFirst({
          where: {
            OR: [
              { name: poi.name },
              {
                AND: [
                  { address: { contains: poi.address.substring(0, 20) } },
                  { latitude: { gte: poi.latitude - 0.001, lte: poi.longitude + 0.001 } },
                  { longitude: { gte: poi.longitude - 0.001, lte: poi.longitude + 0.001 } }
                ]
              }
            ]
          }
        });
        break;
    }
    
    return {
      exists: !!existing,
      id: existing?.id
    };
  } catch (error) {
    console.error('检查POI是否存在时出错:', error);
    return { exists: false };
  }
}

// 保存餐厅数据
async function saveRestaurant(poi: POIData) {
  return await prisma.restaurant.create({
    data: {
      name: poi.name,
      description: poi.description || '',
      address: poi.address,
      latitude: poi.latitude,
      longitude: poi.longitude,
      cuisine: poi.cuisine || [],
      priceRange: poi.price || '价格面议',
      openHours: poi.openingHours || '',
      specialties: [],
      contact: poi.phone || '',
      images: poi.images || [],
      tags: [...(poi.tags || []), poi.source, ...(poi.baiduPlaceId ? [`baidu:${poi.baiduPlaceId}`] : [])],
      rating: poi.rating || 0,
      reviewCount: 0
    }
  });
}

// 保存景点数据
async function saveAttraction(poi: POIData) {
  return await prisma.attraction.create({
    data: {
      nameZh: poi.name,
      nameEn: poi.name,
      nameJp: poi.name,
      descriptionZh: poi.description || '',
      latitude: poi.latitude,
      longitude: poi.longitude,
      openTime: poi.openingHours || '全天开放',
      ticketPrice: poi.price ? parseFloat(poi.price.replace(/[^\d.]/g, '')) || 0 : 0,
      images: poi.images || [],
      tags: [...(poi.tags || []), poi.source, ...(poi.baiduPlaceId ? [`baidu:${poi.baiduPlaceId}`] : [])],
      estimatedTime: '1-2小时'
    }
  });
}

// 保存住宿数据
async function saveAccommodation(poi: POIData) {
  return await prisma.accommodation.create({
    data: {
      name: poi.name,
      nameEn: poi.name,
      description: poi.description || '',
      address: poi.address,
      latitude: poi.latitude,
      longitude: poi.longitude,
      type: '民宿', // 默认类型
      priceRange: poi.price || '价格面议',
      facilities: poi.facilities || [],
      contact: poi.phone || '',
      images: poi.images || [],
      tags: [...(poi.tags || []), poi.source, ...(poi.baiduPlaceId ? [`baidu:${poi.baiduPlaceId}`] : [])],
      rating: poi.rating || 0,
      reviewCount: 0,
      nearbyAttractions: []
    }
  });
}

// GET /api/poi/save - 获取POI保存统计信息
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') || 'all';
    const lang = searchParams.get('lang') || 'zh';

    // 构建查询条件
    const whereCondition = source === 'all' ? {} : {
      tags: { has: source }
    };

    // 获取各类型POI统计
    const [restaurantCount, attractionCount, accommodationCount] = await Promise.all([
      prisma.restaurant.count({ where: whereCondition }),
      prisma.attraction.count({ where: whereCondition }),
      prisma.accommodation.count({ where: whereCondition })
    ]);

    const stats = {
      total: restaurantCount + attractionCount + accommodationCount,
      restaurants: restaurantCount,
      attractions: attractionCount,
      accommodations: accommodationCount,
      source
    };

    return createSuccessResponse(
      stats,
      getLocalizedMessage('api.poi.statsSuccess', lang)
    );

  } catch (error) {
    console.error('获取POI统计失败:', error);
    return createErrorResponse(
      '获取POI统计失败',
      500
    );
  }
}