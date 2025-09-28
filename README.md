# 平潭旅游 Web 平台（pingtan_web）
> 一站式平潭旅游平台：认证、预订、地图与天气集成，5 分钟即可上手。

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs) ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&labelColor=20232a) ![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma) ![TailwindCSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwindcss) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg) ![License](https://img.shields.io/badge/license-TBD-lightgrey)


**如果觉得有帮助，请 Star ⭐、Fork 并分享！**

- 技术栈：Next.js 15 + React 19、NextAuth、Prisma、Tailwind CSS 4、TypeScript
- 目录结构：详见 `src/app` 页面与 `src/app/api` 接口模块；更完整的架构与交互请参考 `docs/modules.md`

## 目录
- [主要功能特性](#主要功能特性)
- [安装指南](#安装指南)
- [使用说明](#使用说明)
- [配置选项](#配置选项)
- [贡献指南](#贡献指南)
- [许可证信息](#许可证信息)
- [联系方式](#联系方式)
- [背景与架构综述](#背景与架构综述)
- [技术细节与实现要点](#技术细节与实现要点)
- [配置矩阵与环境建议](#配置矩阵与环境建议)
- [数据支持与实践建议](#数据支持与实践建议)
- [风险与影响分析](#风险与影响分析)
- [参考资料（权威来源）](#参考资料权威来源)
- [快速开始（5 分钟）](#快速开始-5-分钟)
- [演示与截图](#演示与截图)
- [FAQ](#faq)
- [致谢](#致谢)
- [行动呼吁](#行动呼吁)

## 主要功能特性
- 用户与认证：邮箱/密码登录、会话管理、保护路由（`/api/auth/[...nextauth]`）
- 个人资料：资料更新、头像上传（多步骤表单与文件上传）
- 订单与优先级：订单创建、查询/筛选、更新，支持优先级与状态流转
- 餐厅可约：时段容量计算、剩余可约数查询
- 外部服务：地图检索（位置与关键词）与天气查询（当前/预测）
- 性能与安全：服务端缓存、输入校验、错误处理与鉴权中间件

## 安装指南
1. 环境要求
   - Node.js ≥ 18（推荐 18/20）
   - npm（或 yarn/pnpm/bun）
2. 安装依赖
   ```bash
   npm install
   ```
3. 配置环境变量（在项目根目录创建 `.env`）
   ```env
   # 数据库连接（PostgreSQL 示例）
   DATABASE_URL="postgresql://USER:PASS@HOST:PORT/DBNAME?schema=public"

   # NextAuth 基础配置
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="请替换为安全随机字符串"
   ```
4. 同步数据库 Schema（首次或更新时）
   ```bash
   npx prisma db push
   ```
   安装与构建阶段会自动执行 `prisma generate`。
5. 启动开发服务
   ```bash
   npm run dev
   ```
6. 构建与生产启动
   ```bash
   npm run build
   npm run start
   ```

## 使用说明
- 本地访问开发地址：`http://localhost:3000`
- 关键页面与模块（节选）：
  - `/auth` 登录/注册入口
  - `/profile` 个人资料与头像管理
  - `/restaurants` 餐厅与可约查询
  - `/booking` 订单/预订流程
  - `/trip-planner` 行程规划
- 主要 API（节选）：
  - `GET/POST /api/auth/[...nextauth]` 登录/会话入口
  - `POST /api/profile/update` 更新资料
  - `POST /api/profile/avatar` 上传头像
  - `GET/POST /api/orders` 订单创建/查询/更新
  - `GET /api/restaurant/availability` 可约查询
  - `GET /api/map/search` 地图检索
  - `GET /api/weather` 天气查询
- 更完整的架构、时序图与流程图请参阅：`./docs/modules.md`

## 配置选项
- 环境变量
  - `DATABASE_URL`：数据库连接字符串（PostgreSQL）
  - `NEXTAUTH_URL`：应用可访问的基础 URL（本地默认 `http://localhost:3000`）
  - `NEXTAUTH_SECRET`：NextAuth 用于会话/JWT 的密钥（务必设置为安全随机值）
- 构建与脚本（`package.json`）
  - `dev`：`next dev --turbopack`
  - `build`：`prisma generate && next build --turbopack`
  - `start`：`next start`
  - `postinstall`：`prisma generate`
- 可选：根据需要扩展存储、缓存与第三方 API 的密钥与地址（切勿将真实密钥提交到仓库）。

## 贡献指南
- 提交 Issue 与 Pull Request 前，请先阅读 `docs/modules.md` 以了解模块设计与接口约定。
- 代码规范
  - TypeScript、ESLint（`eslint` / `eslint-config-next`）
  - 组件与样式遵循 Tailwind CSS 约定与 UI 组件库用法
- 开发流程（建议）
  - 从 `main` 创建特性分支：`feature/xxx` 或修复分支：`fix/xxx`
  - 提交信息清晰、原子化；PR 描述包含动机、改动范围与影响面
  - 保持 API 向后兼容或在文档中标注破坏性变更

## 许可证信息
- 当前仓库未提供 `LICENSE` 文件，许可证待维护者确认。
- 如无特殊限制，建议采用开源许可证（例如 MIT 或 Apache-2.0）。

## 联系方式
- 维护者邮箱：请替换为有效邮箱（例如 `contact@example.com`）
- 问题反馈：可在代码托管平台仓库的 Issues 页面提交（如使用 GitHub/GitLab）
- 文档入口：`./docs/modules.md`

---
如需将文档拆分或为各图表导出 SVG，请在 Issue 中提出需求；也可按需补充环境变量、部署指南（Docker/Vercel/自托管）与跨地域加速方案。

## 背景与架构综述
本项目定位为“平潭旅游综合服务平台”的 Web 前端与 API 网关，围绕“行前规划—途中服务—行后回访”的生命周期，抽象并实现了以下核心域：用户与认证、个人资料、订单与优先级、餐饮可约、地图检索、天气查询与通用能力（鉴权、校验、错误处理、缓存）。

- 架构风格：App Router 单体内分层（UI/Server Components + Route Handlers + Domain/Infra），以模块为边界（feature-first），通过 `src/app/api/*` 暴露接口，复用 `src/lib/*` 的认证、校验与数据库访问能力。
- 请求生命周期（简述）：客户端触发 -> 中间件/鉴权检查 -> 路由处理（解析、校验、执行业务、持久化/外部调用）-> 统一响应与错误封装。详见 `docs/modules.md` 中的时序图与流程图。
- 数据模型：采用 Prisma 定义与访问数据库（参见 `prisma/schema.prisma`），以用户、订单、餐厅/时段容量等核心实体为中心，结合状态机实现订单与会话的状态流转（详见 docs）。

## 技术细节与实现要点
### 认证与会话
- 当前使用 NextAuth v4 Credentials 登录策略，配合 Zod 服务器端校验与 `bcryptjs` 校验密码哈希；会话使用 JWT 策略，令牌内最小化携带 `sub`（用户标识）与 `role` 并通过 Cookie 传递，避免敏感信息下发。
- 受保护接口通过 `auth()`/server 辅助方法与中间件在服务端校验身份；路由级别根据角色与资源归属做细粒度授权控制。
- 升级建议：如需迁移到 v5，可在根目录集中导出 `auth`/`handlers` 方法并按需调整回调与环境变量命名；详见“参考资料”。

### API 约定与错误处理
- 所有 Route Handlers 均在 `src/app/api/*/route.ts` 中实现：GET/POST 等方法导出并以模块划分；输入输出统一使用 `application/json`。
- 入参校验：Zod Schema 严格解析并返回 400/422 类错误；未捕获异常统一落盘日志并返回脱敏信息（避免泄露内部细节）。
- 结果约定：成功返回 `data + meta`，失败返回 `error.code + message + correlationId`，便于端到端追踪。

### 数据访问与一致性
- Prisma Client 统一在 `src/lib/prisma.ts` 管理与重用；关键写操作使用事务保证跨表一致性；高并发扣减（如餐厅时段容量）采用行级锁或乐观并发控制，保证“读-改-写”的原子性。
- 模型与索引：结合查询路径为订单、用户邮箱、餐厅/日期等字段建立复合索引；查询仅选择必要字段，避免宽表扫描。

### 性能与可观测性
- 渲染与数据：优先 Server Components，减少客户端包体；列表/搜索类接口分页并限制大小；对热点 GET 查询添加合理缓存与失效策略。
- 监控与日志：为每个请求生成 `correlationId` 并在日志中串联；对外部依赖（地图/天气）记录调用耗时与失败率，便于降级与熔断策略落地。

### 安全与合规
- 输入输出安全：统一使用 Zod/类型约束，所有字符串默认转义/过滤危险字符；上传文件校验 MIME/大小与后缀白名单。
- 身份与令牌：JWT 最小权限化，设置合理过期与刷新策略；仅使用 `HttpOnly`/`Secure` Cookie；跨域与 CSRF 保护在中间件层启用。
- 机密与合规：所有密钥/连接串仅存放在 `.env`，严禁提交到仓库；根据数据敏感度执行脱敏与最小化存储策略。

## 配置矩阵与环境建议
- Node 运行时：建议 Node.js 18/20 LTS；生产环境使用进程管理与零停机热更新策略。
- 环境变量：
  - `DATABASE_URL`：数据库连接串（PostgreSQL）。
  - `NEXTAUTH_URL`：应用对外 URL（开发默认 `http://localhost:3000`）。
  - `NEXTAUTH_SECRET`：会话/JWT 密钥（必须为高熵随机值）。
- 构建与脚本（与 package.json 保持一致）：
  - `dev`：`next dev --turbopack`
  - `build`：`prisma generate && next build --turbopack`
  - `start`：`next start`
  - `postinstall`：`prisma generate`

## 数据支持与实践建议
- 认证路径：凭证登录在后端校验并返回受限的会话载荷，避免在前端泄露敏感字段；失败场景返回统一错误码以提升可观测性。
- 可约计算：餐厅容量建议以“日期+时段”维度聚合，并在订单写入时原子扣减，防止并发超卖；结合读写热点建立覆盖索引。
- 查询与分页：列表查询默认分页（可在 UI 控制页大小），并提供筛选项（状态/优先级/日期范围）；避免 N+1 查询。

## 风险与影响分析
- 身份与权限：弱密码、撞库与越权访问是主要风险点；需在注册/登录启用速率限制与 IP/设备指纹辅助风控；后台接口按最小权限授权。
- 数据一致性：订单创建与容量扣减需事务化；外部依赖（地图/天气）故障时应启用降级与缓存兜底，避免级联失败。
- 升级路线：
  - NextAuth v4 -> v5：配置方式与导出方法有调整，建议在独立分支演练迁移，完成回归后再切主线；详情见迁移指南。
  - 依赖升级：Next.js、Prisma、Tailwind 的大版本升级需关注构建与样式行为变更，先在预发环境灰度验证。

## 参考资料（权威来源）
- Next.js App Router（官方文档）：https://nextjs.org/docs/app
- Next.js Route Handlers 与 Middleware（官方文档）：https://nextjs.org/docs/app/getting-started/route-handlers-and-middleware
- Auth.js（NextAuth）凭证登录与回调（官方文档）：https://authjs.dev/getting-started/authentication/credentials
- Auth.js（Next.js 集成参考与 API）：https://authjs.dev/reference/nextjs
- NextAuth v4 -> v5 迁移指南：https://authjs.dev/getting-started/migrating-to-v5
- Prisma（ORM 官方文档）：https://www.prisma.io/docs



## 快速开始（5 分钟）
1. 克隆仓库并安装依赖：
   ```bash
   git clone https://github.com/OWNER/REPO.git
   cd REPO
   npm install
   ```
2. 配置环境变量 `.env`：
   ```env
   DATABASE_URL="postgresql://USER:PASS@HOST:PORT/DBNAME?schema=public"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="请替换为安全随机字符串"
   ```
3. 初始化数据库与启动开发：
   ```bash
   npx prisma db push
   npm run dev
   ```
4. 打开 `http://localhost:3000`，注册/登录并体验核心功能（认证、预订、地图与天气）。

## 演示与截图
> 暗/亮模式下均保持良好可读性，以下为核心页面与流程预览。

- 首页与导航：
  
  ![首页预览](./public/hero-slide-1.png)

- 目的地/风景页：
  
  ![风景预览](./public/hero-slide-2.png)

- 主题展示：
  
  ![主题示例](./public/hero-windmill.png)

> 建议：补充 10-30 秒的录屏 GIF/视频，展示登录与预订流程，可显著提升 Star 转化。

## FAQ
- 我可以不使用 PostgreSQL 吗？
  - 可以修改 Prisma 连接到其他数据库，但当前示例与索引设计针对 PostgreSQL 优化，建议保持一致以获得最佳性能。
- NEXTAUTH_SECRET 必须设置吗？
  - 必须。它用于签名会话/JWT，需为高熵随机值，避免泄露与重放风险。
- 如何在 5 分钟跑起来？
  - 参考上文“快速开始”，按 4 步完成安装、配置、推送 schema 与启动开发服务。
- 是否提供 Docker 或 Vercel 一键部署？
  - 可以按需新增，我可为你的目标环境生成部署章节与模板。

## 致谢
- 技术栈与灵感来源：Next.js、Auth.js（NextAuth）、Prisma、Tailwind CSS、TypeScript。
- 贡献者与社区：感谢所有提交 Issue/PR 的社区成员，你们的意见让项目更好。

## 行动呼吁
如果这个项目对你有帮助：
- 请 Star ⭐ 支持我们，让更多人看到！
- Fork 并实践你的想法，欢迎提交 PR 改进功能与文档。
- 分享到你的社交网络或交流群，帮助项目成长与迭代。


