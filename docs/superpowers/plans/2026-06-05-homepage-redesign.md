# 首页重设计 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 精简首页为单栏布局（精选 Hero + 排序栏 + 游戏网格），去掉侧栏排行榜和推荐区，优化移动端。

**Architecture:** 重写 `app/page.tsx`，新增 `isFeatured` 字段到 Game 模型，排序栏融合排行榜功能。移动端通过 Tailwind 响应式类适配。

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, TypeScript

---

### Task 1: 给 Game 模型加 isFeatured 字段

**Files:**
- Modify: `lib/games.ts`
- Modify: `data/games.json`
- Modify: `app/api/games/route.ts`
- Modify: `app/api/games/import/route.ts`

- [ ] **Step 1: 更新 Game interface 和 addGame**

`lib/games.ts` 第 4-21 行，在 Game interface 中加 `isFeatured: boolean`，addGame 默认值：

```typescript
export interface Game {
  id: number
  title: string
  description: string
  coverImage: string
  size: string
  category: string
  downloadLinks: {
    platform: string
    url: string
    password: string
  }[]
  releaseDate: string
  updateDate: string
  downloadCount: number
  isHot: boolean
  isNew: boolean
  isFeatured: boolean
}
```

`addGame` 函数中添加：
```typescript
isFeatured: game.isFeatured !== undefined ? game.isFeatured : false
```

- [ ] **Step 2: 更新 data/games.json**

给每个现有游戏加 `"isFeatured": false`，同时把前 2 个设为 true 作为初始精选数据。

```bash
cd game-site && node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/games.json', 'utf-8'));
data.games = data.games.map((g, i) => ({ ...g, isFeatured: i < 2 }));
fs.writeFileSync('data/games.json', JSON.stringify(data, null, 2));
console.log('done');
"
```

- [ ] **Step 3: 更新 API 路由**

`app/api/games/route.ts` POST handler 第 28-40 行，加 `isFeatured`：

```typescript
isFeatured: body.isFeatured !== undefined ? body.isFeatured : false
```

PUT handler 也需要支持更新 `isFeatured`（已使用 spread `...updates`，自动支持）。

`app/api/games/import/route.ts` 第 97-109 行，addGame 调用中加：

```typescript
isFeatured: row['是否精选'] === '是' || row['isFeatured'] === 'true' || false
```

- [ ] **Step 4: 提交**

```bash
git add -A && git commit -m "feat: add isFeatured field to Game model"
```

---

### Task 2: 管理后台支持精选标记

**Files:**
- Modify: `app/admin/games/add/page.tsx`
- Modify: `app/admin/games/[id]/edit/page.tsx`
- Modify: `app/admin/games/page.tsx`

- [ ] **Step 1: 添加游戏表单加精选复选框**

`app/admin/games/add/page.tsx`，在 isNew checkbox 旁边加：

```tsx
const [formData, setFormData] = useState({
  // ...existing fields...
  isHot: false,
  isNew: true,
  isFeatured: false
})
```

在标记选项区域（isNew 后面）加：
```tsx
<label className="flex items-center gap-2 cursor-pointer">
  <input
    type="checkbox"
    name="isFeatured"
    checked={formData.isFeatured}
    onChange={handleChange}
    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
  />
  <span className="text-sm text-gray-700">标记为精选</span>
</label>
```

提交时 `gameData` 中加 `isFeatured: formData.isFeatured`。

- [ ] **Step 2: 编辑页同样加精选复选框**

`app/admin/games/[id]/edit/page.tsx`，formData 初始化和 fetch 中加 `isFeatured`，表单中加同样的复选框。

- [ ] **Step 3: 管理列表页显示精选标签**

`app/admin/games/page.tsx`，在状态列加精选标签：

```tsx
{game.isFeatured && (
  <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
    精选
  </span>
)}
```

- [ ] **Step 4: 提交**

```bash
git add -A && git commit -m "feat: add featured checkbox to admin game forms"
```

---

### Task 3: 重写首页

**Files:**
- Modify: `app/page.tsx`（几乎全部重写）
- Modify: `app/globals.css`（如有需要的新动画/样式）

- [ ] **Step 1: 重写 app/page.tsx**

完整重写为三区域：精选 Hero + 排序栏 + 游戏网格。代码：

```tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import GameCard from '@/components/GameCard'

interface Game {
  id: number
  title: string
  description: string
  coverImage: string
  size: string
  category: string
  downloadLinks: { platform: string; url: string; password: string }[]
  releaseDate: string
  updateDate: string
  downloadCount: number
  isHot: boolean
  isNew: boolean
  isFeatured: boolean
}

type SortKey = 'downloads' | 'newest' | 'featured'

const sortOptions: { key: SortKey; label: string; icon: string }[] = [
  { key: 'downloads', label: '下载排行', icon: '' },
  { key: 'newest', label: '最新上架', icon: '' },
  { key: 'featured', label: '精选推荐', icon: '' },
]

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

  // 精选游戏（管理员标记）
  const featuredGames = games.filter(g => g.isFeatured)

  // 自动轮播
  useEffect(() => {
    if (featuredGames.length <= 1) return
    const timer = setInterval(() => {
      setFeaturedIndex(prev => (prev + 1) % featuredGames.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [featuredGames.length])

  const sortedGames = [...games].sort((a, b) => {
    switch (sortBy) {
      case 'downloads': return b.downloadCount - a.downloadCount
      case 'newest': return new Date(b.updateDate).getTime() - new Date(a.updateDate).getTime()
      case 'featured': return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)
      default: return 0
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4 lg:py-6 max-w-6xl">

        {/* 精选推荐 Hero */}
        {featuredGames.length > 0 && (
          <section className="mb-6">
            <Link href={`/games/${featuredGames[featuredIndex].id}`}>
              <div className="relative rounded-xl lg:rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
                <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-8 p-5 lg:p-8">
                  {/* 封面 */}
                  <div className="w-20 h-28 lg:w-36 lg:h-48 flex-shrink-0 bg-white/10 rounded-lg overflow-hidden">
                    {featuredGames[featuredIndex].coverImage && featuredGames[featuredIndex].coverImage !== '/images/default.svg' ? (
                      <img src={featuredGames[featuredIndex].coverImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">🎮</div>
                    )}
                  </div>
                  {/* 信息 */}
                  <div className="flex-1 text-center lg:text-left">
                    <div className="text-xs text-white/50 mb-1">⭐ 精选推荐</div>
                    <h2 className="text-lg lg:text-2xl font-bold mb-2">{featuredGames[featuredIndex].title}</h2>
                    <p className="text-sm text-white/60 mb-3 line-clamp-2 hidden lg:block">
                      {featuredGames[featuredIndex].description}
                    </p>
                    <div className="flex items-center justify-center lg:justify-start gap-3 text-xs text-white/50">
                      <span>{featuredGames[featuredIndex].size}</span>
                      <span>{featuredGames[featuredIndex].category}</span>
                      <span>{featuredGames[featuredIndex].downloadCount.toLocaleString()} 次下载</span>
                    </div>
                  </div>
                </div>
                {/* 轮播指示器 */}
                {featuredGames.length > 1 && (
                  <div className="flex justify-center gap-1.5 pb-3 lg:pb-4">
                    {featuredGames.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => { e.preventDefault(); setFeaturedIndex(i) }}
                        className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full transition-all ${
                          i === featuredIndex ? 'bg-white w-4 lg:w-6' : 'bg-white/30'
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1 lg:gap-0 overflow-x-auto pb-1 lg:pb-0">
            {sortOptions.map(opt => (
              <button
                key={opt.key}
                onClick={() => setSortBy(opt.key)}
                className={`px-3 lg:px-4 py-2 text-sm rounded-full lg:rounded-none lg:rounded-t-lg whitespace-nowrap transition-colors ${
                  sortBy === opt.key
                    ? 'bg-blue-500 text-white lg:bg-white lg:text-blue-500 lg:border-b-2 lg:border-blue-500 font-medium'
                    : 'bg-white text-gray-600 hover:text-gray-900 lg:bg-transparent'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <span className="text-xs lg:text-sm text-gray-500 flex-shrink-0 ml-3">
            共 {games.length} 款
          </span>
        </div>

        {/* 游戏网格 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
          {sortedGames.map(game => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>

        {/* 移动端底部导航 */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-200 z-50">
          <div className="flex justify-around py-2">
            <Link href="/" className="flex flex-col items-center px-4 py-1 text-xs text-blue-500">
              <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              首页
            </Link>
            <Link href="/games" className="flex flex-col items-center px-4 py-1 text-xs text-gray-500">
              <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              游戏
            </Link>
            <Link href="/login" className="flex flex-col items-center px-4 py-1 text-xs text-gray-500">
              <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              我的
            </Link>
          </div>
        </nav>

        {/* 移动端底部导航占位 */}
        <div className="lg:hidden h-14"></div>

      </div>
    </div>
  )
}
```

- [ ] **Step 2: 验证本地运行**

```bash
npm run dev
```
打开 http://localhost:3000 确认：
- 精选 Hero 正常显示
- 排序栏三个选项可切换
- 游戏网格正常展示
- 移动端（Chrome DevTools 375px）底部导航可见

- [ ] **Step 3: 提交**

```bash
git add -A && git commit -m "feat: redesign homepage - single column, featured hero, mobile nav"
```

---

### Task 4: 完善响应式细节

**Files:**
- Modify: `components/Header.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Header 移动端隐藏桌面导航中的搜索**

Header 已有移动端适配，但搜索框在移动端隐藏。确认 `hidden sm:flex` 生效即可。

- [ ] **Step 2: 给移动端底部导航的 body 加 padding**

在 `globals.css` 末尾加：
```css
@media (max-width: 1023px) {
  body {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
```

- [ ] **Step 3: 提交**

```bash
git add -A && git commit -m "fix: mobile responsive polish"
```

---

### Task 5: 最终验证

- [ ] **Step 1: 完整流程测试**

```bash
npm run build && npm run lint
```
确认无错误。

- [ ] **Step 2: 浏览器验证**

- 桌面端 1440px：Hero + 排序栏 + 5 列网格
- 平板 768px：Hero + 排序栏 + 3 列网格
- 手机 375px：Hero + pill 排序 + 2 列网格 + 底部导航

- [ ] **Step 3: 提交推送**

```bash
git add -A && git commit -m "chore: final verification" && git push origin master
```
