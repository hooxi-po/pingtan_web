# Pingtan tourism accommodation

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/hooxi-pos-projects/v0-pingtan-tourism-accommodation)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/3pX6FU2TdaD)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/hooxi-pos-projects/v0-pingtan-tourism-accommodation](https://vercel.com/hooxi-pos-projects/v0-pingtan-tourism-accommodation)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/3pX6FU2TdaD](https://v0.app/chat/projects/3pX6FU2TdaD)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## 数据表与字段（全局统一规范）

后端数据库使用 PostgreSQL，统一采用 `snake_case` 字段命名；前端/接口返回统一采用 `camelCase`。SQL 查询通过别名进行映射（如 `original_price AS "originalPrice"`）。前后端共享类型定义位于 `lib/schema.ts`。

### accommodations（住宿）
- `id` SERIAL PRIMARY KEY
- `name` TEXT NOT NULL
- `type` TEXT NOT NULL
- `location` TEXT NOT NULL
- `rating` REAL NOT NULL
- `reviews` INTEGER NOT NULL
- `price` INTEGER NOT NULL
- `original_price` INTEGER NOT NULL
- `image` TEXT NOT NULL
- `tags` JSONB NOT NULL
- `distance` TEXT NOT NULL

### attractions（景点）
- `id` SERIAL PRIMARY KEY
- `name` TEXT NOT NULL
- `type` TEXT NOT NULL
- `image` TEXT NOT NULL
- `rating` REAL NOT NULL
- `reviews` INTEGER NOT NULL
- `price` TEXT NOT NULL
- `duration` TEXT NOT NULL
- `distance` TEXT NOT NULL
- `tags` JSONB NOT NULL
- `description` TEXT NOT NULL

### restaurants（餐厅）
- `id` SERIAL PRIMARY KEY
- `name` TEXT NOT NULL
- `category` TEXT NOT NULL
- `image` TEXT NOT NULL
- `rating` REAL NOT NULL
- `reviews` INTEGER NOT NULL
- `avg_price` TEXT NOT NULL
- `distance` TEXT NOT NULL
- `tags` JSONB NOT NULL
- `description` TEXT NOT NULL
- `specialty` TEXT NOT NULL

### users（用户）
- `id` SERIAL PRIMARY KEY
- `name` TEXT NOT NULL
- `email` TEXT NOT NULL UNIQUE
- `phone` TEXT
- `password_hash` TEXT NOT NULL
- `created_at` TIMESTAMP NOT NULL DEFAULT NOW()

### sessions（会话）
- `token` TEXT PRIMARY KEY
- `user_id` INTEGER NOT NULL REFERENCES `users(id)` ON DELETE CASCADE
- `expires_at` TIMESTAMP NOT NULL

## 路由对齐与规范

- 前端页面：
  - `/attractions`、`/accommodations`、`/food` 等页面位于 `app/*`。
- 后端接口：
  - `GET /api/attractions`，`GET /api/attractions/[id]`
  - `GET /api/accommodations`，`GET /api/accommodations/[id]`
  - `GET /api/restaurants`，`GET /api/restaurants/[id]`
  - 认证：`POST /api/auth/login`，`POST /api/auth/register`

动态路由参数类型统一：`{ params: { id: string } }`。已修复 `app/api/attractions/[id]/route.ts` 中将 `params` 误写为 `Promise` 的问题。

## 运行与数据初始化

1. 配置环境变量：在 `.env.local` 中设置 `DATABASE_URL` 为 PostgreSQL 连接字符串。
2. 初始化数据表：运行 `node scripts/seed.mjs` 自动创建表与索引。
3. 开发启动：`npm run dev`

## 代码规范与共享类型

- 共享类型位于 `lib/schema.ts`，用于统一接口与前端组件的数据结构。
- 数据库字段使用 `snake_case`，接口返回与组件使用 `camelCase`，通过 SQL `AS` 保持一致。
