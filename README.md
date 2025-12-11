# 平潭旅游指南与本地生活平台

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your/repo)


[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)](https://nextjs.org/) [![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://react.dev/) [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/) [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169e1?logo=postgresql&logoColor=white)](https://www.postgresql.org/) [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> 探索蓝眼泪奇观、石头厝古韵与海岛美食的一站式 Web 应用。提供景点/住宿/美食检索、预订下单、用户登录、订单管理、天气与地图等核心能力。

- 支持浏览器端与 API 双模使用（App Router + Route Handlers）
- 开箱即用的 Postgres 数据结构与种子数据脚本
- 友好的本地开发体验与可扩展的工程结构


## 在线体验

- 预览地址：待添加（建议部署到 Vercel 并填写此处 URL）
- 设计初衷：让外地游客快速规划“吃住玩行”，也让本地商家/景点更好地被发现


## 主要功能

- 景点/住宿/餐厅列表与详情页，支持筛选、排序与分页
- 用户注册/登录/退出（简单会话 Token + Cookie）
- 订单中心：住宿、餐饮与景点的下单与状态追踪（待付款/待使用/已完成/已取消）
- 天气小组件：基于百度天气 API 服务端签名代理
- 地图组件：优先加载 BMapGL，降级到 BMap 2D（Baidu Map JS SDK）
- SEO/性能：合理的缓存头、按需加载与现代前端栈


## 技术栈

- Web 应用：Next.js 15（App Router）+ React 19
- UI/样式：Tailwind CSS v4 + shadcn/ui（Radix Primitives）+ Lucide 图标
- 数据层：PostgreSQL + `pg` 连接池，Node 端种子数据脚本
- 校验与表单：Zod + React Hook Form
- 数据可视化/交互：Embla Carousel、Recharts（按需）
- 分析统计：@vercel/analytics（可选）


## 项目结构

```
app/                # App Router 页面与 API Route Handlers
  api/              # RESTful 接口（attractions/accommodations/restaurants/auth/orders/weather）
  (pages...)        # /attractions, /accommodations, /food, /guides, /profile, /login, /register
components/         # UI 组件与业务组件（卡片、筛选、地图、天气等）
lib/                # 数据库/认证/环境变量/类型定义等
public/             # 静态资源与示例图片
scripts/            # 数据库建表与种子数据脚本 seed.mjs
```


## 截图（可替换）

> 建议在本地启动后为首页/列表/详情/下单流程各截一张图，放入 `public/screenshots/` 并在此处展示。

- 首页：`/pingtan-scenic-coastline-panorama.jpg`
- 蓝眼泪：`/pingtan-blue-tears-bioluminescence-beach-night.jpg`
- 石头厝：`/pingtan-stone-house-traditional-architecture.jpg`


## 快速开始

前置要求：
- Node.js >= 18.18（推荐 20+）
- 一个可用的 PostgreSQL 数据库（本地/云端均可）

本地启动：

```bash
# 1) 安装依赖
npm i

# 2) 配置环境变量（见下方）
cp env.example .env.local  # 或手动新建 .env.local 并填入变量

# 3) 初始化数据库（建表 + 示例数据）
node scripts/seed.mjs

# 4) 开发启动
npm run dev
```

生产构建：

```bash
npm run build && npm start
```


## 环境变量

在项目根目录创建 `.env.local`（不会被提交）：

```
# PostgreSQL 连接串（必须）
DATABASE_URL=postgres://user:password@host:port/dbname

# 百度地图 JS SDK（必须，客户端使用）
NEXT_PUBLIC_BAIDU_MAP_JS_API_KEY=your_js_api_ak

# 百度天气（必须，服务端使用）
BAIDU_WEATHER_API_KEY=your_weather_ak
BAIDU_WEATHER_SK=your_weather_sk
```

说明：
- 地图组件通过 `NEXT_PUBLIC_BAIDU_MAP_JS_API_KEY` 在浏览器端加载百度地图（GL 优先、2D 兜底）
- 天气接口走服务端路由 `/api/weather`，由服务端使用 AK/SK 完成签名与上游请求，避免泄漏密钥


## 数据库与种子数据

- 建表/索引/示例数据脚本：`scripts/seed.mjs`
- 核心表：
  - `accommodations`（住宿）
  - `attractions`（景点）
  - `restaurants`（餐饮）
  - `users`、`sessions`（用户与会话）
  - `orders`（按需自动创建，保存下单快照）
- 统一规范：
  - 数据库字段使用 `snake_case`
  - API/前端使用 `camelCase`，通过 SQL 别名映射（例如：`original_price AS "originalPrice"`）
  - 共享类型见 `lib/schema.ts`


## API 速览

- 列表：
  - `GET /api/attractions?type=自然景观&sort=rating_desc&page=1&limit=20`
  - `GET /api/accommodations?type=酒店&sort=price_asc&page=1&limit=20`
  - `GET /api/restaurants?category=海鲜&sort=reviews_desc&page=1&limit=20`
- 详情：
  - `GET /api/attractions/[id]`
  - `GET /api/accommodations/[id]`
  - `GET /api/restaurants/[id]`
- 认证：
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
- 订单：
  - `GET /api/orders`（需登录，读取 Cookie 中的会话）
  - `POST /api/orders`（创建住宿/美食/景点订单，自动快照名称/图片/地址/电话）
- 天气：
  - `GET /api/weather?lat=25.519&lng=119.791`（服务端签名代理百度天气）

示例：

```bash
curl "http://localhost:3000/api/attractions?sort=rating_desc&limit=3"
```


## 脚本与常用命令

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

- 开发：`npm run dev`
- 构建：`npm run build`
- 生产启动：`npm start`
- 代码检查：`npm run lint`


## 部署 

- 推荐使用 Vercel 一键部署，或自行部署到任意 Node 运行环境
- 部署前请配置环境变量（与本地一致）
- Next.js `images.unoptimized = true`，开箱本地/边缘均可运行

> 可选：添加「Deploy with Vercel」按钮（把仓库地址替换成你的）
>
> [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your/repo)


## 路线图（欢迎共建）

- [ ] 支持多语言（中文/英文）与基础的国际化 SEO
- [ ] 更丰富的筛选项与搜索（价格区间、评分、标签、关键字）
- [ ] 收藏/心愿单与分享
- [ ] 支付对接与订单状态流转完善
- [ ] 地图选点与路线规划
- [ ] 更健壮的权限与会话管理（刷新、过期、风控）
- [ ] E2E/单元测试覆盖


## 贡献指南

非常欢迎你的贡献！

1. Fork 本仓库并创建特性分支：`feat/your-feature`
2. 以最小 PR 为单位，附带动机/截图/测试说明
3. 保持代码风格统一（TypeScript + ESLint + Prettier）
4. 提交信息建议遵循约定式提交（如 feat/fix/docs/chore 等）

有想法但暂时没空实现？欢迎直接开 Issue 交流～


## 许可证

本项目采用 MIT 许可证开源。你可以自由地使用、修改与分发。在生产环境前，请务必评估第三方服务（如百度地图/天气）的使用条款与配额限制。


## 致谢

- [v0.app](https://v0.app/) 生成初始结构与页面雏形
- [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- [Baidu Map JS API](https://lbsyun.baidu.com/) 与 [百度天气接口]
- 开源社区的每一位贡献者 🙌

---

English (brief)

A modern Next.js app featuring attractions, stays, food discovery for Pingtan Island. Postgres-backed APIs, seed scripts, Baidu Weather + Map integrations, and clean UI built with Tailwind + shadcn/ui. Contributions welcome! Replace the demo URL and add real screenshots to attract more stars.
