'use client'

import React, { useState, useEffect } from 'react'
import { Bell, Settings, Filter, MoreVertical, Trash2, CheckCheck } from 'lucide-react'
import { NotificationType, NotificationPriority, NotificationStatus } from '@prisma/client'
import { InAppNotificationData } from '@/lib/notification/types'
import { NotificationCard } from './notification-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface NotificationCenterProps {
  userId: string
  className?: string
}

export function NotificationCenter({ userId, className }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<InAppNotificationData[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<NotificationPriority | 'all'>('all')

  // 从API获取通知数据
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // 调用真实的API获取通知
        const response = await fetch(`/api/notifications?channel=IN_APP&limit=50&userId=${userId}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        // 转换API数据格式为前端需要的格式
        const formattedNotifications: InAppNotificationData[] = data.notifications?.map((notif: any) => ({
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
  }, [userId])

  // 过滤通知
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread' && notification.isRead) return false
    if (filter === 'read' && !notification.isRead) return false
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false
    if (priorityFilter !== 'all' && notification.priority !== priorityFilter) return false
    return true
  })

  // 统计数据
  const unreadCount = notifications.filter(n => !n.isRead).length
  const totalCount = notifications.length

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

  // 标记全部为已读
  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    )
  }

  // 删除通知
  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // 清空所有通知
  const handleClearAll = () => {
    setNotifications([])
  }

  // 处理操作
  const handleAction = (id: string, actionUrl?: string) => {
    if (actionUrl) {
      window.open(actionUrl, '_blank')
    }
    handleMarkAsRead(id)
  }

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)}>
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-blue-500" />
          <div>
            <h2 className="text-xl font-semibold">通知中心</h2>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} 条未读` : '暂无未读通知'}
              {totalCount > 0 && ` · 共 ${totalCount} 条`}
            </p>
          </div>
        </div>

        {/* 操作菜单 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
              <CheckCheck className="mr-2 h-4 w-4" />
              标记全部已读
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleClearAll} disabled={totalCount === 0}>
              <Trash2 className="mr-2 h-4 w-4" />
              清空所有通知
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 过滤器 */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
          <TabsList className="grid w-full grid-cols-3 max-w-xs">
            <TabsTrigger value="all" className="text-xs">
              全部
              {totalCount > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {totalCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs">
              未读
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="read" className="text-xs">
              已读
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有类型</SelectItem>
            <SelectItem value={NotificationType.ORDER_CONFIRMED}>订单确认</SelectItem>
            <SelectItem value={NotificationType.PAYMENT_SUCCESS}>支付成功</SelectItem>
            <SelectItem value={NotificationType.BOOKING_REMINDER}>预订提醒</SelectItem>
            <SelectItem value={NotificationType.SYSTEM_ANNOUNCEMENT}>系统公告</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as any)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="优先级" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有优先级</SelectItem>
            <SelectItem value={NotificationPriority.URGENT}>紧急</SelectItem>
            <SelectItem value={NotificationPriority.HIGH}>重要</SelectItem>
            <SelectItem value={NotificationPriority.NORMAL}>普通</SelectItem>
            <SelectItem value={NotificationPriority.LOW}>低</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 通知列表 */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onAction={handleAction}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                暂无通知
              </h3>
              <p className="text-sm text-muted-foreground">
                {filter === 'unread' ? '所有通知都已阅读' : '还没有收到任何通知'}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

export default NotificationCenter