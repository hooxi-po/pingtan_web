import { NextResponse } from 'next/server'
import { z } from 'zod'
import { validateRequest } from './validations'

// 多语言错误信息映射
const errorMessages = {
  zh: {
    // 通用错误
    'api.error.general': '服务器错误，请稍后重试',
    'api.error.network': '网络连接失败',
    'api.error.notFound': '请求的资源不存在',
    'api.error.unauthorized': '未授权访问',
    'api.error.forbidden': '访问被禁止',
    'api.error.validation': '数据验证失败',
    
    // 景点相关
    'api.attractions.fetchFailed': '获取景点列表失败',
    'api.attractions.createFailed': '创建景点失败',
    'api.attractions.updateFailed': '更新景点失败',
    'api.attractions.deleteFailed': '删除景点失败',
    'api.attractions.detailsFailed': '获取景点详情失败',
    'api.attractions.nameRequired': '景点名称（中文）为必填项',
    'api.attractions.invalidId': '无效的景点ID',
    'api.attractions.notFound': '景点不存在',
    'api.attractions.deleteSuccess': '景点删除成功',
    
    // 新闻相关
    'api.news.fetchFailed': '获取新闻列表失败',
    'api.news.createFailed': '创建新闻失败',
    'api.news.titleContentRequired': '标题和内容为必填项',
    
    // 行程相关
    'api.itineraries.fetchFailed': '获取行程推荐失败',
    'api.itineraries.createFailed': '创建行程失败',
    'api.itineraries.titleDaysRequired': '标题和天数为必填项',
    
    // 民宿相关
    'api.accommodations.fetchFailed': '获取民宿列表失败',
    'api.accommodations.createFailed': '创建民宿失败',
    'api.accommodations.updateFailed': '更新民宿失败',
    'api.accommodations.deleteFailed': '删除民宿失败',
    'api.accommodations.detailsFailed': '获取民宿详情失败',
    'api.accommodations.nameRequired': '民宿名称为必填项',
    'api.accommodations.invalidId': '无效的民宿ID',
    'api.accommodations.notFound': '民宿不存在',
    
    // 餐厅相关
    'api.restaurants.fetchFailed': '获取餐厅列表失败',
    'api.restaurants.createFailed': '创建餐厅失败',
    'api.restaurants.updateFailed': '更新餐厅失败',
    'api.restaurants.deleteFailed': '删除餐厅失败',
    'api.restaurants.detailsFailed': '获取餐厅详情失败',
    'api.restaurants.nameRequired': '餐厅名称为必填项',
    'api.restaurants.invalidId': '无效的餐厅ID',
    'api.restaurants.notFound': '餐厅不存在',
    
    // 速率限制
    'api.error.rateLimit': '请求过于频繁，请稍后再试',
    
    // 成功消息
    'api.success.fetch': '获取数据成功'
  },
  en: {
    // 通用错误
    'api.error.general': 'Server error, please try again later',
    'api.error.network': 'Network connection failed',
    'api.error.notFound': 'Requested resource not found',
    'api.error.unauthorized': 'Unauthorized access',
    'api.error.forbidden': 'Access forbidden',
    'api.error.validation': 'Data validation failed',
    
    // 景点相关
    'api.attractions.fetchFailed': 'Failed to fetch attractions list',
    'api.attractions.createFailed': 'Failed to create attraction',
    'api.attractions.updateFailed': 'Failed to update attraction',
    'api.attractions.deleteFailed': 'Failed to delete attraction',
    'api.attractions.detailsFailed': 'Failed to fetch attraction details',
    'api.attractions.nameRequired': 'Attraction name (Chinese) is required',
    'api.attractions.invalidId': 'Invalid attraction ID',
    'api.attractions.notFound': 'Attraction not found',
    'api.attractions.deleteSuccess': 'Attraction deleted successfully',
    
    // 新闻相关
    'api.news.fetchFailed': 'Failed to fetch news list',
    'api.news.createFailed': 'Failed to create news',
    'api.news.titleContentRequired': 'Title and content are required',
    
    // 行程相关
    'api.itineraries.fetchFailed': 'Failed to fetch itineraries',
    'api.itineraries.createFailed': 'Failed to create itinerary',
    'api.itineraries.titleDaysRequired': 'Title and days are required',
    
    // 民宿相关
    'api.accommodations.fetchFailed': 'Failed to fetch accommodations list',
    'api.accommodations.createFailed': 'Failed to create accommodation',
    'api.accommodations.updateFailed': 'Failed to update accommodation',
    'api.accommodations.deleteFailed': 'Failed to delete accommodation',
    'api.accommodations.detailsFailed': 'Failed to fetch accommodation details',
    'api.accommodations.nameRequired': 'Accommodation name is required',
    'api.accommodations.invalidId': 'Invalid accommodation ID',
    'api.accommodations.notFound': 'Accommodation not found',
    
    // 餐厅相关
    'api.restaurants.fetchFailed': 'Failed to fetch restaurants list',
    'api.restaurants.createFailed': 'Failed to create restaurant',
    'api.restaurants.updateFailed': 'Failed to update restaurant',
    'api.restaurants.deleteFailed': 'Failed to delete restaurant',
    'api.restaurants.detailsFailed': 'Failed to fetch restaurant details',
    'api.restaurants.nameRequired': 'Restaurant name is required',
    'api.restaurants.invalidId': 'Invalid restaurant ID',
    'api.restaurants.notFound': 'Restaurant not found',
    
    // 速率限制
    'api.error.rateLimit': 'Too many requests, please try again later',
    
    // 成功消息
    'api.success.fetch': 'Data fetched successfully'
  }
}

