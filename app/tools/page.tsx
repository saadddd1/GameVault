'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import SoftwareCard from '@/components/SoftwareCard'
import Pagination from '@/components/Pagination'
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
  { key: 'windows', label: 'Windows' },
  { key: 'android', label: '安卓' },
]

const PAGE_SIZES = [12, 20, 40, 60]

function ToolsContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') || 'windows'
  const search = searchParams.get('search')

  const [items, setItems] = useState<ToolItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(tabParam)
  const [sortBy, setSortBy] = useState('default')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

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
      if (item.platform !== (activeTab === 'windows' ? 'Windows' : 'Android')) return false
      if (search) {
        const q = search.toLowerCase()
        return item.name.toLowerCase().includes(q) ||
               item.description.toLowerCase().includes(q) ||
               item.category.toLowerCase().includes(q)
      }
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'hot': return b.downloadCount - a.downloadCount
        case 'name': return a.name.localeCompare(b.name)
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
      <div className="bg-white border-b border-stone-200">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-[#1C1917] mb-1">
            {search ? `搜索：${search}` : '工具中心'}
          </h1>
          <p className="text-stone-500 text-sm mb-4">共找到 {filtered.length} 款工具</p>

          {/* Tabs + Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex gap-1">
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

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-white border border-stone-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] sm:ml-auto"
            >
              <option value="default">默认排序</option>
              <option value="hot">最热门</option>
              <option value="name">按名称</option>
            </select>
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
                    item.platform === 'Android' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
                  }`}>
                    {item.platform}
                  </span>
                </div>
              ))}
            </div>

            <Pagination
              total={filtered.length}
              page={safePage}
              pageSize={pageSize}
              pageSizes={PAGE_SIZES}
              unit="款"
              onPageChange={setPage}
              onPageSizeChange={(s) => { setPageSize(s); setPage(1) }}
            />
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
