'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getAuthHeaders } from '@/components/AuthProvider'
import FormInput from '@/components/admin/FormInput'
import FormSelect from '@/components/admin/FormSelect'
import FormTextarea from '@/components/admin/FormTextarea'
import FormCheckbox from '@/components/admin/FormCheckbox'
import DownloadLinksEditor from '@/components/admin/DownloadLinksEditor'
import AdminFormShell from '@/components/admin/AdminFormShell'

export default function EditGamePage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [categories, setCategories] = useState<string[]>([])

  const [formData, setFormData] = useState({
    title: '', description: '', coverImage: '', size: '', category: '',
    releaseDate: '', developer: '', publisher: '', steamUrl: '',
    supportedLanguages: '', systemRequirements: { minimum: '', recommended: '' },
    isHot: false, isNew: false, isFeatured: false
  })
  const [downloadLinks, setDownloadLinks] = useState<{ platform: string; url: string; password: string }[]>([])

  useEffect(() => {
    fetch('/api/games').then(r => r.json()).then(data => {
      if (data.categories) setCategories(data.categories)
      const game = data.games?.find((g: { id: number }) => g.id === parseInt(params.id as string))
      if (game) {
        setFormData({
          title: game.title, description: game.description,
          coverImage: game.coverImage || '', size: game.size,
          category: game.category, releaseDate: game.releaseDate || '',
          developer: game.developer || '', publisher: game.publisher || '',
          steamUrl: game.steamUrl || '',
          supportedLanguages: (game.supportedLanguages || []).join(', '),
          systemRequirements: game.systemRequirements || { minimum: '', recommended: '' },
          isHot: game.isHot, isNew: game.isNew, isFeatured: game.isFeatured || false
        })
        setDownloadLinks(game.downloadLinks?.length > 0 ? game.downloadLinks : [{ platform: '百度网盘', url: '', password: '' }])
      } else { setError('游戏不存在') }
    }).catch(() => setError('获取游戏信息失败')).finally(() => setFetching(false))
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }))
  }

  const handleReqChange = (field: 'minimum' | 'recommended', value: string) => {
    setFormData(prev => ({ ...prev, systemRequirements: { ...prev.systemRequirements, [field]: value } }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)
    const validLinks = downloadLinks.filter(l => l.url)
    if (validLinks.length === 0) { setError('请至少填写一个下载链接'); setLoading(false); return }

    try {
      const res = await fetch('/api/games', {
        method: 'PUT', headers: getAuthHeaders(),
        body: JSON.stringify({
          id: parseInt(params.id as string),
          title: formData.title, description: formData.description,
          coverImage: formData.coverImage || '/images/default.svg',
          size: formData.size, category: formData.category,
          downloadLinks: validLinks, releaseDate: formData.releaseDate,
          updateDate: new Date().toISOString().split('T')[0],
          isHot: formData.isHot, isNew: formData.isNew, isFeatured: formData.isFeatured,
          steamUrl: formData.steamUrl || undefined,
          developer: formData.developer || undefined,
          publisher: formData.publisher || undefined,
          supportedLanguages: formData.supportedLanguages ? formData.supportedLanguages.split(',').map(s => s.trim()).filter(Boolean) : undefined,
          systemRequirements: formData.systemRequirements.minimum || formData.systemRequirements.recommended ? formData.systemRequirements : undefined
        })
      })
      const data = await res.json()
      if (data.success) { setSuccess('游戏更新成功！'); setTimeout(() => router.push('/admin/games'), 1000) }
      else { setError(data.error || '更新失败') }
    } catch { setError('网络错误') } finally { setLoading(false) }
  }

  return (
    <AdminFormShell title="编辑游戏" mode="edit" loading={loading} fetching={fetching} error={error} success={success} backHref="/admin/games" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput label="游戏名称" name="title" value={formData.title} onChange={handleChange} required />
        <FormInput label="游戏大小" name="size" value={formData.size} onChange={handleChange} required />
        <FormSelect label="游戏分类" name="category" value={formData.category} onChange={handleChange} options={categories} required />
        <FormInput label="发行日期" name="releaseDate" value={formData.releaseDate} onChange={handleChange} type="date" />
      </div>
      <FormInput label="封面图片链接" name="coverImage" value={formData.coverImage} onChange={handleChange} placeholder="留空使用默认封面" />
      <FormTextarea label="游戏简介" name="description" value={formData.description} onChange={handleChange} required />
      {/* Steam 增强信息 */}
      <div className="border-t pt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Steam 信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput label="开发商" name="developer" value={formData.developer} onChange={handleChange} />
          <FormInput label="发行商" name="publisher" value={formData.publisher} onChange={handleChange} />
        </div>
        <FormInput label="Steam 商店链接" name="steamUrl" value={formData.steamUrl} onChange={handleChange} placeholder="https://store.steampowered.com/app/..." />
        <FormInput label="支持语言" name="supportedLanguages" value={formData.supportedLanguages} onChange={handleChange} placeholder="简体中文, 英语, 日语（逗号分隔）" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">最低配置</label>
            <textarea
              value={formData.systemRequirements.minimum}
              onChange={(e) => handleReqChange('minimum', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">推荐配置</label>
            <textarea
              value={formData.systemRequirements.recommended}
              onChange={(e) => handleReqChange('recommended', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <DownloadLinksEditor links={downloadLinks} onChange={setDownloadLinks} />
      </div>
      <div className="border-t pt-6">
        <div className="flex items-center gap-6">
          <FormCheckbox label="标记为热门" name="isHot" checked={formData.isHot} onChange={handleChange} />
          <FormCheckbox label="标记为新游" name="isNew" checked={formData.isNew} onChange={handleChange} />
          <FormCheckbox label="标记为精选" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} />
        </div>
      </div>
    </AdminFormShell>
  )
}
