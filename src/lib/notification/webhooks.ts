import crypto from 'crypto'
import { PaymentStatus, OrderStatus } from '@prisma/client'
import { onPaymentStatusChange, createPaymentStatusChangeEvent } from './payment-integration'
import type { PaymentStatusChangeEvent } from './payment-integration'

/**
 * Webhook事件类型
 */
export interface WebhookEvent {
  id: string
  type: string
  data: Record<string, any>
  timestamp: string
  signature?: string
}

/**
 * 支付宝Webhook事件
 */
export interface AlipayWebhookEvent extends WebhookEvent {
  type: 'alipay.trade.pay' | 'alipay.trade.refund' | 'alipay.trade.close'
  data: {
    out_trade_no: string // 商户订单号
    trade_no: string // 支付宝交易号
    trade_status: 'TRADE_SUCCESS' | 'TRADE_FINISHED' | 'TRADE_CLOSED' | 'WAIT_BUYER_PAY'
    total_amount: string
    buyer_id: string
    gmt_payment?: string
    gmt_refund?: string
    refund_fee?: string
  }
}

/**
 * 微信支付Webhook事件
 */
export interface WechatWebhookEvent extends WebhookEvent {
  type: 'payment.success' | 'payment.failed' | 'refund.success' | 'refund.failed'
  data: {
    out_trade_no: string // 商户订单号
    transaction_id: string // 微信支付订单号
    trade_state: 'SUCCESS' | 'REFUND' | 'NOTPAY' | 'CLOSED' | 'REVOKED' | 'USERPAYING' | 'PAYERROR'
    total_fee: number
    openid: string
    time_end?: string
    refund_fee?: number
  }
}

/**
 * Webhook签名验证器
 */
export class WebhookSignatureValidator {
  /**
   * 验证支付宝Webhook签名
   */
  static verifyAlipaySignature(
    data: string,
    signature: string,
    publicKey: string
  ): boolean {
    try {
      const verify = crypto.createVerify('RSA-SHA256')
      verify.update(data, 'utf8')
      return verify.verify(publicKey, signature, 'base64')
    } catch (error) {
      console.error('Failed to verify Alipay signature:', error)
      return false
    }
  }

  /**
   * 验证微信支付Webhook签名
   */
  static verifyWechatSignature(
    timestamp: string,
    nonce: string,
    body: string,
    signature: string,
    apiKey: string
  ): boolean {
    try {
      const stringToSign = `${timestamp}\n${nonce}\n${body}\n`
      const hmac = crypto.createHmac('sha256', apiKey)
      hmac.update(stringToSign, 'utf8')
      const expectedSignature = hmac.digest('base64')
      return signature === expectedSignature
    } catch (error) {
      console.error('Failed to verify WeChat signature:', error)
      return false
    }
  }

  /**
   * 验证通用HMAC签名
   */
  static verifyHmacSignature(
    data: string,
    signature: string,
    secret: string,
    algorithm: string = 'sha256'
  ): boolean {
    try {
      const hmac = crypto.createHmac(algorithm, secret)
      hmac.update(data, 'utf8')
      const expectedSignature = hmac.digest('hex')
      return signature === expectedSignature
    } catch (error) {
      console.error('Failed to verify HMAC signature:', error)
      return false
    }
  }
}

/**
 * Webhook处理器
 */
export class WebhookHandler {
  /**
   * 处理支付宝Webhook事件
   */
  static async handleAlipayWebhook(event: AlipayWebhookEvent): Promise<void> {
    try {
      const { out_trade_no, trade_status, total_amount, trade_no } = event.data
      
      // 根据交易状态映射支付状态
      let paymentStatus: PaymentStatus
      switch (trade_status) {
        case 'TRADE_SUCCESS':
        case 'TRADE_FINISHED':
          paymentStatus = PaymentStatus.PAID
          break
        case 'TRADE_CLOSED':
          paymentStatus = PaymentStatus.FAILED
          break
        case 'WAIT_BUYER_PAY':
          paymentStatus = PaymentStatus.PENDING
          break
        default:
          console.log(`Unknown Alipay trade status: ${trade_status}`)
          return
      }

      // 查询订单信息（这里需要根据实际的数据库查询逻辑）
      const orderInfo = await this.getOrderInfo(out_trade_no)
      if (!orderInfo) {
        console.error(`Order not found: ${out_trade_no}`)
        return
      }

      // 创建支付状态变更事件
      const paymentEvent = createPaymentStatusChangeEvent(
        out_trade_no,
        orderInfo.userId,
        PaymentStatus.PENDING, // 假设之前状态为待支付
        paymentStatus,
        parseFloat(total_amount),
        {
          paymentId: trade_no,
          paymentMethod: 'alipay',
          metadata: {
            trade_no,
            trade_status,
            webhook_id: event.id,
            timestamp: event.timestamp
          }
        }
      )

      // 触发通知
      await onPaymentStatusChange(paymentEvent)
      
      console.log(`Alipay webhook processed: ${out_trade_no} -> ${paymentStatus}`)
    } catch (error) {
      console.error('Failed to handle Alipay webhook:', error)
      throw error
    }
  }

