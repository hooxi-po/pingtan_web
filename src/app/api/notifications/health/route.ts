import { NextRequest, NextResponse } from 'next/server'
import { healthCheck } from '@/lib/notification'

/**
 * GET /api/notifications/health - 通知系统健康检查
 */
export async function GET(request: NextRequest) {
  try {
    const healthStatus = await healthCheck()
    
    // 根据健康状态返回相应的HTTP状态码
    const statusCode = healthStatus.status === 'healthy' ? 200 : 503
    
    return NextResponse.json(healthStatus, { status: statusCode })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  }
}