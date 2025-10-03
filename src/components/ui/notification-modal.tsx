'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Clock } from 'lucide-react'
import { NotificationType, NotificationPriority } from '@prisma/client'
import { InAppNotificationData } from '@/lib/notification/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import '@/styles/notification-animations.css'

interface NotificationModalProps {
  notification: InAppNotificationData
  isOpen: boolean
  onClose: () => void
  onAction?: (actionUrl?: string) => void
  autoCloseDelay?: number // 自动关闭延迟，默认5秒
  enableHapticFeedback?: boolean // 是否启用触觉反馈
  className?: string
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  notification,
  isOpen: isVisible,
  onClose,
  onAction,
  autoCloseDelay = 5000,
  enableHapticFeedback = true,
  className
}) => {
  const [isLeaving, setIsLeaving] = useState(false)
  const [progress, setProgress] = useState(100)
  const [isPaused, setIsPaused] = useState(false)

  // 触觉反馈函数
  const triggerHapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!enableHapticFeedback || typeof window === 'undefined') return
    
    // 使用 Vibration API 模拟触觉反馈
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30, 10, 30]
      }
      navigator.vibrate(patterns[type])
    }
  }, [enableHapticFeedback])

  // 自动关闭逻辑
  useEffect(() => {
    if (!isVisible || autoCloseDelay <= 0 || isPaused) return

    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, autoCloseDelay - elapsed)
      const progressPercent = (remaining / autoCloseDelay) * 100
      
      setProgress(progressPercent)
      
      if (remaining <= 0) {
        clearInterval(interval)
        handleClose()
      }
    }, 50)

    return () => clearInterval(interval)
  }, [isVisible, autoCloseDelay, isPaused, handleClose])

  // 鼠标悬停暂停自动关闭
  const handleMouseEnter = () => setIsPaused(true)
  const handleMouseLeave = () => setIsPaused(false)

  // 处理关闭动画
  const handleClose = useCallback(() => {
    if (isLeaving) return
    
    setIsLeaving(true)
    triggerHapticFeedback('light')
    
    // 等待动画完成后调用 onClose
    setTimeout(() => {
      onClose()
    }, 300) // 与 CSS 动画时长匹配
  }, [isLeaving, onClose, triggerHapticFeedback])

  // 处理操作按钮点击
  const handleAction = useCallback((actionId: string) => {
    triggerHapticFeedback('medium')
    onAction?.(actionId)
    handleClose()
  }, [onAction, handleClose, triggerHapticFeedback])

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    }

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isVisible, handleClose])

  // 入场时触发触觉反馈
  useEffect(() => {
    if (isVisible && !isLeaving) {
      const feedbackType = notification.priority === NotificationPriority.HIGH ? 'heavy' : 'light'
      triggerHapticFeedback(feedbackType)
    }
  }, [isVisible, isLeaving, notification.priority, triggerHapticFeedback])

  if (!isVisible) return null

  // 获取通知图标
  const getNotificationIcon = () => {
    const iconProps = { className: "w-6 h-6 notification-icon" }
    
    switch (notification.type) {
      case NotificationType.SUCCESS:
        return <CheckCircle {...iconProps} className={cn(iconProps.className, "text-green-500")} />
      case NotificationType.ERROR:
        return <AlertCircle {...iconProps} className={cn(iconProps.className, "text-red-500")} />
      case NotificationType.WARNING:
        return <AlertTriangle {...iconProps} className={cn(iconProps.className, "text-yellow-500")} />
      case NotificationType.INFO:
        return <Info {...iconProps} className={cn(iconProps.className, "text-blue-500")} />
      default:
        return <Clock {...iconProps} className={cn(iconProps.className, "text-gray-500")} />
    }
  }

  // 获取优先级样式
  const getPriorityStyles = () => {
    switch (notification.priority) {
      case NotificationPriority.HIGH:
        return "border-red-200 bg-red-50/95 dark:bg-red-900/20 dark:border-red-800"
      case NotificationPriority.MEDIUM:
        return "border-yellow-200 bg-yellow-50/95 dark:bg-yellow-900/20 dark:border-yellow-800"
      default:
        return "border-gray-200 bg-white/95 dark:bg-gray-800/95 dark:border-gray-700"
    }
  }

  // 获取动画类名
  const getAnimationClasses = () => {
    const baseClasses = ["notification-modal"]
    
    if (isLeaving) {
      baseClasses.push("leaving")
    }
    
    if (notification.priority === NotificationPriority.HIGH) {
      baseClasses.push("high-priority")
    }
    
    if (notification.type === NotificationType.ERROR) {
      baseClasses.push("error")
    }
    
    return baseClasses.join(" ")
  }

  return (
    <>
      {/* 背景遮罩 */}
      <div 
        className={cn(
          "fixed inset-0 z-50 bg-black/20 backdrop-blur-sm notification-backdrop",
          isLeaving && "leaving"
        )}
        onClick={handleClose}
        aria-hidden="true"
      />
      
      {/* 通知弹窗 */}
      <div className="fixed inset-0 z-50 flex pointer-events-none
                      /* 移动端：顶部对齐，添加安全区域 */
                      items-start justify-center pt-safe-top pt-16
                      /* 平板和桌面端：居中对齐 */
                      md:items-center md:justify-center md:pt-0
                      /* 内边距 */
                      p-4 md:p-6">
        <div
          className={cn(
            // 基础样式
            "notification-modal-container relative pointer-events-auto",
            "border shadow-2xl backdrop-blur-md transform-gpu",
            // 响应式宽度和圆角
            "w-full max-w-none", // 移动端全宽
            "md:w-auto md:max-w-md md:rounded-2xl", // 平板端限制宽度
            "lg:max-w-lg", // 桌面端稍大
            // 优先级样式
            getPriorityStyles(),
            // 动画类
            getAnimationClasses(),
            // 自定义类名
            className
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          role="dialog"
          aria-modal="true"
          aria-labelledby="notification-title"
          aria-describedby="notification-description"
        >
          {/* 进度条 */}
          {autoCloseDelay > 0 && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-t-2xl overflow-hidden">
              <div 
                className="h-full bg-blue-500 notification-progress transition-all duration-75 ease-linear"
                style={{ 
                  width: `${progress}%`,
                  '--duration': `${autoCloseDelay}ms`
                } as React.CSSProperties}
              />
            </div>
          )}

          {/* 关闭按钮 */}
          <button
            onClick={handleClose}
            className={cn(
              "absolute top-3 right-3 p-1.5 rounded-full",
              "hover:bg-gray-100 dark:hover:bg-gray-700",
              "transition-all duration-200 notification-close",
              "focus:outline-none focus:ring-2 focus:ring-blue-500"
            )}
            aria-label="关闭通知"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>

          {/* 内容区域 */}
          <div className="p-6 pr-12">
            {/* 头部区域 */}
            <div className="flex items-start space-x-3 mb-4">
              {/* 图标 */}
              <div className="flex-shrink-0 mt-0.5">
                {getNotificationIcon()}
              </div>
              
              {/* 标题和优先级 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 
                    id="notification-title"
                    className="text-lg font-semibold text-gray-900 dark:text-white notification-content"
                    style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
                  >
                    {notification.title}
                  </h3>
                  {notification.priority === NotificationPriority.HIGH && (
                    <Badge variant="destructive" className="text-xs">
                      紧急
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* 消息内容 */}
            {notification.message && (
              <div 
                id="notification-description"
                className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed notification-content"
                style={{ lineHeight: '1.6' }}
              >
                {notification.message}
              </div>
            )}

            {/* 元数据 */}
            {notification.metadata && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 notification-content">
                {typeof notification.metadata === 'string' 
                  ? notification.metadata 
                  : JSON.stringify(notification.metadata)
                }
              </div>
            )}

            {/* 操作按钮 */}
            {notification.actions && notification.actions.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                {notification.actions.map((action, index) => (
                  <Button
                    key={action.id}
                    onClick={() => handleAction(action.id)}
                    variant={index === 0 ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "notification-button flex-1 sm:flex-none",
                      index === 0 && "bg-blue-500 hover:bg-blue-600 text-white",
                      index !== 0 && "border-gray-300 text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default NotificationModal