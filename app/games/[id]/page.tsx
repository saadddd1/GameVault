'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import FeedbackButton from '@/components/FeedbackButton'
import { formatTime } from '@/lib/format-time'
import type { Game } from '@/lib/games'

export default function GameDetailPage() {
  const params = useParams()
  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [screenshotIndex, setScreenshotIndex] = useState(0)
  const [showPasswords, setShowPasswords] = useState<Record<number, boolean>>({})

  useEffect(() => {
    fetch('/api/games')
      .then(r => r.json())
      .then(data => {
        const g = data.games?.find((item: Game) => item.id === parseInt(params.id as string))
        if (g) setGame(g)
        else setNotFound(true)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [params.id])

  // Screenshot carousel
  const screenshots = game?.screenshots?.length ? game.screenshots : (game?.coverImage ? [game.coverImage] : [])
  useEffect(() => {
    if (screenshots.length <= 1) return
    const timer = setInterval(() => {
      setScreenshotIndex(prev => (prev + 1) % screenshots.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [screenshots.length])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAF9' }}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1E3A5F]"></div>
      </div>
    )
  }

  if (notFound || !game) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAF9' }}>
        <div className="text-center">
          <div className="text-5xl mb-4">{'\u{1F50D}'}</div>
          <h1 className="text-xl font-bold text-[#1C1917] mb-2">游戏不存在</h1>
          <p className="text-stone-500 mb-6">找不到该游戏，可能已被删除</p>
          <Link href="/games" className="text-[#1E3A5F] hover:underline text-sm">返回游戏列表</Link>
        </div>
      </div>
    )
  }

  const handleDownload = (index: number) => {
    fetch(`/api/download?id=${game.id}&index=${index}`)
      .catch(() => {})
  }

  return (
    <div style={{ backgroundColor: '#FAFAF9' }}>
      {/* Dark Hero */}
      <div className="bg-[#1C1917]">
        <div className="container mx-auto px-4 max-w-6xl py-6 lg:py-10">
          {/* Breadcrumb */}
          <div className="text-xs text-stone-500 mb-4">
            <Link href="/" className="hover:text-stone-300">首页</Link>
            <span className="mx-2">/</span>
            <Link href="/games" className="hover:text-stone-300">全部游戏</Link>
            <span className="mx-2">/</span>
            <span className="text-stone-400">{game.title}</span>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
            {/* Cover + Screenshots */}
            <div className="flex-shrink-0 lg:w-80">
              <div className="relative aspect-[16/10] bg-stone-800 rounded-sm overflow-hidden">
                {screenshots.length > 0 ? (
                  <img
                    src={screenshots[screenshotIndex]}
                    alt=""
                    className="w-full h-full object-cover transition-opacity duration-500"
                  />
                ) : game.coverImage && game.coverImage !== '/images/default.svg' ? (
                  <img src={game.coverImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">{'\u{1F3AE}'}</div>
                )}
                {/* Screenshot dots */}
                {screenshots.length > 1 && (
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                    {screenshots.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setScreenshotIndex(i)}
                        className={`h-1 rounded-full transition-all ${i === screenshotIndex ? 'bg-white w-5' : 'bg-white/40 w-1.5'}`}
                      />
                    ))}
                  </div>
                )}
              </div>
              {/* Thumbnail strip */}
              {screenshots.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto">
                  {screenshots.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setScreenshotIndex(i)}
                      className={`flex-shrink-0 w-16 h-10 rounded-sm overflow-hidden border-2 transition-colors ${i === screenshotIndex ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Title + Info */}
            <div className="flex-1 text-white">
              {/* Badges */}
              <div className="flex gap-2 mb-2">
                {game.isHot && <span className="px-2.5 py-0.5 bg-red-600 text-xs font-semibold rounded-sm">热门</span>}
                {game.isNew && <span className="px-2.5 py-0.5 bg-emerald-600 text-xs font-semibold rounded-sm">新游</span>}
              </div>

              <h1 className="text-2xl lg:text-4xl font-bold tracking-wide mb-3">{game.title}</h1>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-stone-400 mb-5 font-number">
                <span>{game.category}</span>
                {game.developer && <span>开发商：{game.developer}</span>}
                {game.publisher && <span>发行商：{game.publisher}</span>}
                {game.releaseDate && <span>{new Date(game.releaseDate).toLocaleDateString('zh-CN')}</span>}
                <span>{game.size}</span>
              </div>

              {/* Download count + Languages */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="text-sm text-stone-400">{game.downloadCount.toLocaleString()} 次下载</span>
                {game.supportedLanguages && game.supportedLanguages.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {game.supportedLanguages.map(lang => (
                      <span key={lang} className="px-2 py-0.5 bg-stone-700 text-stone-300 rounded-sm text-xs">{lang}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3">
                {game.steamUrl && (
                  <a
                    href={game.steamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm text-sm font-medium text-white hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#5c7e10' }}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.972 1.35C5.914 1.35.983 6.281.983 12.34c0 4.86 3.16 8.98 7.54 10.44.55.1.75-.24.75-.53l-.01-1.9c-3.07.67-3.71-1.47-3.71-1.47-.5-1.28-1.23-1.62-1.23-1.62-1-.68.08-.67.08-.67 1.11.08 1.7 1.14 1.7 1.14.99 1.69 2.59 1.2 3.22.92.1-.72.39-1.2.7-1.48-2.45-.28-5.03-1.23-5.03-5.46 0-1.21.43-2.19 1.14-2.97-.12-.28-.5-1.4.1-2.93 0 0 .93-.3 3.06 1.14a10.66 10.66 0 015.56 0c2.12-1.44 3.05-1.14 3.05-1.14.6 1.53.22 2.65.11 2.93.71.78 1.13 1.76 1.13 2.97 0 4.24-2.59 5.18-5.05 5.45.4.34.75 1.01.75 2.04l-.01 3.03c0 .29.2.64.75.53a10.99 10.99 0 005.55-21.47c-1.17-2.22-3.36-3.89-5.85-4.55"/>
                    </svg>
                    在 Steam 购买正版
                  </a>
                )}
                {game.downloadLinks?.filter(l => l.url).map((link, index) => (
                  <a
                    key={index}
                    href={`/api/download?id=${game.id}&index=${index}`}
                    target="_blank"
                    onClick={(e) => { e.preventDefault(); handleDownload(index); window.open(`/api/download?id=${game.id}&index=${index}`, '_blank') }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E3A5F] text-white rounded-sm text-sm font-medium hover:bg-[#162d47] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {link.platform}
                    {link.password && (
                      <span className="text-white/70 text-xs">
                        {showPasswords[index] ? ` 提取码：${link.password}` : ''}
                      </span>
                    )}
                  </a>
                ))}
              </div>

              {/* Password reveals */}
              {game.downloadLinks?.some(l => l.password) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {game.downloadLinks.map((link, index) =>
                    link.password ? (
                      <button
                        key={index}
                        onClick={() => setShowPasswords(prev => ({ ...prev, [index]: !prev[index] }))}
                        className="text-xs text-stone-500 hover:text-stone-300"
                      >
                        {showPasswords[index] ? `隐藏${link.platform}提取码` : `显示${link.platform}提取码`}
                      </button>
                    ) : null
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="container mx-auto px-4 max-w-6xl py-8 lg:py-10">
        <div className="bg-white rounded-sm border border-stone-200 p-6 lg:p-8 mb-8">
          <h2 className="text-lg font-semibold text-[#1C1917] mb-4">游戏简介</h2>
          <p className="text-stone-600 leading-relaxed whitespace-pre-wrap">{game.description}</p>
        </div>

        {/* System Requirements */}
        {game.systemRequirements && (game.systemRequirements.minimum || game.systemRequirements.recommended) && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-[#1C1917] mb-4">系统配置</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {game.systemRequirements.minimum && (
                <div className="bg-stone-100 rounded-sm p-5">
                  <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">最低配置</h3>
                  <pre className="text-sm text-stone-600 whitespace-pre-wrap font-sans leading-relaxed">{game.systemRequirements.minimum}</pre>
                </div>
              )}
              {game.systemRequirements.recommended && (
                <div className="bg-stone-100 rounded-sm p-5">
                  <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">推荐配置</h3>
                  <pre className="text-sm text-stone-600 whitespace-pre-wrap font-sans leading-relaxed">{game.systemRequirements.recommended}</pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom bar */}
        <div className="flex items-center justify-between text-sm text-stone-400">
          <div className="flex items-center gap-6">
            {game.releaseDate && <span>发布日期：{new Date(game.releaseDate).toLocaleDateString('zh-CN')}</span>}
            <span>更新日期：{new Date(game.updateDate).toLocaleDateString('zh-CN')}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href={`/games?category=${game.category}`} className="text-[#1E3A5F] hover:underline">分类：{game.category}</Link>
            <FeedbackButton targetType="game" targetId={game.id} targetName={game.title} />
          </div>
        </div>

        <div className="lg:hidden h-14" />
      </div>
    </div>
  )
}
