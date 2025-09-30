# 平潭旅游支付通知系统

## 系统概述

平潭旅游支付通知系统是一个高效、可靠的多渠道消息推送平台，专为平潭旅游支付场景设计。系统支持实时向用户发送重要的支付状态更新和业务通知，具备消息分类、优先级设置、用户分组管理等功能。采用模块化设计，易于扩展和维护，能够无缝集成到现有平台中。

### 核心特性

- **高效可靠**: 基于队列机制的异步处理，确保高并发场景下的稳定性
- **多渠道支持**: 支持站内消息、邮件、短信、推送通知等多种渠道
- **智能重试**: 内置失败重试机制，提高消息送达率
- **模块化设计**: 松耦合架构，支持渠道插件化扩展
- **实时监控**: 完善的监控体系和统计分析功能
- **安全可靠**: 多层安全防护，包括签名验证、内容过滤等

### 技术架构

- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **后端**: Next.js API Routes + Prisma ORM
- **数据库**: PostgreSQL
- **队列**: 内置队列处理器（支持扩展至Redis/Bull）
- **通知渠道**: 
  - 邮件: SMTP/SendGrid
  - 短信: 阿里云SMS/腾讯云SMS
  - 推送: FCM/APNs
  - 站内: WebSocket/Server-Sent Events

## 快速开始

### 1. 环境准备

```bash
# 克隆项目
git clone <repository-url>
cd pingtan_web

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
```

### 2. 数据库设置

```bash
# 运行数据库迁移
npx prisma migrate dev

# 生成Prisma客户端
npx prisma generate

# （可选）填充示例数据
npx prisma db seed
```

### 3. 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm run build
npm start
```

### 4. 验证安装

```bash
# 健康检查
curl http://localhost:3000/api/notifications/health

# 发送测试通知
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user",
    "type": "SYSTEM",
    "title": "测试通知",
    "content": "系统安装成功！",
    "channels": ["IN_APP"]
  }'
```

## 核心功能

### 1. 实时推送支付状态变更通知
- 支持支付成功、失败、退款等状态变更的实时通知
- 集成支付宝、微信支付等主流支付平台的Webhook回调
- 提供统一的支付状态变更事件处理机制

### 2. 多种通知渠道支持
- **短信通知**: 支持阿里云、腾讯云、Twilio等短信服务商
- **邮件通知**: 支持SMTP、SendGrid、AWS SES等邮件服务
- **站内信**: 应用内消息推送，支持实时WebSocket通知
- **推送通知**: 支持FCM、APNS、极光推送等移动端推送

### 3. 失败通知重试机制
- 指数退避算法，避免系统过载
- 支持最大重试次数和延迟时间配置
- 队列化处理，支持批量发送和并发控制
- 失败通知的详细日志记录和监控

### 4. 通知记录查询功能
- 完整的通知历史记录
- 支持多维度查询和过滤
- 提供统计分析和报表功能
- 用户个人通知管理界面

### 5. 安全性和准确性保障
- 通知内容安全验证和敏感词过滤
- 数字签名验证，防止伪造通知
- 内容加密存储，保护用户隐私
- 权限控制，确保数据访问安全

## 系统架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   支付系统      │    │   Webhook接收   │    │   通知服务      │
│                 │───▶│                 │───▶│                 │
│ - 订单管理      │    │ - 支付宝回调    │    │ - 事件处理      │
│ - 支付处理      │    │ - 微信回调      │    │ - 通知创建      │
│ - 状态更新      │    │ - 签名验证      │    │ - 模板渲染      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                       ┌─────────────────┐             │
                       │   通知队列      │◀────────────┘
                       │                 │
                       │ - 批量处理      │
                       │ - 重试机制      │
                       │ - 并发控制      │
                       └─────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
┌─────────────┐        ┌─────────────┐        ┌─────────────┐
│   短信服务  │        │   邮件服务  │        │   推送服务  │
│             │        │             │        │             │
│ - 阿里云    │        │ - SMTP      │        │ - FCM       │
│ - 腾讯云    │        │ - SendGrid  │        │ - APNS      │
│ - Twilio    │        │ - AWS SES   │        │ - 极光推送  │
└─────────────┘        └─────────────┘        └─────────────┘
```

