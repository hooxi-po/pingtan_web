# 贡献指南

感谢你对本项目的兴趣！我们欢迎各类贡献，包括但不限于：功能开发、缺陷修复、文档完善、示例与优化建议。

## 准备工作

- 保持 Node.js 版本 >= 18（推荐 20+）
- 安装依赖：`npm i`
- 配置本地环境变量：复制 `.env.example` 为 `.env.local` 并按需填写
- 初始化数据库（可选）：`node scripts/seed.mjs`

## 提交流程

1. Fork 本仓库并创建分支：`feat/xxx`、`fix/xxx`、`docs/xxx`
2. 开发与自测：
   - `npm run typecheck`
   - `npm run lint`
   - `npm run build`（或 `npm run dev` 本地验证）
3. 提交规范（建议但不强制）：
   - `feat: ...` 新功能
   - `fix: ...` 缺陷修复
   - `docs: ...` 文档变更
   - `chore: ...` 构建/依赖/脚手架
4. 发起 Pull Request：
   - 请在 PR 中说明变更动机、主要修改点、截图/GIF（如涉及 UI）
   - 关联相关 Issue（如有）

## 代码风格

- 使用 TypeScript、ESLint、Prettier 统一风格
- 前后端字段风格：DB 使用 `snake_case`，API/前端使用 `camelCase`，通过 SQL `AS` 对齐
- 组件与业务逻辑拆分，尽量编写小而清晰的组件

## 安全

- 不要在代码库提交任何私密密钥或敏感信息
- 天气/地图 AK/SK 请放在环境变量，通过服务端路由代理访问

## 沟通

- 遇到问题请先搜索 Issue；如无现成条目，欢迎新建 Issue 详细描述
- 任何想法与建议也欢迎提出，我们会积极讨论

感谢你的每一次贡献 🙌

