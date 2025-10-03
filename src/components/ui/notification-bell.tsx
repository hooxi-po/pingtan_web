'use client'

import React, { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { InAppNotificationData } from '@/lib/notification/types'
import { NotificationCard } from './notification-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface NotificationBellProps {
  userId: string
  className?: string
  onNotificationClick?: (notification: InAppNotificationData) => void
}

export function NotificationBell({ 
  userId, 
  className,
  onNotificationClick 
}: NotificationBellProps) {
  const [notifications, setNotifications] = useState<InAppNotificationData[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // 获取最新通知数据
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // 调用真实的API获取通知
        const response = await fetch(`/api/notifications?channel=IN_APP&limit=10&userId=${userId}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        // 转换API数据格式为前端需要的格式
        const formattedNotifications = data.notifications?.map((notif: any) => ({
          id: notif.id,
          title: notif.title,
          content: notif.content,
          type: notif.type,
          priority: notif.priority || 'NORMAL',
          isRead: false, // DELIVERED状态表示已投递但未读，需要用户点击后才标记为已读
          createdAt: new Date(notif.createdAt),
          metadata: {
            ...notif.metadata,
            orderId: notif.orderId,
            actionUrl: notif.orderId ? `/orders/${notif.orderId}` : undefined,
            actionLabel: notif.orderId ? '查看详情' : undefined,
            amount: notif.order?.totalAmount,
            currency: 'CNY'
          }
        })) || []
        
        setNotifications(formattedNotifications)
      } catch (error) {
        console.error('获取通知失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
    
    // 设置定时刷新
    const interval = setInterval(fetchNotifications, 30000) // 30秒刷新一次
    
    return () => clearInterval(interval)
  }, [userId])

  // 未读通知数量
  const unreadCount = notifications.filter(n => !n.isRead).length

  // 标记为已读
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    )
  }

  // 处理通知点击
  const handleNotificationClick = (notification: InAppNotificationData) => {
    handleMarkAsRead(notification.id)
    if (onNotificationClick) {
      onNotificationClick(notification)
    }
    setIsOpen(false)
  }

  // 处理操作按钮点击
  const handleAction = (id: string, actionUrl?: string) => {
    handleMarkAsRead(id)
    if (actionUrl) {
      window.open(actionUrl, '_blank')
    }
    setIsOpen(false)
  }

  // 标记全部已读
  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    )
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'relative p-2 hover:bg-gray-100 rounded-full',
            className
          )}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-96 p-0" 
        align="end"
        sideOffset={8}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <h3 className="font-medium">通知</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} 条未读
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs h-7 px-2"
              >
                全部已读
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-7 w-7 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* 通知列表 */}
        <ScrollArea className="max-h-96">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.slice(0, 5).map((notification, index) => (
                <div
                  key={notification.id}
                  className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    {/* 未读指示器 */}
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      {/* 标题 */}
                      <h4 className={cn(
                        'text-sm truncate mb-1',
                        !notification.isRead ? 'font-semibold' : 'font-medium'
                      )}>
                        {notification.title}
                      </h4>
                      
                      {/* 内容预览 */}
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {notification.content}
                      </p>
                      
                      {/* 时间和操作 */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleDateString('zh-CN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        
                        {notification.metadata?.actionLabel && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAction(notification.id, notification.metadata?.actionUrl)
                            }}
                            className="h-6 px-2 text-xs"
                          >
                            {notification.metadata.actionLabel}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">暂无通知</p>
            </div>
          )}
        </ScrollArea>

        {/* 底部 */}
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsOpen(false)
                  // 跳转到通知中心页面
                  window.location.href = '/notifications'
                }}
                className="w-full text-xs"
              >
                查看所有通知
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}

export default NotificationBell