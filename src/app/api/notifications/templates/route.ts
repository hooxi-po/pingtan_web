import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { TemplateEngine } from '@/lib/notification/template-engine'
import { NotificationChannel, NotificationType } from '@prisma/client'

const templateEngine = new TemplateEngine()

// 创建模板请求验证schema
const createTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum([
    'PAYMENT_SUCCESS',
    'PAYMENT_FAILED',
    'ORDER_CONFIRMED',
    'ORDER_CANCELLED',
    'ORDER_REFUNDED',
    'BOOKING_REMINDER',
    'SYSTEM_ANNOUNCEMENT',
    'PROMOTIONAL',
    'SECURITY_ALERT'
  ]),
  channel: z.enum(['SMS', 'EMAIL', 'IN_APP', 'PUSH']),
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(2000),
  variables: z.array(z.string()).optional(),
  isActive: z.boolean().optional()
})

// 更新模板请求验证schema
const updateTemplateSchema = createTemplateSchema.partial()

// 预览模板请求验证schema
const previewTemplateSchema = z.object({
  title: z.string(),
  content: z.string(),
  variables: z.record(z.any())
})

/**
 * GET /api/notifications/templates - 获取通知模板列表
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const channel = searchParams.get('channel')
    const isActive = searchParams.get('isActive')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)

    // 构建查询条件
    const where: any = {}
    if (type) where.type = type
    if (channel) where.channel = channel
    if (isActive !== null) where.isActive = isActive === 'true'

    const skip = (page - 1) * limit

    // 查询模板列表
    const [templates, total] = await Promise.all([
      prisma.notificationTemplate.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.notificationTemplate.count({ where })
    ])

    return NextResponse.json({
      templates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Failed to fetch templates:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/notifications/templates - 创建通知模板
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const data = createTemplateSchema.parse(body)

    // 验证模板语法
    const syntaxValidation = templateEngine.validateTemplate(data.content)
    if (!syntaxValidation.isValid) {
      return NextResponse.json({
        error: 'Invalid template syntax',
        details: syntaxValidation.errors
      }, { status: 400 })
    }

    // 提取模板变量
    const extractedVariables = templateEngine.extractVariables(data.content)
    const variables = data.variables || extractedVariables

    // 创建模板
    const template = await prisma.notificationTemplate.create({
      data: {
        name: data.name,
        type: data.type,
        channel: data.channel,
        title: data.title,
        content: data.content,
        variables,
        isActive: data.isActive ?? true
      }
    })

    return NextResponse.json({
      success: true,
      template
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create template:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 注意：预览功能应该在单独的路由文件中实现
// 例如：/api/notifications/templates/preview/route.ts