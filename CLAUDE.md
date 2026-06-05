# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GameVault — 精品游戏分享平台（单机游戏资源分享站），基于 Next.js 16 App Router 构建，JSON 文件存储，无数据库。

## Commands

```bash
npm run dev      # 启动开发服务器 Turbopack (localhost:3000)
npm run build    # 生产构建
npm run start    # 启动生产服务器
npm run lint     # ESLint 检查
```

## Tech Stack

- **Next.js 16.2.7** App Router + **React 19.2.4** — 所有页面均为 `'use client'` 组件
- **Tailwind CSS v4** — 通过 `@tailwindcss/postcss` 使用，`@/` 路径别名映射到项目根目录
- **bcryptjs** — 密码哈希
- **Node.js crypto** — HMAC-SHA256 token 签名验证
- **xlsx** (`^0.18.5`) — Excel 批量导入/模板导出
- 数据存储：`data/games.json`、`data/users.json`、`data/tools.json`、`data/game-metadata.json`

## Architecture

### 路由总览

| 路径 | 文件 | 说明 |
|---|---|---|
| `/` | `app/page.tsx` | 首页：Featured Hero 轮播 + 排序栏（下载排行/最新上架/精选推荐）+ 游戏网格（2-5列响应式）+ 移动端底部导航 |
| `/games` | `app/games/page.tsx` | 全部游戏列表，分类筛选、搜索、排序 |
| `/games/[id]` | `app/games/[id]/page.tsx` | 游戏详情页，下载链接仅登录用户可见 |
| `/tools` | `app/tools/page.tsx` | GitHub 开源游戏工具列表，分类筛选 |
| `/login` | `app/login/page.tsx` | 登录/注册（单页切换） |
| `/admin` | `app/admin/layout.tsx` + `page.tsx` | 管理后台面板，`layout.tsx` 通过 `useAuth().isAdmin` 做权限守卫 |
| `/admin/games` | `app/admin/games/page.tsx` | 游戏管理表格（查看/删除） |
| `/admin/games/add` | `app/admin/games/add/page.tsx` | 添加游戏表单，含 Steam 导入（搜索 Steam + 本地数据库，自动填充并下载封面到本地） |
| `/admin/games/[id]/edit` | `app/admin/games/[id]/edit/page.tsx` | 编辑游戏，支持下载链接管理、精选标记 |
| `/admin/import` | `app/admin/import/page.tsx` | Excel 批量导入（上传 + 模板下载） |
| `/admin/users` | `app/admin/users/page.tsx` | 用户列表（只读） |

### API 路由

| 端点 | 方法 | 认证 | 说明 |
|---|---|---|---|
| `/api/auth` | POST | 无 | `{ action: 'login' \| 'register', ... }` 返回 `{ user, token }` |
| `/api/games` | GET | 无 | 返回 `{ games, categories }` |
| `/api/games` | POST | Admin | 添加单个游戏（`requireAdmin`） |
| `/api/games` | PUT | Admin | 更新游戏 `{ id, ...updates }` |
| `/api/games` | DELETE | Admin | `?id=` 删除游戏 |
| `/api/games/import` | POST | Admin | FormData 上传 Excel 批量导入 |
| `/api/games/template` | GET | 无 | 下载 Excel 导入模板 |
| `/api/users` | GET | Admin | 用户列表（SafeUser，不含密码） |
| `/api/stats` | GET | 无 | 统计数据（游戏数/用户数/热门数/新品数） |
| `/api/download` | GET | 无 | `?id=&index=` 记录下载计数后重定向到网盘链接 |
| `/api/game-search` | GET | 无 | `?q=` 搜索本地 `game-metadata.json`（中英文名） |
| `/api/steam/search` | GET | 无 | Steam 商店搜索代理，8s 超时 |
| `/api/steam/app` | GET | 无 | Steam 应用详情代理，8s 超时 |
| `/api/steam/download-image` | POST | Admin | 下载图片到 `public/images/`，返回本地路径 |
| `/api/tools` | GET | 无 | 返回 `data/tools.json` |

### 认证机制

- **密码**：bcryptjs 哈希存储，`validateUser()` 使用 `bcrypt.compareSync`
- **Token**：HMAC-SHA256 签名，格式 `base64url(payload).base64url(signature)`，7 天过期
- **Secret**：`data/.secret`（gitignored），首次运行时自动生成 32 字节随机串
- **前端**：`AuthProvider` 存储 `user` + `token` 到 localStorage，Context 下发 `user`/`login`/`register`/`logout`/`isAdmin`/`isLoading`/`getToken`
- **API 鉴权**：`requireAdmin(request)` 从 `Authorization: Bearer <token>` 头验证 token，返回 `SafeUser | null`
- **数据保护**：`SafeUser` 类型排除 `password` 字段，`getSafeUsers()` 统一过滤
- **Hydration**：`AuthProvider` 使用 `isLoading` 模式（初始 `true`，`useEffect` 后 `false`），`<html>` 有 `suppressHydrationWarning`

### 数据层

- **`lib/auth.ts`** — 用户 CRUD + Token 签发验证。`getAllUsers()`/`getSafeUsers()`/`createUser()`/`validateUser()`/`generateToken()`/`verifyToken()`/`requireAdmin()`
- **`lib/games.ts`** — 游戏 CRUD。`addGame()` 自动分配递增 ID。所有读写同步（`readFileSync`/`writeFileSync`），仅在服务端 API Route 中调用。

### 组件树

```
RootLayout (app/layout.tsx)
└── AuthProvider (components/AuthProvider.tsx) — React Context
    └── LayoutWrapper (components/LayoutWrapper.tsx)
        ├── Header — 桌面导航链接 + 搜索框 + 用户菜单 + 移动端底部导航
        ├── {children}
        └── Footer
```

### 数据模型

**Game:** `{ id, title, description, coverImage, size, category, downloadLinks: [{platform, url, password}], releaseDate, updateDate, downloadCount, isHot, isNew, isFeatured }`

**User:** `{ id, username, email, password, role: 'user'|'admin', createdAt }`

**Tool:** `{ id, name, description, category, language, stars, url }` (in `data/tools.json`)

### 关键约定

- 所有页面组件均为 `'use client'`，无 RSC
- `Game` 接口在每个消费页面中重复定义（非共享 types 文件），修改时需全局搜索同步
- Steam API 在中国大陆不可达时返回 `{ items: [], error: 'Steam 不可达' }`，UI 降级显示本地数据库结果
- 管理后台添加游戏时封面图片通过 `/api/steam/download-image` 下载到 `public/images/` 实现本地化
- 移动端：首页底部固定导航栏 + `safe-area-inset`，2 列游戏网格，Header 中有第二个底部导航
- Excel 导入支持中英文列名，最多 5 个下载链接列
