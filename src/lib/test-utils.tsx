import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { LocaleProvider } from '@/components/providers/LocaleProvider'

// Mock data for testing
export const mockAttraction = {
  id: '1',
  name: '平潭石牌洋',
  nameEn: 'Pingtan Stone Pillars',
  description: '平潭著名的海上石柱景观',
  descriptionEn: 'Famous sea stone pillar landscape in Pingtan',
  location: '平潭县',
  latitude: 25.5034,
  longitude: 119.7909,
  category: 'natural',
  tags: ['海景', '地质奇观'],
  rating: 4.5,
  reviewCount: 128,
  price: 0,
  duration: 120,
  images: ['/images/attractions/shipaiyang.jpg'],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
}

export const mockUser = {
  id: '1',
  name: '测试用户',
  email: 'test@example.com',
  image: null,
  emailVerified: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
}

export const mockItinerary = {
  id: '1',
  title: '平潭三日游',
  description: '探索平潭美丽海岛',
  userId: '1',
  days: 3,
  totalBudget: 1500,
  isPublic: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
}

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <LocaleProvider>
      {children}
    </LocaleProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Helper functions for testing
export const createMockResponse = (data: unknown, status = 200) => {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data)
  } as Response
}

export const mockFetch = (response: unknown, status = 200) => {
  const mockFn = jest.fn().mockResolvedValue(createMockResponse(response, status))
  global.fetch = mockFn
  return mockFn
}

export const mockConsoleError = () => {
  const originalError = console.error
  console.error = jest.fn()
  return () => {
    console.error = originalError
  }
}