## 数据模型

### 核心表结构

#### Notification (通知记录)
```prisma
model Notification {
  id              String            @id @default(cuid())
  userId          String
  type            NotificationType
  title           String
  content         String
  channels        String[]
  status          NotificationStatus @default(PENDING)
  priority        NotificationPriority @default(NORMAL)
  templateId      String?
  templateVariables Json?
  metadata        Json?
  scheduledAt     DateTime?
  sentAt          DateTime?
  deliveredAt     DateTime?
  readAt          DateTime?
  failureReason   String?
  retryCount      Int              @default(0)
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  
  user            User             @relation(fields: [userId], references: [id])
  template        NotificationTemplate? @relation(fields: [templateId], references: [id])
}
```

#### NotificationTemplate (通知模板)
```prisma
model NotificationTemplate {
  id          String   @id @default(cuid())
  name        String
  type        NotificationType
  channel     NotificationChannel
  subject     String?
  content     String
  variables   String[]
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  notifications Notification[]
}
```

#### NotificationConfig (用户通知配置)
```prisma
model NotificationConfig {
  id        String              @id @default(cuid())
  userId    String
  type      NotificationType
  channels  NotificationChannel[]
  enabled   Boolean             @default(true)
  createdAt DateTime            @default(now())
  updatedAt DateTime            @updatedAt
  
  user      User                @relation(fields: [userId], references: [id])
  
  @@unique([userId, type])
}
```

## API接口

### 通知管理
- `GET /api/notifications` - 查询通知列表
- `POST /api/notifications` - 创建通知
- `PATCH /api/notifications` - 批量操作通知
- `GET /api/notifications/{id}` - 获取通知详情
- `PATCH /api/notifications/{id}` - 更新通知
- `DELETE /api/notifications/{id}` - 删除通知

### 模板管理
- `GET /api/notifications/templates` - 查询模板列表
- `POST /api/notifications/templates` - 创建模板
- `GET /api/notifications/templates/{id}` - 获取模板详情
- `PATCH /api/notifications/templates/{id}` - 更新模板
- `DELETE /api/notifications/templates/{id}` - 删除模板

### 用户配置
- `GET /api/notifications/config` - 获取用户通知配置
- `POST /api/notifications/config` - 创建/更新配置
- `PATCH /api/notifications/config` - 批量更新配置

### 统计监控
- `GET /api/notifications/stats` - 获取通知统计
- `GET /api/notifications/monitor` - 获取监控数据
- `POST /api/notifications/monitor` - 管理监控配置
- `GET /api/notifications/health` - 健康检查

### Webhook接收
- `POST /api/webhooks/payment` - 接收支付Webhook通知

## 使用示例

### 1. 初始化通知系统

```typescript
import { initializeNotificationSystem } from '@/lib/notification'

// 在应用启动时初始化
await initializeNotificationSystem()
```

### 2. 发送支付成功通知

```typescript
import { onPaymentStatusChange, createPaymentStatusChangeEvent } from '@/lib/notification/payment-integration'
import { PaymentStatus } from '@prisma/client'

// 创建支付状态变更事件
const event = createPaymentStatusChangeEvent(
  'order_123456',
  'user_789',
  PaymentStatus.PENDING,
  PaymentStatus.SUCCESS,
  99.99,
  {
    paymentId: 'pay_123456',
    paymentMethod: 'alipay'
  }
)

// 触发通知
await onPaymentStatusChange(event)
```

### 3. 创建自定义通知

