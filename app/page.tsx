'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import GameCard from '@/components/GameCard'
import type { Game } from '@/lib/games'

type SortKey = 'downloads' | 'newest' | 'featured'

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'downloads', label: '下载排行' },
  { key: 'newest', label: '最新上架' },
  { key: 'featured', label: '精选推荐' },
]

function SectionTitle({ title }: { title: string }) {
  return (
    <h2 className="text-base lg:text-lg font-bold text-[#1C1917] border-l-[3px] border-[#1E3A5F] pl-3 mb-4 lg:mb-5 tracking-wide">
      {title}
    </h2>
  )
}

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

  const sortedByDownload = [...games].sort((a, b) => b.downloadCount - a.downloadCount)
  const sortedByNewest = [...games].sort((a, b) => new Date(b.updateDate).getTime() - new Date(a.updateDate).getTime())
  const editorPicks = games.filter(g => g.isFeatured).slice(0, 6)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAF9' }}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1E3A5F]"></div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#FAFAF9' }}>
      <div className="container mx-auto px-4 py-4 lg:py-6 max-w-6xl">

        {/* Hero 精选推荐 */}
        {featuredGames.length > 0 && (
          <section className="mb-6 lg:mb-8">
            <Link href={`/games/${featuredGames[featuredIndex].id}`}>
              <div className="relative bg-[#1C1917] overflow-hidden rounded-sm group cursor-pointer">
                <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-8 p-5 lg:p-8">
                  {/* 封面 */}
                  <div className="w-20 h-28 lg:w-40 lg:h-56 flex-shrink-0 bg-stone-800 overflow-hidden rounded-sm">
                    {featuredGames[featuredIndex].coverImage && featuredGames[featuredIndex].coverImage !== '/images/default.svg' ? (
                      <img src={featuredGames[featuredIndex].coverImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl lg:text-4xl">🎮</div>
                    )}
                  </div>
                  {/* 文字 */}
                  <div className="flex-1 text-center lg:text-left">
                    <div className="text-xs text-stone-400 mb-1 tracking-wider uppercase font-number">Featured</div>
                    <h2 className="text-lg lg:text-3xl font-bold text-white mb-2 lg:mb-3 group-hover:underline tracking-wide">
                      {featuredGames[featuredIndex].title}
                    </h2>
                    <p className="text-sm text-stone-400 mb-3 lg:mb-4 line-clamp-2 hidden lg:block leading-relaxed">
                      {featuredGames[featuredIndex].description}
                    </p>
                    <div className="flex items-center justify-center lg:justify-start gap-3 text-xs text-stone-400 font-number">
                      <span>{featuredGames[featuredIndex].size}</span>
                      <span className="text-stone-600">·</span>
                      <span>{featuredGames[featuredIndex].category}</span>
                      <span className="text-stone-600">·</span>
                      <span>{featuredGames[featuredIndex].downloadCount.toLocaleString()} 次下载</span>
                    </div>
                  </div>
                </div>
                {/* 轮播指示器 */}
                {featuredGames.length > 1 && (
                  <div className="flex justify-center gap-1.5 pb-3 lg:pb-5">
                    {featuredGames.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => { e.preventDefault(); setFeaturedIndex(i) }}
                        className={`h-1 rounded-full transition-all ${
                          i === featuredIndex ? 'bg-white w-6' : 'bg-stone-600 w-1.5'
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
        <div className="flex items-center justify-between mb-5 lg:mb-6">
          <div className="flex gap-1 lg:gap-0">
            {sortOptions.map(opt => (
              <button
                key={opt.key}
                onClick={() => setSortBy(opt.key)}
                className={`px-3 lg:px-4 py-1.5 text-sm transition-colors ${
                  sortBy === opt.key
                    ? 'bg-[#1E3A5F] text-white lg:bg-transparent lg:text-[#1E3A5F] lg:border-b-2 lg:border-[#1E3A5F] font-medium'
                    : 'text-stone-500 hover:text-[#1C1917] lg:hover:text-[#1C1917]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-stone-400 flex-shrink-0 ml-3 font-number">
            {games.length} 款
          </span>
        </div>

        {/* 当前排序的游戏网格 */}
        <section className="mb-8 lg:mb-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
            {(() => {
              const sorted = sortBy === 'downloads' ? sortedByDownload : sortBy === 'newest' ? sortedByNewest : [...games].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
              return sorted.map(game => (
                <GameCard key={game.id} game={game} />
              ))
            })()}
          </div>
        </section>

        {/* 编辑之选（横向滚动） */}
        {editorPicks.length > 0 && (
          <section className="mb-8 lg:mb-10">
            <SectionTitle title="编辑之选" />
            <div className="flex gap-3 lg:gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
              {editorPicks.map(game => (
                <Link key={game.id} href={`/games/${game.id}`} className="flex-shrink-0 w-[140px] lg:w-[200px] group">
                  <article className="bg-white border border-stone-200 rounded-sm overflow-hidden hover:border-stone-400 transition-colors">
                    <div className="aspect-[4/3] bg-stone-100 overflow-hidden">
                      {game.coverImage && game.coverImage !== '/images/default.svg' ? (
                        <img src={game.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🎮</div>
                      )}
                    </div>
                    <div className="p-2 lg:p-3">
                      <h3 className="font-bold text-[#1C1917] text-xs lg:text-sm line-clamp-1">{game.title}</h3>
                      <p className="text-[10px] lg:text-xs text-stone-400 mt-0.5 font-number">{game.size}</p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 热门下载 */}
        <section className="mb-8 lg:mb-10">
          <SectionTitle title="热门下载" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
            {sortedByDownload.slice(0, 10).map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>

        {/* 最近上架 */}
        <section className="mb-8 lg:mb-10">
          <SectionTitle title="最近上架" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
            {sortedByNewest.slice(0, 10).map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>

        {/* 移动端底部间距（给固定导航让位） */}
        <div className="lg:hidden h-14" />
      </div>
    </div>
  )
}
