'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import type { Tool } from '@/lib/tool'
import FeedbackButton from '@/components/FeedbackButton'

const languageColors: Record<string, string> = {
  'C++': 'bg-pink-100 text-pink-700',
  'C#': 'bg-green-100 text-green-700',
  'TypeScript': 'bg-stone-100 text-stone-700',
  'JavaScript': 'bg-yellow-100 text-yellow-700',
  'Python': 'bg-cyan-100 text-cyan-700',
  'Java': 'bg-orange-100 text-orange-700',
}

function formatStars(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

export default function ToolDetailPage() {
  const params = useParams()
  const [tool, setTool] = useState<Tool | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPasswords, setShowPasswords] = useState<{ [key: number]: boolean }>({})

  const fetchTool = async () => {
    try {
      const response = await fetch(`/api/tools?id=${params.id}`)
      const data = await response.json()
      if (data.tool) {
        setTool(data.tool)
      }
    } catch (error) {
      console.error('获取工具详情失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    fetchTool()
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

  if (!tool) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <svg className="w-20 h-20 text-stone-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-xl font-semibold text-[#1C1917] mb-2">工具不存在</h2>
        <p className="text-stone-500 mb-4">找不到这个工具，可能已被删除</p>
        <Link href="/tools" className="px-6 py-3 bg-[#1E3A5F] text-white rounded-sm hover:bg-[#162d47] transition-colors">
          返回工具列表
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
            <Link href="/tools" className="hover:text-[#1E3A5F] transition-colors">开源工具</Link>
            <span>/</span>
            <span className="text-[#1C1917]">{tool.name}</span>
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
                {tool.coverImage && tool.coverImage !== '/images/default.svg' ? (
                  <img
                    src={tool.coverImage}
                    alt={tool.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full min-h-[300px] flex items-center justify-center">
                    <svg className="w-24 h-24 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                )}

                {/* 分类标签 */}
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 text-white text-sm font-semibold rounded-sm bg-[#1E3A5F]">
                    {tool.category}
                  </span>
                </div>
              </div>
            </div>

            {/* 工具信息 */}
            <div className="flex-1 p-6 lg:p-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-[#1C1917] mb-4">
                {tool.name}
              </h1>

              {/* 工具元信息 */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="px-3 py-1.5 bg-stone-100 text-stone-700 text-sm font-medium rounded-sm">
                  {tool.category}
                </span>
                <span className={`px-3 py-1.5 text-sm font-medium rounded-sm ${languageColors[tool.language] || 'bg-stone-100 text-stone-500'}`}>
                  {tool.language}
                </span>
                <span className="flex items-center gap-1 text-sm text-stone-500">
                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  {formatStars(tool.stars)}
                </span>
                {tool.version && <span className="text-stone-500 text-sm">版本：{tool.version}</span>}
                {tool.fileSize && <span className="text-stone-500 text-sm">大小：{tool.fileSize}</span>}
                <span className="text-stone-500 text-sm">下载：{tool.downloadCount.toLocaleString()} 次</span>
                <span className="text-stone-500 text-sm">更新：{formatUpdateTime(tool.updatedAt)}</span>
              </div>

              {/* 标签 */}
              {tool.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {tool.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-stone-100 text-stone-600 text-sm rounded-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* GitHub 按钮 */}
              {tool.githubUrl && (
                <a
                  href={tool.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#1C1917] hover:bg-black text-white rounded-sm font-medium transition-colors mb-6"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub 仓库
                </a>
              )}

              {/* 下载按钮区域 */}
              {tool.downloadLinks && tool.downloadLinks.length > 0 && (
                <div className="bg-stone-50 rounded-sm p-5 mb-6">
                  <h3 className="text-lg font-semibold text-[#1C1917] mb-4">下载链接</h3>

                  <div className="space-y-3">
                      {tool.downloadLinks.map((link, index) => (
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
                            href={`/api/download?type=tool&id=${tool.id}&index=${index}`}
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
              )}

              {/* 工具简介 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#1C1917] mb-3">工具简介</h3>
                <p className="text-stone-500 leading-relaxed whitespace-pre-wrap">
                  {tool.description}
                </p>
              </div>
            </div>
          </div>

          {/* 底部信息栏 */}
          <div className="border-t border-stone-100 px-6 lg:px-8 py-4 bg-stone-50">
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-stone-500">
              <div className="flex items-center gap-6">
                <span>创建日期：{new Date(tool.createdAt).toLocaleDateString('zh-CN')}</span>
                <span>更新日期：{new Date(tool.updatedAt).toLocaleDateString('zh-CN')}</span>
              </div>
              <div className="flex items-center gap-4">
                <span>作者：{tool.author || '未知'}</span>
                <FeedbackButton targetType="tool" targetId={tool.id} targetName={tool.name} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
