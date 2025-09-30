import { NotificationSendResult } from '../types'
import nodemailer from 'nodemailer'
import { NotificationChannel } from '@prisma/client'

interface EmailConfig {
  provider: 'smtp' | 'sendgrid' | 'ses'
  host?: string
  port?: number
  username?: string
  password?: string
  apiKey?: string
  from: string
}

interface EmailSendRequest {
  to: string
  subject: string
  content: string
  metadata?: Record<string, any>
}

export class EmailService {
  private config: EmailConfig
  private transporter?: nodemailer.Transporter

  constructor(config: EmailConfig) {
    this.config = config
    this.initializeTransporter()
  }

  private initializeTransporter() {
    switch (this.config.provider) {
      case 'smtp':
        this.transporter = nodemailer.createTransport({
          host: this.config.host,
          port: this.config.port || 587,
          secure: this.config.port === 465,
          auth: {
            user: this.config.username,
            pass: this.config.password
          }
        })
        break
      case 'sendgrid':
        // SendGrid配置
        this.transporter = nodemailer.createTransport({
          service: 'SendGrid',
          auth: {
            user: 'apikey',
            pass: this.config.apiKey
          }
        })
        break
      case 'ses':
        // AWS SES配置
        // 需要安装 @aws-sdk/client-ses
        break
    }
  }

  async send(request: EmailSendRequest): Promise<NotificationSendResult> {
    try {
      // 验证邮箱地址
      if (!this.isValidEmail(request.to)) {
        return {
          success: false,
          errorMessage: 'Invalid email address format'
        }
      }

      // 构建邮件内容
      const mailOptions = {
        from: this.config.from,
        to: request.to,
        subject: request.subject,
        html: this.buildEmailHTML(request.content, request.metadata),
        text: request.content // 纯文本备用
      }

      if (this.transporter) {
        const result = await this.transporter.sendMail(mailOptions)
        
        return {
          success: true,
          externalId: result.messageId,
          deliveredAt: new Date()
        }
      } else {
        // 如果没有配置transporter，使用模拟发送
        return await this.mockSend(request)
      }
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown email error'
      }
    }
  }

  private async mockSend(request: EmailSendRequest): Promise<NotificationSendResult> {
    // 模拟邮件发送，用于开发和测试
    console.log('Mock Email Send:', {
      to: request.to,
      subject: request.subject,
      content: request.content.substring(0, 100) + '...'
    })

    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 200))

    // 模拟90%成功率
    const success = Math.random() > 0.1

    if (success) {
      return {
        success: true,
        externalId: `mock_email_${Date.now()}`,
        deliveredAt: new Date()
      }
    } else {
      return {
        success: false,
        errorMessage: 'Mock email delivery failed'
      }
    }
  }

  private buildEmailHTML(content: string, metadata?: Record<string, any>): string {
    // 构建HTML邮件模板
    const styles = `
      <style>
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .email-header {
          background-color: #2563eb;
          color: white;
          padding: 20px;
          text-align: center;
        }
        .email-body {
          padding: 30px 20px;
          background-color: #f9fafb;
        }
        .email-footer {
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
          background-color: #f3f4f6;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #2563eb;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          margin: 10px 0;
        }
      </style>
    `

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${styles}
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <h1>平潭旅游通知</h1>
          </div>
          <div class="email-body">
            ${this.formatContent(content)}
            ${metadata?.actionUrl ? `<a href="${metadata.actionUrl}" class="button">查看详情</a>` : ''}
          </div>
          <div class="email-footer">
            <p>此邮件由平潭旅游系统自动发送，请勿回复。</p>
            <p>如有疑问，请联系客服：support@pingtan-travel.com</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private formatContent(content: string): string {
    // 将纯文本内容转换为HTML格式
    return content
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * 发送带附件的邮件
   */
  async sendWithAttachment(
    request: EmailSendRequest & {
      attachments?: Array<{
        filename: string
        content: Buffer | string
        contentType?: string
      }>
    }
  ): Promise<NotificationSendResult> {
    try {
      if (!this.transporter) {
        return await this.mockSend(request)
      }

      const mailOptions = {
        from: this.config.from,
        to: request.to,
        subject: request.subject,
        html: this.buildEmailHTML(request.content, request.metadata),
        text: request.content,
        attachments: request.attachments
      }

      const result = await this.transporter.sendMail(mailOptions)
      
      return {
        success: true,
        externalId: result.messageId,
        deliveredAt: new Date()
      }
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown email error'
      }
    }
  }

  /**
   * 批量发送邮件
   */
  async sendBatch(requests: EmailSendRequest[]): Promise<NotificationSendResult[]> {
    const results: NotificationSendResult[] = []
    
    // 并发发送，但限制并发数量避免被限流
    const batchSize = 5
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize)
      const batchResults = await Promise.all(
        batch.map(request => this.send(request))
      )
      results.push(...batchResults)
      
      // 批次间添加延迟，避免发送过快
      if (i + batchSize < requests.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    return results
  }

  /**
   * 验证邮件服务配置
   */
  async verifyConnection(): Promise<boolean> {
    try {
      if (this.transporter) {
        await this.transporter.verify()
        return true
      }
      return false
    } catch (error) {
      console.error('Email service verification failed:', error)
      return false
    }
  }
}