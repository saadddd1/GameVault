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
}

// 排序选项
const sortOptions = [
  { value: 'update', label: '最近更新' },
  { value: 'release', label: '最近发行' },
  { value: 'week', label: '本周最热' },
  { value: 'month', label: '本月最热' },
  { value: 'all', label: '历史最热' },
]

export default function HomePage() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSort, setActiveSort] = useState('update')
  const [activeHotTab, setActiveHotTab] = useState<'week' | 'month' | 'all'>('week')

  useEffect(() => {
    fetchGames()
  }, [])

  const fetchGames = async () => {
    try {
      const response = await fetch('/api/games')
      const data = await response.json()
      if (data.games) {
        setGames(data.games)
      }
    } catch (error) {
      console.error('获取游戏失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 获取热门游戏排行
  const getHotGames = (type: 'week' | 'month' | 'all') => {
    return [...games]
      .sort((a, b) => b.downloadCount - a.downloadCount)
      .slice(0, 12)
  }

  // 获取新游推荐
  const getNewGames = () => {
    return [...games]
      .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
      .slice(0, 10)
  }

  // 筛选和排序游戏列表
  const getFilteredGames = () => {
    let filtered = [...games]
    
    // 排序
    switch (activeSort) {
      case 'update':
        filtered.sort((a, b) => new Date(b.updateDate).getTime() - new Date(a.updateDate).getTime())
        break
      case 'release':
        filtered.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
        break
      case 'week':
      case 'month':
      case 'all':
        filtered.sort((a, b) => b.downloadCount - a.downloadCount)
        break
    }
    
    return filtered
  }

  const hotGames = getHotGames(activeHotTab)
  const newGames = getNewGames()
  const filteredGames = getFilteredGames()

  const formatCount = (count: number) => {
    if (count >= 10000) {
      return (count / 10000).toFixed(1) + 'W'
    }
    return count.toString()
  }

  const formatUpdateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 24) return `${hours}小时前`
    if (days === 1) return '昨天'
    if (days < 7) return `${days}天前`
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) + ' 更新'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* 左侧：排行榜 */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* 排行榜标签 */}
              <div className="flex border-b">
                {(['week', 'month', 'all'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveHotTab(tab)}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${
                      activeHotTab === tab
                        ? 'text-blue-500 border-b-2 border-blue-500 bg-blue-50/50'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab === 'week' ? '本周最热' : tab === 'month' ? '本月最热' : '历史最热'}
                  </button>
                ))}
              </div>

              {/* 排行榜列表 */}
              <div className="divide-y">
                {hotGames.map((game, index) => (
                  <Link
                    key={game.id}
                    href={`/games/${game.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <span className={`w-6 h-6 flex items-center justify-center rounded text-sm font-bold ${
                      index < 3
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{game.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {game.size} · {game.category}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="p-4 border-t">
                <Link href="/games?sort=hot" className="text-sm text-blue-500 hover:text-blue-600">
                  更多 →
                </Link>
              </div>
            </div>
          </aside>

          {/* 中间：主内容 */}
          <main className="flex-1 min-w-0">
            {/* 新游推荐轮播区 */}
            <section className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-bold text-gray-900">必玩新游</h2>
                  <span className="text-sm text-gray-500">今日更新</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="w-8 h-8 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {newGames.slice(0, 5).map((game) => (
                  <Link key={game.id} href={`/games/${game.id}`} className="group">
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-200">
                      {game.coverImage && game.coverImage !== '/images/default.jpg' ? (
                        <img src={game.coverImage} alt={game.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                          <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                        <div className="text-sm font-medium text-white truncate">{game.title}</div>
                        <div className="text-xs text-white/70 mt-1">发行日期：{new Date(game.releaseDate).toLocaleDateString('zh-CN')}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* 游戏列表区 */}
            <section>
              {/* 排序选项 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setActiveSort(opt.value)}
                      className={`text-sm transition-colors ${
                        activeSort === opt.value
                          ? 'text-blue-500 font-medium'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <span className="text-sm text-gray-500">共 {filteredGames.length} 款游戏</span>
              </div>

              {/* 游戏列表 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGames.map((game) => (
                  <Link key={game.id} href={`/games/${game.id}`} className="group">
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div className="flex">
                        {/* 封面 */}
                        <div className="w-28 h-36 flex-shrink-0 bg-gray-200">
                          {game.coverImage && game.coverImage !== '/images/default.jpg' ? (
                            <img src={game.coverImage} alt={game.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        
                        {/* 信息 */}
                        <div className="flex-1 p-3 flex flex-col justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900 group-hover:text-blue-500 transition-colors line-clamp-1">
                              {game.title}
                            </h3>
                            <div className="text-xs text-gray-500 mt-1">
                              {game.size} · {game.category}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>{formatCount(game.downloadCount)}</span>
                            <span>发行日期：{new Date(game.releaseDate).toLocaleDateString('zh-CN')}</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatUpdateTime(game.updateDate)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </main>

          {/* 右侧：可选区域（可放广告或推荐） */}
          <aside className="hidden xl:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-bold text-gray-900 mb-4">推荐游戏</h3>
              <div className="space-y-3">
                {games.slice(0, 5).map((game) => (
                  <Link key={game.id} href={`/games/${game.id}`} className="flex items-center gap-3 group">
                    <div className="w-12 h-12 rounded bg-gray-200 flex-shrink-0 overflow-hidden">
                      {game.coverImage && game.coverImage !== '/images/default.jpg' ? (
                        <img src={game.coverImage} alt={game.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-500 transition-colors">
                        {game.title}
                      </div>
                      <div className="text-xs text-gray-500">{game.category}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* 底部 */}
      <footer className="bg-gray-900 text-gray-400 mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">G</span>
              </div>
              <span className="font-bold text-white">GameVault</span>
            </div>
            <p className="text-sm">© 2024-2026 GameVault. 免费单机游戏下载平台</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
