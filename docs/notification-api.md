# 通知系统 API 文档

## 概述

平潭旅游支付通知系统提供了完整的RESTful API接口，支持通知的创建、查询、管理和统计功能。所有API接口都遵循统一的响应格式和错误处理机制。

## 基础信息

- **Base URL**: `http://localhost:3000/api`
- **认证方式**: JWT Token (Bearer Authentication)
- **内容类型**: `application/json`
- **字符编码**: UTF-8

## 通用响应格式

### 成功响应
```json
{
  "success": true,
  "data": {
    // 响应数据
  },
  "message": "操作成功",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": {}
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 通知管理接口

### 1. 创建通知

**POST** `/notifications`

创建并发送新的通知消息。

#### 请求参数

```json
{
  "userId": "string",           // 必填：用户ID
  "type": "string",            // 必填：通知类型
  "title": "string",           // 必填：通知标题
  "content": "string",         // 必填：通知内容
  "channels": ["string"],      // 必填：发送渠道数组
  "priority": "string",        // 可选：优先级 (LOW/MEDIUM/HIGH/CRITICAL)
  "templateId": "string",      // 可选：模板ID
  "templateVariables": {},     // 可选：模板变量
  "scheduledAt": "datetime",   // 可选：定时发送时间
  "metadata": {}               // 可选：附加元数据
}
```

#### 响应示例

```json
{
  "success": true,
  "data": {
    "id": "notif_123456",
    "userId": "user_789",
    "type": "PAYMENT_SUCCESS",
    "title": "支付成功",
    "content": "您的订单支付成功",
    "status": "SENT",
    "channels": ["SMS", "EMAIL"],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. 查询通知列表

**GET** `/notifications`

获取通知列表，支持分页和筛选。

#### 查询参数

- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 20, 最大: 100)
- `userId`: 用户ID筛选
- `type`: 通知类型筛选
- `status`: 状态筛选
- `channel`: 渠道筛选
- `startDate`: 开始时间
- `endDate`: 结束时间
- `search`: 关键词搜索

#### 响应示例

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_123456",
        "userId": "user_789",
        "type": "PAYMENT_SUCCESS",
        "title": "支付成功",
        "status": "SENT",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### 3. 获取通知详情

**GET** `/notifications/{id}`

获取指定通知的详细信息。

#### 响应示例

```json
{
  "success": true,
  "data": {
    "id": "notif_123456",
    "userId": "user_789",
    "type": "PAYMENT_SUCCESS",
    "title": "支付成功",
    "content": "您的订单 ORDER_123 支付成功，金额 ¥99.99",
    "status": "SENT",
    "channels": ["SMS", "EMAIL"],
    "priority": "HIGH",
    "metadata": {
      "orderId": "ORDER_123",
      "amount": 99.99
    },
    "deliveryResults": [
      {
        "channel": "SMS",
        "status": "SUCCESS",
        "sentAt": "2024-01-01T00:00:00.000Z",
        "response": "发送成功"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. 更新通知

**PATCH** `/notifications/{id}`

更新通知信息（仅限未发送的通知）。

#### 请求参数

```json
{
  "title": "string",           // 可选：更新标题
  "content": "string",         // 可选：更新内容
  "scheduledAt": "datetime",   // 可选：更新定时发送时间
  "metadata": {}               // 可选：更新元数据
}
```

### 5. 删除通知

**DELETE** `/notifications/{id}`

删除指定通知（仅限草稿状态）。

## 批量操作接口

### 1. 批量创建通知

**POST** `/notifications/batch`

批量创建多个通知。

#### 请求参数

```json
{
  "notifications": [
    {
      "userId": "user_1",
      "type": "SYSTEM",
      "title": "系统通知",
      "content": "系统维护通知",
      "channels": ["IN_APP"]
    }
  ]
}
```

### 2. 批量操作

**PATCH** `/notifications/batch`

批量更新通知状态。

#### 请求参数

```json
{
  "ids": ["notif_1", "notif_2"],
  "action": "mark_read",           // 操作类型
  "data": {}                       // 操作数据
}
```

## 模板管理接口

### 1. 查询模板列表

**GET** `/notifications/templates`

获取通知模板列表。

#### 查询参数

- `type`: 模板类型筛选
- `channel`: 渠道筛选
- `active`: 是否激活

### 2. 创建模板

**POST** `/notifications/templates`

创建新的通知模板。

#### 请求参数

```json
{
  "name": "支付成功模板",
  "type": "PAYMENT_SUCCESS",
  "channel": "SMS",
  "subject": "支付成功通知",
  "content": "【平潭旅游】您的订单{{orderId}}支付成功，金额{{amount}}",
  "variables": ["orderId", "amount"]
}
```

## 用户配置接口

### 1. 获取用户通知配置

**GET** `/notifications/config`

获取当前用户的通知配置。

### 2. 更新用户通知配置

**POST** `/notifications/config`

更新用户的通知偏好设置。

#### 请求参数

```json
{
  "configs": [
    {
      "type": "PAYMENT_SUCCESS",
      "channels": ["SMS", "EMAIL"],
      "enabled": true
    }
  ]
}
```

## 统计监控接口

### 1. 获取通知统计

**GET** `/notifications/stats`

获取通知发送统计数据。

#### 查询参数

- `startDate`: 统计开始时间
- `endDate`: 统计结束时间
- `groupBy`: 分组方式 (day/hour/channel/type)

#### 响应示例

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalSent": 1000,
      "totalSuccess": 950,
      "totalFailed": 50,
      "successRate": 95.0
    },
    "byChannel": {
      "SMS": { "sent": 500, "success": 480, "failed": 20 },
      "EMAIL": { "sent": 300, "success": 290, "failed": 10 },
      "IN_APP": { "sent": 200, "success": 180, "failed": 20 }
    },
    "byType": {
      "PAYMENT_SUCCESS": { "sent": 600, "success": 580, "failed": 20 },
      "ORDER_UPDATE": { "sent": 400, "success": 370, "failed": 30 }
    }
  }
}
```

### 2. 获取监控数据

**GET** `/notifications/monitor`

获取系统监控指标。

#### 响应示例

```json
{
  "success": true,
  "data": {
    "queueStatus": {
      "pending": 10,
      "processing": 5,
      "completed": 1000,
      "failed": 20
    },
    "performance": {
      "avgProcessingTime": 2.5,
      "throughput": 100
    },
    "health": {
      "status": "healthy",
      "uptime": 86400,
      "lastCheck": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 3. 健康检查

**GET** `/notifications/health`

系统健康状态检查。

#### 响应示例

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "services": {
      "database": "healthy",
      "queue": "healthy",
      "sms": "healthy",
      "email": "healthy"
    }
  }
}
```

## Webhook接口

### 1. 支付回调处理

**POST** `/webhooks/payment`

接收支付服务商的回调通知。

#### 请求头

- `X-Provider`: 支付服务商 (alipay/wechat/generic)
- `X-Signature`: 签名验证

#### 请求参数

```json
{
  "orderId": "ORDER_123",
  "status": "SUCCESS",
  "amount": 99.99,
  "transactionId": "TXN_456",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 错误码说明

| 错误码 | HTTP状态码 | 说明 |
|--------|------------|------|
| INVALID_PARAMS | 400 | 请求参数无效 |
| UNAUTHORIZED | 401 | 未授权访问 |
| FORBIDDEN | 403 | 权限不足 |
| NOT_FOUND | 404 | 资源不存在 |
| CONFLICT | 409 | 资源冲突 |
| RATE_LIMITED | 429 | 请求频率超限 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |
| SERVICE_UNAVAILABLE | 503 | 服务不可用 |

## SDK 使用示例

### JavaScript/TypeScript

```typescript
import { NotificationClient } from '@pingtan/notification-sdk'

const client = new NotificationClient({
  baseURL: 'http://localhost:3000/api',
  apiKey: 'your-api-key'
})

// 发送通知
const notification = await client.notifications.create({
  userId: 'user_123',
  type: 'PAYMENT_SUCCESS',
  title: '支付成功',
  content: '您的订单支付成功',
  channels: ['SMS', 'EMAIL']
})

// 查询通知
const notifications = await client.notifications.list({
  userId: 'user_123',
  page: 1,
  limit: 20
})
```

## 测试工具

### Postman 集合

项目提供了完整的 Postman 集合文件，包含所有API接口的示例请求：

```bash
# 导入 Postman 集合
docs/postman/notification-api.json
```

### 测试脚本

```bash
# 运行API测试
npm run test:api

# 运行集成测试
npm run test:integration
```

---

更多详细信息请参考源代码注释和在线API文档。