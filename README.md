# 平潭旅游助手 🏝️

一个现代化的平潭旅游信息平台，为游客提供智能行程规划、景点推荐、实时天气和AI旅游咨询服务。

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/your-username/pingtan-tourism)
[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/your-username/pingtan-tourism)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.0-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Test Coverage](https://img.shields.io/badge/coverage-85%25-brightgreen.svg)](https://github.com/your-username/pingtan-tourism)

## 📸 项目预览

![平潭旅游助手首页](public/images/homepage-preview.png)

*主要功能界面展示*

## ✨ 核心功能

- 🤖 **AI智能助手** - 基于Gemini AI的中文旅游咨询服务
- 🗺️ **智能行程规划** - 个性化旅游路线推荐和制定
- 🏖️ **景点信息** - 详细的景点介绍、图片和用户评价
- 🏠 **民宿推荐** - 精选特色民宿和住宿信息
- 🍽️ **美食地图** - 集成百度地图POI搜索的智能美食推荐系统
- 🔍 **POI搜索** - 基于百度地图API的实时地点搜索功能
- 🌤️ **实时天气** - 集成百度地图API的精准天气服务
- 🚌 **交通指南** - 完整的交通出行信息
- 📰 **旅游资讯** - 最新的旅游新闻和活动信息

## 🛠️ 技术栈

### 前端
- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS + shadcn/ui
- **状态管理**: React Context
- **地图服务**: 百度地图API (JavaScript API GL + Place API + Weather API)
- **AI服务**: Google Gemini AI
- **搜索功能**: 百度地图POI搜索集成

### 后端
- **运行时**: Node.js 18+
- **API**: Next.js API Routes
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: NextAuth.js
- **部署**: Vercel

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 8.0.0
- PostgreSQL >= 14.0

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/your-username/pingtan-tourism.git
   cd pingtan-tourism
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **环境配置**
   ```bash
   cp .env.example .env.local
   ```
   
   配置以下环境变量：
   ```env
   # 数据库
   DATABASE_URL="postgresql://username:password@localhost:5432/pingtan_tourism"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   
   # 百度地图API
   NEXT_PUBLIC_BAIDU_MAP_API_KEY="your-baidu-map-browser-key"  # 浏览器端密钥
   BAIDU_MAP_API_KEY="your-baidu-map-server-key"              # 服务端密钥
   
   # Gemini AI
   GEMINI_API_KEY="your-gemini-api-key"
   GEMINI_MODEL="gemini-1.5-flash"
   ```

### 🔑 API密钥获取指南

#### 百度地图API
1. 访问 [百度地图开放平台](https://lbsyun.baidu.com/)
2. 注册并登录账号
3. 创建应用，选择以下服务：
   - **JavaScript API GL** (浏览器端地图显示)
   - **Place API v2** (POI搜索服务)
   - **Weather API v1** (天气服务)
4. 获取API密钥：
   - 浏览器端密钥：用于前端地图显示
   - 服务端密钥：用于后端API调用

#### Google Gemini AI
1. 访问 [Google AI Studio](https://aistudio.google.com/)
2. 创建API密钥
3. 选择Gemini 1.5 Flash模型

4. **数据库设置**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **启动开发服务器**
   ```bash
   npm run dev
   ```

   访问 [http://localhost:3000](http://localhost:3000) 查看应用

## 📖 使用方法

### AI智能助手
```typescript
// 与AI助手对话
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: '平潭有什么好玩的景点？',
    conversationId: 'unique-id'
  })
});
```

### 获取景点信息
```typescript
// 获取景点列表
const attractions = await fetch('/api/attractions?category=自然景观&limit=10');

// 获取特定景点详情
const attraction = await fetch('/api/attractions/[id]');
```

### 生成行程规划
```typescript
// 创建个性化行程
const itinerary = await fetch('/api/generate-itinerary', {
  method: 'POST',
  body: JSON.stringify({
    days: 3,
    interests: ['自然景观', '美食'],
    budget: 'medium'
  })
});
```

### 百度地图POI搜索
```typescript
// 搜索美食POI
const searchResults = await fetch('/api/baidu-place?query=火锅&region=平潭&tag=美食&page_size=20');

// 获取天气信息
const weather = await fetch('/api/weather?location=平潭');
```

### 美食地图功能
```typescript
// 美食地图页面支持：
// - 本地数据和百度地图数据混合展示
// - 实时POI搜索
// - 地图标记点交互
// - 搜索结果列表展示
// - 筛选和分类功能
```

## 📁 项目结构

```
pingtan-tourism/
├── src/
│   ├── app/                 # Next.js App Router页面
│   │   ├── api/             # API路由
│   │   │   ├── auth/        # 认证相关API
│   │   │   ├── chat/        # AI聊天API
│   │   │   ├── weather/     # 百度天气API
│   │   │   └── baidu-place/ # 百度地图POI搜索API
│   │   ├── attractions/     # 景点页面
│   │   ├── accommodations/  # 住宿页面
│   │   ├── restaurants/     # 餐厅页面（集成百度地图）
│   │   └── transport/       # 交通页面
│   ├── components/          # React组件
│   │   ├── ui/             # 基础UI组件
│   │   ├── features/       # 功能组件
│   │   ├── layout/         # 布局组件
│   │   ├── ChatBot.tsx     # AI聊天机器人
│   │   ├── WeatherWidget.tsx # 天气组件
│   │   └── MapComponent.tsx  # 百度地图组件
│   ├── hooks/              # 自定义React Hooks
│   │   └── useBaiduMap.ts  # 百度地图Hook
│   ├── lib/                # 工具库
│   │   ├── prisma.ts       # 数据库连接
│   │   ├── gemini.ts       # AI服务
│   │   └── utils.ts        # 通用工具
│   └── types/              # TypeScript类型定义
├── prisma/                 # 数据库模式和种子数据
├── public/                 # 静态资源
└── tests/                  # 测试文件
```

## ✨ 核心功能特性

### 🗺️ 百度地图集成
- **多API协同**: 集成百度地图JavaScript API GL、Place API v2、Weather API v1
- **POI搜索**: 实时搜索平潭地区美食、景点等兴趣点
- **地图交互**: 支持标记点击、信息窗口展示、地图缩放等交互功能
- **数据融合**: 本地数据与百度地图数据智能融合展示

### 🍽️ 智能美食地图
- **双重搜索**: 支持本地美食数据和百度地图POI实时搜索
- **列表展示**: 地图右侧展示搜索结果列表，支持点击定位
- **智能筛选**: 按分类、价格、评分等多维度筛选
- **响应式设计**: 适配桌面端和移动端不同屏幕尺寸

### 🌤️ 精准天气服务
- **实时天气**: 基于百度地图Weather API的精准天气信息
- **位置感知**: 自动获取平潭地区天气数据
- **多维展示**: 温度、湿度、风力等详细气象信息

## 🧪 测试

```bash
# 运行所有测试
npm run test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行端到端测试
npm run test:e2e
```

## 🚀 部署

### Vercel部署（推荐）

1. 将代码推送到GitHub仓库
2. 在Vercel中导入项目
3. 配置环境变量
4. 部署完成

### Docker部署

```bash
# 构建镜像
docker build -t pingtan-tourism .

# 运行容器
docker run -p 3000:3000 pingtan-tourism
```

## 🤝 贡献指南

我们欢迎所有形式的贡献！请遵循以下步骤：

1. **Fork** 本仓库
2. **创建** 功能分支 (`git checkout -b feature/AmazingFeature`)
3. **提交** 更改 (`git commit -m 'Add some AmazingFeature'`)
4. **推送** 到分支 (`git push origin feature/AmazingFeature`)
5. **创建** Pull Request

### 开发规范

- 遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范
- 使用 ESLint 和 Prettier 进行代码格式化
- 编写单元测试覆盖新功能
- 更新相关文档

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React全栈框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [Prisma](https://www.prisma.io/) - 数据库ORM
- [Google Gemini](https://ai.google.dev/) - AI服务
- [高德地图](https://lbs.amap.com/) - 地图服务

## 📞 联系方式

- 项目链接: [https://github.com/your-username/pingtan-tourism](https://github.com/your-username/pingtan-tourism)
- 问题反馈: [Issues](https://github.com/your-username/pingtan-tourism/issues)
- 邮箱: your-email@example.com

---

<div align="center">
  <p>如果这个项目对您有帮助，请给我们一个 ⭐️</p>
  <p>Made with ❤️ for 平潭旅游</p>
</div>
