'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, Clock, MapPin, Phone, Mail, CreditCard, Package, Search, Filter, Download, Eye, MessageCircle, Truck, Star, AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface Order {
  id: string
  type: 'ATTRACTION' | 'ACCOMMODATION' | 'RESTAURANT' | 'PACKAGE' | 'EXPERIENCE'
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REFUNDED'
  totalAmount: number
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  paymentMethod?: string
  bookingDate?: string
  checkInDate?: string
  checkOutDate?: string
  guestCount?: number
  contactName: string
  contactPhone: string
  contactEmail?: string
  specialRequests?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  isPriority: boolean
  urgencyLevel: 'NORMAL' | 'TIME_SENSITIVE' | 'LAST_MINUTE' | 'VIP'
  createdAt: string
  updatedAt: string
  restaurantId?: string
  attractionId?: string
  accommodationId?: string
  roomId?: string
  // 新增字段
  productName?: string
  productSpecs?: string
  unitPrice?: number
  quantity?: number
  shippingAddress?: string
  shippingMethod?: string
  trackingNumber?: string
  logisticsStatus?: 'PREPARING' | 'SHIPPED' | 'IN_TRANSIT' | 'DELIVERED' | 'RETURNED'
  deliveryDate?: string
  afterSalesStatus?: 'NONE' | 'APPLIED' | 'PROCESSING' | 'RESOLVED' | 'REJECTED'
}

interface OrderManagementProps {
  orders: Order[]
  onRefresh: () => void
  onUpdateOrder: (orderId: string, updates: any) => void
  onExportOrders: () => void
}

// 订单类型中文映射
const ORDER_TYPE_MAP = {
  ATTRACTION: '景点门票',
  ACCOMMODATION: '住宿预订',
  RESTAURANT: '餐厅预订',
  PACKAGE: '套餐服务',
  EXPERIENCE: '体验项目'
}

// 订单状态中文映射
const ORDER_STATUS_MAP = {
  PENDING: '待确认',
  CONFIRMED: '已确认',
  CANCELLED: '已取消',
  COMPLETED: '已完成',
  REFUNDED: '已退款'
}

// 支付状态中文映射
const PAYMENT_STATUS_MAP = {
  PENDING: '待支付',
  PAID: '已支付',
  FAILED: '支付失败',
  REFUNDED: '已退款'
}

// 支付方式中文映射
const PAYMENT_METHOD_MAP: { [key: string]: string } = {
  'wechat': '微信支付',
  'alipay': '支付宝',
  'unionpay': '银联支付',
  'credit_card': '信用卡',
  'cash': '现金支付',
  'bank_transfer': '银行转账'
}

// 优先级中文映射
const PRIORITY_MAP = {
  LOW: '普通',
  MEDIUM: '中等',
  HIGH: '高',
  CRITICAL: '紧急'
}

// 紧急程度中文映射
const URGENCY_MAP = {
  NORMAL: '正常',
  TIME_SENSITIVE: '时间敏感',
  LAST_MINUTE: '临时预订',
  VIP: 'VIP客户'
}

// 物流状态中文映射
const LOGISTICS_STATUS_MAP = {
  PREPARING: '备货中',
  SHIPPED: '已发货',
  IN_TRANSIT: '运输中',
  DELIVERED: '已送达',
  RETURNED: '已退回'
}

// 售后状态中文映射
const AFTER_SALES_STATUS_MAP = {
  NONE: '无售后',
  APPLIED: '已申请',
  PROCESSING: '处理中',
  RESOLVED: '已解决',
  REJECTED: '已拒绝'
}

// 配送方式中文映射
const SHIPPING_METHOD_MAP: { [key: string]: string } = {
  'express': '快递配送',
  'standard': '标准配送',
  'same_day': '当日达',
  'pickup': '到店自取',
  'digital': '数字交付'
}

