'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import type { AndroidApp } from '@/lib/android'
import FeedbackButton from '@/components/FeedbackButton'

export default function AndroidDetailPage() {
  const params = useParams()
  const [app, setApp] = useState<AndroidApp | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPasswords, setShowPasswords] = useState<{ [key: number]: boolean }>({})

  const fetchApp = async () => {
    try {
      const response = await fetch('/api/android')
      const data = await response.json()
      if (data.apps) {
        const found = data.apps.find((a: AndroidApp) => a.id === parseInt(params.id as string))
        setApp(found || null)
      }
    } catch (error) {
      console.error('获取应用详情失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    fetchApp()
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

  if (!app) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <svg className="w-20 h-20 text-stone-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-xl font-semibold text-[#1C1917] mb-2">应用不存在</h2>
        <p className="text-stone-500 mb-4">找不到这个应用，可能已被删除</p>
        <Link href="/android" className="px-6 py-3 bg-[#1E3A5F] text-white rounded-sm hover:bg-[#162d47] transition-colors">
          返回安卓软件
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-white border-b border-stone-200">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-stone-500">
            <Link href="/" className="hover:text-[#1E3A5F] transition-colors">首页</Link>
            <span>/</span>
            <Link href="/android" className="hover:text-[#1E3A5F] transition-colors">安卓软件</Link>
            <span>/</span>
            <span className="text-[#1C1917]">{app.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-sm border border-stone-200 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-80 flex-shrink-0">
              <div className="relative aspect-[3/4] lg:aspect-auto lg:h-full bg-stone-100">
                {app.coverImage && app.coverImage !== '/images/default.svg' ? (
                  <img src={app.coverImage} alt={app.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full min-h-[300px] flex items-center justify-center">
                    <svg className="w-24 h-24 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 text-white text-sm font-semibold rounded-sm bg-[#1E3A5F]">{app.category}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 lg:p-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-[#1C1917] mb-4">{app.name}</h1>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="px-3 py-1.5 bg-stone-100 text-stone-700 text-sm font-medium rounded-sm">{app.category}</span>
                {app.version && <span className="text-stone-500 text-sm">版本：{app.version}</span>}
                {app.fileSize && <span className="text-stone-500 text-sm">大小：{app.fileSize}</span>}
                <span className="text-stone-500 text-sm">下载：{app.downloadCount.toLocaleString()} 次</span>
                <span className="text-stone-500 text-sm">更新：{formatUpdateTime(app.updatedAt)}</span>
              </div>

              {app.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {app.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-stone-100 text-stone-600 text-sm rounded-sm">{tag}</span>
                  ))}
                </div>
              )}

              {app.downloadLinks && app.downloadLinks.length > 0 && (
                <div className="bg-stone-50 rounded-sm p-5 mb-6">
                  <h3 className="text-lg font-semibold text-[#1C1917] mb-4">下载链接</h3>
                  <div className="space-y-3">
                    {app.downloadLinks.map((link, index) => (
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
                                  <button onClick={() => togglePassword(index)} className="text-[#1E3A5F] hover:text-[#1E3A5F] ml-1">点击查看</button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <a
                          href={`/api/download?type=android&id=${app.id}&index=${index}`}
                          target="_blank" rel="noopener noreferrer"
                          className="px-6 py-2.5 bg-[#1E3A5F] text-white rounded-sm font-medium hover:bg-[#162d47] transition-colors text-center"
                        >前往下载</a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-[#1C1917] mb-3">应用简介</h3>
                <p className="text-stone-500 leading-relaxed whitespace-pre-wrap">{app.description}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-stone-100 px-6 lg:px-8 py-4 bg-stone-50">
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-stone-500">
              <div className="flex items-center gap-6">
                {app.createdAt && <span>创建日期：{new Date(app.createdAt).toLocaleDateString('zh-CN')}</span>}
                {app.author && <span>作者：{app.author}</span>}
              </div>
              <div className="flex items-center gap-4">
                <FeedbackButton targetType="android" targetId={app.id} targetName={app.name} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
