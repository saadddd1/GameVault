# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Geme Vault — 精品免费单机游戏分享平台。Next.js 16 App Router + React 19 + Tailwind v4 + TypeScript，JSON 文件存储，无数据库。

## Commands

```bash
npm run dev      # 开发服务器 (Turbopack, localhost:3000)
npm run build    # 生产构建
npm run start    # 生产服务器
npm run lint     # ESLint
npx tsc --noEmit # TypeScript 类型检查
```

密码重置：
```bash
node scripts/reset-password.js <用户名> <新密码>
```

Steam API 在中国大陆不可达时，用 `node --use-system-ca` 运行脚本。

## Tech Stack

- **Next.js 16.2.7** App Router + **React 19.2.4** — 所有页面组件均为 `'use client'`
- **Tailwind CSS v4** + `@tailwindcss/postcss`
- **bcryptjs** — 密码哈希
- **Node.js crypto** — HMAC-SHA256 token 签名
- **xlsx** — Excel 批量导入/模板导出
- **sharp** — WebP 缩略图生成
- **PM2** + **nginx** — 生产部署（1C1G Debian 12 服务器）

## Architecture

### 前台路由

| 路径 | 说明 |
|---|---|
| `/` | 首页：Hero 精选轮播 → 游戏预览（10条，排序切换）→ MOD 预览（10条，排序切换）→ 工具区（Windows/安卓 tab 切换，各 10 条）+ "查看更多"链接 |
| `/games` | 全部游戏列表（分类筛选、搜索、分页，DataList 组件驱动） |
| `/games/[id]` | **独立 Steam 风格详情页**：深色 Hero（封面+截图轮播+缩略图条）、标签、元信息行、正版购买按钮(Steam绿)+网盘下载按钮(深蓝)、密码显隐切换、完整描述、系统配置卡片（最低/推荐）、底部日期+反馈入口 |
| `/mods` | MOD 列表（分类+游戏筛选、分页，DataList 组件驱动） |
| `/mods/[id]` | MOD 详情（DetailPage 组件驱动） |
| `/android/[id]` | 安卓软件详情（DetailPage 组件驱动） |
| `/windows/[id]` | Windows 软件详情（DetailPage 组件驱动） |
| `/tools` | **统一工具页**：Windows/安卓 2 tab（默认 Windows），无分类下拉，无"全部"tab，分页，合并两种平台到同一列表 |
| `/search` | 全局搜索（游戏/MOD/安卓/Windows 分类标签 + 热门搜索） |
| `/login` | 登录页：居中卡片，Geme Vault logo，用户名/密码表单，成功后跳转 `/admin` |

### 管理后台路由

| 路径 | 说明 |
|---|---|
| `/admin` | 控制面板：统计卡片（游戏数/热门/新游/安卓/Windows）+ 快捷操作（添加游戏/管理游戏/批量导入） |
| `/admin/games` | 游戏列表（AdminTable） |
| `/admin/games/add` | 添加游戏：支持中文名本地搜索（`game-metadata.json`）→ Steam App ID 自动填充完整信息 |
| `/admin/games/[id]/edit` | 编辑游戏 |
| `/admin/mods`, `/admin/mods/add`, `/admin/mods/[id]/edit` | MOD 管理 |
| `/admin/android`, `/admin/android/add`, `/admin/android/[id]/edit` | 安卓软件管理（add/edit 是 ToolForm 薄包装） |
| `/admin/windows`, `/admin/windows/add`, `/admin/windows/[id]/edit` | Windows 软件管理（add/edit 是 ToolForm 薄包装） |
| `/admin/import` | Excel 批量导入（4 类型 tab 切换：游戏/安卓/Windows/MOD） |
| `/admin/feedback` | 反馈管理（标记已处理，AdminTable 组件驱动） |

侧边栏已精简为 6 项（控制面板/游戏管理/MOD管理/安卓软件管理/Windows软件管理/反馈管理），有路径高亮 active 状态，移动端有汉堡菜单+滑出侧边栏。

### API 路由

