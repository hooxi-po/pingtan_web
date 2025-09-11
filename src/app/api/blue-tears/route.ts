import { NextRequest, NextResponse } from 'next/server'
import { mockBlueTearSpots, BlueTearSpotsResponse, BlueTearSpotFilters } from '@/data/blue-tears'

// GET /api/blue-tears - 获取蓝眼泪观赏点列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // 解析查询参数
    const filters: BlueTearSpotFilters = {
      search: searchParams.get('search') || undefined,
      spotType: searchParams.get('spotType') || undefined,
      difficulty: searchParams.get('difficulty') || undefined,
      bestSeason: searchParams.get('bestSeason') || undefined
    }
    
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    
    // 过滤数据
    let filteredSpots = mockBlueTearSpots
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filteredSpots = filteredSpots.filter(spot => 
        spot.name.toLowerCase().includes(searchTerm) ||
        spot.address.toLowerCase().includes(searchTerm) ||
        spot.features.some(f => f.toLowerCase().includes(searchTerm))
      )
    }
    
    if (filters.spotType) {
      filteredSpots = filteredSpots.filter(spot => spot.spotType === filters.spotType)
    }
    
    if (filters.difficulty) {
      filteredSpots = filteredSpots.filter(spot => spot.difficulty === filters.difficulty)
    }
    
    if (filters.bestSeason) {
      // 简单的季节匹配，实际项目中可能需要更复杂的逻辑
      filteredSpots = filteredSpots.filter(spot => 
        spot.bestSeason.includes(filters.bestSeason!)
      )
    }
    
    // 分页
    const total = filteredSpots.length
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedSpots = filteredSpots.slice(startIndex, endIndex)
    
    const response: BlueTearSpotsResponse = {
      data: paginatedSpots,
      total,
      page,
      pageSize
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('获取蓝眼泪观赏点列表失败:', error)
    return NextResponse.json(
      { error: '获取数据失败' },
      { status: 500 }
    )
  }
}