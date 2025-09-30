import { NotificationSendResult } from '../types'

interface SMSConfig {
  provider: 'aliyun' | 'tencent' | 'twilio'
  apiKey: string
  apiSecret: string
  signName: string
  templateCode: string
}

interface SMSSendRequest {
  to: string
  content: string
  metadata?: Record<string, any>
}

export class SMSService {
  private config: SMSConfig

  constructor(config: SMSConfig) {
    this.config = config
  }

  async send(request: SMSSendRequest): Promise<NotificationSendResult> {
    try {
      // 验证手机号
      if (!this.isValidPhoneNumber(request.to)) {
        return {
          success: false,
          errorMessage: 'Invalid phone number format'
        }
      }

      // 根据不同的服务商发送短信
      switch (this.config.provider) {
        case 'aliyun':
          return await this.sendViaAliyun(request)
        case 'tencent':
          return await this.sendViaTencent(request)
        case 'twilio':
          return await this.sendViaTwilio(request)
        default:
          throw new Error(`Unsupported SMS provider: ${this.config.provider}`)
      }
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown SMS error'
      }
    }
  }

  private async sendViaAliyun(request: SMSSendRequest): Promise<NotificationSendResult> {
    // 阿里云短信服务集成
    // 这里使用模拟实现，实际项目中需要集成阿里云SDK
    
    const mockResponse = {
      Code: 'OK',
      Message: 'OK',
      BizId: `aliyun_${Date.now()}`,
      RequestId: `req_${Date.now()}`
    }

    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 100))

    if (mockResponse.Code === 'OK') {
      return {
        success: true,
        externalId: mockResponse.BizId,
        deliveredAt: new Date()
      }
    } else {
      return {
        success: false,
        errorMessage: mockResponse.Message
      }
    }
  }

  private async sendViaTencent(request: SMSSendRequest): Promise<NotificationSendResult> {
    // 腾讯云短信服务集成
    // 这里使用模拟实现，实际项目中需要集成腾讯云SDK
    
    const mockResponse = {
      Response: {
        SendStatusSet: [{
          SerialNo: `tencent_${Date.now()}`,
          PhoneNumber: request.to,
          Fee: 1,
          SessionContext: '',
          Code: 'Ok',
          Message: 'send success'
        }],
        RequestId: `req_${Date.now()}`
      }
    }

    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 100))

    const status = mockResponse.Response.SendStatusSet[0]
    if (status.Code === 'Ok') {
      return {
        success: true,
        externalId: status.SerialNo,
        deliveredAt: new Date()
      }
    } else {
      return {
        success: false,
        errorMessage: status.Message
      }
    }
  }

  private async sendViaTwilio(request: SMSSendRequest): Promise<NotificationSendResult> {
    // Twilio短信服务集成
    // 这里使用模拟实现，实际项目中需要集成Twilio SDK
    
    const mockResponse = {
      sid: `twilio_${Date.now()}`,
      status: 'sent',
      error_code: null,
      error_message: null
    }

    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 100))

    if (mockResponse.status === 'sent') {
      return {
        success: true,
        externalId: mockResponse.sid,
        deliveredAt: new Date()
      }
    } else {
      return {
        success: false,
        errorMessage: mockResponse.error_message || 'SMS send failed'
      }
    }
  }

  private isValidPhoneNumber(phone: string): boolean {
    // 简单的手机号验证，支持中国大陆手机号
    const phoneRegex = /^1[3-9]\d{9}$/
    return phoneRegex.test(phone)
  }

  /**
   * 获取短信发送状态（用于状态回调）
   */
  async getDeliveryStatus(externalId: string): Promise<{
    status: 'pending' | 'delivered' | 'failed'
    deliveredAt?: Date
    errorMessage?: string
  }> {
    // 这里应该调用对应服务商的状态查询API
    // 模拟实现
    return {
      status: 'delivered',
      deliveredAt: new Date()
    }
  }

  /**
   * 批量发送短信
   */
  async sendBatch(requests: SMSSendRequest[]): Promise<NotificationSendResult[]> {
    const results: NotificationSendResult[] = []
    
    // 并发发送，但限制并发数量
    const batchSize = 10
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize)
      const batchResults = await Promise.all(
        batch.map(request => this.send(request))
      )
      results.push(...batchResults)
    }
    
    return results
  }
}