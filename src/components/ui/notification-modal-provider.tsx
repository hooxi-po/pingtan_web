'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { InAppNotificationData } from '@/lib/notification/types'
import { NotificationType, NotificationPriority } from '@prisma/client'
import { NotificationModal } from './notification-modal'
import { useNotificationModal } from '@/hooks/use-notification-modal'

interface NotificationModalContextType {
  showNotification: (notification: InAppNotificationData) => void
  showNotifications: (notifications: InAppNotificationData[]) => void
  showNotificationByType: (
    notification: InAppNotificationData,
    options?: {
      priority?: boolean
      replace?: boolean
    }
  ) => void
  closeNotification: () => void
  clearQueue: () => void
  getQueueStatus: () => {
    queueLength: number
    isShowing: boolean
    currentNotification: InAppNotificationData | null
  }
}

const NotificationModalContext = createContext<NotificationModalContextType | undefined>(undefined)

interface NotificationModalProviderProps {
  children: ReactNode
  maxQueue?: number
  autoCloseDelay?: number
  enableHapticFeedback?: boolean
  className?: string
}

export function NotificationModalProvider({
  children,
  maxQueue = 5,
  autoCloseDelay = 5000,
  enableHapticFeedback = true,
  className
}: NotificationModalProviderProps) {
  const {
    notification,
    isOpen,
    showNotification,
    showNotifications,
    showNotificationByType,
    closeNotification,
    handleAction,
    clearQueue,
    getQueueStatus,
    autoCloseDelay: hookAutoCloseDelay,
    enableHapticFeedback: hookEnableHapticFeedback
  } = useNotificationModal({
    maxQueue,
    autoCloseDelay,
    enableHapticFeedback
  })

  const contextValue: NotificationModalContextType = {
    showNotification,
    showNotifications,
    showNotificationByType,
    closeNotification,
    clearQueue,
    getQueueStatus
  }

  return (
    <NotificationModalContext.Provider value={contextValue}>
      {children}
      
      {/* 全局通知弹窗 */}
      {notification && (
        <NotificationModal
          notification={notification}
          isOpen={isOpen}
          onClose={closeNotification}
          onAction={handleAction}
          autoCloseDelay={hookAutoCloseDelay}
          enableHapticFeedback={hookEnableHapticFeedback}
          className={className}
        />
      )}
    </NotificationModalContext.Provider>
  )
}

// Hook for using the notification modal context
export function useNotificationModalContext() {
  const context = useContext(NotificationModalContext)
  if (context === undefined) {
    throw new Error('useNotificationModalContext must be used within a NotificationModalProvider')
  }
  return context
}

// 便捷的通知显示函数
export function createNotificationHelpers() {
  return {
    // 显示成功通知
    showSuccess: (title: string, content: string, actionLabel?: string, actionUrl?: string) => {
      const notification: InAppNotificationData = {
        id: `success-${Date.now()}`,
        title,
        content,
        type: NotificationType.BOOKING_CONFIRMED,
        priority: NotificationPriority.NORMAL,
        isRead: false,
        createdAt: new Date(),
        metadata: actionLabel ? { actionLabel, actionUrl } : undefined
      }
      
      const context = useNotificationModalContext()
      context.showNotification(notification)
    },

    // 显示错误通知
    showError: (title: string, content: string, actionLabel?: string, actionUrl?: string) => {
      const notification: InAppNotificationData = {
        id: `error-${Date.now()}`,
        title,
        content,
        type: NotificationType.PAYMENT_FAILED,
        priority: NotificationPriority.HIGH,
        isRead: false,
        createdAt: new Date(),
        metadata: actionLabel ? { actionLabel, actionUrl } : undefined
      }
      
      const context = useNotificationModalContext()
      context.showNotificationByType(notification, { priority: true })
    },

    // 显示信息通知
    showInfo: (title: string, content: string, actionLabel?: string, actionUrl?: string) => {
      const notification: InAppNotificationData = {
        id: `info-${Date.now()}`,
        title,
        content,
        type: NotificationType.SYSTEM_ANNOUNCEMENT,
        priority: NotificationPriority.LOW,
        isRead: false,
        createdAt: new Date(),
        metadata: actionLabel ? { actionLabel, actionUrl } : undefined
      }
      
      const context = useNotificationModalContext()
      context.showNotification(notification)
    },

    // 显示警告通知
    showWarning: (title: string, content: string, actionLabel?: string, actionUrl?: string) => {
      const notification: InAppNotificationData = {
        id: `warning-${Date.now()}`,
        title,
        content,
        type: NotificationType.BOOKING_REMINDER,
        priority: NotificationPriority.NORMAL,
        isRead: false,
        createdAt: new Date(),
        metadata: actionLabel ? { actionLabel, actionUrl } : undefined
      }
      
      const context = useNotificationModalContext()
      context.showNotification(notification)
    }
  }
}

export default NotificationModalProvider