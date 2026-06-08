'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getAuthHeaders } from '@/components/AuthProvider'
import FormInput from '@/components/admin/FormInput'
import FormSelect from '@/components/admin/FormSelect'
import FormTextarea from '@/components/admin/FormTextarea'
import FormCheckbox from '@/components/admin/FormCheckbox'
import DownloadLinksEditor from '@/components/admin/DownloadLinksEditor'

export default function EditGamePage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [categories, setCategories] = useState<string[]>([])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverImage: '',
    size: '',
    category: '',
    releaseDate: '',
    isHot: false,
    isNew: false,
    isFeatured: false
  })
  const [downloadLinks, setDownloadLinks] = useState<{ platform: string; url: string; password: string }[]>([])

  useEffect(() => {
    fetch('/api/games')
      .then(r => r.json())
      .then(data => {
        if (data.categories) setCategories(data.categories)
        const game = data.games?.find((g: { id: number }) => g.id === parseInt(params.id as string))
        if (game) {
          setFormData({
            title: game.title,
            description: game.description,
            coverImage: game.coverImage || '',
            size: game.size,
            category: game.category,
            releaseDate: game.releaseDate || '',
            isHot: game.isHot,
            isNew: game.isNew,
            isFeatured: game.isFeatured || false
          })
          setDownloadLinks(game.downloadLinks?.length > 0 ? game.downloadLinks : [{ platform: '百度网盘', url: '', password: '' }])
        } else {
          setError('游戏不存在')
        }
      })
      .catch(() => setError('获取游戏信息失败'))
      .finally(() => setFetching(false))
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }))
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
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          id: parseInt(params.id as string),
          title: formData.title,
          description: formData.description,
          coverImage: formData.coverImage || '/images/default.svg',
          size: formData.size,
          category: formData.category,
          downloadLinks: validLinks,
          releaseDate: formData.releaseDate,
          updateDate: new Date().toISOString().split('T')[0],
          isHot: formData.isHot,
          isNew: formData.isNew,
          isFeatured: formData.isFeatured
        })
      })

      const data = await response.json()
      if (data.success) {
        setSuccess('游戏更新成功！')
        setTimeout(() => router.push('/admin/games'), 1000)
      } else {
        setError(data.error || '更新失败')
      }
    } catch {
      setError('网络错误，请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">编辑游戏</h2>

      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">{error}</div>}
      {success && <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput label="游戏名称" name="title" value={formData.title} onChange={handleChange} required />
          <FormInput label="游戏大小" name="size" value={formData.size} onChange={handleChange} required />
          <FormSelect label="游戏分类" name="category" value={formData.category} onChange={handleChange} options={categories} required />
          <FormInput label="发行日期" name="releaseDate" value={formData.releaseDate} onChange={handleChange} type="date" />
        </div>

        <FormInput label="封面图片链接" name="coverImage" value={formData.coverImage} onChange={handleChange} placeholder="留空使用默认封面" />

        <FormTextarea label="游戏简介" name="description" value={formData.description} onChange={handleChange} required />

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

        <div className="border-t pt-6 flex justify-end gap-4">
          <button type="button" onClick={() => router.back()} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">取消</button>
          <button type="submit" disabled={loading} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? '保存中...' : '保存修改'}
          </button>
        </div>
      </form>
    </div>
  )
}