| 端点 | 方法 | 认证 | 说明 |
|---|---|---|---|
| `/api/auth` | POST | 无 | `action: 'login'\|'register'`。setup 模式：无 admin 时允许首次注册 |
| `/api/games` | GET/POST/PUT/DELETE | Admin(写) | 游戏 CRUD |
| `/api/games/import` | POST | Admin | Excel 批量导入游戏 |
| `/api/games/template` | GET | 无 | 下载游戏导入模板 |
| `/api/mods` | GET/POST/PUT/DELETE | Admin(写) | MOD CRUD |
| `/api/mods/import` | POST | Admin | MOD Excel 导入 |
| `/api/mods/template` | GET | 无 | MOD 导入模板 |
| `/api/android` | GET/POST/PUT/DELETE | Admin(写) | 安卓 CRUD |
| `/api/android/import` | POST | Admin | 安卓 Excel 导入 |
| `/api/android/template` | GET | 无 | 安卓导入模板 |
| `/api/windows` | GET/POST/PUT/DELETE | Admin(写) | Windows CRUD |
| `/api/windows/import` | POST | Admin | Windows Excel 导入 |
| `/api/windows/template` | GET | 无 | Windows 导入模板 |
| `/api/download` | GET | 无 | `?type=&id=&index=` 累加下载计数 → URL 白名单校验 → 重定向到网盘链接 |
| `/api/feedback` | GET(Admin)/POST(公开)/PUT(Admin) | 混 | 反馈 CRUD |
| `/api/stats` | GET | 无 | 面板统计 |
| `/api/search` | GET | 无 | `?q=` 全局搜索；`?hot=1` 热门搜索 TOP 10 |
| `/api/game-search` | GET | 无 | `?q=` 本地 `game-metadata.json` 中文搜索 |
| `/api/steam/search` | GET | 无 | Steam 英文搜索代理 |
| `/api/steam/app` | GET | 无 | `?id=` Steam 应用详情代理（含 developer/publisher/languages/systemRequirements） |
| `/api/steam/download-image` | POST | Admin | 下载图片到 `public/images/`（最大 20MB），HEAD 预检+Content-Length 校验，从 Content-Type 获取扩展名，已存在则跳过，自动生成 WebP 缩略图 |
| `/api/admin/update` | POST | Admin | 服务器一键更新 |

### 认证机制

- **密码**：bcryptjs 哈希
- **Token**：HMAC-SHA256，格式 `base64url(payload).base64url(signature)`，24 小时过期
- **Secret**：`data/.secret`（gitignored），首次运行自动生成 32 字节随机串
- **API 鉴权**：`requireAdmin(request)` 从 `Authorization: Bearer <token>` 头验证
- **前端**：`AuthProvider` Context 下发 `user`/`login`/`logout`/`isAdmin`/`isLoading`/`getToken`
- **Admin 路由守卫**：`app/admin/layout.tsx` 中 `useEffect` 检查 `isAdmin`，非管理员跳转 `/login`

### 数据层

所有数据层使用 `lib/store.ts` 中的泛型 `DataStore<T>` 统一 CRUD + 缓存。数据文件在 `data/`。

| 文件 | 数据文件 | 提供 |
|---|---|---|
| `lib/store.ts` | — | 泛型 `DataStore<T>` 基类：`getAll`/`getById`/`add`/`update`/`delete` + 读写缓存 |
| `lib/modules.ts` | — | 模块注册表 `SEARCHABLE_MODULES`，集中 `ModuleKey` 类型，搜索/下载/统计共用 |
| `lib/cache.ts` | — | 内存缓存：`getCached(key, loader, ttl)` + `invalidate(key)`，5 秒 TTL |
| `lib/api-helpers.ts` | — | `json()`/`err()`/`notFound()`/`unauthorized()`/`checkBodySize()` 减少路由样板 + 请求体大小校验 |
| `lib/route-factory.ts` | — | `createRoutes(config)` 通用 CRUD 路由工厂，消除 4 个模块 API 路由的重复代码 |
| `lib/rate-limit.ts` | — | 内存频率限制：`rateLimit(key, max)`，登录接口防暴力破解 |
| `lib/games.ts` | `data/games.json` | `Game` 接口（含 `steamUrl`/`developer`/`publisher`/`supportedLanguages`/`systemRequirements`）+ CRUD |
| `lib/mod.ts` | `data/mods.json` | `Mod` 接口 + CRUD + categories/games 维护 |
| `lib/android.ts` | `data/android.json` | `AndroidApp` 接口 + CRUD + categories 维护 |
| `lib/windows.ts` | `data/windows.json` | `WindowsApp` 接口 + CRUD + categories 维护 |
| `lib/auth.ts` | `data/users.json`, `data/.secret` | 用户 CRUD + Token 签发/验证 + `requireAdmin` |
| `lib/feedback.ts` | `data/feedback.json` | 反馈 CRUD，`TargetType: 'game'\|'mod'\|'android'\|'windows'` |
| `lib/search.ts` | `data/search-stats.json` | `trackSearch(q)` + `getHotSearches(limit)` |
| `lib/image.ts` | — | 服务端：`generateThumbnail()`（sharp） |
| `lib/image-paths.ts` | — | 客户端：`getThumbPath()` 纯字符串操作 |
| `lib/format-time.ts` | — | `formatTime()` 相对时间显示（今天/昨天/N天前） |

