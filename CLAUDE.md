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
- 数据存储：`data/games.json`、`data/mods.json`、`data/tools.json`、`data/users.json`、`data/game-metadata.json`、`data/feedback.json`、`data/.secret`
- HF Spaces 部署：`lib/store.ts` 启动时从 HF Dataset 拉数据，写操作后异步回传

## Architecture

### 路由总览

| 路径 | 文件 | 说明 |
|---|---|---|
| `/` | `app/page.tsx` | 首页：Featured Hero 轮播 + 排序栏（下载排行/最新上架/精选推荐）+ 游戏网格（2-5列响应式）+ 移动端底部导航 |
| `/games` | `app/games/page.tsx` | 全部游戏列表，分类筛选、搜索、排序、分页 |
| `/games/[id]` | `app/games/[id]/page.tsx` | 游戏详情页，下载链接公开可见，含反馈按钮 |
| `/mods` | `app/mods/page.tsx` | MOD 列表，分类+游戏筛选、分页 |
| `/mods/[id]` | `app/mods/[id]/page.tsx` | MOD 详情，含安装说明、下载链接、反馈按钮 |
| `/tools` | `app/tools/page.tsx` | 开源工具列表，分类筛选、GitHub star、分页 |
| `/tools/[id]` | `app/tools/[id]/page.tsx` | 工具详情，GitHub 链接、下载链接、反馈按钮 |
| `/admin` | `app/admin/layout.tsx` + `page.tsx` | 管理后台面板，`layout.tsx` 通过 `useAuth().isAdmin` 做权限守卫 |
| `/admin/games` | `app/admin/games/page.tsx` | 游戏管理表格（查看/删除） |
| `/admin/games/add` | `app/admin/games/add/page.tsx` | 添加游戏表单，含 Steam 导入（搜索 Steam + 本地数据库，自动填充并下载封面到本地） |
| `/admin/games/[id]/edit` | `app/admin/games/[id]/edit/page.tsx` | 编辑游戏，支持下载链接管理、精选标记 |
| `/admin/import` | `app/admin/import/page.tsx` | Excel 批量导入（上传 + 模板下载） |
| `/admin/mods` | `app/admin/mods/page.tsx` | MOD 管理表格 |
| `/admin/mods/add` | `app/admin/mods/add/page.tsx` | 添加 MOD 表单 |
| `/admin/mods/[id]/edit` | `app/admin/mods/[id]/edit/page.tsx` | 编辑 MOD |
| `/admin/tools` | `app/admin/tools/page.tsx` | 工具管理表格 |
| `/admin/tools/add` | `app/admin/tools/add/page.tsx` | 添加工具表单 |
| `/admin/tools/[id]/edit` | `app/admin/tools/[id]/edit/page.tsx` | 编辑工具 |
| `/admin/feedback` | `app/admin/feedback/page.tsx` | 反馈管理（标记已处理） |

### API 路由

| 端点 | 方法 | 认证 | 说明 |
|---|---|---|---|
| `/api/auth` | POST | 无 | `{ username, password }` 仅登录，无注册 |
| `/api/games` | GET | 无 | 返回 `{ games, categories }` |
| `/api/games` | POST | Admin | 添加单个游戏（`requireAdmin`） |
| `/api/games` | PUT | Admin | 更新游戏 `{ id, ...updates }` |
| `/api/games` | DELETE | Admin | `?id=` 删除游戏 |
| `/api/games/import` | POST | Admin | FormData 上传 Excel 批量导入 |
| `/api/games/template` | GET | 无 | 下载 Excel 导入模板 |
| `/api/mods` | GET | 无 | 返回 `{ mods, games }`；`?id=` 查单个 |
| `/api/mods` | POST | Admin | 添加 MOD |
| `/api/mods` | PUT | Admin | 更新 MOD `{ id, ...updates }` |
| `/api/mods` | DELETE | Admin | `?id=` 删除 MOD |
| `/api/tools` | GET | 无 | 返回 `{ tools, categories, languages }`；`?id=` 查单个 |
| `/api/tools` | POST | Admin | 添加工具 |
| `/api/tools` | PUT | Admin | 更新工具 `{ id, ...updates }` |
| `/api/tools` | DELETE | Admin | `?id=` 删除工具 |
| `/api/github-stars` | GET | 无 | `?url=` 代理查询 GitHub star 数，8s 超时 |
| `/api/stats` | GET | 无 | 统计数据（游戏/热门/新品/MOD/工具数） |
| `/api/feedback` | GET | Admin | 反馈列表 |
| `/api/feedback` | POST | 无 | 提交反馈（公开） |
| `/api/feedback` | PUT | Admin | 标记反馈已处理/未处理 |
| `/api/download` | GET | 无 | `?type=&id=&index=` 记录下载计数后重定向到网盘链接，支持 game/mod/tool |
| `/api/game-search` | GET | 无 | `?q=` 搜索本地 `game-metadata.json`（中英文名） |
| `/api/steam/search` | GET | 无 | Steam 商店搜索代理，8s 超时 |
| `/api/steam/app` | GET | 无 | Steam 应用详情代理，8s 超时 |
| `/api/steam/download-image` | POST | Admin | 下载图片到 `public/images/`，返回本地路径 |