/**
 * 获取本地化的错误信息
 * @param key 错误信息键值
 * @param lang 语言代码 ('zh' | 'en')
 * @returns 本地化的错误信息
 */
export function getLocalizedMessage(key: string, lang: string = 'zh'): string {
  const locale = lang === 'en' ? 'en' : 'zh'
  return errorMessages[locale][key as keyof typeof errorMessages[typeof locale]] || key
}

/**
 * 创建本地化的错误响应
 * @param key 错误信息键值
 * @param status HTTP状态码
 * @param lang 语言代码
 * @returns NextResponse 错误响应
 */
export function createErrorResponse(key: string, status: number = 500, lang: string = 'zh'): NextResponse {
  const message = getLocalizedMessage(key, lang)
  return NextResponse.json(
    { success: false, error: message },
    { status }
  )
}

/**
 * 创建本地化的成功响应
 * @param key 成功信息键值
 * @param data 响应数据
 * @param status HTTP状态码
 * @param lang 语言代码
 * @returns NextResponse 成功响应
 */
export function createSuccessResponse(
  key: string, 
  data?: unknown, 
  status: number = 200, 
  lang: string = 'zh'
): NextResponse {
  const message = getLocalizedMessage(key, lang)
  const response: Record<string, unknown> = { success: true, message }
  
  if (data !== undefined) {
    response.data = data
  }
  
  return NextResponse.json(response, { status })
}

/**
 * 从请求中获取语言参数
 * @param request NextRequest 对象
 * @returns 语言代码
 */
export function getLanguageFromRequest(request: Request): string {
  const url = new URL(request.url)
  return url.searchParams.get('lang') || 'zh'
}

/**
 * 记录错误日志（支持多语言）
 * @param error 错误对象
 * @param context 错误上下文
 * @param lang 语言代码
 */
export function logError(error: unknown, context: string, lang: string = 'zh'): void {
  console.error(`[${context}] Error:`, error)
  
  // 发送错误到监控服务
  if (typeof window !== 'undefined') {
    import('./monitoring').then(({ errorTracker }) => {
      errorTracker.captureError({
        message: error?.message || String(error),
        stack: error?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        severity: 'medium',
        context: {
          type: context,
          language: lang,
          timestamp: new Date().toISOString()
        }
      })
    })
  }
}

