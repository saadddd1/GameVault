'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Tool } from '@/lib/tool'

const languageColors: Record<string, string> = {
  'C++': 'bg-pink-100 text-pink-700',
  'C#': 'bg-green-100 text-green-700',
  'TypeScript': 'bg-stone-100 text-stone-700',
  'JavaScript': 'bg-yellow-100 text-yellow-700',
  'Python': 'bg-cyan-100 text-cyan-700',
  'Java': 'bg-orange-100 text-orange-700',
}

function formatStars(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState('全部')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const PAGE_SIZES = [10, 20, 30]

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/tools')
        const data = await res.json()
        if (data.tools) setTools(data.tools)
        if (data.categories) setCategories(data.categories)
      } catch {
        console.error('获取工具列表失败')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filtered = activeCategory === '全部'
    ? tools
    : tools.filter(t => t.category === activeCategory)

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paginatedTools = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  // Reset page when filter changes
  useEffect(() => {
    setPage(1)
  }, [activeCategory])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" style={{ backgroundColor: '#FAFAF9' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A5F]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF9' }}>
      <div className="bg-white border-b border-stone-200">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <h1 className="text-2xl lg:text-3xl font-bold text-[#1C1917] mb-2">
            开源工具
          </h1>
          <p className="text-stone-500">
            GitHub 热门开源游戏工具 — 引擎、框架、模拟器、启动器
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* 分类筛选 */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-sm rounded-sm whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-[#1E3A5F] text-white'
                  : 'bg-white text-stone-500 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 工具卡片列表 */}
        {paginatedTools.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedTools.map(tool => (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.id}`}
                  className="block bg-white rounded-sm border border-stone-200 p-5 hover:border-stone-300 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-[#1C1917] group-hover:text-[#1E3A5F] transition-colors">
                      {tool.name}
                    </h3>
                    <span className="flex items-center gap-1 text-xs text-yellow-600 flex-shrink-0 ml-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      {formatStars(tool.stars)}
                    </span>
                  </div>

                  <p className="text-sm text-stone-500 mb-3 line-clamp-2">
                    {tool.description}
                  </p>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 text-xs bg-stone-100 text-stone-500 rounded-sm">
                      {tool.category}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded-sm ${languageColors[tool.language] || 'bg-stone-100 text-stone-500'}`}>
                      {tool.language}
                    </span>
                    {tool.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="px-2 py-0.5 text-xs bg-stone-100 text-[#1E3A5F] rounded-sm">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-stone-400">
                    <div className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                      查看详情
                    </div>
                    <span>{tool.downloadCount.toLocaleString()} 次下载</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-1 text-sm text-stone-500 font-number">
                  <span>共 {filtered.length} 个工具</span>
                  <span className="text-stone-300">·</span>
                  <span>第 {safePage}/{totalPages} 页</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                    className="px-3 py-1.5 text-sm border border-stone-200 rounded-sm hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    上一页
                  </button>
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
                            safePage === item
                              ? 'bg-[#1E3A5F] text-white'
                              : 'border border-stone-200 hover:bg-stone-100 text-stone-600'
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={safePage >= totalPages}
                    className="px-3 py-1.5 text-sm border border-stone-200 rounded-sm hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    下一页
                  </button>
                </div>

                <div className="flex items-center gap-2 text-sm text-stone-500">
                  <span>每页</span>
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
                    className="px-2 py-1.5 border border-stone-200 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]"
                  >
                    {PAGE_SIZES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <span>个</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-stone-500">
            暂无该分类的工具
          </div>
        )}
      </div>
    </div>
  )
}
