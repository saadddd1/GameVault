# GameVault 编辑精选风重设计 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 GameVault 整体 UI 从蓝紫 AI 模板风改造为编辑精选（Editorial）风格，移动优先。

**Architecture:** 自底向上推进 — 先建设计系统（CSS 变量、字体），再改原子组件（GameCard、Header），最后组合页面（首页、列表页、详情页、登录页、工具页）。每步可独立验证。

**Tech Stack:** Next.js 16 + React 19 + Tailwind CSS v4 + Noto Sans SC + Inter

---

### Task 1: 设计系统基础 — CSS 变量 + 字体

**Files:**
- Modify: `app/globals.css:1-95`
- Modify: `app/layout.tsx:16-18`

- [ ] **Step 1: 重写 globals.css，注入品牌色和字体系统**

替换 `app/globals.css` 全部内容为：

```css
@import "tailwindcss";

/* GameVault Editorial Design System */
:root {
  --page-bg: #FAFAF9;
  --card-bg: #FFFFFF;
  --title: #1C1917;
  --body: #78716C;
  --brand: #1E3A5F;
  --border: #E7E5E4;
  --muted: #A8A29E;
}

body {
  font-family: 'Noto Sans SC', sans-serif;
  background-color: var(--page-bg);
  color: var(--body);
}

/* 数字/标签使用 Inter */
.font-number {
  font-family: 'Inter', sans-serif;
}

/* 滚动条 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #d4d4d4;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 移动端安全区 */
@media (max-width: 1023px) {
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
```

- [ ] **Step 2: 修改 layout.tsx — Google Fonts 引入 + body 背景色**

修改 `app/layout.tsx`，在 `<html>` 和 `<body>` 之间插入字体 link，并更新 body class：

```tsx
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import LayoutWrapper from "@/components/LayoutWrapper";

export const metadata: Metadata = {
  title: "GameVault - 精品游戏分享平台",
  description: "分享最新、最热的单机游戏资源，支持多种网盘下载方式",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Noto+Sans+SC:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col" style={{ backgroundColor: '#FAFAF9' }}>
        <AuthProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: 构建验证**

```bash
cd "C:\Users\AGV\Desktop\WangPanWangZhan\game-site" && npx next build 2>&1 | tail -20
```

Expected: TypeScript passes, all pages generated successfully.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat: add editorial design system — CSS variables, brand colors, Noto Sans SC + Inter fonts"
```

---

### Task 2: GameCard 编辑风重设计

**Files:**
- Modify: `components/GameCard.tsx`

- [ ] **Step 1: 重写 GameCard 为编辑风样式**

替换 `components/GameCard.tsx` 全部内容为：

```tsx
import Link from 'next/link'
import type { Game } from '@/lib/games'

interface GameCardProps {
  game: Game
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <Link href={`/games/${game.id}`} className="group block">
      <article className="bg-white border border-stone-200 rounded-sm overflow-hidden hover:border-stone-400 transition-colors duration-200">
        {/* 封面图 */}
        <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
          {game.coverImage && game.coverImage !== '/images/default.svg' ? (
            <img
              src={game.coverImage}
              alt={game.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-12 h-12 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}

          {/* 标签 */}
          <div className="absolute top-2 left-2 flex gap-1.5">
            {game.isHot && (
              <span className="px-2 py-0.5 bg-red-600 text-white text-[11px] font-semibold rounded-sm font-number">
                热门
              </span>
            )}
            {game.isNew && (
              <span className="px-2 py-0.5 bg-emerald-600 text-white text-[11px] font-semibold rounded-sm font-number">
                新游
              </span>
            )}
          </div>

          {/* 精选标记 */}
          {game.isFeatured && (
            <div className="absolute top-2 right-2">
              <span className="px-2 py-0.5 bg-[#1E3A5F] text-white text-[10px] font-semibold rounded-sm font-number">
                精选
              </span>
            </div>
          )}
        </div>

        {/* 游戏信息 */}
        <div className="p-3 lg:p-4">
          <h3 className="font-bold text-[#1C1917] mb-1.5 line-clamp-1 text-sm lg:text-base">
            {game.title}
          </h3>
          <p className="text-xs lg:text-sm text-stone-500 mb-3 line-clamp-2 leading-relaxed">
            {game.description}
          </p>
          <div className="flex items-center justify-between text-xs text-stone-400 font-number">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {game.downloadCount.toLocaleString()}
            </span>
            <span>{game.size}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}
```

