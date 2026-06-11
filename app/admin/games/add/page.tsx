'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthHeaders } from '@/components/AuthProvider'
import FormInput from '@/components/admin/FormInput'
import DownloadLinksEditor from '@/components/admin/DownloadLinksEditor'
import AdminFormShell from '@/components/admin/AdminFormShell'

interface ExistingGame {
  id: number
  title: string
  category: string
}

const GAME_PLATFORMS = ['夸克网盘', '迅雷网盘', 'UC网盘', '百度网盘']

export default function AddGamePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [duplicateGame, setDuplicateGame] = useState<ExistingGame | null>(null)
  const [allGames, setAllGames] = useState<ExistingGame[]>([])
  const [title, setTitle] = useState('')
  const [downloadLinks, setDownloadLinks] = useState<{ platform: string; url: string; password: string }[]>([
    { platform: '夸克网盘', url: '', password: '' },
    { platform: '迅雷网盘', url: '', password: '' },
    { platform: 'UC网盘', url: '', password: '' },
    { platform: '百度网盘', url: '', password: '' },
  ])

  useEffect(() => {
    fetch('/api/games').then(r => r.json()).then(data => {
      if (data.games) setAllGames(data.games.map((g: ExistingGame) => ({ id: g.id, title: g.title, category: g.category })))
    }).catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSuccess('');
    setDuplicateGame(null)

    const titleTrimmed = title.trim()
    if (!titleTrimmed) { setError('请输入游戏名称'); return }

    const validLinks = downloadLinks.filter(l => l.url.trim())
    if (validLinks.length === 0) { setError('请至少填写一个下载链接'); return }

    // 重复检测
    const existing = allGames.find(g => g.title.toLowerCase() === titleTrimmed.toLowerCase())
    if (existing) {
      setDuplicateGame(existing)
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/games', {
        method: 'POST', headers: getAuthHeaders(),
        body: JSON.stringify({
          title: titleTrimmed,
          downloadLinks: validLinks.map(l => ({
            platform: l.platform, url: l.url.trim(), password: l.password.trim()
          })),
        })
      })
      const data = await response.json()
      if (data.success || data.game) {
        setSuccess('游戏添加成功！封面、简介、分类已自动填充')
        setTimeout(() => router.push('/admin/games'), 2000)
      } else {
        setError(data.error || '添加失败')
      }
    } catch { setError('网络错误') } finally { setLoading(false) }
  }

  return (
    <AdminFormShell title="添加新游戏" mode="add" loading={loading} error={error} success={success} backHref="/admin/games" submitLabel="添加游戏" onSubmit={handleSubmit}>
      {duplicateGame && (
        <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-yellow-800">发现已存在的游戏</p>
              <p className="text-sm text-yellow-700 mt-1">本地已有「{duplicateGame.title}」（{duplicateGame.category}），确定还要添加吗？</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button type="button" onClick={() => router.push(`/admin/games/${duplicateGame.id}/edit`)}
                className="px-3 py-1.5 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">去编辑已有游戏</button>
              <button type="button" onClick={() => setDuplicateGame(null)}
                className="px-3 py-1.5 text-sm border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-100">仍然添加</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-4 text-white text-sm">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M11.972 1.35C5.914 1.35.983 6.281.983 12.34c0 4.86 3.16 8.98 7.54 10.44.55.1.75-.24.75-.53l-.01-1.9c-3.07.67-3.71-1.47-3.71-1.47-.5-1.28-1.23-1.62-1.23-1.62-1-.68.08-.67.08-.67 1.11.08 1.7 1.14 1.7 1.14.99 1.69 2.59 1.2 3.22.92.1-.72.39-1.2.7-1.48-2.45-.28-5.03-1.23-5.03-5.46 0-1.21.43-2.19 1.14-2.97-.12-.28-.5-1.4.1-2.93 0 0 .93-.3 3.06 1.14a10.66 10.66 0 015.56 0c2.12-1.44 3.05-1.14 3.05-1.14.6 1.53.22 2.65.11 2.93.71.78 1.13 1.76 1.13 2.97 0 4.24-2.59 5.18-5.05 5.45.4.34.75 1.01.75 2.04l-.01 3.03c0 .29.2.64.75.53a10.99 10.99 0 005.55-21.47c-1.17-2.22-3.36-3.89-5.85-4.55"/></svg>
          <span className="font-semibold">自动填充</span>
        </div>
        <p className="mt-1 text-white/70 text-xs">
          只需输入游戏名称，系统自动从本地数据库和 Steam 获取封面、简介、分类。输入中文名或英文名均可。
        </p>
      </div>

      <FormInput label="游戏名称" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="中文或英文名称，如：艾尔登法环、ELDEN RING" />

      <div className="border-t pt-6">
        <DownloadLinksEditor links={downloadLinks} onChange={setDownloadLinks} platforms={GAME_PLATFORMS} />
      </div>
    </AdminFormShell>
  )
}
