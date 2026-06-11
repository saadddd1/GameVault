'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import GameCard from '@/components/GameCard'
import SoftwareCard from '@/components/SoftwareCard'
import ErrorState from '@/components/ErrorState'
import type { Game } from '@/lib/games'
import type { Mod } from '@/lib/mod'
import type { AndroidApp } from '@/lib/android'
import type { WindowsApp } from '@/lib/windows'

type GameSortKey = 'downloads' | 'newest' | 'featured'
type ModSortKey = 'downloads' | 'newest'
type ToolTab = 'windows' | 'android'

const gameSortOptions: { key: GameSortKey; label: string }[] = [
  { key: 'downloads', label: '下载排行' },
  { key: 'newest', label: '最新上架' },
  { key: 'featured', label: '精选推荐' },
]

const modSortOptions: { key: ModSortKey; label: string }[] = [
  { key: 'newest', label: '最新发布' },
  { key: 'downloads', label: '下载排行' },
]

function SectionTitle({ title }: { title: string }) {
  return (
    <h2 className="text-base lg:text-lg font-bold text-[#1C1917] border-l-[3px] border-[#1E3A5F] pl-3 mb-3 lg:mb-4 tracking-wide">
      {title}
    </h2>
  )
}

export default function HomePage() {
  const [games, setGames] = useState<Game[]>([])
  const [mods, setMods] = useState<Mod[]>([])
  const [androidApps, setAndroidApps] = useState<AndroidApp[]>([])
  const [windowsApps, setWindowsApps] = useState<WindowsApp[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [featuredIndex, setFeaturedIndex] = useState(0)
  const [gameSort, setGameSort] = useState<GameSortKey>('downloads')
  const [modSort, setModSort] = useState<ModSortKey>('newest')
  const [toolTab, setToolTab] = useState<ToolTab>('windows')

  useEffect(() => {
    Promise.all([
      fetch('/api/games', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/mods', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/android', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/windows', { cache: 'no-store' }).then(r => r.json()),
    ])
      .then(([gameData, modData, androidData, windowsData]) => {
        if (gameData.games) setGames(gameData.games)
        if (modData.mods) setMods(modData.mods)
        if (androidData.apps) setAndroidApps(androidData.apps)
        if (windowsData.apps) setWindowsApps(windowsData.apps)
      })
      .catch(e => { console.error('Homepage fetch failed:', e); setError(true) })
      .finally(() => setLoading(false))
  }, [])

  // Hero carousel
  const featuredGames = games.filter(g => g.isFeatured)
  useEffect(() => {
    if (featuredGames.length <= 1) return
    const timer = setInterval(() => {
      setFeaturedIndex(prev => (prev + 1) % featuredGames.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [featuredGames.length])

  // Sorted previews
  const sortedGames = [...games].sort((a, b) => {
    switch (gameSort) {
      case 'downloads': return b.downloadCount - a.downloadCount
      case 'newest': return new Date(b.updateDate).getTime() - new Date(a.updateDate).getTime()
      case 'featured': return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)
      default: return 0
    }
  }).slice(0, 10)

  const sortedMods = [...mods].sort((a, b) => {
    switch (modSort) {
      case 'downloads': return b.downloadCount - a.downloadCount
      case 'newest': return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      default: return 0
    }
  }).slice(0, 10)

  const activeTools = toolTab === 'windows' ? windowsApps : androidApps
  const sortedTools = [...activeTools].sort((a, b) => b.downloadCount - a.downloadCount).slice(0, 10)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAF9' }}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1E3A5F]"></div>
      </div>
    )
  }

  if (error) {
    return <ErrorState onRetry={() => { setError(false); setLoading(true); }} />
  }

  return (
    <div style={{ backgroundColor: '#FAFAF9' }}>
      <div className="container mx-auto px-4 py-4 lg:py-6 max-w-6xl">

        {/* Hero 轮播 */}
        {featuredGames.length > 0 && (
          <section className="mb-6 lg:mb-8">
            <Link href={`/games/${featuredGames[featuredIndex].id}`}>
              <div className="relative bg-[#1C1917] overflow-hidden rounded-sm group cursor-pointer">
                <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-8 p-5 lg:p-8">
                  <div className="w-20 h-28 lg:w-40 lg:h-56 flex-shrink-0 bg-stone-800 overflow-hidden rounded-sm">
                    {featuredGames[featuredIndex].coverImage && featuredGames[featuredIndex].coverImage !== '/images/default.svg' ? (
                      <img src={featuredGames[featuredIndex].coverImage} alt="" fetchPriority="high" width={160} height={224} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl lg:text-4xl">{'\u{1F3AE}'}</div>
                    )}
                  </div>
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

        {/* 游戏区 */}
        <section className="mb-6 lg:mb-8">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <SectionTitle title="游戏" />
            <div className="flex gap-1">
              {gameSortOptions.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setGameSort(opt.key)}
                  className={`px-2.5 lg:px-3 py-1 text-xs lg:text-sm transition-colors rounded-sm ${
                    gameSort === opt.key
                      ? 'bg-[#1E3A5F] text-white font-medium'
                      : 'text-stone-500 hover:text-[#1C1917]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
            {sortedGames.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link href="/games" className="text-sm text-[#1E3A5F] hover:underline font-medium">
              查看全部游戏 ({games.length} 款) →
            </Link>
          </div>
        </section>

        {/* MOD 区 */}
        {mods.length > 0 && (
          <section className="mb-6 lg:mb-8">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <SectionTitle title="MOD" />
              <div className="flex gap-1">
                {modSortOptions.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setModSort(opt.key)}
                    className={`px-2.5 lg:px-3 py-1 text-xs lg:text-sm transition-colors rounded-sm ${
                      modSort === opt.key
                        ? 'bg-[#1E3A5F] text-white font-medium'
                        : 'text-stone-500 hover:text-[#1C1917]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
              {sortedMods.map(mod => (
                <SoftwareCard
                  key={mod.id}
                  app={{
                    id: mod.id,
                    name: mod.title,
                    description: mod.description,
                    coverImage: mod.coverImage,
                    category: mod.category,
                    version: mod.version,
                    fileSize: mod.fileSize,
                    downloadCount: mod.downloadCount,
                    subtitle: mod.gameName,
                  }}
                  href={`/mods/${mod.id}`}
                />
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link href="/mods" className="text-sm text-[#1E3A5F] hover:underline font-medium">
                查看更多 MOD ({mods.length} 款) →
              </Link>
            </div>
          </section>
        )}

        {/* 工具软件区 */}
        <section className="mb-8 lg:mb-10">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <SectionTitle title="工具软件" />
            <div className="flex gap-0 bg-stone-100 rounded-sm p-0.5">
              <button
                onClick={() => setToolTab('windows')}
                className={`px-3 py-1 text-xs lg:text-sm rounded-sm transition-colors ${
                  toolTab === 'windows'
                    ? 'bg-white text-[#1C1917] font-medium shadow-sm'
                    : 'text-stone-500 hover:text-[#1C1917]'
                }`}
              >
                Windows
              </button>
              <button
                onClick={() => setToolTab('android')}
                className={`px-3 py-1 text-xs lg:text-sm rounded-sm transition-colors ${
                  toolTab === 'android'
                    ? 'bg-white text-[#1C1917] font-medium shadow-sm'
                    : 'text-stone-500 hover:text-[#1C1917]'
                }`}
              >
                安卓
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
            {sortedTools.map(app => (
              <SoftwareCard
                key={app.id}
                app={{
                  id: app.id,
                  name: app.name,
                  description: app.description,
                  coverImage: app.coverImage,
                  category: app.category,
                  version: (app as AndroidApp).version,
                  fileSize: (app as WindowsApp).fileSize || (app as AndroidApp).fileSize,
                  downloadCount: app.downloadCount,
                }}
                href={`/${toolTab === 'windows' ? 'windows' : 'android'}/${app.id}`}
              />
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link href={`/tools?tab=${toolTab}`} className="text-sm text-[#1E3A5F] hover:underline font-medium">
              查看更多{toolTab === 'windows' ? 'Windows' : '安卓'}软件 ({activeTools.length} 款) →
            </Link>
          </div>
        </section>

        {/* 移动端底部间距 */}
        <div className="lg:hidden h-14" />
      </div>
    </div>
  )
}
