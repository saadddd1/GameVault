'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { getThumbPath } from '@/lib/image-paths'
import type { Mod } from '@/lib/mod'

function ModCard({ mod }: { mod: Mod }) {
  return (
    <Link href={`/mods/${mod.id}`} className="group block">
      <article className="bg-white border border-stone-200 rounded-sm overflow-hidden hover:border-stone-400 transition-colors duration-200">
        <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
          {mod.coverImage && mod.coverImage !== '/images/default.svg' ? (
            <img src={getThumbPath(mod.coverImage)} alt={mod.title} width={400} height={300} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">{'⚙'}</div>
          )}
          <div className="absolute top-2 left-2 flex gap-1.5">
            <span className="px-2 py-0.5 bg-[#1E3A5F] text-white text-[11px] font-semibold rounded-sm">{mod.category}</span>
          </div>
        </div>
        <div className="p-3 lg:p-4">
          <h3 className="font-bold text-[#1C1917] mb-1 line-clamp-1 text-sm">{mod.title}</h3>
          <p className="text-xs text-stone-500 mb-1">{mod.gameName}</p>
          <p className="text-xs text-stone-400 mb-2 line-clamp-2">{mod.description}</p>
          <div className="flex items-center justify-between text-xs text-stone-400 font-number">
            <span>{mod.downloadCount.toLocaleString()} 次下载</span>
            <span>{mod.fileSize}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}

function ModsContent() {
  const searchParams = useSearchParams()
  const category = searchParams.get('category')
  const game = searchParams.get('game')
  const search = searchParams.get('search')
  const sort = searchParams.get('sort')

  const [mods, setMods] = useState<Mod[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [games, setGames] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState(sort || 'default')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const PAGE_SIZES = [12, 20, 40, 60]

  useEffect(() => {
    fetch('/api/mods')
      .then(r => r.json())
      .then(data => {
        if (data.mods) { setMods(data.mods); setCategories(data.categories || []); setGames(data.games || []) }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = mods
    .filter(m => {
      if (category && m.category !== category) return false
      if (game && m.gameName !== game) return false
      if (search) {
        const q = search.toLowerCase()
        return m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)
      }
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'hot': return b.downloadCount - a.downloadCount
        case 'new': return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        default: return 0
      }
    })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  useEffect(() => { setPage(1) }, [category, game, search, sortBy])

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A5F]"></div></div>
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF9' }}>
      <div className="bg-white border-b border-stone-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#1C1917] mb-2">{category || game || (search ? `搜索：${search}` : '游戏MOD')}</h1>
              <p className="text-stone-500">共找到 {filtered.length} 个MOD</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {categories.length > 0 && (
                <select
                  value={category || ''}
                  onChange={(e) => { const v = e.target.value; window.location.search = v ? `?category=${v}` : '' }}
                  className="px-3 py-2 bg-white border border-stone-200 rounded-sm text-sm"
                >
                  <option value="">全部分类</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
              {games.length > 0 && (
                <select
                  value={game || ''}
                  onChange={(e) => { const v = e.target.value; window.location.search = v ? `?game=${v}` : '' }}
                  className="px-3 py-2 bg-white border border-stone-200 rounded-sm text-sm"
                >
                  <option value="">全部游戏</option>
                  {games.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              )}
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 bg-white border border-stone-200 rounded-sm text-sm">
                <option value="default">默认排序</option>
                <option value="hot">最热门</option>
                <option value="new">最新发布</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {filtered.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
              {paginated.map(mod => <ModCard key={mod.id} mod={mod} />)}
            </div>
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-sm text-stone-500 font-number">第 {safePage}/{totalPages} 页</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage <= 1} className="px-3 py-1.5 text-sm border border-stone-200 rounded-sm hover:bg-stone-100 disabled:opacity-30">上一页</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(n => n === 1 || n === totalPages || Math.abs(n - safePage) <= 1)
                    .reduce<(number | '...')[]>((acc, n, i, arr) => { if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push('...'); acc.push(n); return acc }, [])
                    .map((item, i) => item === '...' ? <span key={i} className="px-2 text-stone-300 text-sm">...</span> : <button key={item} onClick={() => setPage(item)} className={`w-8 h-8 text-sm rounded-sm font-number ${safePage === item ? 'bg-[#1E3A5F] text-white' : 'border border-stone-200 hover:bg-stone-100 text-stone-600'}`}>{item}</button>)}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages} className="px-3 py-1.5 text-sm border border-stone-200 rounded-sm hover:bg-stone-100 disabled:opacity-30">下一页</button>
                </div>
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }} className="px-2 py-1.5 border border-stone-200 rounded-sm text-sm">
                  {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-stone-500">
            <p className="text-xl mb-2">没有找到MOD</p>
            <Link href="/mods" className="text-[#1E3A5F] hover:underline">查看全部</Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ModsPage() {
  return <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A5F]"></div></div>}><ModsContent /></Suspense>
}
