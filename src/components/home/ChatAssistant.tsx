'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Send, Bot, User, MapPin, Building2, UtensilsCrossed, Calendar, Sparkles } from 'lucide-react'
import { useLocale } from '../providers/LocaleProvider'
import Link from 'next/link'
import ItineraryGenerator from './ItineraryGenerator'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  suggestions?: string[]
}

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  action: () => void
}

export default function ChatAssistant() {
  const { locale } = useLocale()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showItineraryGenerator, setShowItineraryGenerator] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // 初始欢迎消息
    const welcomeMessage: Message = {
      id: '1',
      type: 'assistant',
      content: locale === 'zh' 
        ? '您好！我是平潭旅游智能助手，可以帮您推荐景点、民宿、美食，制定行程计划。请问有什么可以帮助您的吗？'
        : 'Hello! I\'m your Pingtan Tourism AI Assistant. I can help you discover attractions, accommodations, restaurants, and plan your itinerary. How can I assist you today?',
      timestamp: new Date(),
      suggestions: locale === 'zh' 
        ? ['推荐热门景点', '寻找特色民宿', '推荐当地美食', '制定3日游行程']
        : ['Recommend popular attractions', 'Find unique accommodations', 'Suggest local cuisine', 'Plan a 3-day itinerary']
    }
    setMessages([welcomeMessage])
  }, [locale])

  const quickActions: QuickAction[] = [
    {
      id: 'attractions',
      title: locale === 'zh' ? '探索景点' : 'Explore Attractions',
      description: locale === 'zh' ? '发现平潭最美景点' : 'Discover Pingtan\'s most beautiful spots',
      icon: <MapPin className="w-5 h-5" />,
      action: () => handleQuickMessage(locale === 'zh' ? '推荐一些平潭的热门景点' : 'Recommend some popular attractions in Pingtan')
    },
    {
      id: 'accommodations',
      title: locale === 'zh' ? '寻找民宿' : 'Find Accommodations',
      description: locale === 'zh' ? '精选特色住宿推荐' : 'Curated unique stays',
      icon: <Building2 className="w-5 h-5" />,
      action: () => handleQuickMessage(locale === 'zh' ? '推荐一些有特色的民宿' : 'Recommend some unique accommodations')
    },
    {
      id: 'restaurants',
      title: locale === 'zh' ? '品尝美食' : 'Taste Local Food',
      description: locale === 'zh' ? '当地特色美食指南' : 'Local cuisine guide',
      icon: <UtensilsCrossed className="w-5 h-5" />,
      action: () => handleQuickMessage(locale === 'zh' ? '推荐一些当地特色美食' : 'Recommend some local specialties')
    },
    {
      id: 'itinerary',
      title: locale === 'zh' ? '规划行程' : 'Plan Itinerary',
      description: locale === 'zh' ? '智能行程规划助手' : 'Smart itinerary planner',
      icon: <Calendar className="w-5 h-5" />,
      action: () => handleQuickMessage(locale === 'zh' ? '帮我制定一个3天2夜的平潭旅游行程' : 'Help me plan a 3-day 2-night Pingtan itinerary')
    },
    {
      id: 'generator',
      title: locale === 'zh' ? '一键生成行程' : 'Generate Itinerary',
      description: locale === 'zh' ? '智能生成个性化行程' : 'AI-powered personalized itinerary',
      icon: <Sparkles className="w-5 h-5" />,
      action: () => setShowItineraryGenerator(true)
    }
  ]

  const handleQuickMessage = (message: string) => {
    setInputValue(message)
    handleSendMessage(message)
  }

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputValue.trim()
    if (!text) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          history: messages,
          locale
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.response,
        timestamp: new Date(),
        suggestions: data.suggestions || generateSuggestions(text)
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: locale === 'zh' 
          ? '抱歉，我现在无法回复。请稍后再试。'
          : 'Sorry, I cannot respond right now. Please try again later.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const generateResponse = (input: string): string => {
    const lowerInput = input.toLowerCase()
    
    if (locale === 'zh') {
      if (lowerInput.includes('景点') || lowerInput.includes('推荐') && lowerInput.includes('地方')) {
        return '平潭有很多美丽的景点！推荐您去石牌洋景区欣赏海上奇观，龙凤头海滨浴场享受阳光沙滩，还有坛南湾的绝美日落。每个景点都有独特的魅力，您可以根据兴趣选择。需要我为您详细介绍某个景点吗？'
      }
      if (lowerInput.includes('民宿') || lowerInput.includes('住宿')) {
        return '平潭有许多特色民宿！海景民宿可以让您醒来就看到大海，石头厝民宿体验当地传统建筑，还有现代化的精品民宿提供舒适服务。价格从100-500元不等，您有什么特殊需求吗？'
      }
      if (lowerInput.includes('美食') || lowerInput.includes('吃')) {
        return '平潭的海鲜美食非常丰富！必尝的有时来运转（海蛎煎）、鱼丸汤、紫菜汤，还有各种新鲜海鲜。推荐去海坛古城品尝地道小吃，或者到渔港附近的餐厅享用刚捕捞的海鲜。'
      }
      if (lowerInput.includes('行程') || lowerInput.includes('计划') || lowerInput.includes('天')) {
        return '为您推荐3天2夜行程：\n第1天：石牌洋景区 → 龙凤头海滨浴场 → 海坛古城\n第2天：坛南湾 → 北港村 → 猴研岛\n第3天：东海仙境 → 将军山 → 返程\n每天安排2-3个景点，既能充分游览又不会太累。需要我详细介绍某天的安排吗？'
      }
      return '感谢您的提问！我可以为您推荐景点、民宿、美食，或者帮您制定旅游行程。请告诉我您最感兴趣的是什么，我会为您提供详细的建议。'
    } else {
      if (lowerInput.includes('attraction') || lowerInput.includes('place') || lowerInput.includes('visit')) {
        return 'Pingtan has many beautiful attractions! I recommend Shipaiyang Scenic Area for sea wonders, Longfengtou Beach for sun and sand, and Tannan Bay for stunning sunsets. Each has unique charm. Would you like detailed information about any specific attraction?'
      }
      if (lowerInput.includes('accommodation') || lowerInput.includes('hotel') || lowerInput.includes('stay')) {
        return 'Pingtan offers various unique accommodations! Ocean-view guesthouses let you wake up to the sea, traditional stone house B&Bs offer local architecture experience, and modern boutique hotels provide comfort. Prices range from ¥100-500. Any specific requirements?'
      }
      if (lowerInput.includes('food') || lowerInput.includes('restaurant') || lowerInput.includes('eat')) {
        return 'Pingtan\'s seafood cuisine is amazing! Must-try dishes include Shi Lai Yun Zhuan (oyster omelet), fish ball soup, and seaweed soup, plus fresh seafood. Visit Haitan Ancient City for local snacks or harbor restaurants for fresh catches.'
      }
      if (lowerInput.includes('itinerary') || lowerInput.includes('plan') || lowerInput.includes('day')) {
        return 'Here\'s a 3-day 2-night itinerary:\nDay 1: Shipaiyang → Longfengtou Beach → Haitan Ancient City\nDay 2: Tannan Bay → Beigang Village → Houyan Island\nDay 3: Donghai Fairyland → General Mountain → Departure\n2-3 attractions per day for a balanced experience. Need details for any specific day?'
      }
      return 'Thank you for your question! I can recommend attractions, accommodations, restaurants, or help plan your itinerary. Please let me know what interests you most, and I\'ll provide detailed suggestions.'
    }
  }

  const generateSuggestions = (input: string): string[] => {
    if (locale === 'zh') {
      return ['查看更多景点', '寻找附近民宿', '推荐特色美食', '制定详细行程']
    } else {
      return ['View more attractions', 'Find nearby accommodations', 'Recommend specialties', 'Create detailed itinerary']
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Sparkles className="w-8 h-8 text-blue-600 mr-2" />
              <h1 className="text-3xl font-bold text-gray-900">
                {locale === 'zh' ? '平潭旅游智能助手' : 'Pingtan Tourism AI Assistant'}
              </h1>
            </div>
            <p className="text-gray-600">
              {locale === 'zh' 
                ? '您的专属旅游规划师，为您提供个性化的平潭旅游建议'
                : 'Your personal travel planner for customized Pingtan tourism recommendations'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Quick Actions */}
        {messages.length <= 1 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {locale === 'zh' ? '快速开始' : 'Quick Start'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Card key={action.id} className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105" onClick={action.action}>
                  <CardContent className="p-4 text-center">
                    <div className="flex justify-center mb-2 text-blue-600">
                      {action.icon}
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="bg-white rounded-lg shadow-sm border min-h-[400px] flex flex-col">
          <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[500px]">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start space-x-2 max-w-[80%] ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.suggestions && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="cursor-pointer hover:bg-blue-50 text-xs"
                            onClick={() => {
                              setInputValue(suggestion)
                              setTimeout(() => handleSendMessage(suggestion), 100)
                            }}
                          >
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={locale === 'zh' ? '请输入您的问题...' : 'Type your question...'}
                className="flex-1"
                disabled={isLoading}
              />
              <Button 
                onClick={() => handleSendMessage()} 
                disabled={!inputValue.trim() || isLoading}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            {locale === 'zh' ? '或者直接浏览我们的推荐' : 'Or browse our recommendations directly'}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/attractions">
              <Button variant="outline" className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>{locale === 'zh' ? '景点推荐' : 'Attractions'}</span>
              </Button>
            </Link>
            <Link href="/accommodations">
              <Button variant="outline" className="flex items-center space-x-2">
                <Building2 className="w-4 h-4" />
                <span>{locale === 'zh' ? '民宿推荐' : 'Accommodations'}</span>
              </Button>
            </Link>
            <Link href="/restaurants">
              <Button variant="outline" className="flex items-center space-x-2">
                <UtensilsCrossed className="w-4 h-4" />
                <span>{locale === 'zh' ? '美食推荐' : 'Restaurants'}</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* 一键行程生成器 */}
      {showItineraryGenerator && (
        <ItineraryGenerator onClose={() => setShowItineraryGenerator(false)} />
      )}
    </div>
  )
}