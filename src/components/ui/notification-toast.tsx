'use client'

import React, { useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { InAppNotificationData } from '@/lib/notification/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface NotificationToastProps {
  notification: InAppNotificationData
  onClose: () => void
  onAction?: (actionUrl?: string) => void
  autoClose?: boolean
  autoCloseDelay?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

export function NotificationToast({
  notification,
  onClose,
  onAction,
  autoClose = true,
  autoCloseDelay = 5000,
  position = 'top-right'
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // 进入动画
    const timer = setTimeout(() => setIsVisible(true), 100)
    
    // 自动关闭
    let autoCloseTimer: NodeJS.Timeout
    if (autoClose) {
      autoCloseTimer = setTimeout(() => {
        handleClose()
      }, autoCloseDelay)
    }

    return () => {
      clearTimeout(timer)
      if (autoCloseTimer) clearTimeout(autoCloseTimer)
    }
  }, [autoClose, autoCloseDelay])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onClose()
    }, 300) // 等待退出动画完成
  }

  const handleAction = () => {
    if (onAction) {
      onAction(notification.metadata?.actionUrl)
    }
    handleClose()
  }

  // 根据通知类型获取图标
  const getIcon = () => {
    switch (notification.type) {
      case 'ORDER_CONFIRMED':
      case 'PAYMENT_SUCCESS':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'BOOKING_REMINDER':
        return <AlertCircle className="h-5 w-5 text-orange-500" />
      case 'SYSTEM_ANNOUNCEMENT':
        return <Info className="h-5 w-5 text-blue-500" />
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />
    }
  }

  // 根据优先级获取样式
  const getPriorityStyles = () => {
    switch (notification.priority) {
      case 'HIGH':
        return 'border-l-4 border-l-red-500 bg-red-50'
      case 'NORMAL':
        return 'border-l-4 border-l-blue-500 bg-blue-50'
      case 'LOW':
        return 'border-l-4 border-l-gray-500 bg-gray-50'
      default:
        return 'border-l-4 border-l-gray-500 bg-white'
    }
  }

  // 获取位置样式
  const getPositionStyles = () => {
    const baseStyles = 'fixed z-50'
    switch (position) {
      case 'top-right':
        return `${baseStyles} top-4 right-4`
      case 'top-left':
        return `${baseStyles} top-4 left-4`
      case 'bottom-right':
        return `${baseStyles} bottom-4 right-4`
      case 'bottom-left':
        return `${baseStyles} bottom-4 left-4`
      default:
        return `${baseStyles} top-4 right-4`
    }
  }

  return (
    <div
      className={cn(
        getPositionStyles(),
        'w-96 max-w-sm',
        'transform transition-all duration-300 ease-in-out',
        isVisible && !isLeaving
          ? 'translate-x-0 opacity-100 scale-100'
          : position.includes('right')
          ? 'translate-x-full opacity-0 scale-95'
          : '-translate-x-full opacity-0 scale-95'
      )}
    >
      <div
        className={cn(
          'bg-white rounded-lg shadow-lg border',
          getPriorityStyles(),
          'p-4 space-y-3'
        )}
      >
        {/* 头部 */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            {getIcon()}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm truncate">
                  {notification.title}
                </h4>
                {notification.priority === 'HIGH' && (
                  <Badge variant="destructive" className="text-xs px-1 py-0">
                    重要
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(notification.createdAt).toLocaleString('zh-CN')}
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-6 w-6 p-0 hover:bg-gray-100"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* 内容 */}
        <div className="space-y-2">
          <p className="text-sm text-gray-700 leading-relaxed">
            {notification.content}
          </p>

          {/* 元数据信息 */}
          {notification.metadata && (
            <div className="space-y-1">
              {notification.metadata.confirmationNumber && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">确认编号:</span>
                  <span className="font-mono font-medium">
                    {notification.metadata.confirmationNumber}
                  </span>
                </div>
              )}
              
              {notification.metadata.amount && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">金额:</span>
                  <span className="font-semibold text-green-600">
                    ¥{notification.metadata.amount.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        {notification.metadata?.actionLabel && (
          <div className="flex justify-end pt-2">
            <Button
              size="sm"
              onClick={handleAction}
              className="h-8 px-3 text-xs"
            >
              {notification.metadata.actionLabel}
            </Button>
          </div>
        )}

        {/* 进度条（自动关闭时显示） */}
        {autoClose && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all ease-linear"
              style={{
                width: '100%',
                animation: `shrink ${autoCloseDelay}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  )
}

// Toast 容器组件
interface NotificationToastContainerProps {
  notifications: InAppNotificationData[]
  onClose: (id: string) => void
  onAction?: (id: string, actionUrl?: string) => void
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  maxToasts?: number
}

export function NotificationToastContainer({
  notifications,
  onClose,
  onAction,
  position = 'top-right',
  maxToasts = 3
}: NotificationToastContainerProps) {
  // 限制显示的Toast数量
  const visibleNotifications = notifications.slice(0, maxToasts)

  const handleAction = (id: string, actionUrl?: string) => {
    if (onAction) {
      onAction(id, actionUrl)
    }
  }

  return (
    <>
      {visibleNotifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{
            zIndex: 1000 - index, // 确保新的Toast在上层
            transform: position.includes('top')
              ? `translateY(${index * 10}px)`
              : `translateY(${-index * 10}px)`
          }}
        >
          <NotificationToast
            notification={notification}
            onClose={() => onClose(notification.id)}
            onAction={(actionUrl) => handleAction(notification.id, actionUrl)}
            position={position}
          />
        </div>
      ))}
    </>
  )
}

export default NotificationToast