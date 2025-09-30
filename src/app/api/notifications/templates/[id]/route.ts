import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { TemplateEngine } from '@/lib/notification/template-engine'
import { z } from 'zod'

const prisma = new PrismaClient()
const templateEngine = new TemplateEngine()

// 更新模板请求验证schema
const updateTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
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
  ]).optional(),
  channel: z.enum(['SMS', 'EMAIL', 'IN_APP', 'PUSH']).optional(),
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(2000).optional(),
  variables: z.array(z.string()).optional(),
  isActive: z.boolean().optional()
})

/**
 * GET /api/notifications/templates/[id] - 获取单个通知模板
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const templateId = params.id

    const template = await prisma.notificationTemplate.findUnique({
      where: { id: templateId },
      include: {
        _count: {
          select: {
            notifications: true
          }
        }
      }
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Failed to fetch template:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/notifications/templates/[id] - 更新通知模板
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const templateId = params.id
    const body = await request.json()
    const data = updateTemplateSchema.parse(body)

    // 检查模板是否存在
    const existingTemplate = await prisma.notificationTemplate.findUnique({
      where: { id: templateId }
    })

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // 如果更新了内容，验证模板语法
    if (data.content) {
      const syntaxValidation = templateEngine.validateTemplate(data.content)
      if (!syntaxValidation.isValid) {
        return NextResponse.json({
          error: 'Invalid template syntax',
          details: syntaxValidation.errors
        }, { status: 400 })
      }
    }

    // 构建更新数据
    const updateData: any = {}
    
    if (data.name !== undefined) updateData.name = data.name
    if (data.type !== undefined) updateData.type = data.type
    if (data.channel !== undefined) updateData.channel = data.channel
    if (data.title !== undefined) updateData.title = data.title
    if (data.content !== undefined) {
      updateData.content = data.content
      // 重新提取变量
      const extractedVariables = templateEngine.extractVariables(data.content)
      updateData.variables = data.variables || extractedVariables
    } else if (data.variables !== undefined) {
      updateData.variables = data.variables
    }
    if (data.isActive !== undefined) updateData.isActive = data.isActive

    // 更新模板
    const updatedTemplate = await prisma.notificationTemplate.update({
      where: { id: templateId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      template: updatedTemplate
    })
  } catch (error) {
    console.error('Failed to update template:', error)
    
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

/**
 * DELETE /api/notifications/templates/[id] - 删除通知模板
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const templateId = params.id

    // 检查模板是否存在
    const existingTemplate = await prisma.notificationTemplate.findUnique({
      where: { id: templateId },
      include: {
        _count: {
          select: {
            notifications: true
          }
        }
      }
    })

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // 检查是否有关联的通知
    if (existingTemplate._count.notifications > 0) {
      return NextResponse.json({
        error: 'Cannot delete template with associated notifications',
        details: `Template has ${existingTemplate._count.notifications} associated notifications`
      }, { status: 400 })
    }

    // 删除模板
    await prisma.notificationTemplate.delete({
      where: { id: templateId }
    })

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete template:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}