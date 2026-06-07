'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import type { Mod } from '@/lib/mod'
import FeedbackButton from '@/components/FeedbackButton'

export default function ModDetailPage() {
  const params = useParams()
  const [mod, setMod] = useState<Mod | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPasswords, setShowPasswords] = useState<{ [key: number]: boolean }>({})

  const fetchMod = async () => {
    try {
      const response = await fetch('/api/mods')
      const data = await response.json()
      if (data.mods) {
        const found = data.mods.find((m: Mod) => m.id === parseInt(params.id as string))
        setMod(found || null)
      }
    } catch (error) {
      console.error('获取MOD详情失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    fetchMod()
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A5F]"></div>
      </div>
    )
  }

  if (!mod) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <svg className="w-20 h-20 text-stone-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-xl font-semibold text-[#1C1917] mb-2">MOD不存在</h2>
        <p className="text-stone-500 mb-4">找不到这个MOD，可能已被删除</p>
        <Link href="/mods" className="px-6 py-3 bg-[#1E3A5F] text-white rounded-sm hover:bg-[#162d47] transition-colors">
          返回MOD列表
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* 面包屑导航 */}
      <div className="bg-white border-b border-stone-200">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-stone-500">
            <Link href="/" className="hover:text-[#1E3A5F] transition-colors">首页</Link>
            <span>/</span>
            <Link href="/mods" className="hover:text-[#1E3A5F] transition-colors">MOD</Link>
            <span>/</span>
            <span className="text-[#1C1917]">{mod.title}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-sm border border-stone-200 overflow-hidden">
          {/* 顶部：封面 + 基本信息 */}
          <div className="flex flex-col lg:flex-row">
            {/* 封面图 */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="relative aspect-[3/4] lg:aspect-auto lg:h-full bg-stone-100">
                {mod.coverImage && mod.coverImage !== '/images/default.svg' ? (
                  <img
                    src={mod.coverImage}
                    alt={mod.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full min-h-[300px] flex items-center justify-center">
                    <svg className="w-24 h-24 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                )}

                {/* 分类标签 */}
                <div className="absolute top-3 left-3">
                  <span className={`px-3 py-1 text-white text-sm font-semibold rounded-sm shadow-sm ${
                    mod.category === '模组' ? 'bg-emerald-600' : 'bg-blue-600'
                  }`}>
                    {mod.category}
                  </span>
                </div>
              </div>
            </div>

            {/* MOD 信息 */}
            <div className="flex-1 p-6 lg:p-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-[#1C1917] mb-4">
                {mod.title}
              </h1>

              {/* MOD 元信息 */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="px-3 py-1.5 bg-stone-100 text-stone-700 text-sm font-medium rounded-sm">
                  {mod.gameName}
                </span>
                <span className="text-stone-500">作者：{mod.author}</span>
                <span className="text-stone-500">版本：{mod.version}</span>
                <span className="text-stone-500">大小：{mod.fileSize}</span>
                <span className="text-stone-500">下载：{mod.downloadCount.toLocaleString()} 次</span>
                <span className="text-stone-500">更新：{formatUpdateTime(mod.updatedAt)}</span>
              </div>

              {/* 标签 */}
              {mod.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {mod.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-stone-100 text-stone-600 text-sm rounded-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* 下载按钮区域 */}
              <div className="bg-stone-50 rounded-sm p-5 mb-6">
                <h3 className="text-lg font-semibold text-[#1C1917] mb-4">下载链接</h3>

                <div className="space-y-3">
                    {mod.downloadLinks.map((link, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-white rounded-sm border border-stone-100">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 bg-stone-100 rounded-sm flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-[#1E3A5F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium text-[#1C1917]">{link.platform}</div>
                            {link.password && (
                              <div className="text-sm text-stone-500 mt-1">
                                提取码：
                                {showPasswords[index] ? (
                                  <span className="font-mono text-[#1C1917] ml-1">{link.password}</span>
                                ) : (
                                  <button
                                    onClick={() => togglePassword(index)}
                                    className="text-[#1E3A5F] hover:text-[#1E3A5F] ml-1"
                                  >
                                    点击查看
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <a
                          href={`/api/download?type=mod&id=${mod.id}&index=${index}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-2.5 bg-[#1E3A5F] text-white rounded-sm font-medium hover:bg-[#162d47] transition-colors text-center"
                        >
                          前往下载
                        </a>
                      </div>
                    ))}
                  </div>
              </div>

              {/* MOD 简介 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#1C1917] mb-3">MOD简介</h3>
                <div className="max-w-none">
                  <p className="text-stone-500 leading-relaxed whitespace-pre-wrap">
                    {mod.description}
                  </p>
                </div>
              </div>

              {/* 安装说明 */}
              {mod.installInstructions && (
                <div className="bg-stone-50 rounded-sm p-5">
                  <h3 className="text-lg font-semibold text-[#1C1917] mb-3">安装说明</h3>
                  <p className="text-stone-500 leading-relaxed whitespace-pre-wrap">
                    {mod.installInstructions}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 底部信息栏 */}
          <div className="border-t border-stone-100 px-6 lg:px-8 py-4 bg-stone-50">
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-stone-500">
              <div className="flex items-center gap-6">
                <span>创建日期：{new Date(mod.createdAt).toLocaleDateString('zh-CN')}</span>
                <span>更新日期：{new Date(mod.updatedAt).toLocaleDateString('zh-CN')}</span>
              </div>
              <div className="flex items-center gap-4">
                <span>分类：</span>
                <Link
                  href={`/mods?category=${mod.category}`}
                  className="text-[#1E3A5F] hover:text-[#162d47]"
                >
                  {mod.category}
                </Link>
                <FeedbackButton targetType="mod" targetId={mod.id} targetName={mod.title} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