- [ ] **Step 2: 构建验证**

```bash
cd "C:\Users\AGV\Desktop\WangPanWangZhan\game-site" && npx next build 2>&1 | tail -20
```

Expected: TypeScript passes.

- [ ] **Step 3: Commit**

```bash
git add components/GameCard.tsx
git commit -m "feat: redesign GameCard with editorial style — stone palette, flat tags, brand accent"
```

---

### Task 3: Header 品牌化 + 移动端汉堡

**Files:**
- Modify: `components/Header.tsx`

- [ ] **Step 1: 重写 Header — Logo+tagline、品牌色、移动端汉堡菜单**

替换 `components/Header.tsx` 全部内容为：

```tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from './AuthProvider'

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAdmin, isLoading, logout } = useAuth()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/games?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const closeMenus = () => {
    setShowMobileMenu(false)
    setShowUserMenu(false)
  }

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-stone-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between h-14 lg:h-16">

          {/* 移动端：汉堡菜单按钮 */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2 -ml-2 text-stone-600 hover:text-[#1C1917]"
            aria-label="菜单"
          >
            {showMobileMenu ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0" onClick={closeMenus}>
            <span className="text-lg lg:text-xl font-extrabold text-[#1C1917] tracking-wide">
              GAMEVAULT
            </span>
            <span className="hidden sm:block text-[11px] text-stone-400 tracking-wider">
              游戏 · MOD · 资源
            </span>
          </Link>

          {/* 桌面端导航 */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              href="/"
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname === '/' ? 'text-[#1E3A5F]' : 'text-stone-500 hover:text-[#1C1917]'
              }`}
            >
              首页
            </Link>
            <Link
              href="/games"
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname === '/games' ? 'text-[#1E3A5F]' : 'text-stone-500 hover:text-[#1C1917]'
              }`}
            >
              全部游戏
            </Link>
            <Link
              href="/tools"
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname === '/tools' ? 'text-[#1E3A5F]' : 'text-stone-500 hover:text-[#1C1917]'
              }`}
            >
              MOD工具
            </Link>
            {!isLoading && isAdmin && (
              <Link
                href="/admin"
                className="px-3 py-1.5 text-sm font-medium text-stone-500 hover:text-[#1C1917] transition-colors"
              >
                管理后台
              </Link>
            )}
          </nav>

          {/* 右侧区域 */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* 搜索框 */}
            <form onSubmit={handleSearch} className="hidden sm:flex items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索游戏、MOD..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-36 lg:w-56 pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] focus:bg-white transition-all text-sm"
                />
                <svg
                  className="absolute left-2.5 top-2 h-4 w-4 text-stone-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>

            {/* 用户区域 */}
            {isLoading ? (
              <div className="w-8 h-8" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-stone-50 transition-colors rounded-sm"
                >
                  <div className="w-7 h-7 bg-[#1E3A5F] rounded-sm flex items-center justify-center">
                    <span className="text-white text-xs font-semibold font-number">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden lg:block text-sm font-medium text-[#1C1917]">
                    {user.username}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-stone-200 rounded-sm shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-sm font-medium text-[#1C1917]">{user.username}</p>
                      <p className="text-xs text-stone-400">{user.email}</p>
                    </div>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-[#1E3A5F] hover:bg-stone-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        管理后台
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout()
                        setShowUserMenu(false)
                        router.push('/')
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3 py-1.5 bg-[#1E3A5F] text-white text-sm font-medium rounded-sm hover:bg-[#162d47] transition-colors"
              >
                登录
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 移动端下拉菜单 */}
      {showMobileMenu && (
        <div className="lg:hidden border-t border-stone-200 bg-white">
          <div className="container mx-auto px-4 py-3 space-y-1">
            <Link
              href="/"
              onClick={closeMenus}
              className={`block px-3 py-2 text-sm font-medium rounded-sm ${
                pathname === '/' ? 'text-[#1E3A5F] bg-stone-50' : 'text-stone-600'
              }`}
            >
              首页
            </Link>
            <Link
              href="/games"
              onClick={closeMenus}
              className={`block px-3 py-2 text-sm font-medium rounded-sm ${
                pathname === '/games' ? 'text-[#1E3A5F] bg-stone-50' : 'text-stone-600'
              }`}
            >
              全部游戏
            </Link>
            <Link
              href="/tools"
              onClick={closeMenus}
              className={`block px-3 py-2 text-sm font-medium rounded-sm ${
                pathname === '/tools' ? 'text-[#1E3A5F] bg-stone-50' : 'text-stone-600'
              }`}
            >
              MOD工具
            </Link>
            {!isLoading && isAdmin && (
              <Link
                href="/admin"
                onClick={closeMenus}
                className="block px-3 py-2 text-sm font-medium text-[#1E3A5F]"
              >
                管理后台
              </Link>
            )}
            {/* 移动端搜索 */}
            <form onSubmit={(e) => { handleSearch(e); closeMenus() }} className="pt-2">
              <input
                type="text"
                placeholder="搜索游戏、MOD..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#1E3A5F] text-sm"
              />
            </form>
          </div>
        </div>
      )}

      {/* 移动端底部导航 */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-stone-200 z-50 pb-safe">
        <div className="flex justify-around py-1.5">
          <Link href="/" className={`flex flex-col items-center px-3 py-1 text-[11px] ${pathname === '/' ? 'text-[#1E3A5F]' : 'text-stone-400'}`}>
            <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            首页
          </Link>
          <Link href="/games" className={`flex flex-col items-center px-3 py-1 text-[11px] ${pathname === '/games' ? 'text-[#1E3A5F]' : 'text-stone-400'}`}>
            <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            游戏
          </Link>
          <Link href="/login" className={`flex flex-col items-center px-3 py-1 text-[11px] ${pathname === '/login' ? 'text-[#1E3A5F]' : 'text-stone-400'}`}>
            <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            我的
          </Link>
        </div>
      </nav>
    </header>
  )
}
```

- [ ] **Step 2: 构建验证**

```bash
cd "C:\Users\AGV\Desktop\WangPanWangZhan\game-site" && npx next build 2>&1 | tail -20
```

Expected: TypeScript passes.

- [ ] **Step 3: 检查 LayoutWrapper 是否需要底部占位**

Read `components/LayoutWrapper.tsx` — 如果 `<main>` 没有移动端底部 padding，需添加 `pb-16 lg:pb-0`。

- [ ] **Step 4: Commit**

```bash
git add components/Header.tsx components/LayoutWrapper.tsx
git commit -m "feat: redesign Header with editorial branding, hamburger menu, mobile bottom nav"
```

---

### Task 4: 首页 — 杂志分区式布局

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: 重写首页为杂志分区式，带分区标题和横向滚动**

替换 `app/page.tsx` 全部内容为：

```tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import GameCard from '@/components/GameCard'
import type { Game } from '@/lib/games'

type SortKey = 'downloads' | 'newest' | 'featured'

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'downloads', label: '下载排行' },
  { key: 'newest', label: '最新上架' },
  { key: 'featured', label: '精选推荐' },
]

function SectionTitle({ title }: { title: string }) {
  return (
    <h2 className="text-base lg:text-lg font-bold text-[#1C1917] border-l-[3px] border-[#1E3A5F] pl-3 mb-4 lg:mb-5 tracking-wide">
      {title}
    </h2>
  )
}

export default function HomePage() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortKey>('downloads')
  const [featuredIndex, setFeaturedIndex] = useState(0)

  useEffect(() => {
    fetch('/api/games')
      .then(r => r.json())
      .then(data => { if (data.games) setGames(data.games) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const featuredGames = games.filter(g => g.isFeatured)

  useEffect(() => {
    if (featuredGames.length <= 1) return
    const timer = setInterval(() => {
      setFeaturedIndex(prev => (prev + 1) % featuredGames.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [featuredGames.length])

  const sortedByDownload = [...games].sort((a, b) => b.downloadCount - a.downloadCount)
  const sortedByNewest = [...games].sort((a, b) => new Date(b.updateDate).getTime() - new Date(a.updateDate).getTime())
  const editorPicks = games.filter(g => g.isFeatured).slice(0, 6)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAF9' }}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1E3A5F]"></div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#FAFAF9' }}>
      <div className="container mx-auto px-4 py-4 lg:py-6 max-w-6xl">

        {/* Hero 精选推荐 */}
        {featuredGames.length > 0 && (
          <section className="mb-6 lg:mb-8">
            <Link href={`/games/${featuredGames[featuredIndex].id}`}>
              <div className="relative bg-[#1C1917] overflow-hidden rounded-sm group cursor-pointer">
                <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-8 p-5 lg:p-8">
                  {/* 封面 */}
                  <div className="w-20 h-28 lg:w-40 lg:h-56 flex-shrink-0 bg-stone-800 overflow-hidden rounded-sm">
                    {featuredGames[featuredIndex].coverImage && featuredGames[featuredIndex].coverImage !== '/images/default.svg' ? (
                      <img src={featuredGames[featuredIndex].coverImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl lg:text-4xl">🎮</div>
                    )}
                  </div>
                  {/* 文字 */}
                  <div className="flex-1 text-center lg:text-left">
                    <div className="text-xs text-stone-400 mb-1 tracking-wider uppercase font-number">Featured</div>
                    <h2 className="text-lg lg:text-3xl font-bold text-white mb-2 lg:mb-3 group-hover:underline tracking-wide">
                      {featuredGames[featuredIndex].title}
                    </h2>
                    <p className="text-sm text-stone-400 mb-3 lg:mb-4 line-clamp-2 hidden lg:block leading-relaxed">
                      {featuredGames[featuredIndex].description}
                    </p>
                    <div className="flex items-center justify-center lg:justify-start gap-3 text-xs text-stone-400 font-number">
                      <span>{featuredGames[featuredIndex].size}</span>
                      <span className="text-stone-600">·</span>
                      <span>{featuredGames[featuredIndex].category}</span>
                      <span className="text-stone-600">·</span>
                      <span>{featuredGames[featuredIndex].downloadCount.toLocaleString()} 次下载</span>
                    </div>
                  </div>
                </div>
                {/* 轮播指示器 */}
                {featuredGames.length > 1 && (
                  <div className="flex justify-center gap-1.5 pb-3 lg:pb-5">
                    {featuredGames.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => { e.preventDefault(); setFeaturedIndex(i) }}
                        className={`h-1 rounded-full transition-all ${
                          i === featuredIndex ? 'bg-white w-6' : 'bg-stone-600 w-1.5'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Link>
          </section>
        )}

        {/* 排序栏 */}
        <div className="flex items-center justify-between mb-5 lg:mb-6">
          <div className="flex gap-1 lg:gap-0">
            {sortOptions.map(opt => (
              <button
                key={opt.key}
                onClick={() => setSortBy(opt.key)}
                className={`px-3 lg:px-4 py-1.5 text-sm transition-colors ${
                  sortBy === opt.key
                    ? 'bg-[#1E3A5F] text-white lg:bg-transparent lg:text-[#1E3A5F] lg:border-b-2 lg:border-[#1E3A5F] font-medium'
                    : 'text-stone-500 hover:text-[#1C1917] lg:hover:text-[#1C1917]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-stone-400 flex-shrink-0 ml-3 font-number">
            {games.length} 款
          </span>
        </div>

        {/* 当前排序的游戏网格 */}
        <section className="mb-8 lg:mb-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
            {(sortBy === 'downloads' ? sortedByDownload : sortBy === 'newest' ? sortedByNewest : sortedByDownload).map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>

        {/* 编辑之选（横向滚动） */}
        {editorPicks.length > 0 && (
          <section className="mb-8 lg:mb-10">
            <div className="flex items-center justify-between mb-4 lg:mb-5">
              <SectionTitle title="编辑之选" />
            </div>
            <div className="flex gap-3 lg:gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
              {editorPicks.map(game => (
                <Link key={game.id} href={`/games/${game.id}`} className="flex-shrink-0 w-[140px] lg:w-[200px] group">
                  <article className="bg-white border border-stone-200 rounded-sm overflow-hidden hover:border-stone-400 transition-colors">
                    <div className="aspect-[4/3] bg-stone-100 overflow-hidden">
                      {game.coverImage && game.coverImage !== '/images/default.svg' ? (
                        <img src={game.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🎮</div>
                      )}
                    </div>
                    <div className="p-2 lg:p-3">
                      <h3 className="font-bold text-[#1C1917] text-xs lg:text-sm line-clamp-1">{game.title}</h3>
                      <p className="text-[10px] lg:text-xs text-stone-400 mt-0.5 font-number">{game.size}</p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 热门下载 */}
        <section className="mb-8 lg:mb-10">
          <SectionTitle title="热门下载" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
            {sortedByDownload.slice(0, 10).map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>

        {/* 最近上架 */}
        <section className="mb-8 lg:mb-10">
          <SectionTitle title="最近上架" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
            {sortedByNewest.slice(0, 10).map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>

        {/* 移动端底部间距（给固定导航让位） */}
        <div className="lg:hidden h-14" />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 构建验证**

```bash
cd "C:\Users\AGV\Desktop\WangPanWangZhan\game-site" && npx next build 2>&1 | tail -20
```

Expected: TypeScript passes.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: redesign homepage with magazine sections — editor picks scroll, section headers, editorial hero"
```

---

### Task 5: 全部游戏页 + 游戏详情页 样式跟随

**Files:**
- Modify: `app/games/page.tsx:74-127`
- Modify: `app/games/[id]/page.tsx:76-234`

- [ ] **Step 1: 更新 games/page.tsx 配色和样式**

修改 `app/games/page.tsx` 中的背景色、文字色、按钮色：

- `bg-gray-50` → `style={{ backgroundColor: '#FAFAF9' }}`
- `bg-white border-b border-gray-100` → `bg-white border-b border-stone-200`
- `text-gray-900` → `text-[#1C1917]`
- `text-gray-500` → `text-stone-500`
- `border-blue-500` → `border-[#1E3A5F]`
- `bg-blue-500` → `bg-[#1E3A5F]`，`hover:bg-blue-600` → `hover:bg-[#162d47]`
- `text-blue-500` → `text-[#1E3A5F]`
- `focus:ring-blue-500` → `focus:ring-[#1E3A5F]`
- `rounded-xl` → `rounded-sm`，`rounded-lg` → `rounded-sm`

- [ ] **Step 2: 更新 games/[id]/page.tsx 配色和样式**

同样替换所有 `gray-*`、`blue-*`、`rounded-*` 为品牌色。登录按钮 `from-blue-500 to-purple-600` 改为 `bg-[#1E3A5F] hover:bg-[#162d47]`。

详情页关键修改：
- 下载链接区 `bg-gray-50` → `bg-stone-50`
- 下载按钮 `bg-blue-500` → `bg-[#1E3A5F]`
- 面包屑 `text-blue-500` → `text-[#1E3A5F]`
- 标签 `bg-gradient-to-r from-red-500 to-orange-500` → `bg-red-600`
- 卡片 `rounded-2xl` → `rounded-sm`

- [ ] **Step 3: 构建验证**

```bash
cd "C:\Users\AGV\Desktop\WangPanWangZhan\game-site" && npx next build 2>&1 | tail -20
```

Expected: TypeScript passes.

- [ ] **Step 4: Commit**

```bash
git add app/games/page.tsx app/games/\[id\]/page.tsx
git commit -m "feat: update games list and detail pages with editorial color system"
```

---

### Task 6: 登录页 + 工具页 + Footer 样式跟随

**Files:**
- Modify: `app/login/page.tsx:52-156`
- Modify: `app/tools/page.tsx:60-148`
- Modify: `components/Footer.tsx`

- [ ] **Step 1: 更新 login/page.tsx — 去掉蓝紫渐变，用品牌色**

- Logo 图标区 `from-blue-500 to-purple-600` → `bg-[#1E3A5F]`
- 按钮 `from-blue-500 to-purple-600` → `bg-[#1E3A5F] hover:bg-[#162d47]`
- 所有 `gray-*` → `stone-*`
- 所有 `blue-*` → `[#1E3A5F]`
- `rounded-2xl` → `rounded-sm`，`rounded-xl` → `rounded-sm`

- [ ] **Step 2: 更新 tools/page.tsx — 工具列表配色跟随**

- `bg-gray-50` → `style={{ backgroundColor: '#FAFAF9' }}`
- `bg-white border-b border-gray-100` → `bg-white border-b border-stone-200`
- `bg-blue-500` → `bg-[#1E3A5F]`，`hover:bg-blue-600` → `hover:bg-[#162d47]`
- 所有 `text-gray-*` → `text-stone-*`
- `border-blue-200` → `border-stone-300`
- `rounded-full` → `rounded-sm`（分类筛选按钮）

- [ ] **Step 3: 更新 Footer.tsx — 配色跟随**

- `bg-gray-900` → `bg-[#1C1917]`
- `text-gray-400` → `text-stone-400`

- [ ] **Step 4: 构建验证**

```bash
cd "C:\Users\AGV\Desktop\WangPanWangZhan\game-site" && npx next build 2>&1 | tail -20
```

Expected: TypeScript passes, all pages generated.

- [ ] **Step 5: Commit**

```bash
git add app/login/page.tsx app/tools/page.tsx components/Footer.tsx
git commit -m "feat: update login, tools, footer with editorial branding"
```

---

### Task 7: 最终验收 — 全量构建 + 视觉检查

**Files:** (none, verification only)

- [ ] **Step 1: 全量构建**

```bash
cd "C:\Users\AGV\Desktop\WangPanWangZhan\game-site" && npx next build 2>&1 | tail -25
```

Expected: TypeScript 零错误，所有 24 页生成成功。

- [ ] **Step 2: 启动开发服务器目测**

```bash
cd "C:\Users\AGV\Desktop\WangPanWangZhan\game-site" && npm run dev
```

在浏览器依次检查：
1. 首页 — Hero 深色底、分区标题左侧竖线、编辑之选横向滚、卡片风格统一
2. 移动端（F12 切手机模式）— 汉堡菜单、底部导航三按钮、2 列网格
3. 全部游戏页 — 配色一致
4. 游戏详情页 — 下载按钮品牌色
5. 登录页 — 无蓝紫渐变
6. 工具页 — 配色一致

- [ ] **Step 3: 修复目测发现的问题**

如有视觉不一致，就地修复并重新构建验证。

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete editorial redesign — all pages migrated to brand system"
```
