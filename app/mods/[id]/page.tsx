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

  useEffect(() => {
    fetch('/api/mods')
      .then(r => r.json())
      .then(data => {
        if (data.mods) setMod(data.mods.find((m: Mod) => m.id === parseInt(params.id as string)) || null)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [params.id])

  const togglePassword = (index: number) => setShowPasswords(prev => ({ ...prev, [index]: true }))
  const formatTime = (d: string) => { const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000); return days === 0 ? '今天' : days === 1 ? '昨天' : days < 7 ? `${days}天前` : new Date(d).toLocaleDateString('zh-CN') }

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A5F]"></div></div>
  if (!mod) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <h2 className="text-xl font-semibold text-[#1C1917] mb-2">MOD不存在</h2>
      <Link href="/mods" className="px-6 py-3 bg-[#1E3A5F] text-white rounded-sm">返回MOD列表</Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-white border-b border-stone-200">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-stone-500">
            <Link href="/" className="hover:text-[#1E3A5F]">首页</Link><span>/</span>
            <Link href="/mods" className="hover:text-[#1E3A5F]">游戏MOD</Link><span>/</span>
            <span className="text-[#1C1917]">{mod.title}</span>
          </nav>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-sm border border-stone-200 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-80 flex-shrink-0">
              <div className="relative aspect-[3/4] lg:aspect-auto lg:h-full bg-stone-100">
                {mod.coverImage && mod.coverImage !== '/images/default.svg' ? (
                  <img src={mod.coverImage} alt={mod.title} width={320} height={480} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full min-h-[300px] flex items-center justify-center"><span className="text-6xl">{'⚙'}</span></div>
                )}
                <div className="absolute top-3 left-3"><span className="px-3 py-1 bg-[#1E3A5F] text-white text-sm font-semibold rounded-sm">{mod.category}</span></div>
              </div>
            </div>
            <div className="flex-1 p-6 lg:p-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-[#1C1917] mb-4">{mod.title}</h1>
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="px-3 py-1.5 bg-stone-100 text-stone-700 text-sm rounded-sm">{mod.category}</span>
                <span className="text-stone-500 text-sm">游戏：{mod.gameName}</span>
                {mod.version && <span className="text-stone-500 text-sm">版本：{mod.version}</span>}
                {mod.fileSize && <span className="text-stone-500 text-sm">大小：{mod.fileSize}</span>}
                <span className="text-stone-500 text-sm">下载：{mod.downloadCount.toLocaleString()} 次</span>
              </div>
              {mod.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">{mod.tags.map((t, i) => <span key={i} className="px-3 py-1 bg-stone-100 text-stone-600 text-sm rounded-sm">{t}</span>)}</div>
              )}
              {mod.downloadLinks?.length > 0 && (
                <div className="bg-stone-50 rounded-sm p-5 mb-6">
                  <h3 className="text-lg font-semibold text-[#1C1917] mb-4">下载链接</h3>
                  <div className="space-y-3">
                    {mod.downloadLinks.map((link, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-white rounded-sm border border-stone-100">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 bg-stone-100 rounded-sm flex items-center justify-center"><svg className="w-5 h-5 text-[#1E3A5F]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg></div>
                          <div>
                            <div className="font-medium text-[#1C1917]">{link.platform}</div>
                            {link.password && (
                              <div className="text-sm text-stone-500 mt-1">提取码：{showPasswords[i] ? <span className="font-mono text-[#1C1917] ml-1">{link.password}</span> : <button onClick={() => togglePassword(i)} className="text-[#1E3A5F] ml-1">点击查看</button>}</div>
                            )}
                          </div>
                        </div>
                        <a href={`/api/download?type=mod&id=${mod.id}&index=${i}`} target="_blank" rel="noopener noreferrer" className="px-6 py-2.5 bg-[#1E3A5F] text-white rounded-sm font-medium hover:bg-[#162d47] text-center">前往下载</a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {mod.installInstructions && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-[#1C1917] mb-3">安装说明</h3>
                  <p className="text-stone-500 leading-relaxed whitespace-pre-wrap">{mod.installInstructions}</p>
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-[#1C1917] mb-3">MOD简介</h3>
                <p className="text-stone-500 leading-relaxed whitespace-pre-wrap">{mod.description}</p>
              </div>
            </div>
          </div>
          <div className="border-t border-stone-100 px-6 lg:px-8 py-4 bg-stone-50">
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-stone-500">
              <div className="flex items-center gap-6">
                <span>作者：{mod.author || '未知'}</span>
                <span>更新：{formatTime(mod.updatedAt)}</span>
              </div>
              <FeedbackButton targetType="mod" targetId={mod.id} targetName={mod.title} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
