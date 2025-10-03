'use client'

import React from 'react'
import { NotificationModalDemo } from '@/components/ui/notification-modal-demo'

/**
 * 通知弹窗演示页面
 * 用于测试和展示新的苹果风格通知弹窗系统
 */
export default function NotificationModalDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🍎 苹果风格通知弹窗系统
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            符合苹果设计规范的用户友好通知弹窗系统，具备清晰的视觉层级、
            明确的交互元素、自动关闭功能、响应式适配以及iOS标准动画效果。
          </p>
        </div>
        
        <NotificationModalDemo />
      </div>
    </div>
  )
}