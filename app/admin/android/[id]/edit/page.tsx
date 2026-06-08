'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getAuthHeaders } from '@/components/AuthProvider'
import FormInput from '@/components/admin/FormInput'
import FormSelect from '@/components/admin/FormSelect'
import FormTextarea from '@/components/admin/FormTextarea'
import DownloadLinksEditor from '@/components/admin/DownloadLinksEditor'

const PLATFORMS = ['蓝奏云', '百度网盘', '阿里云盘', '夸克网盘', 'GitHub', '其他']

export default function EditAndroidPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [categories, setCategories] = useState<string[]>([])

  const [formData, setFormData] = useState({
    name: '', description: '', coverImage: '', category: '', version: '', fileSize: '',
    tags: '', author: ''
  })
  const [downloadLinks, setDownloadLinks] = useState<{ platform: string; url: string; password: string }[]>([])

  useEffect(() => {
    fetch('/api/android').then(r => r.json()).then(data => {
      if (data.categories) setCategories(data.categories)
      const app = data.apps?.find((a: { id: number }) => a.id === parseInt(params.id as string))
      if (app) {
        setFormData({
          name: app.name, description: app.description,
          coverImage: app.coverImage || '', category: app.category,
          version: app.version || '', fileSize: app.fileSize || '',
          tags: (app.tags || []).join(', '), author: app.author || ''
        })
        setDownloadLinks(app.downloadLinks?.length > 0 ? app.downloadLinks : [{ platform: '蓝奏云', url: '', password: '' }])
      } else { setError('应用不存在') }
    }).catch(() => setError('获取信息失败')).finally(() => setFetching(false))
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)

    const validLinks = downloadLinks.filter(l => l.url)
    if (validLinks.length === 0) { setError('请至少填写一个下载链接'); setLoading(false); return }

    const tags = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : []

    try {
      const response = await fetch('/api/android', {
        method: 'PUT', headers: getAuthHeaders(),
        body: JSON.stringify({
          id: parseInt(params.id as string),
          name: formData.name, description: formData.description,
          coverImage: formData.coverImage || '/images/default.svg',
          category: formData.category, version: formData.version,
          fileSize: formData.fileSize, downloadLinks: validLinks, tags, author: formData.author
        })
      })
      if (response.ok) {
        setSuccess('更新成功！')
        setTimeout(() => router.push('/admin/android'), 1000)
      } else {
        const data = await response.json()
        setError(data.error || '更新失败')
      }
    } catch { setError('网络错误') } finally { setLoading(false) }
  }

  if (fetching) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">编辑安卓应用</h2>
      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">{error}</div>}
      {success && <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput label="应用名称" name="name" value={formData.name} onChange={handleChange} required />
          <FormSelect label="分类" name="category" value={formData.category} onChange={handleChange} options={categories} required />
          <FormInput label="版本" name="version" value={formData.version} onChange={handleChange} />
          <FormInput label="文件大小" name="fileSize" value={formData.fileSize} onChange={handleChange} />
        </div>
        <FormInput label="封面图片链接" name="coverImage" value={formData.coverImage} onChange={handleChange} />
        <FormTextarea label="应用简介" name="description" value={formData.description} onChange={handleChange} required />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput label="标签" name="tags" value={formData.tags} onChange={handleChange} placeholder="多个标签用逗号分隔" />
          <FormInput label="作者" name="author" value={formData.author} onChange={handleChange} />
        </div>

        <div className="border-t pt-6">
          <DownloadLinksEditor links={downloadLinks} onChange={setDownloadLinks} platforms={PLATFORMS} />
        </div>

        <div className="border-t pt-6 flex justify-end gap-4">
          <button type="button" onClick={() => router.back()} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">取消</button>
          <button type="submit" disabled={loading} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50">
            {loading ? '保存中...' : '保存修改'}
          </button>
        </div>
      </form>
    </div>
  )
}

