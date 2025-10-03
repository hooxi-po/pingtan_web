import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NotificationType, NotificationChannel } from '@prisma/client'

/**
 * 初始化预订相关的默认通知模板
 * POST /api/notifications/templates/init-booking
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const bookingTemplates = [
      // 预订确认 - 站内通知模板
      {
        name: '预订确认通知（站内）',
        type: NotificationType.BOOKING_CONFIRMED,
        channel: NotificationChannel.IN_APP,
        title: '🎉 预订确认成功',
        content: `亲爱的 {{customerName}}，您的预订已确认成功！

📋 预订确认编号：{{confirmationNumber}}
🎯 服务名称：{{serviceName}}
📝 服务详情：{{serviceDescription}}
📅 预订日期：{{bookingDate}}
⏰ 预订时间：{{bookingTime}}
💰 订单金额：{{currency}} {{totalAmount}}

请保存好您的确认编号，并按时前往享受服务。
如有疑问，请联系客服。`,
        variables: ['customerName', 'confirmationNumber', 'serviceName', 'serviceDescription', 'bookingDate', 'bookingTime', 'currency', 'totalAmount'],
        isActive: true
      },
      
      // 预订确认 - 邮件模板
      {
        name: '预订确认通知（邮件）',
        type: NotificationType.BOOKING_CONFIRMED,
        channel: NotificationChannel.EMAIL,
        title: '平潭旅游 - 预订确认成功',
        content: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>预订确认</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">🎉 预订确认成功</h2>
        
        <p>亲爱的 {{customerName}}，</p>
        <p>感谢您选择平潭旅游！您的预订已确认成功。</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">预订详情</h3>
            <p><strong>确认编号：</strong>{{confirmationNumber}}</p>
            <p><strong>服务名称：</strong>{{serviceName}}</p>
            <p><strong>服务详情：</strong>{{serviceDescription}}</p>
            <p><strong>预订日期：</strong>{{bookingDate}}</p>
            <p><strong>预订时间：</strong>{{bookingTime}}</p>
            <p><strong>订单金额：</strong>{{currency}} {{totalAmount}}</p>
        </div>
        
        <p>请保存好您的确认编号，并按时前往享受服务。</p>
        <p>如有疑问，请联系我们的客服团队。</p>
        
        <hr style="margin: 30px 0;">
        <p style="font-size: 12px; color: #666;">
            此邮件由平潭旅游系统自动发送，请勿回复。
        </p>
    </div>
</body>
</html>`,
        variables: ['customerName', 'confirmationNumber', 'serviceName', 'serviceDescription', 'bookingDate', 'bookingTime', 'currency', 'totalAmount'],
        isActive: true
      },

      // 预订确认 - 短信模板
      {
        name: '预订确认通知（短信）',
        type: NotificationType.BOOKING_CONFIRMED,
        channel: NotificationChannel.SMS,
        title: '预订确认',
        content: `【平潭旅游】亲爱的{{customerName}}，您的{{serviceName}}预订已确认！确认编号：{{confirmationNumber}}，预订日期：{{bookingDate}}，金额：{{currency}}{{totalAmount}}。请按时前往，如有疑问请联系客服。`,
        variables: ['customerName', 'serviceName', 'confirmationNumber', 'bookingDate', 'currency', 'totalAmount'],
        isActive: true
      },

      // 预订取消 - 站内通知模板
      {
        name: '预订取消通知（站内）',
        type: NotificationType.ORDER_CANCELLED,
        channel: NotificationChannel.IN_APP,
        title: '❌ 预订已取消',
        content: `亲爱的 {{customerName}}，您的预订已取消。

📋 预订确认编号：{{confirmationNumber}}
🎯 服务名称：{{serviceName}}
📅 原预订日期：{{bookingDate}}
💰 订单金额：{{currency}} {{totalAmount}}
📝 取消原因：{{changeReason}}

如需重新预订或有疑问，请联系客服。`,
        variables: ['customerName', 'confirmationNumber', 'serviceName', 'bookingDate', 'currency', 'totalAmount', 'changeReason'],
        isActive: true
      },

      // 预订退款 - 站内通知模板
      {
        name: '预订退款通知（站内）',
        type: NotificationType.ORDER_REFUNDED,
        channel: NotificationChannel.IN_APP,
        title: '💰 退款处理完成',
        content: `亲爱的 {{customerName}}，您的退款已处理完成。

📋 预订确认编号：{{confirmationNumber}}
🎯 服务名称：{{serviceName}}
💸 退款金额：{{currency}} {{refundAmount}}
📝 退款原因：{{changeReason}}

退款将在3-5个工作日内到账，请注意查收。
如有疑问，请联系客服。`,
        variables: ['customerName', 'confirmationNumber', 'serviceName', 'currency', 'refundAmount', 'changeReason'],
        isActive: true
      },

      // 预订提醒 - 站内通知模板
      {
        name: '预订提醒通知（站内）',
        type: NotificationType.BOOKING_REMINDER,
        channel: NotificationChannel.IN_APP,
        title: '⏰ 预订提醒',
        content: `亲爱的 {{customerName}}，温馨提醒您即将到来的预订：

📋 预订确认编号：{{confirmationNumber}}
🎯 服务名称：{{serviceName}}
📅 预订日期：{{bookingDate}}
⏰ 预订时间：{{bookingTime}}
📍 服务地址：{{serviceAddress}}

请提前做好准备，按时前往享受服务。
如需取消或修改，请及时联系客服。`,
        variables: ['customerName', 'confirmationNumber', 'serviceName', 'bookingDate', 'bookingTime', 'serviceAddress'],
        isActive: true
      }
    ]

    // 批量创建模板（如果不存在的话）
    const createdTemplates = []
    const skippedTemplates = []
    
    for (const templateData of bookingTemplates) {
      const existingTemplate = await prisma.notificationTemplate.findFirst({
        where: {
          type: templateData.type,
          channel: templateData.channel,
          isActive: true
        }
      })

      if (!existingTemplate) {
        const template = await prisma.notificationTemplate.create({
          data: templateData
        })
        createdTemplates.push(template)
      } else {
        skippedTemplates.push({
          type: templateData.type,
          channel: templateData.channel,
          reason: '已存在活跃模板'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `预订通知模板初始化完成`,
      data: {
        createdCount: createdTemplates.length,
        skippedCount: skippedTemplates.length,
        createdTemplates: createdTemplates.map(t => ({
          id: t.id,
          name: t.name,
          type: t.type,
          channel: t.channel
        })),
        skippedTemplates
      }
    })

  } catch (error) {
    console.error('初始化预订通知模板失败:', error)
    return NextResponse.json(
      { error: '初始化预订通知模板失败' },
      { status: 500 }
    )
  }
}