  /**
   * 处理微信支付Webhook事件
   */
  static async handleWechatWebhook(event: WechatWebhookEvent): Promise<void> {
    try {
      const { out_trade_no, trade_state, total_fee, transaction_id } = event.data
      
      // 根据交易状态映射支付状态
      let paymentStatus: PaymentStatus
      switch (trade_state) {
        case 'SUCCESS':
          paymentStatus = PaymentStatus.PAID
          break
        case 'REFUND':
          paymentStatus = PaymentStatus.REFUNDED
          break
        case 'CLOSED':
        case 'REVOKED':
        case 'PAYERROR':
          paymentStatus = PaymentStatus.FAILED
          break
        case 'NOTPAY':
        case 'USERPAYING':
          paymentStatus = PaymentStatus.PENDING
          break
        default:
          console.log(`Unknown WeChat trade state: ${trade_state}`)
          return
      }

      // 查询订单信息
      const orderInfo = await this.getOrderInfo(out_trade_no)
      if (!orderInfo) {
        console.error(`Order not found: ${out_trade_no}`)
        return
      }

      // 创建支付状态变更事件
      const paymentEvent = createPaymentStatusChangeEvent(
        out_trade_no,
        orderInfo.userId,
        PaymentStatus.PENDING, // 假设之前状态为待支付
        paymentStatus,
        total_fee / 100, // 微信支付金额单位为分
        {
          paymentId: transaction_id,
          paymentMethod: 'wechat',
          refundAmount: event.data.refund_fee ? event.data.refund_fee / 100 : undefined,
          metadata: {
            transaction_id,
            trade_state,
            openid: event.data.openid,
            webhook_id: event.id,
            timestamp: event.timestamp
          }
        }
      )

      // 触发通知
      await onPaymentStatusChange(paymentEvent)
      
      console.log(`WeChat webhook processed: ${out_trade_no} -> ${paymentStatus}`)
    } catch (error) {
      console.error('Failed to handle WeChat webhook:', error)
      throw error
    }
  }

  /**
   * 处理通用支付Webhook事件
   */
  static async handleGenericWebhook(event: WebhookEvent): Promise<void> {
    try {
      const { type, data } = event
      
      // 根据事件类型处理
      switch (type) {
        case 'payment.success':
          await this.handlePaymentSuccess(data, event)
          break
        case 'payment.failed':
          await this.handlePaymentFailed(data, event)
          break
        case 'payment.refund':
          await this.handlePaymentRefund(data, event)
          break
        case 'order.confirmed':
          await this.handleOrderConfirmed(data, event)
          break
        case 'order.cancelled':
          await this.handleOrderCancelled(data, event)
          break
        default:
          console.log(`Unknown webhook event type: ${type}`)
      }
    } catch (error) {
      console.error('Failed to handle generic webhook:', error)
      throw error
    }
  }

  /**
   * 处理支付成功事件
   */
  private static async handlePaymentSuccess(data: any, event: WebhookEvent): Promise<void> {
    const orderInfo = await this.getOrderInfo(data.order_id)
    if (!orderInfo) return

    const paymentEvent = createPaymentStatusChangeEvent(
      data.order_id,
      orderInfo.userId,
      PaymentStatus.PENDING,
      PaymentStatus.PAID,
      data.amount,
      {
        paymentId: data.payment_id,
        paymentMethod: data.payment_method,
        metadata: { webhook_id: event.id, timestamp: event.timestamp }
      }
    )

    await onPaymentStatusChange(paymentEvent)
  }

  /**
   * 处理支付失败事件
   */
  private static async handlePaymentFailed(data: any, event: WebhookEvent): Promise<void> {
    const orderInfo = await this.getOrderInfo(data.order_id)
    if (!orderInfo) return

    const paymentEvent = createPaymentStatusChangeEvent(
      data.order_id,
      orderInfo.userId,
      PaymentStatus.PENDING,
      PaymentStatus.FAILED,
      data.amount,
      {
        paymentId: data.payment_id,
        paymentMethod: data.payment_method,
        failureReason: data.failure_reason,
        metadata: { webhook_id: event.id, timestamp: event.timestamp }
      }
    )

    await onPaymentStatusChange(paymentEvent)
  }