// 验证请求数据的辅助函数
export async function validateRequestData<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; errors: string[] }> {
  try {
    const body = await request.json()
    return validateRequest(schema, body)
  } catch {
    return {
      success: false,
      errors: ['Invalid JSON format']
    }
  }
}

// 验证查询参数的辅助函数
export function validateQueryParams<T>(
  request: Request,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; errors: string[] } {
  const url = new URL(request.url)
  const params: Record<string, unknown> = {}
  
  for (const [key, value] of url.searchParams.entries()) {
    params[key] = value
  }
  
  return validateRequest(schema, params)
}

// 创建验证错误响应
export function createValidationErrorResponse(
  errors: string[],
  lang: string = 'zh'
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message: getLocalizedMessage('api.error.validation', lang),
      errors,
      data: null
    },
    { status: 400 }
  )
}

// 统一的API响应格式
export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  errors?: string[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// 创建分页响应
export function createPaginatedResponse<T>(
  items: T[],
  page: number,
  limit: number,
  total: number,
  messageKey: string = 'api.success.fetch',
  lang: string = 'zh'
): NextResponse {
  const totalPages = Math.ceil(total / limit)
  const hasNext = page < totalPages
  const hasPrev = page > 1

  const response: ApiResponse<{ items: T[]; pagination: Record<string, unknown> }> = {
    success: true,
    message: getLocalizedMessage(messageKey, lang),
    data: {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev
      }
    }
  }

  return NextResponse.json(response)
}

// 错误类型枚举
export enum ApiErrorType {
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INTERNAL_SERVER = 'INTERNAL_SERVER',
  BAD_REQUEST = 'BAD_REQUEST',
  CONFLICT = 'CONFLICT'
}

// 自定义API错误类
export class ApiError extends Error {
  public readonly type: ApiErrorType
  public readonly statusCode: number
  public readonly messageKey: string
  public readonly details?: unknown

  constructor(
    type: ApiErrorType,
    messageKey: string,
    statusCode: number,
    details?: unknown
  ) {
    super(messageKey)
    this.type = type
    this.messageKey = messageKey
    this.statusCode = statusCode
    this.details = details
    this.name = 'ApiError'
  }
}

// 处理API错误的辅助函数
export function handleApiError(
  error: unknown,
  context: string,
  lang: string = 'zh'
): NextResponse {
  // 记录错误
  logError(error, context, lang)

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        message: getLocalizedMessage(error.messageKey, lang),
        error: error.type,
        details: error.details
      },
      { status: error.statusCode }
    )
  }

  if (error instanceof z.ZodError) {
    const errors = error.errors.map(err => err.message)
    return createValidationErrorResponse(errors, lang)
  }

  // 默认服务器错误
  return createErrorResponse('api.error.general', 500, lang)
}

// 速率限制检查（简单实现）
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15分钟
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  
  // 清理过期的记录
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < now) {
      rateLimitMap.delete(key)
    }
  }
  
  const current = rateLimitMap.get(identifier)
  
  if (!current || current.resetTime < now) {
    // 新的时间窗口
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    })
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs
    }
  }
  
  if (current.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime
    }
  }
  
  current.count++
  return {
    allowed: true,
    remaining: maxRequests - current.count,
    resetTime: current.resetTime
  }
}

// 创建速率限制错误响应
export function createRateLimitErrorResponse(
  resetTime: number,
  lang: string = 'zh'
): NextResponse {
  const response = NextResponse.json(
    {
      success: false,
      message: getLocalizedMessage('api.error.rateLimit', lang),
      error: 'RATE_LIMIT_EXCEEDED',
      resetTime
    },
    { status: 429 }
  )
  
  response.headers.set('Retry-After', Math.ceil((resetTime - Date.now()) / 1000).toString())
  return response
}