import crypto from 'crypto'
import { z } from 'zod'

/**
 * 通知安全验证器
 * 负责验证通知内容的安全性和准确性
 */
export class NotificationSecurityValidator {
  private readonly secretKey: string
  private readonly allowedDomains: string[]
  private readonly maxContentLength: number
  private readonly sensitiveWords: string[]

  constructor(config: {
    secretKey?: string
    allowedDomains?: string[]
    maxContentLength?: number
    sensitiveWords?: string[]
  } = {}) {
    this.secretKey = config.secretKey || process.env.NOTIFICATION_SECRET_KEY || 'default-secret-key'
    this.allowedDomains = config.allowedDomains || ['pingtan-travel.com', 'localhost']
    this.maxContentLength = config.maxContentLength || 2000
    this.sensitiveWords = config.sensitiveWords || [
      '密码', 'password', '银行卡', '身份证', 'credit card',
      '验证码', 'verification code', '支付密码', 'payment password'
    ]
  }

  /**
   * 验证通知内容安全性
   */
  validateContent(content: string, title?: string): {
    isValid: boolean
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []

    // 1. 长度验证
    if (content.length > this.maxContentLength) {
      errors.push(`Content exceeds maximum length of ${this.maxContentLength} characters`)
    }

    if (title && title.length > 200) {
      errors.push('Title exceeds maximum length of 200 characters')
    }

    // 2. 敏感词检测
    const sensitiveWordsFound = this.detectSensitiveWords(content)
    if (sensitiveWordsFound.length > 0) {
      warnings.push(`Sensitive words detected: ${sensitiveWordsFound.join(', ')}`)
    }

    // 3. HTML/脚本注入检测
    if (this.containsScriptInjection(content)) {
      errors.push('Content contains potential script injection')
    }

    // 4. URL安全检测
    const unsafeUrls = this.detectUnsafeUrls(content)
    if (unsafeUrls.length > 0) {
      warnings.push(`Potentially unsafe URLs detected: ${unsafeUrls.join(', ')}`)
    }

    // 5. 格式验证
    if (!this.isValidFormat(content)) {
      errors.push('Content contains invalid formatting')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * 验证用户权限
   */
  validateUserPermission(userId: string, notificationType: string, channel: string): boolean {
    // 这里可以实现更复杂的权限验证逻辑
    // 例如：检查用户是否有发送特定类型通知的权限
    
    // 基本验证：用户ID不能为空
    if (!userId || userId.trim() === '') {
      return false
    }

    // 验证通知类型和渠道的组合是否合法
    const validCombinations = {
      'PAYMENT_SUCCESS': ['SMS', 'EMAIL', 'IN_APP'],
      'PAYMENT_FAILED': ['SMS', 'EMAIL', 'IN_APP'],
      'ORDER_CONFIRMED': ['SMS', 'EMAIL', 'IN_APP', 'PUSH'],
      'ORDER_CANCELLED': ['SMS', 'EMAIL', 'IN_APP'],
      'SYSTEM_ANNOUNCEMENT': ['IN_APP', 'PUSH'],
      'PROMOTIONAL': ['EMAIL', 'IN_APP', 'PUSH'],
      'SECURITY_ALERT': ['SMS', 'EMAIL', 'IN_APP', 'PUSH']
    }

    const allowedChannels = validCombinations[notificationType as keyof typeof validCombinations]
    return allowedChannels ? allowedChannels.includes(channel) : false
  }

  /**
   * 生成通知签名
   */
  generateSignature(data: {
    userId: string
    content: string
    timestamp: number
  }): string {
    const payload = `${data.userId}:${data.content}:${data.timestamp}`
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(payload)
      .digest('hex')
  }

  /**
   * 验证通知签名
   */
  verifySignature(data: {
    userId: string
    content: string
    timestamp: number
    signature: string
  }): boolean {
    const expectedSignature = this.generateSignature({
      userId: data.userId,
      content: data.content,
      timestamp: data.timestamp
    })
    
    return crypto.timingSafeEqual(
      Buffer.from(data.signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )
  }

  /**
   * 清理和转义内容
   */
  sanitizeContent(content: string): string {
    return content
      // 移除潜在的脚本标签
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // 转义HTML特殊字符
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      // 移除多余的空白字符
      .trim()
      .replace(/\s+/g, ' ')
  }

  /**
   * 验证手机号格式
   */
  validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^1[3-9]\d{9}$/
    return phoneRegex.test(phone)
  }

  /**
   * 验证邮箱格式
   */
  validateEmail(email: string): boolean {
    const emailSchema = z.string().email()
    try {
      emailSchema.parse(email)
      return true
    } catch {
      return false
    }
  }

  /**
   * 验证通知频率限制
   */
  async validateRateLimit(userId: string, channel: string): Promise<{
    allowed: boolean
    remainingQuota: number
    resetTime: Date
  }> {
    // 这里应该实现基于Redis或数据库的频率限制
    // 暂时返回模拟数据
    const limits = {
      SMS: { hourly: 10, daily: 50 },
      EMAIL: { hourly: 50, daily: 200 },
      IN_APP: { hourly: 100, daily: 500 },
      PUSH: { hourly: 100, daily: 500 }
    }

    const channelLimit = limits[channel as keyof typeof limits]
    if (!channelLimit) {
      return {
        allowed: false,
        remainingQuota: 0,
        resetTime: new Date(Date.now() + 3600000) // 1小时后重置
      }
    }

    // 模拟检查当前使用量
    const currentUsage = Math.floor(Math.random() * channelLimit.hourly)
    const remaining = Math.max(0, channelLimit.hourly - currentUsage)

    return {
      allowed: remaining > 0,
      remainingQuota: remaining,
      resetTime: new Date(Date.now() + 3600000)
    }
  }

  /**
   * 检测敏感词
   */
  private detectSensitiveWords(content: string): string[] {
    const found: string[] = []
    const lowerContent = content.toLowerCase()

    for (const word of this.sensitiveWords) {
      if (lowerContent.includes(word.toLowerCase())) {
        found.push(word)
      }
    }

    return found
  }

  /**
   * 检测脚本注入
   */
  private containsScriptInjection(content: string): boolean {
    const scriptPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^>]*>/gi,
      /<object\b[^>]*>/gi,
      /<embed\b[^>]*>/gi
    ]

    return scriptPatterns.some(pattern => pattern.test(content))
  }