  /**
   * 处理退款事件
   */
  private static async handlePaymentRefund(data: any, event: WebhookEvent): Promise<void> {
    const orderInfo = await this.getOrderInfo(data.order_id)
    if (!orderInfo) return

    const paymentEvent = createPaymentStatusChangeEvent(
      data.order_id,
      orderInfo.userId,
      PaymentStatus.PAID,
      PaymentStatus.REFUNDED,
      data.original_amount,
      {
        paymentId: data.payment_id,
        paymentMethod: data.payment_method,
        refundAmount: data.refund_amount,
        metadata: { webhook_id: event.id, timestamp: event.timestamp }
      }
    )

    await onPaymentStatusChange(paymentEvent)
  }

  /**
   * 处理订单确认事件
   */
  private static async handleOrderConfirmed(data: any, event: WebhookEvent): Promise<void> {
    const orderInfo = await this.getOrderInfo(data.order_id)
    if (!orderInfo) return

    const paymentEvent = createPaymentStatusChangeEvent(
      data.order_id,
      orderInfo.userId,
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      data.amount,
      {
        metadata: { webhook_id: event.id, timestamp: event.timestamp }
      }
    )

    await onPaymentStatusChange(paymentEvent)
  }

  /**
   * 处理订单取消事件
   */
  private static async handleOrderCancelled(data: any, event: WebhookEvent): Promise<void> {
    const orderInfo = await this.getOrderInfo(data.order_id)
    if (!orderInfo) return

    const paymentEvent = createPaymentStatusChangeEvent(
      data.order_id,
      orderInfo.userId,
      OrderStatus.CONFIRMED,
      OrderStatus.CANCELLED,
      data.amount,
      {
        metadata: { webhook_id: event.id, timestamp: event.timestamp }
      }
    )

    await onPaymentStatusChange(paymentEvent)
  }

  /**
   * 获取订单信息（需要根据实际数据库实现）
   */
  private static async getOrderInfo(orderId: string): Promise<{ userId: string; amount: number } | null> {
    // 这里应该查询实际的订单数据库
    // 返回订单的用户ID和金额信息
    try {
      // 模拟数据库查询
      // const order = await prisma.order.findUnique({
      //   where: { id: orderId },
      //   select: { userId: true, totalAmount: true }
      // })
      // return order ? { userId: order.userId, amount: order.totalAmount } : null
      
      // 临时返回模拟数据
      return {
        userId: 'user_' + orderId.slice(-6),
        amount: 100.00
      }
    } catch (error) {
      console.error('Failed to get order info:', error)
      return null
    }
  }
}

/**
 * Webhook事件验证和处理的统一入口
 */
export async function processWebhook(
  eventType: 'alipay' | 'wechat' | 'generic',
  rawData: string,
  signature?: string,
  headers?: Record<string, string>
): Promise<{ success: boolean; message: string }> {
  try {
    // 解析事件数据
    const eventData = JSON.parse(rawData)
    
    // 验证签名（根据不同的支付平台）
    if (signature) {
      let isValid = false
      
      switch (eventType) {
        case 'alipay':
          const alipayPublicKey = process.env.ALIPAY_PUBLIC_KEY || ''
          isValid = WebhookSignatureValidator.verifyAlipaySignature(
            rawData,
            signature,
            alipayPublicKey
          )
          break
        case 'wechat':
          const wechatApiKey = process.env.WECHAT_API_KEY || ''
          const timestamp = headers?.['wechatpay-timestamp'] || ''
          const nonce = headers?.['wechatpay-nonce'] || ''
          isValid = WebhookSignatureValidator.verifyWechatSignature(
            timestamp,
            nonce,
            rawData,
            signature,
            wechatApiKey
          )
          break
        case 'generic':
          const webhookSecret = process.env.WEBHOOK_SECRET || ''
          isValid = WebhookSignatureValidator.verifyHmacSignature(
            rawData,
            signature,
            webhookSecret
          )
          break
      }
      
      if (!isValid) {
        return { success: false, message: 'Invalid signature' }
      }
    }

    // 处理事件
    switch (eventType) {
      case 'alipay':
        await WebhookHandler.handleAlipayWebhook(eventData as AlipayWebhookEvent)
        break
      case 'wechat':
        await WebhookHandler.handleWechatWebhook(eventData as WechatWebhookEvent)
        break
      case 'generic':
        await WebhookHandler.handleGenericWebhook(eventData)
        break
    }

    return { success: true, message: 'Webhook processed successfully' }
  } catch (error) {
    console.error('Failed to process webhook:', error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}