'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

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
  isFeatured: boolean
}

export default function GameDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPasswords, setShowPasswords] = useState<{ [key: number]: boolean }>({})

  const fetchGame = async () => {
    try {
      const response = await fetch('/api/games')
      const data = await response.json()
      if (data.games) {
        const found = data.games.find((g: Game) => g.id === parseInt(params.id as string))
        setGame(found || null)
      }
    } catch (error) {
      console.error('获取游戏详情失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    fetchGame()
  }, [params.id])

  const togglePassword = (index: number) => {
    setShowPasswords(prev => ({ ...prev, [index]: true }))
  }

  const formatUpdateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return '今天'
    if (days === 1) return '昨天'
    if (days < 7) return `${days}天前`
    return date.toLocaleDateString('zh-CN')
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <svg className="w-20 h-20 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">游戏不存在</h2>
        <p className="text-gray-500 mb-4">找不到这个游戏，可能已被删除</p>
        <Link href="/games" className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          返回游戏列表
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 面包屑导航 */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-500 transition-colors">首页</Link>
            <span>/</span>
            <Link href="/games" className="hover:text-blue-500 transition-colors">全部游戏</Link>
            <span>/</span>
            <span className="text-gray-900">{game.title}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* 顶部：封面 + 基本信息 */}
          <div className="flex flex-col lg:flex-row">
            {/* 封面图 */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="relative aspect-[3/4] lg:aspect-auto lg:h-full bg-gradient-to-br from-gray-100 to-gray-200">
                {game.coverImage && game.coverImage !== '/images/default.svg' ? (
                  <img
                    src={game.coverImage}
                    alt={game.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full min-h-[300px] flex items-center justify-center">
                    <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
                
                {/* 标签 */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {game.isHot && (
                    <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-semibold rounded-md shadow-md">
                      热门
                    </span>
                  )}
                  {game.isNew && (
                    <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold rounded-md shadow-md">
                      新游
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 游戏信息 */}
            <div className="flex-1 p-6 lg:p-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                {game.title}
              </h1>
              
              {/* 游戏元信息 */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium rounded-md">
                  {game.category}
                </span>
                <span className="text-gray-500">大小：{game.size}</span>
                <span className="text-gray-500">下载：{game.downloadCount.toLocaleString()} 次</span>
                <span className="text-gray-500">更新：{formatUpdateTime(game.updateDate)}</span>
              </div>

              {/* 下载按钮区域 */}
              <div className="bg-gray-50 rounded-xl p-5 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">下载链接</h3>
                
                {!user ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500 mb-4">登录后即可查看下载链接</p>
                    <Link
                      href="/login"
                      className="inline-flex px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                      立即登录
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {game.downloadLinks.map((link, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-white rounded-lg border border-gray-100">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{link.platform}</div>
                            {link.password && (
                              <div className="text-sm text-gray-500 mt-1">
                                提取码：
                                {showPasswords[index] ? (
                                  <span className="font-mono text-gray-900 ml-1">{link.password}</span>
                                ) : (
                                  <button 
                                    onClick={() => togglePassword(index)}
                                    className="text-blue-500 hover:text-blue-600 ml-1"
                                  >
                                    点击查看
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <a
                          href={`/api/download?id=${game.id}&index=${index}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors text-center"
                        >
                          前往下载
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 游戏简介 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">游戏简介</h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {game.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 底部信息栏 */}
          <div className="border-t border-gray-100 px-6 lg:px-8 py-4 bg-gray-50">
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-6">
                <span>发布日期：{new Date(game.releaseDate).toLocaleDateString('zh-CN')}</span>
                <span>更新日期：{new Date(game.updateDate).toLocaleDateString('zh-CN')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>分类：</span>
                <Link 
                  href={`/games?category=${game.category}`}
                  className="text-blue-500 hover:text-blue-600"
                >
                  {game.category}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
