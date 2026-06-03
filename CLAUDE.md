# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GameVault — 精品游戏分享平台（单机游戏资源分享站），基于 Next.js 16 App Router 构建。

## Commands

```bash
npm run dev      # 启动开发服务器 (localhost:3000)
npm run build    # 生产构建
npm run start    # 启动生产服务器
npm run lint     # ESLint 检查
```

## Tech Stack

- **Next.js 16.2.7** (App Router) — AGENTS.md 提示此版本与训练数据中的 Next.js 有 breaking changes，需查阅 `node_modules/next/dist/docs/` 中的文档
- **React 19.2.4** — 所有页面均为 `'use client'` 组件
- **Tailwind CSS v4** — 通过 `@tailwindcss/postcss` 插件使用
- **xlsx** (`^0.18.5`) — Excel 批量导入/模板导出
- **数据存储** — 文件系统 JSON（`data/games.json`、`data/users.json`），无数据库

## Architecture

### 路由结构（App Router）

| 路径 | 文件 | 说明 |
|---|---|---|
| `/` | `app/page.tsx` | 首页：左侧排行榜 + 中间游戏列表 + 新游推荐 |
| `/games` | `app/games/page.tsx` | 全部游戏列表，支持分类筛选、搜索、排序 |
| `/games/[id]` | `app/games/[id]/page.tsx` | 游戏详情页，下载链接仅登录后可见 |
| `/login` | `app/login/page.tsx` | 登录/注册页（单页切换） |
| `/admin` | `app/admin/layout.tsx` + `page.tsx` | 管理后台面板，`layout.tsx` 通过 `useAuth()` 做权限守卫，非 admin 重定向到 `/login` |
| `/admin/games` | `app/admin/games/page.tsx` | 游戏管理表格（查看/删除） |
| `/admin/games/add` | `app/admin/games/add/page.tsx` | 添加单个游戏表单 |
| `/admin/import` | `app/admin/import/page.tsx` | Excel 批量导入（上传 + 模板下载） |
| `/admin/users` | `app/admin/users/page.tsx` | 用户列表（只读） |

### API 路由

| 端点 | 方法 | 说明 |
|---|---|---|
| `/api/auth` | POST | `{ action: 'login' \| 'register', ... }` 统一认证入口 |
| `/api/games` | GET | 返回 `{ games, categories }` |
| `/api/games` | POST | 添加单个游戏 |
| `/api/games` | DELETE | `?id=` 删除游戏 |
| `/api/games/import` | POST | `FormData` 上传 Excel 批量导入 |
| `/api/games/template` | GET | 下载 Excel 导入模板 |
| `/api/users` | GET | 用户列表（不含密码） |
| `/api/stats` | GET | 统计数据（游戏数/用户数/热门数/新品数） |

### 数据层

- **`lib/auth.ts`** — 用户 CRUD，操作 `data/users.json`。`validateUser()` 明文密码比对。
- **`lib/games.ts`** — 游戏 CRUD，操作 `data/games.json`。`addGame()` 自动分配递增 ID。

两个 lib 文件均使用同步 `fs.readFileSync` / `fs.writeFileSync`，在服务端（API Route）调用。

### 组件树

```
RootLayout (app/layout.tsx)
├── AuthProvider (components/AuthProvider.tsx) — React Context，管理 user/login/register/logout
└── LayoutWrapper (components/LayoutWrapper.tsx)
    ├── Header — 导航栏、搜索、用户菜单
    ├── {children} — 页面内容
    └── Footer
```

### 认证机制

- 前端：`localStorage` 存储 `user` 对象（不含密码）
- `AuthProvider` 通过 React Context 下发 `user` / `login` / `register` / `logout` / `isAdmin`
- `useAuth()` hook 在任意 `'use client'` 组件中使用
- 无 token/session，无服务端鉴权中间件 — API 无认证校验
- 默认管理员账号：admin / admin123

### 数据模型

**Game:** `{ id, title, description, coverImage, size, category, downloadLinks: [{platform, url, password}], releaseDate, updateDate, downloadCount, isHot, isNew }`

**User:** `{ id, username, email, password, role: 'user'|'admin', createdAt }`

### Excel 导入格式

模板通过 `/api/games/template` 下载。支持中文列名（游戏名称、游戏描述等）和英文列名（title、description 等），最多 5 个下载链接。
