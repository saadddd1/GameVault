# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GameVault — 精品游戏资源分享平台。Next.js 16 App Router + React 19 + Tailwind v4 + TypeScript，JSON 文件存储，无数据库。

## Commands

```bash
npm run dev      # 开发服务器 (Turbopack, localhost:3000)
npm run build    # 生产构建
npm run start    # 生产服务器
npm run lint     # ESLint
```

## Tech Stack

- **Next.js 16.2.7** App Router + **React 19.2.4** — 所有页面组件均为 `'use client'`
- **Tailwind CSS v4** + `@tailwindcss/postcss`
- **bcryptjs** — 密码哈希
- **Node.js crypto** — HMAC-SHA256 token 签名
- **xlsx** — Excel 批量导入/模板导出
- **PM2** + **nginx** — 生产部署（1C1G Debian 12 服务器优化）

## Architecture

### 前台路由

| 路径 | 说明 |
|---|---|
| `/` | 首页：Hero 轮播 → 编辑之选 → 排序栏(下载排行/最新上架/精选推荐) → 全部游戏分页 → 安卓软件 → Windows软件 → 开源工具 |
| `/games` | 全部游戏列表（分类筛选、搜索、分页） |
| `/games/[id]` | 游戏详情、下载链接、反馈按钮 |
| `/mods` | MOD 列表（分类+游戏筛选、分页） |
| `/mods/[id]` | MOD 详情（安装说明、下载链接、反馈） |
| `/android` | 安卓软件列表（分类筛选、排序、分页） |
| `/android/[id]` | 安卓软件详情、下载链接、反馈 |
| `/windows` | Windows软件列表 |
| `/windows/[id]` | Windows软件详情 |
| `/tools` | 工具中心（合并 Android + Windows 数据，tab 切换分类：游戏修改器/绿色软件/系统工具/安卓应用/Windows软件） |
| `/search` | 全局搜索（游戏/MOD/安卓/Windows 分类标签 + 热门搜索） |

### 管理后台路由

| 路径 | 说明 |
|---|---|
| `/admin` | 后台面板，`layout.tsx` 用 `useAuth().isAdmin` 做权限守卫 |
| `/admin/games`, `/admin/games/add`, `/admin/games/[id]/edit` | 游戏管理（含 Steam 导入 + 封面下载） |
| `/admin/mods`, `/admin/mods/add`, `/admin/mods/[id]/edit` | MOD 管理 |
| `/admin/android`, `/admin/android/add`, `/admin/android/[id]/edit` | 安卓软件管理 |
| `/admin/windows`, `/admin/windows/add`, `/admin/windows/[id]/edit` | Windows 软件管理 |
| `/admin/import` | Excel 批量导入（类型标签切换：游戏/安卓/Windows/MOD） |
| `/admin/feedback` | 反馈管理（标记已处理） |

### API 路由

| 端点 | 方法 | 认证 | 说明 |
|---|---|---|---|
| `/api/auth` | POST | 无 | 登录，返回 token |
| `/api/games` | GET/POST/PUT/DELETE | Admin(写) | 游戏 CRUD |
| `/api/games/import` | POST | Admin | Excel 批量导入 |
| `/api/games/template` | GET | 无 | 下载导入模板 |
| `/api/mods` | GET/POST/PUT/DELETE | Admin(写) | MOD CRUD |
| `/api/mods/import` | POST | Admin | MOD Excel 导入 |
| `/api/mods/template` | GET | 无 | MOD 导入模板 |
| `/api/android` | GET/POST/PUT/DELETE | Admin(写) | 安卓 CRUD |
| `/api/android/import` | POST | Admin | 安卓 Excel 导入 |
| `/api/android/template` | GET | 无 | 安卓导入模板 |
| `/api/windows` | GET/POST/PUT/DELETE | Admin(写) | Windows CRUD |
| `/api/windows/import` | POST | Admin | Windows Excel 导入 |
| `/api/windows/template` | GET | 无 | Windows 导入模板 |
| `/api/download` | GET | 无 | `?type=&id=&index=` 累加下载计数后重定向到网盘链接 |
| `/api/feedback` | GET(Admin)/POST(公开)/PUT(Admin) | 混 | 反馈 CRUD |
| `/api/stats` | GET | 无 | 面板统计 |
| `/api/search` | GET | 无 | `?q=` 全局搜索；`?hot=1` 热门搜索 TOP 10 |
| `/api/game-search` | GET | 无 | 本地 game-metadata.json 搜索 |
| `/api/steam/search` | GET | 无 | Steam 搜索代理 |
| `/api/steam/app` | GET | 无 | Steam 应用详情代理 |
| `/api/steam/download-image` | POST | Admin | 下载图片到 `public/images/` |

### 认证机制

