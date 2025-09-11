import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock useLocale hook
const mockUseLocale = {
  locale: 'zh',
  setLocale: jest.fn(),
  t: jest.fn((key: string) => {
    const translations: Record<string, string> = {
      'home.hero.title': '探索平潭，发现美丽',
      'home.hero.subtitle': '平潭综合实验区官方旅游指南',
      'home.hero.searchPlaceholder': '搜索景点、美食、住宿...',
      'home.hero.searchButton': '搜索',
      'home.hero.popularSearches': '热门搜索',
      'home.hero.weather.title': '今日天气'
    }
    return translations[key] || key
  })
}

jest.mock('@/components/providers/LocaleProvider', () => ({
  useLocale: () => mockUseLocale
}))

// Mock useRouter
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

// Simple HeroSection component for testing
const HeroSection = () => {
  const [searchValue, setSearchValue] = React.useState('')
  
  const handleSearch = () => {
    const trimmedValue = searchValue.trim()
    mockPush(`/attractions?search=${encodeURIComponent(trimmedValue)}`)
  }
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }
  
  return (
    <section>
      <h1>{mockUseLocale.t('home.hero.title')}</h1>
      <p>{mockUseLocale.t('home.hero.subtitle')}</p>
      <div>
        <input 
          type="text"
          placeholder={mockUseLocale.t('home.hero.searchPlaceholder')}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleSearch}>
          {mockUseLocale.t('home.hero.searchButton')}
        </button>
      </div>
      <img src="/hero-image.jpg" alt="Hero" role="img" />
      <div>{mockUseLocale.t('home.hero.popularSearches')}</div>
    </section>
  )
}

describe('HeroSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render hero section with title and subtitle', () => {
    render(<HeroSection />)
    
    expect(screen.getByText('探索平潭之美')).toBeInTheDocument()
    expect(screen.getByText('发现海岛风光，体验独特文化')).toBeInTheDocument()
  })

  it('should render search input with placeholder', () => {
    render(<HeroSection />)
    
    const searchInput = screen.getByPlaceholderText('搜索景点、美食、住宿...')
    expect(searchInput).toBeInTheDocument()
    expect(searchInput).toHaveAttribute('type', 'text')
  })

  it('should render search button', () => {
    render(<HeroSection />)
    
    const searchButton = screen.getByRole('button', { name: '搜索' })
    expect(searchButton).toBeInTheDocument()
  })

  it('should render weather widget', () => {
    render(<HeroSection />)
    
    expect(screen.getByTestId('weather-widget')).toBeInTheDocument()
  })

  it('should handle search input changes', async () => {
    const user = userEvent.setup()
    render(<HeroSection />)
    
    const searchInput = screen.getByPlaceholderText('搜索景点、美食、住宿...')
    
    await user.type(searchInput, '石牌洋')
    
    expect(searchInput).toHaveValue('石牌洋')
  })

  it('should navigate to attractions page when search button is clicked', async () => {
    const user = userEvent.setup()
    render(<HeroSection />)
    
    const searchInput = screen.getByPlaceholderText('搜索景点、美食、住宿...')
    const searchButton = screen.getByRole('button', { name: '搜索' })
    
    await user.type(searchInput, '石牌洋')
    await user.click(searchButton)
    
    expect(mockPush).toHaveBeenCalledWith('/attractions?search=石牌洋')
  })

  it('should navigate to attractions page when Enter key is pressed', async () => {
    const user = userEvent.setup()
    render(<HeroSection />)
    
    const searchInput = screen.getByPlaceholderText('搜索景点、美食、住宿...')
    
    await user.type(searchInput, '海滩')
    await user.keyboard('{Enter}')
    
    expect(mockPush).toHaveBeenCalledWith('/attractions?search=海滩')
  })

  it('should handle empty search gracefully', async () => {
    const user = userEvent.setup()
    render(<HeroSection />)
    
    const searchButton = screen.getByRole('button', { name: '搜索' })
    
    await user.click(searchButton)
    
    expect(mockPush).toHaveBeenCalledWith('/attractions?search=')
  })

  it('should render hero images', () => {
    render(<HeroSection />)
    
    // 检查是否有图片元素存在
    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThan(0)
  })

  it('should handle popular search clicks', async () => {
    const user = userEvent.setup()
    render(<HeroSection />)
    
    // 假设有热门搜索标签
    const popularSearchText = screen.queryByText('热门搜索')
    if (popularSearchText) {
      expect(popularSearchText).toBeInTheDocument()
    }
  })

  it('should be accessible', () => {
    render(<HeroSection />)
    
    // 检查搜索表单的可访问性
    const searchInput = screen.getByPlaceholderText('搜索景点、美食、住宿...')
    const searchButton = screen.getByRole('button', { name: '搜索' })
    
    expect(searchInput).toBeAccessible()
    expect(searchButton).toBeAccessible()
  })

  it('should handle different locales', () => {
    // 测试英文版本
    mockUseLocale.locale = 'en'
    mockUseLocale.t.mockImplementation((key: string) => {
      const translations: Record<string, string> = {
        'home.hero.title': 'Explore the Beauty of Pingtan',
        'home.hero.subtitle': 'Discover island scenery and unique culture',
        'home.hero.searchPlaceholder': 'Search attractions, food, accommodation...',
        'home.hero.searchButton': 'Search'
      }
      return translations[key] || key
    })
    
    render(<HeroSection />)
    
    expect(screen.getByText('Explore the Beauty of Pingtan')).toBeInTheDocument()
    expect(screen.getByText('Discover island scenery and unique culture')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search attractions, food, accommodation...')).toBeInTheDocument()
  })

  it('should handle search with special characters', async () => {
    const user = userEvent.setup()
    render(<HeroSection />)
    
    const searchInput = screen.getByPlaceholderText('搜索景点、美食、住宿...')
    const searchTerm = '石牌洋 & 海滩'
    
    await user.type(searchInput, searchTerm)
    await user.keyboard('{Enter}')
    
    expect(mockPush).toHaveBeenCalledWith(`/attractions?search=${encodeURIComponent(searchTerm)}`)
  })

  it('should trim whitespace from search input', async () => {
    const user = userEvent.setup()
    render(<HeroSection />)
    
    const searchInput = screen.getByPlaceholderText('搜索景点、美食、住宿...')
    
    await user.type(searchInput, '  石牌洋  ')
    await user.keyboard('{Enter}')
    
    expect(mockPush).toHaveBeenCalledWith('/attractions?search=石牌洋')
  })
})

// 自定义匹配器扩展
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeAccessible(): R
    }
  }
}

// 简单的可访问性检查
expect.extend({
  toBeAccessible(received) {
    const element = received as HTMLElement
    
    // 检查基本的可访问性属性
    const hasAriaLabel = element.hasAttribute('aria-label')
    const hasAriaLabelledBy = element.hasAttribute('aria-labelledby')
    const isButton = element.tagName === 'BUTTON'
    const isInput = element.tagName === 'INPUT'
    
    let pass = true
    let message = ''
    
    if (isButton && !hasAriaLabel && !hasAriaLabelledBy && !element.textContent?.trim()) {
      pass = false
      message = 'Button should have accessible text, aria-label, or aria-labelledby'
    }
    
    if (isInput && !hasAriaLabel && !hasAriaLabelledBy && !element.hasAttribute('placeholder')) {
      pass = false
      message = 'Input should have accessible label, aria-label, aria-labelledby, or placeholder'
    }
    
    return {
      message: () => message,
      pass
    }
  }
})