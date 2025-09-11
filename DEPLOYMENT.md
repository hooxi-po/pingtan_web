# 平潭旅游网站部署指南

## 概述

本文档提供了平潭旅游网站的完整部署指南，包括本地开发环境搭建、生产环境部署和性能优化配置。

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS + shadcn/ui
- **数据库**: PostgreSQL + Prisma ORM
- **身份认证**: NextAuth.js
- **地图服务**: 高德地图 API
- **部署平台**: Vercel
- **语言**: TypeScript

## 本地开发环境搭建

### 1. 环境要求

- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器
- PostgreSQL 数据库
- Git

### 2. 克隆项目

```bash
git clone <repository-url>
cd pingtan-tourism
```

### 3. 安装依赖

```bash
npm install
# 或
yarn install
```

### 4. 环境变量配置

复制环境变量示例文件：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，填入实际的配置值：

```env
# 数据库配置
DATABASE_URL="postgresql://username:password@localhost:5432/pingtan_tourism"

# NextAuth.js 配置
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# 高德地图 API
AMAP_KEY="your-amap-api-key"
NEXT_PUBLIC_AMAP_KEY="your-amap-api-key"

# 其他配置...
```

### 5. 数据库设置

```bash
# 生成 Prisma 客户端
npx prisma generate

# 运行数据库迁移
npx prisma db push

# 填充初始数据（可选）
npx prisma db seed
```

### 6. 启动开发服务器

```bash
npm run dev
# 或
yarn dev
```

访问 http://localhost:3000 查看应用。

## 生产环境部署

### Vercel 部署（推荐）

#### 1. 准备工作

- 注册 Vercel 账号
- 连接 GitHub 仓库
- 准备生产环境数据库

#### 2. 环境变量配置

在 Vercel 项目设置中添加以下环境变量：

```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://your-domain.vercel.app
AMAP_KEY=your-amap-key
NEXT_PUBLIC_AMAP_KEY=your-amap-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### 3. 部署配置

项目已包含 `vercel.json` 配置文件，Vercel 会自动识别并应用配置。

#### 4. 自动部署

推送代码到 main 分支即可触发自动部署：

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

### 其他部署平台

#### Docker 部署

```dockerfile
# Dockerfile
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

构建和运行：

```bash
docker build -t pingtan-tourism .
docker run -p 3000:3000 pingtan-tourism
```

## 性能优化

### 1. 图片优化

- 使用 Next.js Image 组件
- 配置适当的图片尺寸和格式
- 启用 WebP 和 AVIF 格式

### 2. 代码分割

- 使用动态导入 `dynamic()`
- 配置 Webpack 代码分割
- 优化包大小

### 3. 缓存策略

```javascript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
    ];
  },
};
```

### 4. 数据库优化

- 添加适当的索引
- 使用连接池
- 实现查询缓存

```sql
-- 添加索引示例
CREATE INDEX idx_attractions_category ON attractions(category);
CREATE INDEX idx_attractions_rating ON attractions(rating);
CREATE INDEX idx_users_email ON users(email);
```

## 监控和维护

### 1. 错误监控

集成 Sentry 进行错误追踪：

```bash
npm install @sentry/nextjs
```

### 2. 性能监控

- 使用 Vercel Analytics
- 配置 Google Analytics
- 监控 Core Web Vitals

### 3. 日志管理

```javascript
// lib/logger.js
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export default logger;
```

## 安全配置

### 1. 环境变量安全

- 使用强密码和密钥
- 定期轮换密钥
- 不要在代码中硬编码敏感信息

### 2. HTTPS 配置

- 启用 HTTPS
- 配置 HSTS
- 使用安全的 Cookie 设置

### 3. API 安全

- 实现速率限制
- 输入验证和清理
- 使用 CORS 配置

## 备份和恢复

### 1. 数据库备份

```bash
# 创建备份
pg_dump $DATABASE_URL > backup.sql

# 恢复备份
psql $DATABASE_URL < backup.sql
```

### 2. 自动备份脚本

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="pingtan_tourism"

pg_dump $DATABASE_URL > $BACKUP_DIR/backup_$DATE.sql

# 保留最近30天的备份
find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete
```

## 故障排除

### 常见问题

1. **构建失败**
   - 检查 Node.js 版本
   - 清除缓存：`npm run clean`
   - 重新安装依赖：`rm -rf node_modules && npm install`

2. **数据库连接问题**
   - 检查 DATABASE_URL 格式
   - 确认数据库服务运行状态
   - 检查网络连接和防火墙设置

3. **API 调用失败**
   - 检查 API 密钥配置
   - 确认 API 限额和权限
   - 查看网络请求日志

### 调试工具

```bash
# 查看构建日志
npm run build -- --debug

# 分析包大小
ANALYZE=true npm run build

# 运行测试
npm run test

# 代码质量检查
npm run lint
```

## 联系支持

如果遇到部署问题，请：

1. 查看项目文档和 FAQ
2. 检查 GitHub Issues
3. 联系开发团队

---

**注意**: 请确保在生产环境中使用强密码和安全配置，定期更新依赖包以修复安全漏洞。