### 认证机制

- **密码**：bcryptjs 哈希存储，`validateUser()` 使用 `bcrypt.compareSync`
- **Token**：HMAC-SHA256 签名，格式 `base64url(payload).base64url(signature)`，7 天过期
- **Secret**：`data/.secret`（gitignored），首次运行时自动生成 32 字节随机串
- **前端**：`AuthProvider` 仅用于管理员登录，Context 下发 `user`/`login`/`logout`/`isAdmin`/`isLoading`/`getToken`。前台 Header 不再引用 `useAuth`，纯展示
- **API 鉴权**：`requireAdmin(request)` 从 `Authorization: Bearer <token>` 头验证 token，返回 `SafeUser | null`
- **数据保护**：`SafeUser` 类型排除 `password` 字段，`getSafeUsers()` 统一过滤
- **Hydration**：`AuthProvider` 使用 `isLoading` 模式（初始 `true`，`useEffect` 后 `false`），`<html>` 有 `suppressHydrationWarning`

### 数据层

- **`lib/auth.ts`** — 用户 CRUD + Token 签发验证。`getAllUsers()`/`getSafeUsers()`/`createUser()`/`validateUser()`/`generateToken()`/`verifyToken()`/`requireAdmin()`
- **`lib/games.ts`** — 游戏 CRUD。`addGame()` 自动分配递增 ID。所有读写同步（`readFileSync`/`writeFileSync`），仅在服务端 API Route 中调用。
- **`lib/mod.ts`** — MOD CRUD。`getAllMods()` 返回 `{ mods, games }`，`addMod()`/`updateMod()`/`deleteMod()`/`getModById()`。写操作后调 `syncToHF('mods.json')`。
- **`lib/tool.ts`** — 工具 CRUD。`getAllTools()` 返回 `{ tools, categories, languages }`，`addTool()` 自动分配递增 ID。写操作后调 `syncToHF('tools.json')`。
- **`lib/feedback.ts`** — 反馈 CRUD。`getAllFeedback()`/`addFeedback()`/`toggleFeedbackResolved()`。写操作后调 `syncToHF('feedback.json')`。
- **`lib/store.ts`** — HF Dataset 持久化层。`isHF()` 检查 `HF_DATASET_REPO` 环境变量，`startupDataSync()` 启动时拉取全部数据文件，`syncToHF()` 写操作后异步上传（best-effort，不阻塞请求）。写操作用旧版 upload API（`/upload/`），读操作用 resolve API（`/resolve/main/`）。

### 组件树

```
RootLayout (app/layout.tsx)
└── AuthProvider (components/AuthProvider.tsx) — React Context
    └── LayoutWrapper (components/LayoutWrapper.tsx)
        ├── Header — 桌面导航链接 + 搜索框 + 移动端底部导航（首页/游戏/MOD，3 个标签）
        ├── {children}
        └── Footer
```

前台组件：`GameCard`、`ModCard`、`FeedbackButton`（模态框提交反馈）、`Header`、`Footer`

### 数据模型

**Game:** `{ id, title, description, coverImage, size, category, downloadLinks: [{platform, url, password}], releaseDate, updateDate, downloadCount, isHot, isNew, isFeatured }`

**Mod:** `{ id, title, description, coverImage, category: '模组'|'存档', gameName, author, version, fileSize, downloadLinks: [{platform, url, password}], tags: string[], installInstructions, downloadCount, createdAt, updatedAt }`

**Tool:** `{ id, name, description, coverImage, category, language, githubUrl, stars: number, downloadLinks: [{platform, url, password}], tags: string[], author, version, fileSize, downloadCount, createdAt, updatedAt }`

**User:** `{ id, username, email, password, role: 'user'|'admin', createdAt }`

**Feedback:** `{ id, targetType: 'game'|'mod'|'tool', targetId: number, targetName: string, content: string, createdAt: string, resolved: boolean }`

### HF Spaces 部署

- **Dockerfile**：Node.js 22 Alpine 三阶段构建，`output: 'standalone'`，`PORT=7860`
- **instrumentation.ts**：启动时调用 `startupDataSync()` 从 HF Dataset 拉取数据
- **环境变量**：`HF_DATASET_REPO=assddd123/gamevault-data`、`HF_TOKEN=<token>`
- 数据持久化：每次写操作后 `syncToHF()` 异步上传对应 JSON 文件到 Dataset

### 关键约定

- 所有页面组件均为 `'use client'`，无 RSC
- `Game`/`Mod`/`Tool` 接口在各消费页面中重复定义（非共享 types 文件），修改时需全局搜索同步
- Steam API 在中国大陆不可达时返回 `{ items: [], error: 'Steam 不可达' }`，UI 降级显示本地数据库结果
- 管理后台添加游戏时封面图片通过 `/api/steam/download-image` 下载到 `public/images/` 实现本地化
- 移动端：首页底部固定导航栏 + `safe-area-inset`，2 列游戏网格，Header 中有第二个底部导航
- Excel 导入支持中英文列名，最多 5 个下载链接列
- 前台无需登录，所有下载链接公开可见；管理员通过 `/admin` 访问后台，未登录自动跳转 `/login`（该页面不存在，需手动访问）