- **密码**：bcryptjs 哈希，`validateUser()` 使用 `bcrypt.compareSync`
- **Token**：HMAC-SHA256，格式 `base64url(payload).base64url(signature)`，7 天过期
- **Secret**：`data/.secret`（gitignored），首次运行自动生成 32 字节随机串
- **API 鉴权**：`requireAdmin(request)` 从 `Authorization: Bearer <token>` 头验证
- **前端**：`AuthProvider` Context 下发 `user`/`login`/`logout`/`isAdmin`/`isLoading`/`getToken`

### 数据层

所有数据层使用 `lib/store.ts` 中的泛型 `DataStore<T>` 统一 CRUD + 缓存，消除重复代码。数据文件在 `data/`。

| 文件 | 数据文件 | 提供 |
|---|---|---|
| `lib/store.ts` | — | 泛型 `DataStore<T>` 基类：`getAll`/`getById`/`add`/`update`/`delete` + 读写缓存 |
| `lib/modules.ts` | — | 模块注册表 `SEARCHABLE_MODULES`，集中 `ModuleKey` 类型，搜索/下载/统计共用 |
| `lib/cache.ts` | — | 内存缓存：`getCached(key, loader, ttl)` + `invalidate(key)`，5 秒 TTL |
| `lib/api-helpers.ts` | — | `json()`/`err()`/`notFound()`/`unauthorized()` 减少路由样板 |
| `lib/games.ts` | `data/games.json` | `Game` 接口（含 `screenshots: string[]`）+ CRUD（基于 DataStore） |
| `lib/mod.ts` | `data/mods.json` | `Mod` 接口 + CRUD + categories/games 维护 |
| `lib/android.ts` | `data/android.json` | `AndroidApp` 接口 + CRUD + categories 维护 |
| `lib/windows.ts` | `data/windows.json` | `WindowsApp` 接口 + CRUD + categories 维护 |
| `lib/auth.ts` | `data/users.json`, `data/.secret` | 用户 CRUD + Token 签发/验证 + `requireAdmin`（基于 DataStore） |
| `lib/feedback.ts` | `data/feedback.json` | 反馈 CRUD，`TargetType: 'game'\|'mod'\|'android'\|'windows'` |
| `lib/search.ts` | `data/search-stats.json` | `trackSearch(q)` + `getHotSearches(limit)` |
| `lib/image.ts` | — | 服务端：`generateThumbnail()`（sharp） |
| `lib/image-paths.ts` | — | 客户端：`getThumbPath()` 纯字符串操作 |

### 共享组件

- `components/admin/FormInput.tsx` — 输入框 + 标签 + 必填标记
- `components/admin/FormSelect.tsx` — 下拉选择
- `components/admin/FormTextarea.tsx` — 多行文本
- `components/admin/FormCheckbox.tsx` — 复选框
- `components/admin/DownloadLinksEditor.tsx` — 动态下载链接编辑器（增删行，最少 1 行）
- `components/SoftwareCard.tsx` — Android/Windows/工具通用卡片
- `components/GameCard.tsx` — 游戏网格卡片
- `components/FeedbackButton.tsx` — 反馈模态框
- `components/AuthProvider.tsx` — 认证 Context
- `components/LayoutWrapper.tsx` — 布局包装（Header + children + Footer，底部导航在 Header 内）
- `components/Header.tsx` — 粘性顶栏（4 导航链接：首页/全部游戏/MOD/工具 + 搜索框）+ 移动端底部 3 标签（首页/游戏/工具），tagline "游戏 · MOD · 工具 · Windows"
- `components/Footer.tsx` — 页脚

### 关键约定

- 所有页面组件均为 `'use client'`，无 RSC
- `@/` 路径别名映射到项目根目录
- 数据接口在各自 `lib/*.ts` 中定义；消费页面通过 API 获取数据，不直接 import lib
- 新增模块：① 定义接口 → ② `new DataStore<T>(cacheKey, jsonFile, listKey)` 实例化 → ③ 在 `lib/modules.ts` 注册 → ④ `app/api/[模块]/` → ⑤ `app/[模块]/` + `app/admin/[模块]/`
- 颜色：`#1E3A5F`（深蓝主色）、`#1C1917`（标题文字）、`#FAFAF9`（页面背景）
- 前台无需登录，下载链接公开可见；管理后台通过 `layout.tsx` 的 `isAdmin` 判断跳转 `/login`（该页面待创建）
- 下载计数通过 `/api/download` 重定向实现
- 搜索统计通过 `trackSearch()` 累加到 `search-stats.json`
- 首页分页支持 20/40/60，其他列表页 12/20/40/60
- Steam API 中国大陆不可达时降级显示本地数据库

## 服务器部署

1C1G Debian 12，80Mbps/300GB 流量。部署文件：
- `ecosystem.config.js` — PM2，单实例，384MB heap，400MB 重启
- `nginx.conf` — 反向代理 + gzip + 静态缓存（`_next/static` 30d，图片 7d）
- `setup.sh` — 一键部署脚本