### 共享组件

**前台：**
- `components/DataList.tsx` — 通用列表页（config 驱动：fetch → 筛选 → 排序 → 分页 → 网格渲染），`/games`、`/mods` 共用
- `components/DetailPage.tsx` — 通用详情页（封面/描述/下载链接/反馈），`/mods/[id]`、`/android/[id]`、`/windows/[id]` 共用（游戏详情页已独立）
- `components/Pagination.tsx` — 通用分页（页码、省略号、每页条数选择器）
- `components/GameCard.tsx` — 游戏网格卡片（`getThumbPath()` + `loading="lazy"`）
- `components/SoftwareCard.tsx` — 工具/MOD 通用卡片，支持 `subtitle` prop（MOD 显示关联游戏名）
- `components/FeedbackButton.tsx` — 反馈模态框（props: `targetType`/`targetId`/`targetName`）
- `components/AuthProvider.tsx` — 认证 Context
- `components/LayoutWrapper.tsx` — 布局包装（Header + children + Footer）
- `components/Header.tsx` — 粘性顶栏（4 导航：首页/全部游戏/MOD/工具 + 搜索框）+ 移动端底部 3 标签 + 登录/后台入口
- `components/Footer.tsx` — 页脚

**后台：**
- `components/admin/FormInput.tsx` — 输入框 + 标签 + 必填标记
- `components/admin/FormSelect.tsx` — 下拉选择
- `components/admin/FormTextarea.tsx` — 多行文本
- `components/admin/FormCheckbox.tsx` — 复选框
- `components/admin/DownloadLinksEditor.tsx` — 动态下载链接编辑器（增删行，最少 1 行，8 平台选项含 UC 网盘）
- `components/admin/AdminTable.tsx` — 通用后台表格（加载→列表→空状态→删除确认），所有后台列表页共用
- `components/admin/AdminFormShell.tsx` — 后台表单外壳（标题/成功/错误/取消/提交），所有增改页共用
- `components/admin/ToolForm.tsx` — **共享工具表单组件**：config map 区分 android/windows，同时处理 add 和 edit 模式。Android/Windows 的 4 个 add/edit 页面缩减为薄包装

### 设计规范

- **深蓝主色**：`#1E3A5F`（按钮、链接、边框高亮）
- **标题文字**：`#1C1917`
- **页面背景**：`#FAFAF9`
- **圆角**：统一 `rounded-sm`
- **灰色系**：`stone-*`（非 `gray-*`）
- **按钮**：纯色 `bg-[#1E3A5F]`，无渐变
- Steam 购买按钮：`#5c7e10`（Steam 绿）
- 游戏详情页：深色 Hero 区 `bg-[#1C1917]` + 白色内容卡

### 关键约定

- 所有页面组件均为 `'use client'`，无 RSC
- `@/` 路径别名映射到项目根目录
- 数据接口在各自 `lib/*.ts` 中定义；消费页面通过 API 获取数据，不直接 import lib
- 新增模块：① 定义接口 → ② `new DataStore<T>(cacheKey, jsonFile, listKey)` 实例化 → ③ 在 `lib/modules.ts` 注册 → ④ `app/api/[模块]/` → ⑤ `app/[模块]/` + `app/admin/[模块]/`
- 前台无需登录，下载链接公开可见
- 下载计数通过 `/api/download` 重定向实现
- 搜索统计通过 `trackSearch()` 累加到 `search-stats.json`
- 中文名搜索 Steam 游戏：先在 `data/game-metadata.json` 匹配 → 获取 `steamAppId` → 直接调 `/api/steam/app?id=` 获取完整数据

## 服务器部署

1C1G Debian 12，80Mbps/300GB 流量。部署文件：
- `ecosystem.config.js` — PM2，单实例，384MB heap，400MB 重启
- `nginx.conf` — 反向代理 + gzip + 静态缓存（`_next/static` 30d，图片 7d）
- `setup.sh` — 一键部署（安装依赖、构建、启动 PM2、配置 nginx）
- `update.sh` — 从 GitHub 拉取代码 → 构建 → 重启（不覆盖 `data/` 数据文件）
- `backup.sh` — 定时备份 `data/` 到 `/opt/backups/gemevault/`，保留 7 天
