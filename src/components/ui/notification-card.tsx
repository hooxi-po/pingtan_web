'use client'

import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Bell, CheckCircle, AlertCircle, Info, Clock, ExternalLink } from 'lucide-react'
import { NotificationType, NotificationPriority } from '@prisma/client'
import { InAppNotificationData } from '@/lib/notification/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface NotificationCardProps {
  notification: InAppNotificationData
  onMarkAsRead?: (id: string) => void
  onAction?: (id: string, actionUrl?: string) => void
  className?: string
}

export function NotificationCard({
  notification,
  onMarkAsRead,
  onAction,
  className
}: NotificationCardProps) {
  const {
    id,
    title,
    content,
    type,
    priority,
    isRead,
    createdAt,
    metadata
  } = notification

  // 获取通知图标
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.ORDER_CONFIRMED:
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case NotificationType.PAYMENT_SUCCESS:
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case NotificationType.PAYMENT_FAILED:
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case NotificationType.ORDER_CANCELLED:
        return <AlertCircle className="h-5 w-5 text-orange-500" />
      case NotificationType.BOOKING_REMINDER:
        return <Clock className="h-5 w-5 text-blue-500" />
      case NotificationType.SYSTEM_ANNOUNCEMENT:
        return <Info className="h-5 w-5 text-blue-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  // 获取优先级颜色
  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.URGENT:
        return 'bg-red-100 text-red-800 border-red-200'
      case NotificationPriority.HIGH:
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case NotificationPriority.NORMAL:
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case NotificationPriority.LOW:
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // 获取优先级标签
  const getPriorityLabel = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.URGENT:
        return '紧急'
      case NotificationPriority.HIGH:
        return '重要'
      case NotificationPriority.NORMAL:
        return '普通'
      case NotificationPriority.LOW:
        return '低'
      default:
        return '普通'
    }
  }

  // 处理标记为已读
  const handleMarkAsRead = () => {
    if (!isRead && onMarkAsRead) {
      onMarkAsRead(id)
    }
  }

  // 处理操作按钮点击
  const handleAction = () => {
    if (onAction) {
      onAction(id, metadata?.actionUrl)
    }
  }

  // 格式化时间
  const timeAgo = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: zhCN
  })

  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:shadow-md cursor-pointer',
        !isRead && 'border-l-4 border-l-blue-500 bg-blue-50/30',
        isRead && 'opacity-75',
        className
      )}
      onClick={handleMarkAsRead}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            {/* 通知图标 */}
            <div className="mt-0.5">
              {getNotificationIcon(type)}
            </div>
            
            {/* 标题和时间 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={cn(
                  'font-medium text-sm truncate',
                  !isRead && 'font-semibold'
                )}>
                  {title}
                </h4>
                {!isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {timeAgo}
              </p>
            </div>
          </div>

          {/* 优先级标签 */}
          {priority !== NotificationPriority.NORMAL && (
            <Badge
              variant="outline"
              className={cn(
                'text-xs px-2 py-0.5 flex-shrink-0',
                getPriorityColor(priority)
              )}
            >
              {getPriorityLabel(priority)}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* 通知内容 */}
        <div className="mb-4">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {content}
          </p>
        </div>

        {/* 元数据信息 */}
        {metadata && (
          <div className="space-y-2 mb-4">
            {metadata.confirmationNumber && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium">确认编号:</span>
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                  {metadata.confirmationNumber}
                </span>
              </div>
            )}
            
            {metadata.amount && metadata.currency && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium">金额:</span>
                <span className="font-semibold text-green-600">
                  {metadata.currency} {metadata.amount.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 操作按钮 */}
        {metadata?.actionLabel && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleAction()
              }}
              className="h-8 px-3 text-xs"
            >
              {metadata.actionLabel}
              {metadata.actionUrl && (
                <ExternalLink className="ml-1 h-3 w-3" />
              )}
            </Button>
            
            {!isRead && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleMarkAsRead()
                }}
                className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground"
              >
                标记已读
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default NotificationCard