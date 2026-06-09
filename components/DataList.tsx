'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Pagination from './Pagination'
import ErrorState from './ErrorState'

export interface DataListConfig {
  /** 页面标题 */
  title: (category: string | null, search: string | null) => string
  /** 空状态文案 */
  emptyTitle: string
  emptyDesc: string
  emptyLink: string
  emptyLinkText: string
  /** 数量单位，如 '款游戏' */
  unit: string
  /** API 路径 */
  apiUrl: string
  /** 数据在响应中的 key */
  dataKey: string
  /** 卡片 href 前缀 */
  hrefPrefix: string
  /** 搜索字段 */
  searchFields: string[]
  /** 排序选项 */
  sortOptions: { value: string; label: string }[]
  /** 额外过滤条件（如 MOD 按游戏名过滤） */
  extraFilter?: (item: unknown, params: URLSearchParams) => boolean
  /** 渲染卡片 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderCard: (item: any) => React.ReactNode
}

interface Props {
  config: DataListConfig
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sortItems(items: any[], sortBy: string): any[] {
  const sorted = [...items]
  switch (sortBy) {
    case 'hot': return sorted.sort((a, b) => b.downloadCount - a.downloadCount)
    case 'new': return sorted.sort((a, b) => new Date(b.updatedAt || b.updateDate).getTime() - new Date(a.updatedAt || a.updateDate).getTime())
    case 'name': return sorted.sort((a, b) => (a.name || a.title || '').localeCompare(b.name || b.title || ''))
    default: return sorted
  }
}

export default function DataList({ config }: Props) {
  const searchParams = useSearchParams()
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const sort = searchParams.get('sort')

  const [items, setItems] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [sortBy, setSortBy] = useState(sort || config.sortOptions[0]?.value || 'default')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  useEffect(() => {
    fetch(config.apiUrl)
      .then(r => r.json())
      .then(data => { if (data[config.dataKey]) setItems(data[config.dataKey]) })
      .catch(e => { console.error('DataList fetch failed:', e); setError(true) })
      .finally(() => setLoading(false))
  }, [config.apiUrl, config.dataKey])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filtered = items.filter((item: any) => {
    if (category && item.category !== category) return false
    if (config.extraFilter && !config.extraFilter(item, searchParams)) return false
    if (search) {
      const q = search.toLowerCase()
      return config.searchFields.some(f => {
        const val = (item as Record<string, unknown>)[f]
        return typeof val === 'string' && val.toLowerCase().includes(q)
      })
    }
    return true
  })

  const sorted = sortItems(filtered, sortBy)
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paginated = sorted.slice((safePage - 1) * pageSize, safePage * pageSize)

  useEffect(() => { setPage(1) }, [category, search, sortBy])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A5F]"></div>
      </div>
    )
  }

  if (error) {
    return <ErrorState onRetry={() => { setError(false); setLoading(true); }} />
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF9' }}>
      <div className="bg-white border-b border-stone-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#1C1917] mb-2">
                {config.title(category, search)}
              </h1>
              <p className="text-stone-500">共找到 {filtered.length} {config.unit}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-stone-500">排序：</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white border border-stone-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]">
                {config.sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {filtered.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
              {paginated.map((item: unknown) => config.renderCard(item))}
            </div>
            <Pagination
              total={filtered.length} page={safePage} pageSize={pageSize}
              unit={config.unit} onPageChange={setPage} onPageSizeChange={s => { setPageSize(s); setPage(1) }}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="w-20 h-20 text-stone-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-[#1C1917] mb-2">{config.emptyTitle}</h2>
            <p className="text-stone-500 mb-6">{config.emptyDesc}</p>
            <Link href={config.emptyLink} className="px-6 py-3 bg-[#1E3A5F] text-white rounded-sm hover:bg-[#162d47] transition-colors">
              {config.emptyLinkText}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