// 状态颜色映射
const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-800'
    case 'CONFIRMED': return 'bg-green-100 text-green-800'
    case 'CANCELLED': return 'bg-red-100 text-red-800'
    case 'COMPLETED': return 'bg-blue-100 text-blue-800'
    case 'REFUNDED': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

// 支付状态颜色映射
const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return 'bg-orange-100 text-orange-800'
    case 'PAID': return 'bg-green-100 text-green-800'
    case 'FAILED': return 'bg-red-100 text-red-800'
    case 'REFUNDED': return 'bg-purple-100 text-purple-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

// 物流状态颜色映射
const getLogisticsStatusColor = (status: string) => {
  switch (status) {
    case 'PREPARING': return 'bg-orange-100 text-orange-800'
    case 'SHIPPED': return 'bg-blue-100 text-blue-800'
    case 'IN_TRANSIT': return 'bg-purple-100 text-purple-800'
    case 'DELIVERED': return 'bg-green-100 text-green-800'
    case 'RETURNED': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

// 售后状态颜色映射
const getAfterSalesStatusColor = (status: string) => {
  switch (status) {
    case 'NONE': return 'bg-gray-100 text-gray-800'
    case 'APPLIED': return 'bg-yellow-100 text-yellow-800'
    case 'PROCESSING': return 'bg-blue-100 text-blue-800'
    case 'RESOLVED': return 'bg-green-100 text-green-800'
    case 'REJECTED': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export default function OrderManagement({ orders, onRefresh, onUpdateOrder, onExportOrders }: OrderManagementProps) {
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(orders)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [afterSalesDialogOpen, setAfterSalesDialogOpen] = useState(false)
  const [afterSalesReason, setAfterSalesReason] = useState('')
  const [afterSalesDescription, setAfterSalesDescription] = useState('')

  // 筛选订单
  useEffect(() => {
    let filtered = orders

    // 搜索筛选
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.contactPhone.includes(searchTerm)
      )
    }

    // 状态筛选
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    // 类型筛选
    if (typeFilter !== 'all') {
      filtered = filtered.filter(order => order.type === typeFilter)
    }

    // 日期筛选
    if (dateFilter !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt)
        const orderDateOnly = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate())
        
        switch (dateFilter) {
          case 'today':
            return orderDateOnly.getTime() === today.getTime()
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
            return orderDateOnly >= weekAgo
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
            return orderDateOnly >= monthAgo
          default:
            return true
        }
      })
    }

    setFilteredOrders(filtered)
  }, [orders, searchTerm, statusFilter, typeFilter, dateFilter])

  // 格式化日期
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })
  }

  // 格式化金额
  const formatAmount = (amount: number) => {
    return `¥${amount.toFixed(2)}`
  }

  // 获取支付方式显示名称
  const getPaymentMethodName = (method?: string) => {
    if (!method) return '未知'
    return PAYMENT_METHOD_MAP[method] || method
  }

  // 获取配送方式显示名称
  const getShippingMethodName = (method?: string) => {
    if (!method) return '未知'
    return SHIPPING_METHOD_MAP[method] || method
  }

  // 处理售后申请
  const handleAfterSalesSubmit = () => {
    if (!selectedOrder || !afterSalesReason.trim()) return
    
    // 这里应该调用API提交售后申请
    onUpdateOrder(selectedOrder.id, {
      afterSalesStatus: 'APPLIED',
      afterSalesReason,
      afterSalesDescription
    })
    
    setAfterSalesDialogOpen(false)
    setAfterSalesReason('')
    setAfterSalesDescription('')
    setSelectedOrder(null)
  }

  return (
    <div className="space-y-6">
      {/* 筛选和搜索栏 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>订单管理</span>
            <div className="flex gap-2">
              <Button onClick={onRefresh} variant="outline" size="sm">
                刷新
              </Button>
              <Button onClick={onExportOrders} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                导出
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜索订单号、联系人、电话"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 状态筛选 */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="订单状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="PENDING">待确认</SelectItem>
                <SelectItem value="CONFIRMED">已确认</SelectItem>
                <SelectItem value="CANCELLED">已取消</SelectItem>
                <SelectItem value="COMPLETED">已完成</SelectItem>
                <SelectItem value="REFUNDED">已退款</SelectItem>
              </SelectContent>
            </Select>

            {/* 类型筛选 */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="订单类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="ATTRACTION">景点门票</SelectItem>
                <SelectItem value="ACCOMMODATION">住宿预订</SelectItem>
                <SelectItem value="RESTAURANT">餐厅预订</SelectItem>
                <SelectItem value="PACKAGE">套餐服务</SelectItem>
                <SelectItem value="EXPERIENCE">体验项目</SelectItem>
              </SelectContent>
            </Select>

            {/* 日期筛选 */}
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="下单时间" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部时间</SelectItem>
                <SelectItem value="today">今天</SelectItem>
                <SelectItem value="week">最近一周</SelectItem>
                <SelectItem value="month">最近一月</SelectItem>
              </SelectContent>
            </Select>

            {/* 清空筛选 */}
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setTypeFilter('all')
                setDateFilter('all')
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              清空筛选
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 订单统计 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{filteredOrders.length}</div>
            <div className="text-sm text-gray-600">总订单数</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredOrders.filter(o => o.status === 'PENDING').length}
            </div>
            <div className="text-sm text-gray-600">待确认</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {filteredOrders.filter(o => o.status === 'CONFIRMED').length}
            </div>
            <div className="text-sm text-gray-600">已确认</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {filteredOrders.filter(o => o.status === 'COMPLETED').length}
            </div>
            <div className="text-sm text-gray-600">已完成</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatAmount(filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0))}
            </div>
            <div className="text-sm text-gray-600">总金额</div>
          </CardContent>
        </Card>
      </div>

      {/* 订单列表 */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              暂无符合条件的订单
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* 基本信息 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">订单 #{order.id.slice(-8)}</h3>
                      {order.isPriority && (
                        <Badge variant="destructive" className="text-xs">
                          优先
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(order.status)}>
                          {ORDER_STATUS_MAP[order.status]}
                        </Badge>
                        <Badge variant="outline">
                          {ORDER_TYPE_MAP[order.type]}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>下单时间：{formatDate(order.createdAt)}</span>
                      </div>
                      
                      {order.bookingDate && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>预订时间：{formatDate(order.bookingDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 商品信息 */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">商品信息</h4>
                    <div className="space-y-2 text-sm">
                      {order.productName && (
                        <div>
                          <div className="font-medium">{order.productName}</div>
                          {order.productSpecs && (
                            <div className="text-gray-600">规格：{order.productSpecs}</div>
                          )}
                        </div>
                      )}
                      
                      {order.unitPrice && order.quantity && (
                        <div className="space-y-1">
                          <div>单价：{formatAmount(order.unitPrice)}</div>
                          <div>数量：{order.quantity}</div>
                          <div className="font-medium">小计：{formatAmount(order.unitPrice * order.quantity)}</div>
                        </div>
                      )}
                      
                      {order.guestCount && (
                        <div>人数：{order.guestCount}人</div>
                      )}
                      
                      {order.checkInDate && order.checkOutDate && (
                        <div>
                          <div>入住：{formatDate(order.checkInDate)}</div>
                          <div>退房：{formatDate(order.checkOutDate)}</div>
                        </div>
                      )}
                      
                      {order.specialRequests && (
                        <div className="text-gray-600">
                          备注：{order.specialRequests}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 收货信息 */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">收货信息</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{order.contactName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{order.contactPhone}</span>
                      </div>
                      {order.contactEmail && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{order.contactEmail}</span>
                        </div>
                      )}
                      {order.shippingAddress && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{order.shippingAddress}</span>
                        </div>
                      )}
                      {order.shippingMethod && (
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-gray-400" />
                          <span>{getShippingMethodName(order.shippingMethod)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 支付和物流信息 */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">支付与物流</h4>
                    <div className="space-y-3">
                      {/* 支付信息 */}
                      <div className="space-y-2">
                        <div className="text-xl font-bold text-green-600">
                          {formatAmount(order.totalAmount)}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                            {PAYMENT_STATUS_MAP[order.paymentStatus]}
                          </Badge>
                          {order.afterSalesStatus && order.afterSalesStatus !== 'NONE' && (
                            <Badge className={getAfterSalesStatusColor(order.afterSalesStatus)}>
                              {AFTER_SALES_STATUS_MAP[order.afterSalesStatus]}
                            </Badge>
                          )}
                        </div>
                        {order.paymentMethod && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CreditCard className="w-4 h-4" />
                            <span>{getPaymentMethodName(order.paymentMethod)}</span>
                          </div>
                        )}
                      </div>

                      {/* 物流信息 */}
                      {order.logisticsStatus && (
                        <div className="space-y-2 pt-2 border-t">
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-gray-400" />
                            <Badge className={getLogisticsStatusColor(order.logisticsStatus)}>
                              {LOGISTICS_STATUS_MAP[order.logisticsStatus]}
                            </Badge>
                          </div>
                          {order.trackingNumber && (
                            <div className="text-sm text-gray-600">
                              快递单号：{order.trackingNumber}
                            </div>
                          )}
                          {order.deliveryDate && (
                            <div className="text-sm text-gray-600">
                              预计送达：{formatDate(order.deliveryDate)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        详情
                      </Button>
                      
                      {(order.status === 'CONFIRMED' || order.status === 'COMPLETED') && 
                       (!order.afterSalesStatus || order.afterSalesStatus === 'NONE') && (
                        <Dialog open={afterSalesDialogOpen} onOpenChange={setAfterSalesDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <MessageCircle className="w-4 h-4 mr-1" />
                              售后
                            </Button>
                          </DialogTrigger>
                        </Dialog>
                      )}

                      {order.trackingNumber && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            // 这里可以跳转到物流查询页面
                            window.open(`https://www.kuaidi100.com/query?type=auto&postid=${order.trackingNumber}`, '_blank')
                          }}
                        >
                          <Package className="w-4 h-4 mr-1" />
                          查询物流
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 订单详情弹窗 */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>订单详情 #{selectedOrder.id.slice(-8)}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedOrder(null)}
                >
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 详细的订单信息展示 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">订单基本信息</h4>
                  <div className="space-y-2 text-sm">
                    <div>订单编号：{selectedOrder.id}</div>
                    <div>订单类型：{ORDER_TYPE_MAP[selectedOrder.type]}</div>
                    <div>订单状态：{ORDER_STATUS_MAP[selectedOrder.status]}</div>
                    <div>优先级：{PRIORITY_MAP[selectedOrder.priority]}</div>
                    <div>紧急程度：{URGENCY_MAP[selectedOrder.urgencyLevel]}</div>
                    <div>下单时间：{formatDate(selectedOrder.createdAt)}</div>
                    <div>更新时间：{formatDate(selectedOrder.updatedAt)}</div>
                    {selectedOrder.bookingDate && (
                      <div>预订时间：{formatDate(selectedOrder.bookingDate)}</div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">支付信息</h4>
                  <div className="space-y-2 text-sm">
                    <div>订单金额：{formatAmount(selectedOrder.totalAmount)}</div>
                    <div>支付状态：{PAYMENT_STATUS_MAP[selectedOrder.paymentStatus]}</div>
                    {selectedOrder.paymentMethod && (
                      <div>支付方式：{getPaymentMethodName(selectedOrder.paymentMethod)}</div>
                    )}
                    {selectedOrder.afterSalesStatus && selectedOrder.afterSalesStatus !== 'NONE' && (
                      <div>售后状态：{AFTER_SALES_STATUS_MAP[selectedOrder.afterSalesStatus]}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* 商品信息 */}
              {selectedOrder.productName && (
                <div>
                  <h4 className="font-medium mb-3">商品信息</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                    <div className="font-medium">{selectedOrder.productName}</div>
                    {selectedOrder.productSpecs && (
                      <div>规格：{selectedOrder.productSpecs}</div>
                    )}
                    {selectedOrder.unitPrice && selectedOrder.quantity && (
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        <div>单价：{formatAmount(selectedOrder.unitPrice)}</div>
                        <div>数量：{selectedOrder.quantity}</div>
                        <div className="font-medium">小计：{formatAmount(selectedOrder.unitPrice * selectedOrder.quantity)}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 收货信息 */}
              <div>
                <h4 className="font-medium mb-3">收货信息</h4>
                <div className="space-y-2 text-sm">
                  <div>收货人：{selectedOrder.contactName}</div>
                  <div>联系电话：{selectedOrder.contactPhone}</div>
                  {selectedOrder.contactEmail && (
                    <div>联系邮箱：{selectedOrder.contactEmail}</div>
                  )}
                  {selectedOrder.shippingAddress && (
                    <div>收货地址：{selectedOrder.shippingAddress}</div>
                  )}
                  {selectedOrder.shippingMethod && (
                    <div>配送方式：{getShippingMethodName(selectedOrder.shippingMethod)}</div>
                  )}
                </div>
              </div>

              {/* 物流信息 */}
              {selectedOrder.logisticsStatus && (
                <div>
                  <h4 className="font-medium mb-3">物流跟踪</h4>
                  <div className="bg-blue-50 p-4 rounded-lg space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge className={getLogisticsStatusColor(selectedOrder.logisticsStatus)}>
                        {LOGISTICS_STATUS_MAP[selectedOrder.logisticsStatus]}
                      </Badge>
                    </div>
                    {selectedOrder.trackingNumber && (
                      <div>快递单号：{selectedOrder.trackingNumber}</div>
                    )}
                    {selectedOrder.deliveryDate && (
                      <div>预计送达：{formatDate(selectedOrder.deliveryDate)}</div>
                    )}
                    {selectedOrder.trackingNumber && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          window.open(`https://www.kuaidi100.com/query?type=auto&postid=${selectedOrder.trackingNumber}`, '_blank')
                        }}
                      >
                        <Package className="w-4 h-4 mr-1" />
                        查看物流详情
                      </Button>
                    )}
                  </div>
                </div>
              )}
              
              {selectedOrder.specialRequests && (
                <div>
                  <h4 className="font-medium mb-3">特殊要求</h4>
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {selectedOrder.specialRequests}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 售后申请弹窗 */}
      <Dialog open={afterSalesDialogOpen} onOpenChange={setAfterSalesDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>申请售后服务</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">售后原因</label>
              <Select value={afterSalesReason} onValueChange={setAfterSalesReason}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择售后原因" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quality_issue">质量问题</SelectItem>
                  <SelectItem value="wrong_item">商品错误</SelectItem>
                  <SelectItem value="damaged">商品损坏</SelectItem>
                  <SelectItem value="not_as_described">与描述不符</SelectItem>
                  <SelectItem value="service_issue">服务问题</SelectItem>
                  <SelectItem value="other">其他原因</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">问题描述</label>
              <Textarea
                placeholder="请详细描述遇到的问题..."
                value={afterSalesDescription}
                onChange={(e) => setAfterSalesDescription(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setAfterSalesDialogOpen(false)
                  setAfterSalesReason('')
                  setAfterSalesDescription('')
                }}
              >
                取消
              </Button>
              <Button 
                onClick={handleAfterSalesSubmit}
                disabled={!afterSalesReason.trim()}
              >
                提交申请
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { OrderManagement }