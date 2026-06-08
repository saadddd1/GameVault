# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GameVault — 精品游戏分享平台（单机游戏资源分享站），基于 Next.js 16 App Router 构建，JSON 文件存储，无数据库。

## Commands

```bash
npm run dev      # 开发服务器 Turbopack (localhost:3000)
npm run build    # 生产构建 (output: 'standalone')
npm run start    # 启动生产服务器
npm run lint     # ESLint
```

## Tech Stack

- **Next.js 16.2.7** App Router + **React 19.2.4** — 所有页面均为 `'use client'` 组件
- **Tailwind CSS v4** — 通过 `@tailwindcss/postcss` 使用，`@/` 路径别名映射到项目根目录
- **bcryptjs** — 密码哈希
- **Node.js crypto** — HMAC-SHA256 token 签名验证
- **xlsx** (`^0.18.5`) — Excel 批量导入/模板导出
- **next/font/google** — 自托管字体 (Inter + Noto Sans SC)，无外部 Google Fonts 请求

## Architecture

### 前台路由

| 路径 | 文件 | 说明 |
|---|---|---|
| `/` | `app/page.tsx` | 首页：Featured Hero 轮播 + 排序栏 + 游戏网格 |
| `/games` | `app/games/page.tsx` | 全部游戏，分类筛选、搜索、排序、分页 |
| `/games/[id]` | `app/games/[id]/page.tsx` | 游戏详情，下载链接 + 反馈按钮 |
| `/mods` | `app/mods/page.tsx` | MOD 列表 |
| `/mods/[id]` | `app/mods/[id]/page.tsx` | MOD 详情 |
| `/tools` | `app/tools/page.tsx` | 工具中心（合并 Android + Windows，tab 切换分类） |
| `/android` | `app/android/page.tsx` | Android 应用列表（保留） |
| `/android/[id]` | `app/android/[id]/page.tsx` | Android 应用详情 |
| `/windows` | `app/windows/page.tsx` | Windows 软件列表（保留） |
| `/windows/[id]` | `app/windows/[id]/page.tsx` | Windows 软件详情 |
| `/search` | `app/search/page.tsx` | 全局搜索 |

### 管理后台路由

| 路径 | 文件 | 说明 |
|---|---|---|
| `/admin` | `app/admin/layout.tsx` + `page.tsx` | 后台面板，`layout.tsx` 用 `useAuth().isAdmin` 做权限守卫 |
| `/admin/games` | `app/admin/games/page.tsx` | 游戏管理表格 |
| `/admin/games/add` | `app/admin/games/add/page.tsx` | 添加游戏（含 Steam 导入：自动填发布日/截图/重复检测） |
| `/admin/games/[id]/edit` | `app/admin/games/[id]/edit/page.tsx` | 编辑游戏 |
| `/admin/mods` | `app/admin/mods/page.tsx` | MOD 管理 |
| `/admin/mods/add` | `app/admin/mods/add/page.tsx` | 添加 MOD |
| `/admin/mods/[id]/edit` | `app/admin/mods/[id]/edit/page.tsx` | 编辑 MOD |
| `/admin/android` | `app/admin/android/page.tsx` | Android 管理 |
| `/admin/android/add` | `app/admin/android/add/page.tsx` | 添加 Android 应用 |
| `/admin/android/[id]/edit` | `app/admin/android/[id]/edit/page.tsx` | 编辑 Android 应用 |
| `/admin/windows` | `app/admin/windows/page.tsx` | Windows 管理 |
| `/admin/windows/add` | `app/admin/windows/add/page.tsx` | 添加 Windows 软件 |
| `/admin/windows/[id]/edit` | `app/admin/windows/[id]/edit/page.tsx` | 编辑 Windows 软件 |
| `/admin/import` | `app/admin/import/page.tsx` | Excel 批量导入（类型标签切换：游戏/Android/Windows/MOD） |
| `/admin/feedback` | `app/admin/feedback/page.tsx` | 反馈管理 |

### API 路由

