'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import SoftwareCard from '@/components/SoftwareCard'
import type { AndroidApp } from '@/lib/android'

function AndroidContent() {
  const searchParams = useSearchParams()
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const sort = searchParams.get('sort')

  const [apps, setApps] = useState<AndroidApp[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<string>(sort || 'default')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const PAGE_SIZES = [12, 20, 40, 60]

  const fetchApps = async () => {
    try {
      const response = await fetch('/api/android')
      const data = await response.json()
      if (data.apps) setApps(data.apps)
    } catch (error) {
      console.error('获取安卓应用失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    fetchApps()
  }, [])

  const filtered = apps
    .filter(app => {
      if (category && app.category !== category) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          app.name.toLowerCase().includes(q) ||
          app.description.toLowerCase().includes(q) ||
          app.category.toLowerCase().includes(q)
        )
      }
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'hot': return b.downloadCount - a.downloadCount
        case 'new': return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case 'name': return a.name.localeCompare(b.name)
        default: return 0
      }
    })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  useEffect(() => { setPage(1) }, [category, search, sortBy])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A5F]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF9' }}>
      <div className="bg-white border-b border-stone-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#1C1917] mb-2">
                {category || (search ? `搜索：${search}` : '安卓软件')}
              </h1>
              <p className="text-stone-500">共找到 {filtered.length} 款应用</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-stone-500">排序：</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white border border-stone-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
              >
                <option value="default">默认排序</option>
                <option value="hot">最热门</option>
                <option value="new">最新发布</option>
                <option value="name">按名称</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {filtered.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
              {paginated.map((app) => (
                <SoftwareCard key={app.id} app={app} href={`/android/${app.id}`} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-1 text-sm text-stone-500 font-number">
                  <span>共 {filtered.length} 款</span>
                  <span className="text-stone-300">·</span>
                  <span>第 {safePage}/{totalPages} 页</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                    className="px-3 py-1.5 text-sm border border-stone-200 rounded-sm hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >上一页</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(n => n === 1 || n === totalPages || Math.abs(n - safePage) <= 1)
                    .reduce<(number | '...')[]>((acc, n, i, arr) => {
                      if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push('...')
                      acc.push(n)
                      return acc
                    }, [])
                    .map((item, i) =>
                      item === '...' ? (
                        <span key={`dots-${i}`} className="px-2 text-stone-300 text-sm">...</span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setPage(item)}
                          className={`w-8 h-8 text-sm rounded-sm transition-colors font-number ${
                            safePage === item ? 'bg-[#1E3A5F] text-white' : 'border border-stone-200 hover:bg-stone-100 text-stone-600'
                          }`}
                        >{item}</button>
                      )
                    )}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={safePage >= totalPages}
                    className="px-3 py-1.5 text-sm border border-stone-200 rounded-sm hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >下一页</button>
                </div>
                <div className="flex items-center gap-2 text-sm text-stone-500">
                  <span>每页</span>
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
                    className="px-2 py-1.5 border border-stone-200 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]"
                  >
                    {PAGE_SIZES.map(s => (<option key={s} value={s}>{s}</option>))}
                  </select>
                  <span>款</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="w-20 h-20 text-stone-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-[#1C1917] mb-2">没有找到应用</h2>
            <p className="text-stone-500 mb-6">尝试更换筛选条件</p>
            <Link href="/android" className="px-6 py-3 bg-[#1E3A5F] text-white rounded-sm hover:bg-[#162d47] transition-colors">
              查看全部
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AndroidPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A5F]"></div>
      </div>
    }>
      <AndroidContent />
    </Suspense>
  )
}
