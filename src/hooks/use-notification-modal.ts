'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { InAppNotificationData } from '@/lib/notification/types'

interface NotificationModalState {
  notification: InAppNotificationData | null
  isOpen: boolean
}

interface UseNotificationModalOptions {
  maxQueue?: number // 最大队列长度
  autoCloseDelay?: number // 自动关闭延迟
  enableHapticFeedback?: boolean // 是否启用触觉反馈
}

export function useNotificationModal(options: UseNotificationModalOptions = {}) {
  const {
    maxQueue = 5,
    autoCloseDelay = 5000,
    enableHapticFeedback = true
  } = options

  const [currentModal, setCurrentModal] = useState<NotificationModalState>({
    notification: null,
    isOpen: false
  })
  
  const queueRef = useRef<InAppNotificationData[]>([])
  const isProcessingRef = useRef(false)

  // 显示下一个通知
  const showNextNotification = useCallback(() => {
    if (isProcessingRef.current || queueRef.current.length === 0) {
      return
    }

    isProcessingRef.current = true
    const nextNotification = queueRef.current.shift()!
    
    setCurrentModal({
      notification: nextNotification,
      isOpen: true
    })
  }, [])

  // 添加通知到队列
  const showNotification = useCallback((notification: InAppNotificationData) => {
    // 检查是否已存在相同的通知
    const isDuplicate = queueRef.current.some(n => n.id === notification.id) ||
                       currentModal.notification?.id === notification.id

    if (isDuplicate) {
      console.warn('Duplicate notification ignored:', notification.id)
      return
    }

    // 添加到队列
    queueRef.current.push(notification)

    // 如果队列超过最大长度，移除最旧的通知
    if (queueRef.current.length > maxQueue) {
      queueRef.current.shift()
      console.warn('Notification queue overflow, oldest notification removed')
    }

    // 如果当前没有显示通知，立即显示
    if (!currentModal.isOpen) {
      showNextNotification()
    }
  }, [currentModal.isOpen, currentModal.notification?.id, maxQueue, showNextNotification])

  // 关闭当前通知
  const closeNotification = useCallback(() => {
    setCurrentModal(prev => ({
      ...prev,
      isOpen: false
    }))

    // 延迟处理下一个通知，确保动画完成
    setTimeout(() => {
      isProcessingRef.current = false
      setCurrentModal({
        notification: null,
        isOpen: false
      })
      
      // 显示队列中的下一个通知
      showNextNotification()
    }, 300)
  }, [showNextNotification])

  // 处理操作按钮点击
  const handleAction = useCallback((actionUrl?: string) => {
    if (actionUrl) {
      // 在新标签页中打开链接
      window.open(actionUrl, '_blank', 'noopener,noreferrer')
    }
    
    // 标记通知为已读（这里可以调用API）
    if (currentModal.notification) {
      console.log('Marking notification as read:', currentModal.notification.id)
      // TODO: 调用API标记为已读
    }
    
    closeNotification()
  }, [currentModal.notification, closeNotification])

  // 清空队列
  const clearQueue = useCallback(() => {
    queueRef.current = []
    if (currentModal.isOpen) {
      closeNotification()
    }
  }, [currentModal.isOpen, closeNotification])

  // 获取队列状态
  const getQueueStatus = useCallback(() => {
    return {
      queueLength: queueRef.current.length,
      isShowing: currentModal.isOpen,
      currentNotification: currentModal.notification
    }
  }, [currentModal.isOpen, currentModal.notification])

  // 批量添加通知
  const showNotifications = useCallback((notifications: InAppNotificationData[]) => {
    notifications.forEach(notification => {
      showNotification(notification)
    })
  }, [showNotification])

  // 根据类型过滤和显示通知
  const showNotificationByType = useCallback((
    notification: InAppNotificationData,
    options?: {
      priority?: boolean // 是否优先显示
      replace?: boolean // 是否替换当前显示的通知
    }
  ) => {
    const { priority = false, replace = false } = options || {}

    if (replace && currentModal.isOpen) {
      // 替换当前通知
      setCurrentModal({
        notification,
        isOpen: true
      })
      return
    }

    if (priority) {
      // 优先显示，插入到队列前面
      queueRef.current.unshift(notification)
      if (!currentModal.isOpen) {
        showNextNotification()
      }
    } else {
      // 正常添加到队列
      showNotification(notification)
    }
  }, [currentModal.isOpen, showNotification, showNextNotification])

  // 监听页面可见性变化
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && currentModal.isOpen) {
        // 页面隐藏时暂停自动关闭
        console.log('Page hidden, pausing notification auto-close')
      } else if (!document.hidden && currentModal.isOpen) {
        // 页面显示时恢复自动关闭
        console.log('Page visible, resuming notification auto-close')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [currentModal.isOpen])

  return {
    // 状态
    notification: currentModal.notification,
    isOpen: currentModal.isOpen,
    
    // 操作方法
    showNotification,
    showNotifications,
    showNotificationByType,
    closeNotification,
    handleAction,
    clearQueue,
    getQueueStatus,
    
    // 配置
    autoCloseDelay,
    enableHapticFeedback
  }
}

export default useNotificationModal