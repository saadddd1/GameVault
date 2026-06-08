'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthHeaders } from '@/components/AuthProvider'
import FormInput from '@/components/admin/FormInput'
import FormSelect from '@/components/admin/FormSelect'
import FormTextarea from '@/components/admin/FormTextarea'
import FormCheckbox from '@/components/admin/FormCheckbox'
import DownloadLinksEditor from '@/components/admin/DownloadLinksEditor'

interface SteamItem {
  id: number
  name: string
  tiny_image: string
}

interface GameMeta {
  id: number
  name: string
  nameEn: string
  description: string
  cover: string
  size: string
  category: string
}

interface ExistingGame {
  id: number
  title: string
  category: string
}

export default function AddGamePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [steamQuery, setSteamQuery] = useState('')
  const [steamResults, setSteamResults] = useState<SteamItem[]>([])
  const [localResults, setLocalResults] = useState<GameMeta[]>([])
  const [searching, setSearching] = useState(false)
  const [filling, setFilling] = useState(false)
  const [steamError, setSteamError] = useState('')
  const [showSearch, setShowSearch] = useState(true)
  const [duplicateGame, setDuplicateGame] = useState<ExistingGame | null>(null)
  const [allGames, setAllGames] = useState<ExistingGame[]>([])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverImage: '',
    size: '',
    category: '',
    releaseDate: '',
    screenshots: [] as string[],
    isHot: false,
    isNew: true,
    isFeatured: false
  })
  const [downloadLinks, setDownloadLinks] = useState<{ platform: string; url: string; password: string }[]>([
    { platform: '百度网盘', url: '', password: '' }
  ])

  useEffect(() => {
    fetch('/api/games')
      .then(r => r.json())
      .then(data => {
        if (data.categories) setCategories(data.categories)
        if (data.games) setAllGames(data.games.map((g: ExistingGame) => ({ id: g.id, title: g.title, category: g.category })))
      })
      .catch(() => {})
  }, [])

  const handleSearch = async () => {
    const q = steamQuery.trim()
    if (!q) return
    setSearching(true)
    setSteamError('')
    setSteamResults([])
    setLocalResults([])
    setDuplicateGame(null)

    try {
      const res = await fetch(`/api/steam/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      if (data.items?.length) setSteamResults(data.items.slice(0, 8))
      else if (data.error) setSteamError(data.error)
    } catch { setSteamError('Steam 连接失败') }

    try {
      const res = await fetch(`/api/game-search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      if (data.games?.length) setLocalResults(data.games)
    } catch { /* ignore */ }

    setSearching(false)
  }

  const handleSteamSelect = async (item: SteamItem) => {
    setFilling(true)
    setSteamResults([])
    setSteamQuery('')

    // 检查本地是否已存在同名游戏
    const existing = allGames.find(g => g.title.toLowerCase() === item.name.toLowerCase())
    if (existing) {
      setDuplicateGame(existing)
      setFilling(false)
      return
    }

    await fillFromSteam(item.id, item.name)
    setFilling(false)
  }

  const fillFromSteam = async (appId: number, name: string) => {
    try {
      const res = await fetch(`/api/steam/app?id=${appId}`)
      const data = await res.json()
      if (!data.name) return

      // 下载封面
      let localCover = data.cover || ''
      if (localCover) {
        try {
          const imgRes = await fetch('/api/steam/download-image', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ url: localCover, filename: data.name })
          })
          const imgData = await imgRes.json()
          if (imgData.path) localCover = imgData.path
        } catch { /* keep original URL */ }
      }

      // 下载截图 (最多 3 张)
      const localScreenshots: string[] = []
      const screenshots = (data.screenshots || []).slice(0, 3)
      for (const url of screenshots) {
        try {
          const imgRes = await fetch('/api/steam/download-image', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ url, filename: data.name + '_screenshot' })
          })
          const imgData = await imgRes.json()
          if (imgData.path) localScreenshots.push(imgData.path)
        } catch { localScreenshots.push(url) }
      }

      setFormData(prev => ({
        ...prev,
        title: data.name,
        description: (data.description || '').slice(0, 2000),
        coverImage: localCover,
        size: data.size || '',
        category: data.genres?.[0] || prev.category,
        releaseDate: data.releaseDate || '',
        screenshots: localScreenshots
      }))
      setShowSearch(false)
    } catch {
      setError('获取 Steam 详情失败')
    }
  }

  const handleLocalSelect = (game: GameMeta) => {
    setFormData(prev => ({
      ...prev,
      title: game.name,
      description: game.description?.slice(0, 1000) || '',
      coverImage: game.cover || '',
      size: game.size || '',
      category: game.category || prev.category
    }))
    setLocalResults([])
    setSteamQuery('')
    setShowSearch(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const validLinks = downloadLinks.filter(l => l.url)
    if (validLinks.length === 0) {
      setError('请至少填写一个下载链接')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          coverImage: formData.coverImage || '/images/default.svg',
          size: formData.size,
          category: formData.category,
          downloadLinks: validLinks,
          screenshots: formData.screenshots,
          releaseDate: formData.releaseDate || new Date().toISOString().split('T')[0],
          updateDate: new Date().toISOString().split('T')[0],
          downloadCount: 0,
          isHot: formData.isHot,
          isNew: formData.isNew,
          isFeatured: formData.isFeatured
        })
      })

      const data = await response.json()
      if (data.success) {
        setSuccess('游戏添加成功！')
        setTimeout(() => router.push('/admin/games'), 1500)
      } else {
        setError(data.error || '添加失败')
      }
    } catch {
      setError('网络错误，请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">添加新游戏</h2>

      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">{error}</div>}
      {success && <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600">{success}</div>}

      {/* 重复检测警告 */}
      {duplicateGame && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-yellow-800">发现已存在的游戏</p>
              <p className="text-sm text-yellow-700 mt-1">
                本地已有「{duplicateGame.title}」（{duplicateGame.category}），确定还要添加吗？
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => router.push(`/admin/games/${duplicateGame.id}/edit`)}
                className="px-3 py-1.5 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                去编辑已有游戏
              </button>
              <button
                type="button"
                onClick={() => setDuplicateGame(null)}
                className="px-3 py-1.5 text-sm border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-100"
              >
                仍然添加
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Steam 搜索 */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.972 1.35C5.914 1.35.983 6.281.983 12.34c0 4.86 3.16 8.98 7.54 10.44.55.1.75-.24.75-.53l-.01-1.9c-3.07.67-3.71-1.47-3.71-1.47-.5-1.28-1.23-1.62-1.23-1.62-1-.68.08-.67.08-.67 1.11.08 1.7 1.14 1.7 1.14.99 1.69 2.59 1.2 3.22.92.1-.72.39-1.2.7-1.48-2.45-.28-5.03-1.23-5.03-5.46 0-1.21.43-2.19 1.14-2.97-.12-.28-.5-1.4.1-2.93 0 0 .93-.3 3.06 1.14a10.66 10.66 0 015.56 0c2.12-1.44 3.05-1.14 3.05-1.14.6 1.53.22 2.65.11 2.93.71.78 1.13 1.76 1.13 2.97 0 4.24-2.59 5.18-5.05 5.45.4.34.75 1.01.75 2.04l-.01 3.03c0 .29.2.64.75.53a10.99 10.99 0 005.55-21.47c-1.17-2.22-3.36-3.89-5.85-4.55"/>
              </svg>
              <span className="font-semibold">Steam 导入</span>
              <span className="text-xs text-white/60">自动填标题/简介/分类/发布日/封面/截图</span>
            </div>
            <button type="button" onClick={() => { setShowSearch(!showSearch); setSteamResults([]); setLocalResults([]); setSteamQuery('') }} className="text-xs text-white/70 hover:text-white">
              {showSearch ? '收起' : '展开'}
            </button>
          </div>

          {showSearch && (
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={steamQuery}
                  onChange={(e) => setSteamQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch() } }}
                  placeholder="输入游戏英文名搜索 Steam（如 Elden Ring、Cyberpunk）..."
                  className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-white/40 text-sm"
                />
                <button type="button" onClick={handleSearch} disabled={searching || !steamQuery.trim()} className="px-4 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50">
                  {searching ? '搜索中...' : '搜索'}
                </button>
              </div>

              {steamError && <div className="mt-2 text-xs text-yellow-400">Steam 不可用，仅显示本地数据库结果</div>}

              {steamResults.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs text-white/50 mb-2">Steam 搜索结果</div>
                  <div className="bg-white/5 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                    {steamResults.map(item => (
                      <button key={item.id} type="button" disabled={filling} onClick={() => handleSteamSelect(item)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 transition-colors text-left border-b border-white/5 last:border-0 disabled:opacity-50">
                        <img src={item.tiny_image} alt="" className="w-8 h-11 rounded object-cover bg-white/10 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm truncate">{item.name}</div>
                          <div className="text-xs text-white/40">App ID: {item.id}</div>
                        </div>
                        <span className="text-xs text-white/30 flex-shrink-0">+ 填充</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {localResults.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs text-white/50 mb-2">本地数据库</div>
                  <div className="bg-white/5 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                    {localResults.map(game => (
                      <button key={game.id} type="button" onClick={() => handleLocalSelect(game)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 transition-colors text-left border-b border-white/5 last:border-0">
                        <div className="w-8 h-11 rounded bg-white/10 flex-shrink-0 flex items-center justify-center text-sm">
                          {game.cover ? <img src={game.cover} alt="" className="w-full h-full object-cover rounded" /> : 'G'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm truncate">{game.name}</div>
                          <div className="text-xs text-white/40">{game.nameEn} · {game.size} · {game.category}</div>
                        </div>
                        <span className="text-xs text-white/30 flex-shrink-0">+ 填充</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {filling && <div className="mt-3 text-center text-sm text-white/60">正在从 Steam 获取详情并下载封面和截图...</div>}
            </div>
          )}
        </div>

        {/* 基本信息 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput label="游戏名称" name="title" value={formData.title} onChange={handleChange} required />
          <FormInput label="游戏大小" name="size" value={formData.size} onChange={handleChange} placeholder="例如：10GB" required />
          <FormSelect label="游戏分类" name="category" value={formData.category} onChange={handleChange} options={categories} required />
          <FormInput label="发行日期" name="releaseDate" value={formData.releaseDate} onChange={handleChange} type="date" />
        </div>

        <FormInput label="封面图片链接" name="coverImage" value={formData.coverImage} onChange={handleChange} placeholder="留空使用默认封面（Steam 导入自动下载）" />

        <FormTextarea label="游戏简介" name="description" value={formData.description} onChange={handleChange} required />

        {/* 截图预览 */}
        {formData.screenshots.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">截图 (Steam 自动导入)</label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {formData.screenshots.map((url, i) => (
                <img key={i} src={url} alt={`screenshot ${i + 1}`} className="h-24 rounded-lg object-cover border" />
              ))}
            </div>
          </div>
        )}

        {/* 下载链接 */}
        <div className="border-t pt-6">
          <DownloadLinksEditor links={downloadLinks} onChange={setDownloadLinks} />
        </div>

        {/* 标记选项 */}
        <div className="border-t pt-6">
          <div className="flex items-center gap-6">
            <FormCheckbox label="标记为热门" name="isHot" checked={formData.isHot} onChange={handleChange} />
            <FormCheckbox label="标记为新游" name="isNew" checked={formData.isNew} onChange={handleChange} />
            <FormCheckbox label="标记为精选" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} />
          </div>
        </div>

        {/* 提交 */}
        <div className="border-t pt-6 flex justify-end gap-4">
          <button type="button" onClick={() => router.back()} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            取消
          </button>
          <button type="submit" disabled={loading} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? '提交中...' : '添加游戏'}
          </button>
        </div>
      </form>
    </div>
  )
}

