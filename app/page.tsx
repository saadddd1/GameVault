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

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'downloads', label: '下载排行' },
  { key: 'newest', label: '最新上架' },
  { key: 'featured', label: '精选推荐' },
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

  const featuredGames = games.filter(g => g.isFeatured)

  useEffect(() => {
    if (featuredGames.length <= 1) return
    const timer = setInterval(() => {
      setFeaturedIndex(prev => (prev + 1) % featuredGames.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [featuredGames.length])

  const sortedGames = [...games].sort((a, b) => {
    switch (sortBy) {
      case 'downloads':
        return b.downloadCount - a.downloadCount
      case 'newest':
        return new Date(b.updateDate).getTime() - new Date(a.updateDate).getTime()
      case 'featured':
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)
      default:
        return 0
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
          <section className="mb-5 lg:mb-6">
            <Link href={`/games/${featuredGames[featuredIndex].id}`}>
              <div className="relative rounded-xl lg:rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white group cursor-pointer">
                <div className="flex flex-col lg:flex-row items-center gap-3 lg:gap-8 p-4 lg:p-8">
                  <div className="w-16 h-24 lg:w-36 lg:h-48 flex-shrink-0 bg-white/10 rounded-lg overflow-hidden">
                    {featuredGames[featuredIndex].coverImage && featuredGames[featuredIndex].coverImage !== '/images/default.svg' ? (
                      <img src={featuredGames[featuredIndex].coverImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl lg:text-4xl">🎮</div>
                    )}
                  </div>
                  <div className="flex-1 text-center lg:text-left">
                    <div className="text-xs text-white/50 mb-1">⭐ 精选推荐</div>
                    <h2 className="text-base lg:text-2xl font-bold mb-1 lg:mb-2 group-hover:underline">
                      {featuredGames[featuredIndex].title}
                    </h2>
                    <p className="text-xs lg:text-sm text-white/60 mb-2 lg:mb-3 line-clamp-2 hidden lg:block">
                      {featuredGames[featuredIndex].description}
                    </p>
                    <div className="flex items-center justify-center lg:justify-start gap-2 lg:gap-3 text-xs text-white/50">
                      <span className="px-2 py-0.5 bg-white/10 rounded">{featuredGames[featuredIndex].size}</span>
                      <span className="px-2 py-0.5 bg-white/10 rounded">{featuredGames[featuredIndex].category}</span>
                      <span>{featuredGames[featuredIndex].downloadCount.toLocaleString()} 次下载</span>
                    </div>
                  </div>
                </div>
                {featuredGames.length > 1 && (
                  <div className="flex justify-center gap-1.5 pb-2 lg:pb-4">
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
