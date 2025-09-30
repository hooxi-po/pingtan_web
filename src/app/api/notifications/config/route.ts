import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// 通知配置请求验证schema
const notificationConfigSchema = z.object({
  channel: z.enum(['SMS', 'EMAIL', 'IN_APP', 'PUSH']),
  isEnabled: z.boolean(),
  preferences: z.record(z.any()).optional()
})

// 批量更新配置请求验证schema
const batchUpdateConfigSchema = z.object({
  configs: z.array(notificationConfigSchema)
})

/**
 * GET /api/notifications/config - 获取用户通知配置
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // 确定要查询的用户ID
    let targetUserId = session.user.id
    if (userId && session.user.role === 'ADMIN') {
      targetUserId = userId
    }

    // 获取用户的通知配置
    const configs = await prisma.notificationConfig.findMany({
      where: { userId: targetUserId },
      orderBy: { channel: 'asc' }
    })

    // 如果用户没有配置，返回默认配置
    if (configs.length === 0) {
      const defaultConfigs = [
        { channel: 'SMS', isEnabled: true, preferences: {} },
        { channel: 'EMAIL', isEnabled: true, preferences: {} },
        { channel: 'IN_APP', isEnabled: true, preferences: {} },
        { channel: 'PUSH', isEnabled: true, preferences: {} }
      ]

      return NextResponse.json({
        configs: defaultConfigs,
        isDefault: true
      })
    }

    return NextResponse.json({
      configs,
      isDefault: false
    })
  } catch (error) {
    console.error('Failed to fetch notification config:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/notifications/config - 创建或更新用户通知配置
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = notificationConfigSchema.parse(body)

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // 确定要操作的用户ID
    let targetUserId = session.user.id
    if (userId && session.user.role === 'ADMIN') {
      targetUserId = userId
    }

    // 使用 upsert 创建或更新配置
    const config = await prisma.notificationConfig.upsert({
      where: {
        userId_channel: {
          userId: targetUserId,
          channel: data.channel
        }
      },
      update: {
        isEnabled: data.isEnabled,
        preferences: data.preferences || {}
      },
      create: {
        userId: targetUserId,
        channel: data.channel,
        isEnabled: data.isEnabled,
        preferences: data.preferences || {}
      }
    })

    return NextResponse.json({
      success: true,
      config
    })
  } catch (error) {
    console.error('Failed to update notification config:', error)
    
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
 * PATCH /api/notifications/config - 批量更新用户通知配置
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = batchUpdateConfigSchema.parse(body)

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // 确定要操作的用户ID
    let targetUserId = session.user.id
    if (userId && session.user.role === 'ADMIN') {
      targetUserId = userId
    }

    // 批量更新配置
    const updatedConfigs = []
    
    for (const configData of data.configs) {
      const config = await prisma.notificationConfig.upsert({
        where: {
          userId_channel: {
            userId: targetUserId,
            channel: configData.channel
          }
        },
        update: {
          isEnabled: configData.isEnabled,
          preferences: configData.preferences || {}
        },
        create: {
          userId: targetUserId,
          channel: configData.channel,
          isEnabled: configData.isEnabled,
          preferences: configData.preferences || {}
        }
      })
      
      updatedConfigs.push(config)
    }

    return NextResponse.json({
      success: true,
      configs: updatedConfigs
    })
  } catch (error) {
    console.error('Failed to batch update notification config:', error)
    
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