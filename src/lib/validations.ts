import { z } from 'zod'

// 通用验证模式
export const idSchema = z.string().min(1, 'ID不能为空')
export const emailSchema = z.string().email('请输入有效的邮箱地址')
export const passwordSchema = z.string().min(6, '密码至少需要6个字符')
export const phoneSchema = z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号码')

// 民宿相关验证
export const accommodationCreateSchema = z.object({
  name: z.string().min(1, '民宿名称不能为空').max(100, '民宿名称不能超过100个字符'),
  nameEn: z.string().max(100, '英文名称不能超过100个字符').optional(),
  address: z.string().min(1, '地址不能为空').max(200, '地址不能超过200个字符'),
  priceRange: z.string().min(1, '价格区间不能为空'),
  contact: z.string().min(1, '联系方式不能为空'),
  facilities: z.array(z.string()).optional(),
  images: z.array(z.string().url('请提供有效的图片URL')).optional()
})

// 餐厅相关验证
export const restaurantCreateSchema = z.object({
  name: z.string().min(1, '餐厅名称不能为空').max(100, '餐厅名称不能超过100个字符'),
  nameEn: z.string().max(100, '英文名称不能超过100个字符').optional(),
  address: z.string().min(1, '地址不能为空').max(200, '地址不能超过200个字符'),
  cuisine: z.union([
    z.string().min(1, '菜系不能为空'),
    z.array(z.string()).min(1, '菜系不能为空')
  ]),
  priceRange: z.string().min(1, '价格区间不能为空'),
  openingHours: z.string().min(1, '营业时间不能为空'),
  specialties: z.array(z.string()).optional(),
  contact: z.string().optional(),
  images: z.array(z.string().url('请提供有效的图片URL')).optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  description: z.string().max(2000, '描述不能超过2000个字符').optional()
})

// 景点相关验证
export const attractionCreateSchema = z.object({
  name: z.string().min(1, '景点名称不能为空').max(100, '景点名称不能超过100个字符'),
  nameEn: z.string().max(100, '英文名称不能超过100个字符').optional(),
  description: z.string().min(10, '描述至少需要10个字符').max(2000, '描述不能超过2000个字符'),
  descriptionEn: z.string().max(2000, '英文描述不能超过2000个字符').optional(),
  location: z.string().min(1, '位置不能为空').max(200, '位置不能超过200个字符'),
  latitude: z.number().min(-90).max(90, '纬度必须在-90到90之间'),
  longitude: z.number().min(-180).max(180, '经度必须在-180到180之间'),
  category: z.enum(['natural', 'cultural', 'entertainment', 'food', 'shopping', 'accommodation'], {
    errorMap: () => ({ message: '请选择有效的景点类别' })
  }),
  tags: z.array(z.string()).max(10, '标签不能超过10个').optional(),
  price: z.number().min(0, '价格不能为负数').optional(),
  duration: z.number().min(0, '游览时长不能为负数').optional(),
  images: z.array(z.string().url('请提供有效的图片URL')).max(10, '图片不能超过10张').optional()
})

export const attractionUpdateSchema = attractionCreateSchema.partial()

export const attractionQuerySchema = z.object({
  page: z.coerce.number().min(1, '页码必须大于0').optional().default(1),
  limit: z.coerce.number().min(1).max(100, '每页数量不能超过100').optional().default(10),
  search: z.string().max(100, '搜索关键词不能超过100个字符').optional(),
  category: z.enum(['natural', 'cultural', 'entertainment', 'food', 'shopping', 'accommodation']).optional(),
  tags: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  maxRating: z.coerce.number().min(0).max(5).optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().min(0).max(100).optional().default(10),
  sortBy: z.enum(['name', 'rating', 'price', 'createdAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  language: z.enum(['zh', 'en']).optional().default('zh')
})

// 行程相关验证
export const itineraryCreateSchema = z.object({
  title: z.string().min(1, '行程标题不能为空').max(100, '行程标题不能超过100个字符'),
  description: z.string().max(1000, '行程描述不能超过1000个字符').optional(),
  days: z.number().min(1, '行程天数至少为1天').max(30, '行程天数不能超过30天'),
  totalBudget: z.number().min(0, '预算不能为负数').optional(),
  isPublic: z.boolean().optional().default(false)
})

export const itineraryUpdateSchema = itineraryCreateSchema.partial()

// 评论相关验证
export const reviewCreateSchema = z.object({
  attractionId: idSchema,
  rating: z.number().min(1, '评分至少为1星').max(5, '评分最多为5星'),
  comment: z.string().min(10, '评论至少需要10个字符').max(1000, '评论不能超过1000个字符'),
  images: z.array(z.string().url('请提供有效的图片URL')).max(5, '图片不能超过5张').optional()
})

export const reviewUpdateSchema = reviewCreateSchema.partial().omit({ attractionId: true })

// 新闻相关验证
export const newsCreateSchema = z.object({
  title: z.string().min(1, '新闻标题不能为空').max(200, '新闻标题不能超过200个字符'),
  titleEn: z.string().max(200, '英文标题不能超过200个字符').optional(),
  content: z.string().min(50, '新闻内容至少需要50个字符'),
  contentEn: z.string().optional(),
  summary: z.string().max(500, '摘要不能超过500个字符').optional(),
  summaryEn: z.string().max(500, '英文摘要不能超过500个字符').optional(),
  category: z.enum(['travel', 'culture', 'food', 'event', 'announcement'], {
    errorMap: () => ({ message: '请选择有效的新闻类别' })
  }),
  tags: z.array(z.string()).max(10, '标签不能超过10个').optional(),
  featuredImage: z.string().url('请提供有效的图片URL').optional(),
  isPublished: z.boolean().optional().default(false)
})

export const newsUpdateSchema = newsCreateSchema.partial()

// API 响应验证
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.unknown().optional(),
  error: z.string().optional()
})

// 分页响应验证
export const paginatedResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    items: z.array(z.unknown()),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
      hasNext: z.boolean(),
      hasPrev: z.boolean()
    })
  }),
  error: z.string().optional()
})

// 验证辅助函数
export const validateRequest = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } => {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => err.message)
      return { success: false, errors }
    }
    return { success: false, errors: ['验证失败'] }
  }
}

export const validateQuery = <T>(schema: z.ZodSchema<T>, searchParams: URLSearchParams): { success: true; data: T } | { success: false; errors: string[] } => {
  const params: Record<string, string> = {}
  for (const [key, value] of searchParams.entries()) {
    params[key] = value
  }
  return validateRequest(schema, params)
}