  /**
   * 检测不安全的URL
   */
  private detectUnsafeUrls(content: string): string[] {
    const urlRegex = /https?:\/\/[^\s<>"']+/gi
    const urls = content.match(urlRegex) || []
    const unsafeUrls: string[] = []

    for (const url of urls) {
      try {
        const urlObj = new URL(url)
        const domain = urlObj.hostname.toLowerCase()
        
        // 检查是否在允许的域名列表中
        const isAllowed = this.allowedDomains.some(allowedDomain => 
          domain === allowedDomain || domain.endsWith('.' + allowedDomain)
        )

        if (!isAllowed) {
          unsafeUrls.push(url)
        }
      } catch {
        // 无效URL
        unsafeUrls.push(url)
      }
    }

    return unsafeUrls
  }

  /**
   * 验证内容格式
   */
  private isValidFormat(content: string): boolean {
    // 检查是否包含无效字符
    const invalidChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/
    if (invalidChars.test(content)) {
      return false
    }

    // 检查是否有未闭合的标签（如果允许HTML）
    const openTags = (content.match(/<[^\/][^>]*>/g) || []).length
    const closeTags = (content.match(/<\/[^>]*>/g) || []).length
    
    // 简单的标签平衡检查
    if (Math.abs(openTags - closeTags) > 2) {
      return false
    }

    return true
  }
}

/**
 * 通知内容加密器
 */
export class NotificationEncryption {
  private readonly algorithm = 'aes-256-gcm'
  private readonly secretKey: Buffer

  constructor(secretKey?: string) {
    const key = secretKey || process.env.NOTIFICATION_ENCRYPTION_KEY || 'default-encryption-key-32-chars!!'
    this.secretKey = crypto.scryptSync(key, 'salt', 32)
  }

  /**
   * 加密敏感内容
   */
  encrypt(text: string): {
    encrypted: string
    iv: string
    tag: string
  } {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher('aes-256-gcm', this.secretKey)
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const tag = cipher.getAuthTag()

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    }
  }

  /**
   * 解密敏感内容
   */
  decrypt(encryptedData: {
    encrypted: string
    iv: string
    tag: string
  }): string {
    const iv = Buffer.from(encryptedData.iv, 'hex')
    const tag = Buffer.from(encryptedData.tag, 'hex')
    
    const decipher = crypto.createDecipher('aes-256-gcm', this.secretKey)
    decipher.setAuthTag(tag)
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  }

  /**
   * 生成安全的随机令牌
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }
}

// 导出默认实例
export const securityValidator = new NotificationSecurityValidator()
export const notificationEncryption = new NotificationEncryption()