```typescript
import { notificationService } from '@/lib/notification'

await notificationService.createAndSendNotification({
  userId: 'user_123',
  type: 'PAYMENT_SUCCESS',
  title: '支付成功',
  content: '您的订单支付成功，感谢您的购买！',
  channels: ['SMS', 'EMAIL', 'IN_APP'],
  priority: 'HIGH',
  templateId: 'payment_success_template',
  templateVariables: {
    orderId: 'order_123',
    amount: '99.99'
  }
})
```

### 4. 处理Webhook回调

```typescript
// 在支付回调中使用
import { processWebhook } from '@/lib/notification/webhooks'

const result = await processWebhook(
  'alipay',
  webhookBody,
  signature,
  headers
)

if (result.success) {
  console.log('Webhook processed successfully')
} else {
  console.error('Webhook processing failed:', result.message)
}
```

## 配置说明

### 环境变量配置

```env
# 数据库
DATABASE_URL="postgresql://..."

# 短信服务
ALIYUN_ACCESS_KEY_ID="your_access_key"
ALIYUN_ACCESS_KEY_SECRET="your_secret"
SMS_SIGN_NAME="平潭旅游"
SMS_TEMPLATE_CODE="SMS_123456"

# 邮件服务
SMTP_HOST="smtp.qq.com"
SMTP_PORT="587"
SMTP_USER="your_email@qq.com"
SMTP_PASS="your_password"

# 推送服务
FCM_SERVER_KEY="your_fcm_server_key"
FCM_SENDER_ID="your_sender_id"

# Webhook验证
ALIPAY_PUBLIC_KEY="your_alipay_public_key"
WECHAT_API_KEY="your_wechat_api_key"
WEBHOOK_SECRET="your_webhook_secret"

# 加密密钥
NOTIFICATION_ENCRYPTION_KEY="your_32_char_encryption_key"
```

### 通知模板示例

```json
{
  "name": "支付成功通知",
  "type": "PAYMENT_SUCCESS",
  "channel": "SMS",
  "content": "【平潭旅游】您的订单{{orderId}}支付成功，金额{{formattedAmount}}，感谢您的购买！",
  "variables": ["orderId", "formattedAmount"]
}
```

## 监控和日志

### 监控指标
- 通知发送成功率
- 平均发送时间
- 失败通知数量
- 各渠道发送统计
- 队列处理性能

### 告警规则
- 成功率低于90%时告警
- 失败数量超过100时告警
- 平均发送时间超过30秒时告警

### 日志记录
- 通知创建和发送日志
- 错误和异常日志
- 性能指标日志
- Webhook接收日志

## 部署和运维

### 数据库迁移
```bash
npx prisma migrate dev
npx prisma generate
```

### 启动服务
```bash
npm run dev
# 或
npm run build && npm start
```

### 健康检查
```bash
curl http://localhost:3000/api/notifications/health
```

## 性能优化

1. **批量处理**: 支持批量创建和发送通知
2. **队列机制**: 异步处理，避免阻塞主流程
3. **并发控制**: 限制同时处理的通知数量
4. **缓存策略**: 缓存模板和用户配置
5. **数据库优化**: 合理的索引和查询优化

## 安全考虑

1. **权限控制**: 基于角色的访问控制
2. **数据加密**: 敏感信息加密存储
3. **签名验证**: Webhook签名验证
4. **内容过滤**: 敏感词和恶意内容过滤
5. **速率限制**: 防止恶意请求和滥用

## 扩展性

系统设计支持以下扩展：
- 新增通知渠道
- 自定义通知类型
- 第三方服务集成
- 多语言支持
- 个性化推荐

## 故障排查

### 常见问题
1. **通知发送失败**: 检查服务商配置和网络连接
2. **Webhook验证失败**: 检查签名密钥和算法
3. **队列处理缓慢**: 检查并发配置和数据库性能
4. **模板渲染错误**: 检查模板语法和变量

### 调试工具
- 日志查询接口
- 监控面板
- 健康检查接口
- 测试工具

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 支持多渠道通知
- 实现重试机制
- 添加监控功能

---

更多详细信息请参考源代码注释和API文档。