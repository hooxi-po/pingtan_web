import { NextRequest } from 'next/server'

// Mock Prisma client
const mockPrisma = {
  attraction: {
    findMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn()
  }
}

// Mock API utils
const mockApiUtils = {
  getLanguageFromRequest: jest.fn(),
  validateQueryParams: jest.fn(),
  validateRequestData: jest.fn(),
  handleApiError: jest.fn(),
  checkRateLimit: jest.fn(),
  createValidationErrorResponse: jest.fn(),
  createRateLimitErrorResponse: jest.fn()
}

// Mock the route handlers
const mockGET = jest.fn()
const mockPOST = jest.fn()

jest.mock('@/lib/prisma', () => mockPrisma)
jest.mock('@/lib/api-utils', () => mockApiUtils)
jest.mock('./route', () => ({
  GET: mockGET,
  POST: mockPOST
}))

const prisma = mockPrisma
const apiUtils = mockApiUtils
const { GET, POST } = { GET: mockGET, POST: mockPOST }

// Mock response helper
const createMockResponse = (data: any, status: number = 200) => {
  return {
    status,
    json: async () => data
  } as any
}

// Mock attraction data
const mockAttraction = {
  id: '1',
  name: '石牌洋',
  description: '平潭著名的海蚀地貌景观',
  location: '平潭县',
  latitude: 25.5034,
  longitude: 119.7909,
  category: 'natural',
  createdAt: new Date(),
  updatedAt: new Date()
}

