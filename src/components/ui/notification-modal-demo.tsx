'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useNotificationModalContext } from './notification-modal-provider'
import { NotificationType, NotificationPriority } from '@prisma/client'
import { InAppNotificationData } from '@/lib/notification/types'

/**
 * 通知弹窗演示组件
 * 用于测试和展示新的苹果风格通知弹窗系统
 */
export function NotificationModalDemo() {
  const { showNotification, showNotificationByType, getQueueStatus, clearQueue } = useNotificationModalContext()

  // 创建测试通知数据
  const createTestNotification = (
    type: 'success' | 'error' | 'warning' | 'info',
    priority: NotificationPriority = NotificationPriority.MEDIUM
  ): InAppNotificationData => {
    const baseId = `demo-${type}-${Date.now()}`
    
    const notifications = {
      success: {
        id: baseId,
        userId: 'demo-user',
        title: '操作成功',
        message: '您的预订已确认，我们将为您保留房间直到入住当天。',
        type: NotificationType.SUCCESS,
        priority,
        isRead: false,
        createdAt: new Date(),
        actions: [
          { id: 'view', label: '查看详情' },
          { id: 'dismiss', label: '知道了' }
        ]
      },
      error: {
        id: baseId,
        userId: 'demo-user',
        title: '支付失败',
        message: '很抱歉，您的支付未能成功完成。请检查支付信息或尝试其他支付方式。',
        type: NotificationType.ERROR,
        priority: NotificationPriority.HIGH,
        isRead: false,
        createdAt: new Date(),
        actions: [
          { id: 'retry', label: '重试支付' },
          { id: 'contact', label: '联系客服' }
        ]
      },
      warning: {
        id: baseId,
        userId: 'demo-user',
        title: '预订提醒',
        message: '您的入住时间即将到来，请提前准备相关证件并确认行程安排。',
        type: NotificationType.WARNING,
        priority,
        isRead: false,
        createdAt: new Date(),
        actions: [
          { id: 'confirm', label: '确认入住' },
          { id: 'modify', label: '修改预订' }
        ]
      },
      info: {
        id: baseId,
        userId: 'demo-user',
        title: '系统公告',
        message: '为了提供更好的服务体验，系统将在今晚23:00-01:00进行维护升级。',
        type: NotificationType.INFO,
        priority,
        isRead: false,
        createdAt: new Date(),
        metadata: '维护期间可能无法正常使用部分功能，敬请谅解。',
        actions: [
          { id: 'ok', label: '我知道了' }
        ]
      }
    }

    return notifications[type] as InAppNotificationData
  }

  // 显示成功通知
  const showSuccessNotification = () => {
    showNotification(createTestNotification('success'))
  }

  // 显示错误通知（高优先级）
  const showErrorNotification = () => {
    showNotificationByType(
      createTestNotification('error', NotificationPriority.HIGH),
      { priority: true }
    )
  }

  // 显示警告通知
  const showWarningNotification = () => {
    showNotification(createTestNotification('warning'))
  }

  // 显示信息通知
  const showInfoNotification = () => {
    showNotification(createTestNotification('info', NotificationPriority.LOW))
  }

  // 批量显示通知
  const showBatchNotifications = () => {
    const notifications = [
      createTestNotification('info', NotificationPriority.LOW),
      createTestNotification('warning', NotificationPriority.MEDIUM),
      createTestNotification('success', NotificationPriority.MEDIUM)
    ]
    
    notifications.forEach((notification, index) => {
      setTimeout(() => {
        showNotification(notification)
      }, index * 1000) // 每秒显示一个
    })
  }

  // 获取队列状态
  const queueStatus = getQueueStatus()

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🍎 苹果风格通知弹窗演示
            <Badge variant="outline">iOS Design</Badge>
          </CardTitle>
          <CardDescription>
            测试符合苹果设计规范的用户友好通知弹窗系统，包含动画效果、触觉反馈和响应式适配。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 基础通知测试 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">基础通知类型</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button 
                onClick={showSuccessNotification}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                ✅ 成功通知
              </Button>
              <Button 
                onClick={showErrorNotification}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                ❌ 错误通知
              </Button>
              <Button 
                onClick={showWarningNotification}
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                ⚠️ 警告通知
              </Button>
              <Button 
                onClick={showInfoNotification}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                ℹ️ 信息通知
              </Button>
            </div>
          </div>

          {/* 高级功能测试 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">高级功能</h3>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={showBatchNotifications}
                variant="outline"
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                📚 批量通知
              </Button>
              <Button 
                onClick={clearQueue}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                🗑️ 清空队列
              </Button>
            </div>
          </div>

          {/* 队列状态显示 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">队列状态</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">队列长度:</span>
                <Badge variant={queueStatus.queueLength > 0 ? "default" : "secondary"}>
                  {queueStatus.queueLength}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">显示状态:</span>
                <Badge variant={queueStatus.isShowing ? "default" : "secondary"}>
                  {queueStatus.isShowing ? '显示中' : '空闲'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">当前通知:</span>
                <span className="text-sm font-mono">
                  {queueStatus.currentNotification?.title || '无'}
                </span>
              </div>
            </div>
          </div>

          {/* 功能特性说明 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">功能特性</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-green-700">✨ 视觉设计</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• SF Pro Display 字体</li>
                  <li>• iOS 标准颜色和间距</li>
                  <li>• 毛玻璃背景效果</li>
                  <li>• 优先级视觉区分</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-blue-700">🎯 交互体验</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 5秒自动关闭</li>
                  <li>• 悬停暂停计时</li>
                  <li>• 触觉反馈支持</li>
                  <li>• 键盘快捷键(ESC)</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-purple-700">📱 响应式适配</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• iPhone 全屏宽度</li>
                  <li>• iPad 限制最大宽度</li>
                  <li>• 自适应字体大小</li>
                  <li>• 深色模式支持</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-orange-700">⚡ 动画效果</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 弹簧入场动画</li>
                  <li>• 平滑淡出效果</li>
                  <li>• 进度条指示器</li>
                  <li>• 硬件加速优化</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default NotificationModalDemo