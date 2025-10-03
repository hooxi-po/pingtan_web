'use client'

import React, { useState, useEffect } from 'react'
import { 
  Bell, 
  Search, 
  Filter, 
  MoreVertical, 
  Trash2, 
  CheckCheck, 
  Mail, 
  MailOpen,
  Star,
  Archive,
  Settings,
  MessageSquare,
  AlertCircle,
  Info,
  Calendar,
  User,
  X
} from 'lucide-react'
import { NotificationType, NotificationPriority, NotificationStatus } from '@prisma/client'
import { InAppNotificationData } from '@/lib/notification/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface MessageCenterProps {
  userId: string
  className?: string
}

interface Message {
  id: string
  title: string
  content: string
  type: 'system' | 'private' | 'order' | 'promotion'
  priority: 'low' | 'medium' | 'high' | 'critical'
  isRead: boolean
  isStarred: boolean
  isArchived: boolean
  sender?: string
  createdAt: Date
  updatedAt: Date
}

const messageTypeLabels = {
  system: '系统通知',
  private: '私信',
  order: '订单消息',
  promotion: '推广消息'
}

const priorityLabels = {
  low: '低',
  medium: '中',
  high: '高',
  critical: '紧急'
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
}

const typeIcons = {
  system: AlertCircle,
  private: MessageSquare,
  order: Calendar,
  promotion: Star
}

