'use client'

import React, { useState } from 'react'
import { useLocale } from '@/components/providers/LocaleProvider'
import { Calendar, Users, DollarSign, Clock, ChevronRight, Loader2 } from 'lucide-react'

interface GenerateItineraryRequest {
  days: number
  budget: number
  interests: string[]
  groupSize: number
  travelStyle: 'relaxed' | 'active' | 'cultural' | 'adventure'
  locale?: string
}

interface ItineraryItem {
  time: string
  activity: string
  location: string
  description: string
  estimatedCost: number
  duration: string
  tips?: string
}

interface GeneratedItinerary {
  title: string
  description: string
  totalBudget: number
  days: { [key: number]: ItineraryItem[] }
  recommendations: {
    accommodations: unknown[]
    restaurants: unknown[]
    transportation: string
  }
}

interface ItineraryGeneratorProps {
  onClose: () => void
}

export default function ItineraryGenerator({ onClose }: ItineraryGeneratorProps) {
  const { t, locale } = useLocale()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [generatedItinerary, setGeneratedItinerary] = useState<GeneratedItinerary | null>(null)
  
  const [formData, setFormData] = useState<GenerateItineraryRequest>({
    days: 3,
    budget: 300,
    interests: [],
    groupSize: 2,
    travelStyle: 'relaxed',
    locale
  })

  const interestOptions = [
    { id: 'photography', label: t('interests.photography', '摄影'), icon: '📸' },
    { id: 'sightseeing', label: t('interests.sightseeing', '观光'), icon: '🏞️' },
    { id: 'culture', label: t('interests.culture', '文化'), icon: '🏛️' },
    { id: 'adventure', label: t('interests.adventure', '探险'), icon: '🧗' },
    { id: 'relaxation', label: t('interests.relaxation', '休闲'), icon: '🏖️' },
    { id: 'food', label: t('interests.food', '美食'), icon: '🍽️' },
    { id: 'swimming', label: t('interests.swimming', '游泳'), icon: '🏊' },
    { id: 'hiking', label: t('interests.hiking', '徒步'), icon: '🥾' }
  ]

  const travelStyleOptions = [
    { id: 'relaxed', label: t('travelStyle.relaxed', '悠闲'), desc: t('travelStyle.relaxedDesc', '慢节奏，重点休闲') },
    { id: 'active', label: t('travelStyle.active', '活力'), desc: t('travelStyle.activeDesc', '运动丰富，体验多样') },
    { id: 'cultural', label: t('travelStyle.cultural', '文化'), desc: t('travelStyle.culturalDesc', '深度文化体验') },
    { id: 'adventure', label: t('travelStyle.adventure', '探险'), desc: t('travelStyle.adventureDesc', '刺激冒险，挑战自我') }
  ]

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const generateItinerary = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()
      if (result.success) {
        setGeneratedItinerary(result.data)
        setStep(3)
      } else {
        alert(result.error || t('error.generateFailed', '生成行程失败'))
      }
    } catch (error) {
      console.error('Generate itinerary error:', error)
      alert(t('error.networkError', '网络错误，请重试'))
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('itineraryGenerator.basicInfo', '基本信息')}
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            {t('itineraryGenerator.days', '旅行天数')}
          </label>
          <select
            value={formData.days}
            onChange={(e) => setFormData(prev => ({ ...prev, days: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {[1, 2, 3, 4, 5, 6, 7].map(day => (
              <option key={day} value={day}>{day} {t('common.days', '天')}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="w-4 h-4 inline mr-1" />
            {t('itineraryGenerator.groupSize', '出行人数')}
          </label>
          <select
            value={formData.groupSize}
            onChange={(e) => setFormData(prev => ({ ...prev, groupSize: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {[1, 2, 3, 4, 5, 6].map(size => (
              <option key={size} value={size}>{size} {t('common.people', '人')}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <DollarSign className="w-4 h-4 inline mr-1" />
          {t('itineraryGenerator.budget', '预算')} (¥/人)
        </label>
        <input
          type="range"
          min="100"
          max="1000"
          step="50"
          value={formData.budget}
          onChange={(e) => setFormData(prev => ({ ...prev, budget: parseInt(e.target.value) }))}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-500 mt-1">
          <span>¥100</span>
          <span className="font-medium text-blue-600">¥{formData.budget}</span>
          <span>¥1000+</span>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={() => setStep(2)}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          {t('common.next', '下一步')}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('itineraryGenerator.preferences', '偏好设置')}
      </h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {t('itineraryGenerator.interests', '兴趣爱好')}
        </label>
        <div className="grid grid-cols-2 gap-3">
          {interestOptions.map(option => (
            <button
              key={option.id}
              onClick={() => handleInterestToggle(option.id)}
              className={`p-3 rounded-lg border-2 transition-colors text-left ${
                formData.interests.includes(option.id)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-lg mr-2">{option.icon}</span>
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {t('itineraryGenerator.travelStyle', '旅行风格')}
        </label>
        <div className="space-y-2">
          {travelStyleOptions.map(option => (
            <button
              key={option.id}
              onClick={() => setFormData(prev => ({ ...prev, travelStyle: option.id as 'relaxed' | 'active' | 'cultural' | 'adventure' }))}
              className={`w-full p-3 rounded-lg border-2 transition-colors text-left ${
                formData.travelStyle === option.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">{option.label}</div>
              <div className="text-sm text-gray-600">{option.desc}</div>
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={() => setStep(1)}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {t('common.previous', '上一步')}
        </button>
        <button
          onClick={generateItinerary}
          disabled={loading || formData.interests.length === 0}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('itineraryGenerator.generating', '生成中...')}
            </>
          ) : (
            t('itineraryGenerator.generate', '生成行程')
          )}
        </button>
      </div>
    </div>
  )

  const renderStep3 = () => {
    if (!generatedItinerary) return null

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {generatedItinerary.title}
          </h3>
          <p className="text-gray-600 mb-4">{generatedItinerary.description}</p>
          <div className="inline-flex items-center gap-4 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formData.days} {t('common.days', '天')}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {formData.groupSize} {t('common.people', '人')}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              ¥{generatedItinerary.totalBudget}
            </span>
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto space-y-4">
          {Object.entries(generatedItinerary.days).map(([day, items]) => (
            <div key={day} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {t('itinerary.day', '第')} {day} {t('common.day', '天')}
              </h4>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <Clock className="w-4 h-4 text-gray-500 mt-1" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-blue-600">{item.time}</span>
                        <span className="text-sm text-gray-500">¥{item.estimatedCost}</span>
                      </div>
                      <h5 className="font-medium text-gray-900">{item.activity}</h5>
                      <p className="text-sm text-gray-600 mb-1">{item.description}</p>
                      {item.tips && (
                        <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          💡 {item.tips}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={() => {
              setStep(1)
              setGeneratedItinerary(null)
            }}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('itineraryGenerator.regenerate', '重新生成')}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            {t('itineraryGenerator.save', '保存行程')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {t('itineraryGenerator.title', '一键行程生成')}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* 步骤指示器 */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3].map(stepNum => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    step > stepNum ? 'bg-blue-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>
      </div>
    </div>
  )
}