describe('/api/attractions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // 默认速率限制通过
    ;(apiUtils.checkRateLimit as jest.Mock).mockReturnValue({
      allowed: true,
      remaining: 99,
      resetTime: Date.now() + 900000
    })
  })

  describe('GET /api/attractions', () => {
    it('should return attractions list successfully', async () => {
      // Arrange
      const mockAttractions = [mockAttraction]
      const mockCount = 1
      
      ;(apiUtils.getLanguageFromRequest as jest.Mock).mockReturnValue('zh')
      ;(apiUtils.validateQueryParams as jest.Mock).mockReturnValue({
        success: true,
        data: {
          page: 1,
          limit: 10,
          language: 'zh',
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }
      })
      
      ;(prisma.attraction.findMany as jest.Mock).mockResolvedValue(mockAttractions)
      ;(prisma.attraction.count as jest.Mock).mockResolvedValue(mockCount)

      const request = new NextRequest('http://localhost:3000/api/attractions')

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.items).toEqual(mockAttractions)
      expect(data.data.pagination.total).toBe(mockCount)
      expect(prisma.attraction.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' }
      })
    })

    it('should handle search query correctly', async () => {
      // Arrange
      const searchTerm = '石牌洋'
      ;(apiUtils.getLanguageFromRequest as jest.Mock).mockReturnValue('zh')
      ;(apiUtils.validateQueryParams as jest.Mock).mockReturnValue({
        success: true,
        data: {
          page: 1,
          limit: 10,
          search: searchTerm,
          language: 'zh',
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }
      })
      
      ;(prisma.attraction.findMany as jest.Mock).mockResolvedValue([mockAttraction])
      ;(prisma.attraction.count as jest.Mock).mockResolvedValue(1)

      const request = new NextRequest(`http://localhost:3000/api/attractions?search=${searchTerm}`)

      // Act
      const response = await GET(request)

      // Assert
      expect(prisma.attraction.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        orderBy: { createdAt: 'desc' }
      })
    })

    it('should handle validation errors', async () => {
      // Arrange
      const validationErrors = ['Invalid page number']
      ;(apiUtils.getLanguageFromRequest as jest.Mock).mockReturnValue('zh')
      ;(apiUtils.validateQueryParams as jest.Mock).mockReturnValue({
        success: false,
        errors: validationErrors
      })
      ;(apiUtils.createValidationErrorResponse as jest.Mock).mockReturnValue(
        createMockResponse({ success: false, errors: validationErrors }, 400)
      )

      const request = new NextRequest('http://localhost:3000/api/attractions?page=invalid')

      // Act
      const response = await GET(request)

      // Assert
      expect(apiUtils.createValidationErrorResponse).toHaveBeenCalledWith(validationErrors, 'zh')
    })

    it('should handle rate limiting', async () => {
      // Arrange
      ;(apiUtils.checkRateLimit as jest.Mock).mockReturnValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 900000
      })
      ;(apiUtils.createRateLimitErrorResponse as jest.Mock).mockReturnValue(
        createMockResponse({ success: false, error: 'RATE_LIMIT_EXCEEDED' }, 429)
      )

      const request = new NextRequest('http://localhost:3000/api/attractions')

      // Act
      const response = await GET(request)

      // Assert
      expect(apiUtils.createRateLimitErrorResponse).toHaveBeenCalled()
    })

    it('should handle database errors', async () => {
      // Arrange
      const dbError = new Error('Database connection failed')
      ;(apiUtils.getLanguageFromRequest as jest.Mock).mockReturnValue('zh')
      ;(apiUtils.validateQueryParams as jest.Mock).mockReturnValue({
        success: true,
        data: { page: 1, limit: 10, language: 'zh', sortBy: 'createdAt', sortOrder: 'desc' }
      })
      ;(prisma.attraction.findMany as jest.Mock).mockRejectedValue(dbError)
      ;(apiUtils.handleApiError as jest.Mock).mockReturnValue(
        createMockResponse({ success: false, message: 'Server error' }, 500)
      )

      const request = new NextRequest('http://localhost:3000/api/attractions')

      // Act
      const response = await GET(request)

      // Assert
      expect(apiUtils.handleApiError).toHaveBeenCalledWith(dbError, 'GET /api/attractions', 'zh')
    })
  })

  describe('POST /api/attractions', () => {
    it('should create attraction successfully', async () => {
      // Arrange
      const newAttractionData = {
        name: '新景点',
        description: '这是一个新的景点描述',
        location: '平潭县',
        latitude: 25.5034,
        longitude: 119.7909,
        category: 'natural' as const
      }
      
      ;(apiUtils.getLanguageFromRequest as jest.Mock).mockReturnValue('zh')
      ;(apiUtils.validateRequestData as jest.Mock).mockResolvedValue({
        success: true,
        data: newAttractionData
      })
      ;(prisma.attraction.create as jest.Mock).mockResolvedValue({
        id: '2',
        ...newAttractionData,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const request = new NextRequest('http://localhost:3000/api/attractions', {
        method: 'POST',
        body: JSON.stringify(newAttractionData)
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.name).toBe(newAttractionData.name)
      expect(prisma.attraction.create).toHaveBeenCalledWith({
        data: newAttractionData
      })
    })

    it('should handle validation errors on create', async () => {
      // Arrange
      const invalidData = { name: '' } // 缺少必需字段
      const validationErrors = ['景点名称不能为空']
      
      ;(apiUtils.getLanguageFromRequest as jest.Mock).mockReturnValue('zh')
      ;(apiUtils.validateRequestData as jest.Mock).mockResolvedValue({
        success: false,
        errors: validationErrors
      })
      ;(apiUtils.createValidationErrorResponse as jest.Mock).mockReturnValue(
        createMockResponse({ success: false, errors: validationErrors }, 400)
      )

      const request = new NextRequest('http://localhost:3000/api/attractions', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      })

      // Act
      const response = await POST(request)

      // Assert
      expect(apiUtils.createValidationErrorResponse).toHaveBeenCalledWith(validationErrors, 'zh')
      expect(prisma.attraction.create).not.toHaveBeenCalled()
    })

    it('should handle database errors on create', async () => {
      // Arrange
      const newAttractionData = {
        name: '新景点',
        description: '这是一个新的景点描述',
        location: '平潭县',
        latitude: 25.5034,
        longitude: 119.7909,
        category: 'natural' as const
      }
      const dbError = new Error('Unique constraint violation')
      
      ;(apiUtils.getLanguageFromRequest as jest.Mock).mockReturnValue('zh')
      ;(apiUtils.validateRequestData as jest.Mock).mockResolvedValue({
        success: true,
        data: newAttractionData
      })
      ;(prisma.attraction.create as jest.Mock).mockRejectedValue(dbError)
      ;(apiUtils.handleApiError as jest.Mock).mockReturnValue(
        createMockResponse({ success: false, message: 'Server error' }, 500)
      )

      const request = new NextRequest('http://localhost:3000/api/attractions', {
        method: 'POST',
        body: JSON.stringify(newAttractionData)
      })

      // Act
      const response = await POST(request)

      // Assert
      expect(apiUtils.handleApiError).toHaveBeenCalledWith(dbError, 'POST /api/attractions', 'zh')
    })
  })
})