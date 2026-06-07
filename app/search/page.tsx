'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface SearchResult {
  games: any[]
  mods: any[]
  android: any[]
  windows: any[]
}

type Tab = 'all' | 'games' | 'mods' | 'android' | 'windows'

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const q = searchParams.get('q') || ''
  const [results, setResults] = useState<SearchResult>({ games: [], mods: [], android: [], windows: [] })
  const [hot, setHot] = useState<{ query: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [searchInput, setSearchInput] = useState(q)

  useEffect(() => {
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(d => { setResults(d.results || { games: [], mods: [], android: [], windows: [] }); setHot(d.hot || []) })
      .finally(() => setLoading(false))
  }, [q])

  const totalCount = results.games.length + results.mods.length + results.android.length + results.windows.length

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF9' }}>
      {/* 搜索头部 */}
      <div className="bg-white border-b border-stone-200">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="搜索游戏、MOD、安卓、Windows..."
                className="flex-1 px-4 py-3 border border-stone-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                autoFocus
              />
              <button type="submit" className="px-6 py-3 bg-[#1E3A5F] text-white rounded-sm font-medium hover:bg-[#162d47]">
                搜索
              </button>
            </div>
          </form>

          {/* 热门搜索 */}
          {hot.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-stone-400">热门搜索：</span>
              {hot.map((h, i) => (
                <Link
                  key={i}
                  href={`/search?q=${encodeURIComponent(h.query)}`}
                  className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-xs text-stone-600 rounded-sm transition-colors"
                >
                  {h.query}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1E3A5F]"></div>
          </div>
        ) : q.length < 2 ? (
          <div className="text-center py-16 text-stone-400">
            <p className="text-lg mb-2">输入关键词开始搜索</p>
            <p className="text-sm">支持搜索游戏、MOD、安卓软件、Windows软件</p>
          </div>
        ) : (
          <>
            {/* 结果统计 */}
            <div className="mb-6">
              <p className="text-stone-500">
                搜索 &quot;{q}&quot; 找到 <span className="text-[#1C1917] font-bold">{totalCount}</span> 个结果
              </p>
            </div>

            {/* 分类标签 */}
            <div className="flex gap-2 mb-6 border-b border-stone-200 pb-2 overflow-x-auto">
              {([
                { key: 'all', label: '全部', count: totalCount },
                { key: 'games', label: '游戏', count: results.games.length },
                { key: 'mods', label: 'MOD', count: results.mods.length },
                { key: 'android', label: '安卓', count: results.android.length },
                { key: 'windows', label: 'Windows', count: results.windows.length },
              ] as { key: Tab; label: string; count: number }[]).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 text-sm rounded-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.key ? 'bg-[#1E3A5F] text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {/* 搜索结果列表 */}
            {totalCount === 0 ? (
              <div className="text-center py-16 text-stone-400">
                <p className="text-lg mb-2">没有找到相关内容</p>
                <p className="text-sm">试试其他关键词</p>
              </div>
            ) : (
              <div className="space-y-2">
                {(activeTab === 'all' || activeTab === 'games') && results.games.length > 0 && (
                  <>
                    {activeTab === 'all' && <h3 className="text-sm font-semibold text-stone-500 pt-2 pb-1">游戏</h3>}
                    {results.games.map(item => (
                      <Link key={`g-${item.id}`} href={`/games/${item.id}`} className="block bg-white border border-stone-200 rounded-sm p-4 hover:border-stone-400 transition-colors">
                        <div className="flex gap-3">
                          <div className="w-12 h-16 bg-stone-100 rounded-sm flex-shrink-0 overflow-hidden">
                            {item.coverImage && item.coverImage !== '/images/default.svg' ? <img src={item.coverImage} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg">{'\u{1F3AE}'}</div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-[#1C1917] text-sm">{item.title}</h4>
                            <p className="text-xs text-stone-400 mt-1 line-clamp-1">{item.description}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-stone-400">
                              <span className="px-1.5 py-0.5 bg-stone-100 rounded-sm">{item.category}</span>
                              <span>{item.downloadCount.toLocaleString()} 次下载</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </>
                )}

                {(activeTab === 'all' || activeTab === 'mods') && results.mods.length > 0 && (
                  <>
                    {activeTab === 'all' && <h3 className="text-sm font-semibold text-stone-500 pt-2 pb-1">MOD</h3>}
                    {results.mods.map(item => (
                      <Link key={`m-${item.id}`} href={`/mods/${item.id}`} className="block bg-white border border-stone-200 rounded-sm p-4 hover:border-stone-400 transition-colors">
                        <div className="flex gap-3">
                          <div className="w-12 h-16 bg-stone-100 rounded-sm flex-shrink-0 overflow-hidden">
                            {item.coverImage && item.coverImage !== '/images/default.svg' ? <img src={item.coverImage} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg">{'⚙'}</div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-[#1C1917] text-sm">{item.title}</h4>
                            <p className="text-xs text-stone-400 mt-1">{item.gameName} · {item.category}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </>
                )}

                {(activeTab === 'all' || activeTab === 'android') && results.android.length > 0 && (
                  <>
                    {activeTab === 'all' && <h3 className="text-sm font-semibold text-stone-500 pt-2 pb-1">安卓软件</h3>}
                    {results.android.map(item => (
                      <Link key={`a-${item.id}`} href={`/android/${item.id}`} className="block bg-white border border-stone-200 rounded-sm p-4 hover:border-stone-400 transition-colors">
                        <div className="flex gap-3">
                          <div className="w-12 h-16 bg-stone-100 rounded-sm flex-shrink-0 overflow-hidden">
                            {item.coverImage && item.coverImage !== '/images/default.svg' ? <img src={item.coverImage} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg">{'📱'}</div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-[#1C1917] text-sm">{item.name}</h4>
                            <p className="text-xs text-stone-400 mt-1 line-clamp-1">{item.description}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-stone-400">
                              <span className="px-1.5 py-0.5 bg-stone-100 rounded-sm">{item.category}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </>
                )}

                {(activeTab === 'all' || activeTab === 'windows') && results.windows.length > 0 && (
                  <>
                    {activeTab === 'all' && <h3 className="text-sm font-semibold text-stone-500 pt-2 pb-1">Windows软件</h3>}
                    {results.windows.map(item => (
                      <Link key={`w-${item.id}`} href={`/windows/${item.id}`} className="block bg-white border border-stone-200 rounded-sm p-4 hover:border-stone-400 transition-colors">
                        <div className="flex gap-3">
                          <div className="w-12 h-16 bg-stone-100 rounded-sm flex-shrink-0 overflow-hidden">
                            {item.coverImage && item.coverImage !== '/images/default.svg' ? <img src={item.coverImage} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg">{'🖥'}</div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-[#1C1917] text-sm">{item.name}</h4>
                            <p className="text-xs text-stone-400 mt-1 line-clamp-1">{item.description}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-stone-400">
                              <span className="px-1.5 py-0.5 bg-stone-100 rounded-sm">{item.category}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A5F]"></div></div>}>
      <SearchContent />
    </Suspense>
  )
}
