import { NextRequest, NextResponse } from 'next/server'
import { processWebhook } from '@/lib/notification/webhooks'

/**
 * POST /api/webhooks/payment - 接收支付系统Webhook通知
 */
export async function POST(request: NextRequest) {
  try {
    // 获取原始请求体
    const rawBody = await request.text()
    
    // 获取请求头
    const headers = Object.fromEntries(request.headers.entries())
    
    // 获取查询参数，确定支付平台类型
    const { searchParams } = new URL(request.url)
    const provider = searchParams.get('provider') || 'generic' // alipay, wechat, generic
    
    // 获取签名
    let signature: string | undefined
    switch (provider) {
      case 'alipay':
        signature = headers['x-alipay-signature'] || searchParams.get('sign') || undefined
        break
      case 'wechat':
        signature = headers['wechatpay-signature']
        break
      case 'generic':
        signature = headers['x-webhook-signature'] || headers['x-signature']
        break
    }

    // 记录Webhook接收日志
    console.log(`Received ${provider} webhook:`, {
      contentLength: rawBody.length,
      hasSignature: !!signature,
      timestamp: new Date().toISOString()
    })

    // 处理Webhook事件
    const result = await processWebhook(
      provider as 'alipay' | 'wechat' | 'generic',
      rawBody,
      signature,
      headers
    )

    if (result.success) {
      // 根据不同支付平台返回相应的成功响应
      switch (provider) {
        case 'alipay':
          return new NextResponse('success', { status: 200 })
        case 'wechat':
          return NextResponse.json({ code: 'SUCCESS', message: '成功' })
        default:
          return NextResponse.json({ status: 'success', message: result.message })
      }
    } else {
      console.error(`Webhook processing failed: ${result.message}`)
      
      // 根据不同支付平台返回相应的失败响应
      switch (provider) {
        case 'alipay':
          return new NextResponse('fail', { status: 400 })
        case 'wechat':
          return NextResponse.json({ code: 'FAIL', message: result.message }, { status: 400 })
        default:
          return NextResponse.json({ status: 'error', message: result.message }, { status: 400 })
      }
    }
  } catch (error) {
    console.error('Webhook endpoint error:', error)
    
    // 返回通用错误响应
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/webhooks/payment - Webhook端点健康检查
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'healthy',
    endpoint: 'payment-webhook',
    timestamp: new Date().toISOString(),
    supportedProviders: ['alipay', 'wechat', 'generic']
  })
}