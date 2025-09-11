import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/news - 获取新闻资讯列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const lang = searchParams.get('lang') || 'zh'
    const search = searchParams.get('search')
    const tags = searchParams.get('tags')?.split(',')
    const published = searchParams.get('published') !== 'false' // 默认只显示已发布的
    
    const skip = (page - 1) * limit
    
    // 构建查询条件
    const where: any = {
      lang,
      published
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags
      }
    }
    
    const news = await prisma.news.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        summary: true,
        author: true,
        images: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
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
    
    const total = await prisma.news.count({ where })
    
    // 格式化返回数据
    const formattedNews = news.map(item => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      author: item.author,
      images: item.images,
      tags: item.tags,
      favoriteCount: item._count.userActions,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }))
    
    return NextResponse.json({
      success: true,
      data: formattedNews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
    
  } catch (error) {
    console.error('获取新闻列表失败:', error)
    return NextResponse.json(
      { success: false, error: '获取新闻列表失败' },
      { status: 500 }
    )
  }
}

// POST /api/news - 创建新闻（管理员功能）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      content,
      summary,
      lang,
      author,
      images,
      tags,
      published
    } = body
    
    // 验证必填字段
    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: '标题和内容为必填项' },
        { status: 400 }
      )
    }
    
    const news = await prisma.news.create({
      data: {
        title,
        content,
        summary,
        lang: lang || 'zh',
        author,
        images: images || [],
        tags: tags || [],
        published: published || false
      }
    })
    
    return NextResponse.json({
      success: true,
      data: news
    }, { status: 201 })
    
  } catch (error) {
    console.error('创建新闻失败:', error)
    return NextResponse.json(
      { success: false, error: '创建新闻失败' },
      { status: 500 }
    )
  }
}