| 端点 | 方法 | 认证 | 说明 |
|---|---|---|---|
| `/api/auth` | POST | 无 | 登录 `{ username, password }` |
| `/api/games` | GET | 无 | 返回 `{ games, categories }` |
| `/api/games` | POST | Admin | 添加游戏 |
| `/api/games` | PUT | Admin | 更新游戏 `{ id, ...updates }` |
| `/api/games` | DELETE | Admin | `?id=` 删除游戏 |
| `/api/games/import` | POST | Admin | FormData 上传 Excel 批量导入游戏 |
| `/api/games/template` | GET | 无 | 下载游戏导入 Excel 模板 |
| `/api/mods` | GET | 无 | 返回 `{ mods, games }`；`?id=` 查单个 |
| `/api/mods` | POST | Admin | 添加 MOD |
| `/api/mods` | PUT | Admin | 更新 MOD |
| `/api/mods` | DELETE | Admin | `?id=` 删除 MOD |
| `/api/mods/import` | POST | Admin | Excel 批量导入 MOD |
| `/api/mods/template` | GET | 无 | MOD 模板下载 |
| `/api/android` | GET | 无 | 返回 `{ apps, categories }`；`?id=` 查单个 |
| `/api/android` | POST | Admin | 添加 Android 应用 |
| `/api/android` | PUT | Admin | 更新 Android 应用 |
| `/api/android` | DELETE | Admin | `?id=` 删除 |
| `/api/android/import` | POST | Admin | Excel 批量导入 Android |
| `/api/android/template` | GET | 无 | Android 模板下载 |
| `/api/windows` | GET | 无 | 返回 `{ apps, categories }`；`?id=` 查单个 |
| `/api/windows` | POST | Admin | 添加 Windows 软件 |
| `/api/windows` | PUT | Admin | 更新 Windows 软件 |
| `/api/windows` | DELETE | Admin | `?id=` 删除 |
| `/api/windows/import` | POST | Admin | Excel 批量导入 Windows |
| `/api/windows/template` | GET | 无 | Windows 模板下载 |
| `/api/search` | GET | 无 | `?q=` 全局搜索（游戏+Android+Windows） |
| `/api/game-search` | GET | 无 | `?q=` 搜索本地 `game-metadata.json` |
| `/api/stats` | GET | 无 | 首页统计数据 |
| `/api/feedback` | GET | Admin | 反馈列表 |
| `/api/feedback` | POST | 无 | 提交反馈 |
| `/api/feedback` | PUT | Admin | 标记已处理/未处理 |
| `/api/download` | GET | 无 | `?type=&id=&index=` 记录下载计数后重定向 |
| `/api/steam/search` | GET | 无 | Steam 商店搜索代理 |
| `/api/steam/app` | GET | 无 | Steam 应用详情代理 |
| `/api/steam/download-image` | POST | Admin | 下载图片到 `public/images/` |

### 数据层

- **`lib/auth.ts`** — `User`/`SafeUser`/`UsersData` 类型，`getAllUsers()`/`createUser()`/`validateUser()`/`generateToken()`/`verifyToken()`/`requireAdmin()`
- **`lib/games.ts`** — `Game`/`GamesData` 类型（含 `screenshots: string[]`），`getAllGames()`/`getGameById()`/`addGame()`/`updateGame()`/`deleteGame()`
- **`lib/mod.ts`** — `Mod`/`ModsData` 类型，`getAllMods()`/`getModById()`/`addMod()`/`updateMod()`/`deleteMod()`
- **`lib/android.ts`** — `AndroidApp`/`AndroidData` 类型，`getAllAndroid()`/`getAndroidById()`/`addAndroid()`/`updateAndroid()`/`deleteAndroid()`
- **`lib/windows.ts`** — `WindowsApp`/`WindowsData` 类型，`getAllWindows()`/`getWindowsById()`/`addWindows()`/`updateWindows()`/`deleteWindows()`
- **`lib/feedback.ts`** — `Feedback` 类型，`getAllFeedback()`/`addFeedback()`/`toggleFeedbackResolved()`
- **`lib/search.ts`** — 全局搜索工具函数

所有读写同步（`readFileSync`/`writeFileSync`），仅在服务端 API Route 中调用。

### 数据文件 (`data/`)

`games.json`, `mods.json`, `android.json`, `windows.json`, `users.json`, `game-metadata.json`, `feedback.json`, `search-stats.json`, `.secret`

### 共享组件

- `components/admin/FormInput.tsx` — 输入框 + 标签 + 必填标记
- `components/admin/FormSelect.tsx` — 下拉选择
- `components/admin/FormTextarea.tsx` — 多行文本
- `components/admin/FormCheckbox.tsx` — 复选框
- `components/admin/DownloadLinksEditor.tsx` — 动态下载链接（增删行，最少 1 行）
- `components/SoftwareCard.tsx` — Android/Windows/工具通用卡片（含平台标签）
- `components/GameCard.tsx`, `components/ModCard.tsx` — 游戏/MOD 卡片
- `components/FeedbackButton.tsx` — 反馈模态框
- `components/AuthProvider.tsx` — 认证 Context
- `components/LayoutWrapper.tsx` — 布局包装（Header + children + Footer）

### 认证机制

- 密码 bcryptjs 哈希，`validateUser()` 用 `bcrypt.compareSync`
- Token: HMAC-SHA256 签名，`base64url(payload).base64url(signature)`，7 天过期
- Secret 存 `data/.secret`（gitignored），首次运行自动生成
- `AuthProvider` Context 下发 `user`/`login`/`logout`/`isAdmin`/`isLoading`/`getToken`
- `requireAdmin(request)` 从 `Authorization: Bearer <token>` 验证
- `SafeUser` 类型排除 `password` 字段

### 关键约定

- 所有页面组件均为 `'use client'`
- 数据模型接口在各消费页面中重复定义，修改字段需全局搜索同步
- Steam API 不可达时返回 `{ items: [], error: 'Steam 不可达' }`，UI 降级显示本地数据库结果
- Steam 导入时封面通过 `/api/steam/download-image` 下载到 `public/images/`
- Excel 导入支持中英文列名，最多 5 个下载链接列
- 前台无需登录，所有下载链接公开可见
- 管理员通过 `/admin` 访问后台，未登录自动跳转 `/login`（该页面不存在，需手动 `/admin` 并登录）
- ADDR 标签: "游戏 · MOD · 工具 · Windows"
