# Vercel 部署指南

## 环境变量配置

在 Vercel 部署时，必须正确配置以下环境变量以确保身份验证正常工作：

### 1. 必需的环境变量

#### NextAuth 配置
```bash
NEXTAUTH_SECRET=your-super-secret-key-here-32-characters-minimum
NEXTAUTH_URL=https://your-app-name.vercel.app
```

**重要说明：**
- `NEXTAUTH_SECRET` 必须至少32个字符，建议使用随机生成的强密钥
- `NEXTAUTH_URL` 必须设置为你的 Vercel 应用的完整 URL
- 可以使用 `openssl rand -base64 32` 生成安全的密钥

#### 数据库配置
```bash
DATABASE_URL=postgresql://username:password@host:port/database
```

### 2. Vercel 环境变量设置步骤

1. 登录 Vercel Dashboard
2. 选择你的项目
3. 进入 Settings → Environment Variables
4. 添加以下环境变量：
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `DATABASE_URL`
   - 其他必需的 API 密钥

### 3. 常见问题解决

#### 问题：登录后跳转到登录页面

**可能原因：**
1. `NEXTAUTH_SECRET` 未设置或过短
2. `NEXTAUTH_URL` 设置错误
3. Cookie 安全设置问题
4. 会话存储问题

**解决方案：**
1. 确保 `NEXTAUTH_SECRET` 至少32个字符
2. 确保 `NEXTAUTH_URL` 与实际域名完全匹配
3. 检查 HTTPS 配置（Vercel 自动提供）
4. 重新部署应用

#### 问题：API 路由返回 401 未授权

**解决方案：**
1. 检查 `getServerSession` 调用是否正确
2. 确保环境变量在服务端可用
3. 检查中间件配置

### 4. 部署检查清单

- [ ] 设置 `NEXTAUTH_SECRET`（至少32字符）
- [ ] 设置 `NEXTAUTH_URL`（完整的 HTTPS URL）
- [ ] 配置 `DATABASE_URL`
- [ ] 添加其他必需的 API 密钥
- [ ] 测试登录功能
- [ ] 测试受保护的路由
- [ ] 检查会话持久性

### 5. 调试技巧

1. 启用 NextAuth 调试模式（仅开发环境）
2. 检查浏览器开发者工具的 Network 和 Application 标签
3. 查看 Vercel 函数日志
4. 使用 `console.log` 检查会话状态

### 6. 安全最佳实践

1. 使用强随机密钥作为 `NEXTAUTH_SECRET`
2. 确保所有敏感信息都通过环境变量配置
3. 定期轮换密钥
4. 监控异常登录活动