export function MessageCenter({ userId, className }: MessageCenterProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'starred' | 'archived'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set())

  // 从API获取通知数据
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/notifications?channel=IN_APP&limit=50&userId=${userId}`)
        if (response.ok) {
          const data = await response.json()
          
          // 将API返回的通知数据转换为消息格式
          const apiMessages: Message[] = data.notifications?.map((notification: any) => ({
            id: notification.id,
            title: notification.title,
            content: notification.content,
            type: mapNotificationTypeToMessageType(notification.type),
            priority: mapNotificationPriorityToMessagePriority(notification.priority),
            isRead: false, // DELIVERED状态表示已投递但未读，需要用户点击后才标记为已读
            isStarred: false,
            isArchived: false,
            sender: notification.user?.name || '系统',
            createdAt: new Date(notification.createdAt),
            updatedAt: new Date(notification.updatedAt)
          })) || []
          
          setMessages(apiMessages)
        } else {
          console.error('Failed to fetch notifications:', response.statusText)
          // 如果API调用失败，使用空数组
          setMessages([])
        }
      } catch (error) {
        console.error('Error fetching notifications:', error)
        // 如果发生错误，使用空数组
        setMessages([])
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [userId])

  // 映射通知类型到消息类型
  const mapNotificationTypeToMessageType = (type: string): 'system' | 'private' | 'order' | 'promotion' => {
    switch (type) {
      case 'ORDER_CONFIRMED':
      case 'BOOKING_REMINDER':
        return 'order'
      case 'PAYMENT_SUCCESS':
      case 'SYSTEM_ANNOUNCEMENT':
        return 'system'
      case 'PROMOTION':
        return 'promotion'
      default:
        return 'system'
    }
  }

  // 映射通知优先级到消息优先级
  const mapNotificationPriorityToMessagePriority = (priority: string): 'low' | 'medium' | 'high' | 'critical' => {
    switch (priority) {
      case 'URGENT':
        return 'critical'
      case 'HIGH':
        return 'high'
      case 'NORMAL':
        return 'medium'
      case 'LOW':
        return 'low'
      default:
        return 'medium'
    }
  }

  // 过滤消息
  const filteredMessages = messages.filter(message => {
    // 搜索过滤
    if (searchQuery && !message.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !message.content.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    
    // 标签页过滤
    if (activeTab === 'unread' && message.isRead) return false
    if (activeTab === 'starred' && !message.isStarred) return false
    if (activeTab === 'archived' && !message.isArchived) return false
    
    // 类型过滤
    if (typeFilter !== 'all' && message.type !== typeFilter) return false
    
    // 优先级过滤
    if (priorityFilter !== 'all' && message.priority !== priorityFilter) return false
    
    return true
  })

  // 统计数据
  const stats = {
    total: messages.length,
    unread: messages.filter(m => !m.isRead).length,
    starred: messages.filter(m => m.isStarred).length,
    archived: messages.filter(m => m.isArchived).length
  }

  // 标记已读/未读
  const toggleReadStatus = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isRead: !msg.isRead } : msg
    ))
  }

  // 标记星标
  const toggleStarred = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isStarred: !msg.isStarred } : msg
    ))
  }

  // 归档消息
  const toggleArchived = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isArchived: !msg.isArchived } : msg
    ))
  }

  // 删除消息
  const deleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId))
    if (selectedMessage?.id === messageId) {
      setSelectedMessage(null)
    }
  }

  // 批量操作
  const handleBatchAction = (action: 'read' | 'unread' | 'star' | 'unstar' | 'archive' | 'delete') => {
    const messageIds = Array.from(selectedMessages)
    
    switch (action) {
      case 'read':
        setMessages(prev => prev.map(msg => 
          messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
        ))
        break
      case 'unread':
        setMessages(prev => prev.map(msg => 
          messageIds.includes(msg.id) ? { ...msg, isRead: false } : msg
        ))
        break
      case 'star':
        setMessages(prev => prev.map(msg => 
          messageIds.includes(msg.id) ? { ...msg, isStarred: true } : msg
        ))
        break
      case 'unstar':
        setMessages(prev => prev.map(msg => 
          messageIds.includes(msg.id) ? { ...msg, isStarred: false } : msg
        ))
        break
      case 'archive':
        setMessages(prev => prev.map(msg => 
          messageIds.includes(msg.id) ? { ...msg, isArchived: true } : msg
        ))
        break
      case 'delete':
        setMessages(prev => prev.filter(msg => !messageIds.includes(msg.id)))
        if (selectedMessage && messageIds.includes(selectedMessage.id)) {
          setSelectedMessage(null)
        }
        break
    }
    
    setSelectedMessages(new Set())
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedMessages.size === filteredMessages.length) {
      setSelectedMessages(new Set())
    } else {
      setSelectedMessages(new Set(filteredMessages.map(m => m.id)))
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return '昨天'
    } else if (days < 7) {
      return `${days}天前`
    } else {
      return date.toLocaleDateString('zh-CN')
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="py-10 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">加载消息中心...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("flex flex-col h-full max-w-7xl mx-auto", className)}>
      {/* 优化后的头部 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">消息中心</h1>
              <p className="text-sm text-gray-600">管理您的所有消息和通知</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            设置
          </Button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">全部消息</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Mail className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.unread}</p>
                <p className="text-sm text-gray-600">未读消息</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{stats.starred}</p>
                <p className="text-sm text-gray-600">星标消息</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Archive className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-600">{stats.archived}</p>
                <p className="text-sm text-gray-600">已归档</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="flex flex-1 gap-6">
        {/* 左侧：消息列表 */}
        <Card className="flex-1 min-w-0">
          <CardHeader className="pb-4 space-y-4">
            {/* 优化后的搜索和过滤器 */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索消息标题、内容或发送者..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-36 h-10">
                    <SelectValue placeholder="消息类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有类型</SelectItem>
                    <SelectItem value="system">系统通知</SelectItem>
                    <SelectItem value="private">私信</SelectItem>
                    <SelectItem value="order">订单消息</SelectItem>
                    <SelectItem value="promotion">推广消息</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-32 h-10">
                    <SelectValue placeholder="优先级" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有优先级</SelectItem>
                    <SelectItem value="critical">紧急</SelectItem>
                    <SelectItem value="high">高</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="low">低</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 优化后的标签页 */}
            <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
              <TabsList className="grid w-full grid-cols-4 h-10">
                <TabsTrigger value="all" className="flex items-center gap-2 text-sm">
                  全部
                  {stats.total > 0 && (
                    <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                      {stats.total}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="unread" className="flex items-center gap-2 text-sm">
                  未读
                  {stats.unread > 0 && (
                    <Badge variant="destructive" className="ml-1 px-1.5 py-0.5 text-xs">
                      {stats.unread}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="starred" className="flex items-center gap-2 text-sm">
                  星标
                  {stats.starred > 0 && (
                    <Badge variant="outline" className="ml-1 px-1.5 py-0.5 text-xs">
                      {stats.starred}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="archived" className="flex items-center gap-2 text-sm">
                  归档
                  {stats.archived > 0 && (
                    <Badge variant="outline" className="ml-1 px-1.5 py-0.5 text-xs">
                      {stats.archived}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* 批量操作 */}
            {selectedMessages.size > 0 && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-sm font-medium text-blue-900">
                  已选择 {selectedMessages.size} 条消息
                </span>
                <div className="flex gap-1 ml-auto">
                  <Button size="sm" variant="outline" onClick={() => handleBatchAction('read')} className="h-8">
                    <CheckCheck className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBatchAction('star')} className="h-8">
                    <Star className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBatchAction('archive')} className="h-8">
                    <Archive className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBatchAction('delete')} className="h-8">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              {filteredMessages.length === 0 ? (
                <div className="text-center py-16">
                  <div className="p-4 bg-gray-50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Bell className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">暂无消息</h3>
                  <p className="text-gray-500">当有新消息时，它们会显示在这里</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredMessages.map((message) => {
                    const TypeIcon = typeIcons[message.type]
                    const isSelected = selectedMessages.has(message.id)
                    
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "p-4 hover:bg-gray-50 cursor-pointer transition-all duration-200 border-l-4 border-transparent",
                          !message.isRead && "bg-blue-50/50 border-l-blue-500",
                          selectedMessage?.id === message.id && "bg-blue-100 border-l-blue-600",
                          isSelected && "bg-blue-50"
                        )}
                        onClick={() => setSelectedMessage(message)}
                      >
                        <div className="flex items-start gap-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation()
                              const newSelected = new Set(selectedMessages)
                              if (isSelected) {
                                newSelected.delete(message.id)
                              } else {
                                newSelected.add(message.id)
                              }
                              setSelectedMessages(newSelected)
                            }}
                            className="mt-1.5 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          
                          <div className="flex-shrink-0 mt-1">
                            <div className={cn(
                              "p-2 rounded-lg",
                              message.type === 'system' && "bg-blue-100",
                              message.type === 'private' && "bg-green-100",
                              message.type === 'order' && "bg-orange-100",
                              message.type === 'promotion' && "bg-purple-100"
                            )}>
                              <TypeIcon className={cn(
                                "h-4 w-4",
                                message.type === 'system' && "text-blue-600",
                                message.type === 'private' && "text-green-600",
                                message.type === 'order' && "text-orange-600",
                                message.type === 'promotion' && "text-purple-600"
                              )} />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <h4 className={cn(
                                  "font-medium truncate text-gray-900",
                                  !message.isRead && "font-semibold"
                                )}>
                                  {message.title}
                                </h4>
                                {message.isStarred && (
                                  <Star className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0" />
                                )}
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    "text-xs px-2 py-0.5",
                                    priorityColors[message.priority]
                                  )}
                                >
                                  {priorityLabels[message.priority]}
                                </Badge>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => toggleReadStatus(message.id)}>
                                      {message.isRead ? (
                                        <>
                                          <Mail className="h-4 w-4 mr-2" />
                                          标记未读
                                        </>
                                      ) : (
                                        <>
                                          <MailOpen className="h-4 w-4 mr-2" />
                                          标记已读
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => toggleStarred(message.id)}>
                                      <Star className={cn(
                                        "h-4 w-4 mr-2",
                                        message.isStarred && "text-yellow-500 fill-current"
                                      )} />
                                      {message.isStarred ? '取消星标' : '添加星标'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => toggleArchived(message.id)}>
                                      <Archive className="h-4 w-4 mr-2" />
                                      {message.isArchived ? '取消归档' : '归档'}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => deleteMessage(message.id)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      删除
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                              {message.content}
                            </p>
                            
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs px-2 py-0.5">
                                  {messageTypeLabels[message.type]}
                                </Badge>
                                {message.sender && (
                                  <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {message.sender}
                                  </span>
                                )}
                              </div>
                              <span className="font-medium">{formatDate(message.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* 右侧：消息详情 - 响应式隐藏 */}
        {selectedMessage && (
          <Card className="w-96 hidden lg:block">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      selectedMessage.type === 'system' && "bg-blue-100",
                      selectedMessage.type === 'private' && "bg-green-100",
                      selectedMessage.type === 'order' && "bg-orange-100",
                      selectedMessage.type === 'promotion' && "bg-purple-100"
                    )}>
                      {React.createElement(typeIcons[selectedMessage.type], { 
                        className: cn(
                          "h-5 w-5",
                          selectedMessage.type === 'system' && "text-blue-600",
                          selectedMessage.type === 'private' && "text-green-600",
                          selectedMessage.type === 'order' && "text-orange-600",
                          selectedMessage.type === 'promotion' && "text-purple-600"
                        )
                      })}
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge variant="outline" className="text-xs w-fit">
                        {messageTypeLabels[selectedMessage.type]}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs w-fit", priorityColors[selectedMessage.priority])}
                      >
                        {priorityLabels[selectedMessage.priority]}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg leading-tight mb-2">
                    {selectedMessage.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    {selectedMessage.sender && (
                      <>
                        <User className="h-4 w-4" />
                        <span>{selectedMessage.sender}</span>
                        <span>·</span>
                      </>
                    )}
                    <span>{formatDate(selectedMessage.createdAt)}</span>
                  </CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedMessage(null)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                    {selectedMessage.content}
                  </p>
                </div>
              </ScrollArea>
              
              <div className="flex gap-2 mt-6 pt-4 border-t">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => toggleReadStatus(selectedMessage.id)}
                  className="flex-1"
                >
                  {selectedMessage.isRead ? (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      标记未读
                    </>
                  ) : (
                    <>
                      <MailOpen className="h-4 w-4 mr-2" />
                      标记已读
                    </>
                  )}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => toggleStarred(selectedMessage.id)}
                  className="flex-1"
                >
                  <Star className={cn(
                    "h-4 w-4 mr-2",
                    selectedMessage.isStarred && "text-yellow-500 fill-current"
                  )} />
                  {selectedMessage.isStarred ? '取消星标' : '星标'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 移动端消息详情模态框 */}
      {selectedMessage && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      selectedMessage.type === 'system' && "bg-blue-100",
                      selectedMessage.type === 'private' && "bg-green-100",
                      selectedMessage.type === 'order' && "bg-orange-100",
                      selectedMessage.type === 'promotion' && "bg-purple-100"
                    )}>
                      {React.createElement(typeIcons[selectedMessage.type], { 
                        className: cn(
                          "h-5 w-5",
                          selectedMessage.type === 'system' && "text-blue-600",
                          selectedMessage.type === 'private' && "text-green-600",
                          selectedMessage.type === 'order' && "text-orange-600",
                          selectedMessage.type === 'promotion' && "text-purple-600"
                        )
                      })}
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge variant="outline" className="text-xs w-fit">
                        {messageTypeLabels[selectedMessage.type]}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs w-fit", priorityColors[selectedMessage.priority])}
                      >
                        {priorityLabels[selectedMessage.priority]}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg leading-tight mb-2">
                    {selectedMessage.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    {selectedMessage.sender && (
                      <>
                        <User className="h-4 w-4" />
                        <span>{selectedMessage.sender}</span>
                        <span>·</span>
                      </>
                    )}
                    <span>{formatDate(selectedMessage.createdAt)}</span>
                  </CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedMessage(null)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                    {selectedMessage.content}
                  </p>
                </div>
              </ScrollArea>
              
              <div className="flex gap-2 mt-6 pt-4 border-t">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => toggleReadStatus(selectedMessage.id)}
                  className="flex-1"
                >
                  {selectedMessage.isRead ? (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      标记未读
                    </>
                  ) : (
                    <>
                      <MailOpen className="h-4 w-4 mr-2" />
                      标记已读
                    </>
                  )}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => toggleStarred(selectedMessage.id)}
                  className="flex-1"
                >
                  <Star className={cn(
                    "h-4 w-4 mr-2",
                    selectedMessage.isStarred && "text-yellow-500 fill-current"
                  )} />
                  {selectedMessage.isStarred ? '取消星标' : '星标'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default MessageCenter