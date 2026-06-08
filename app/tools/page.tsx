'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import SoftwareCard from '@/components/SoftwareCard'
import type { AndroidApp } from '@/lib/android'
import type { WindowsApp } from '@/lib/windows'

interface ToolItem {
  id: number
  name: string
  description: string
  coverImage: string
  category: string
  version?: string
  fileSize?: string
  downloadCount: number
  platform: 'Android' | 'Windows'
  originalSlug: string
}

const TABS = [
  { key: 'all', label: '全部' },
  { key: 'trainer', label: '游戏修改器' },
  { key: 'portable', label: '绿色软件' },
  { key: 'system', label: '系统工具' },
  { key: 'android', label: '安卓应用' },
  { key: 'windows', label: 'Windows软件' },
]

function ToolsContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') || 'all'
  const search = searchParams.get('search')

  const [items, setItems] = useState<ToolItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(tabParam)
  const [sortBy, setSortBy] = useState('default')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const PAGE_SIZES = [12, 20, 40, 60]

  useEffect(() => {
    async function fetchAll() {
      try {
        const [androidRes, windowsRes] = await Promise.all([
          fetch('/api/android'),
          fetch('/api/windows')
        ])
        const androidData = await androidRes.json()
        const windowsData = await windowsRes.json()

        const merged: ToolItem[] = [
          ...(androidData.apps || []).map((a: AndroidApp) => ({
            id: a.id, name: a.name, description: a.description,
            coverImage: a.coverImage, category: a.category,
            version: a.version, fileSize: a.fileSize,
            downloadCount: a.downloadCount, platform: 'Android' as const,
            originalSlug: 'android'
          })),
          ...(windowsData.apps || []).map((w: WindowsApp) => ({
            id: w.id, name: w.name, description: w.description,
            coverImage: w.coverImage, category: w.category,
            version: w.version, fileSize: w.fileSize,
            downloadCount: w.downloadCount, platform: 'Windows' as const,
            originalSlug: 'windows'
          }))
        ]
        setItems(merged)
      } catch (e) {
        console.error('Failed to fetch tools:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const filtered = items
    .filter(item => {
      if (search) {
        const q = search.toLowerCase()
        return item.name.toLowerCase().includes(q) ||
               item.description.toLowerCase().includes(q) ||
               item.category.toLowerCase().includes(q)
      }
      switch (activeTab) {
        case 'android': return item.platform === 'Android'
        case 'windows': return item.platform === 'Windows'
        case 'trainer': return /修改器|辅助|修改|trainer|cheat|存档/i.test(item.category)
        case 'portable': return /绿色|便携|portable|免安装|单文件/i.test(item.category)
        case 'system': return /系统|工具|优化|清理|驱动|磁盘/i.test(item.category)
        default: return true
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'hot': return b.downloadCount - a.downloadCount
        case 'new': return b.name.localeCompare(a.name)
        default: return 0
      }
    })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  useEffect(() => { setPage(1) }, [activeTab, search, sortBy])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A5F]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF9' }}>
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#1C1917] mb-2">
                {search ? `搜索：${search}` : '工具中心'}
              </h1>
              <p className="text-stone-500">共找到 {filtered.length} 款工具</p>
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
                <option value="new">按名称</option>
              </select>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 overflow-x-auto pb-1">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm rounded-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? 'bg-[#1E3A5F] text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="container mx-auto px-4 py-8">
        {filtered.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
              {paginated.map((item) => (
                <div key={`${item.originalSlug}-${item.id}`} className="relative">
                  <SoftwareCard app={item} href={`/${item.originalSlug}/${item.id}`} />
                  <span className={`absolute top-2 right-2 px-1.5 py-0.5 text-[10px] font-semibold rounded-sm ${
                    item.platform === 'Android' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                  }`}>
                    {item.platform}
                  </span>
                </div>
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
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage <= 1}
                    className="px-3 py-1.5 text-sm border border-stone-200 rounded-sm hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed">
                    上一页</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(n => n === 1 || n === totalPages || Math.abs(n - safePage) <= 1)
                    .reduce<(number | '...')[]>((acc, n, i, arr) => {
                      if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push('...')
                      acc.push(n); return acc
                    }, [])
                    .map((item, i) =>
                      item === '...' ? <span key={`dots-${i}`} className="px-2 text-stone-300 text-sm">...</span> :
                      <button key={item} onClick={() => setPage(item)}
                        className={`w-8 h-8 text-sm rounded-sm transition-colors font-number ${
                          safePage === item ? 'bg-[#1E3A5F] text-white' : 'border border-stone-200 hover:bg-stone-100 text-stone-600'
                        }`}>{item}</button>
                    )}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages}
                    className="px-3 py-1.5 text-sm border border-stone-200 rounded-sm hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed">
                    下一页</button>
                </div>
                <div className="flex items-center gap-2 text-sm text-stone-500">
                  <span>每页</span>
                  <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
                    className="px-2 py-1.5 border border-stone-200 rounded-sm text-sm focus:outline-none">
                    {PAGE_SIZES.map(s => (<option key={s} value={s}>{s}</option>))}
                  </select>
                  <span>款</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <h2 className="text-xl font-semibold text-[#1C1917] mb-2">没有找到工具</h2>
            <p className="text-stone-500 mb-6">尝试切换分类或搜索关键词</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ToolsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A5F]"></div>
      </div>
    }>
      <ToolsContent />
    </Suspense>
  )
}

