import { NextRequest, NextResponse } from 'next/server'
import { mockBlueTearSpots, BlueTearSpotDetailResponse } from '@/data/blue-tears'

// GET /api/blue-tears/[id] - 获取蓝眼泪观赏点详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // 查找对应的观赏点
    const spot = mockBlueTearSpots.find(s => s.id === id)
    
    if (!spot) {
      return NextResponse.json(
        { error: '观赏点不存在' },
        { status: 404 }
      )
    }
    
    const response: BlueTearSpotDetailResponse = {
      data: spot
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('获取蓝眼泪观赏点详情失败:', error)
    return NextResponse.json(
      { error: '获取数据失败' },
      { status: 500 }
    )
  }
}