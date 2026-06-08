'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthHeaders } from '@/components/AuthProvider'
import FormInput from '@/components/admin/FormInput'
import FormSelect from '@/components/admin/FormSelect'
import FormTextarea from '@/components/admin/FormTextarea'
import DownloadLinksEditor from '@/components/admin/DownloadLinksEditor'

const PLATFORMS = ['蓝奏云', '百度网盘', '阿里云盘', '夸克网盘', 'GitHub', '其他']

export default function AddWindowsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [categories, setCategories] = useState<string[]>([])

  const [formData, setFormData] = useState({
    name: '', description: '', coverImage: '', category: '', version: '', fileSize: '',
    tags: '', author: ''
  })
  const [downloadLinks, setDownloadLinks] = useState<{ platform: string; url: string; password: string }[]>([
    { platform: '蓝奏云', url: '', password: '' }
  ])

  useEffect(() => {
    fetch('/api/windows').then(r => r.json()).then(d => {
      if (d.categories) setCategories(d.categories)
    }).catch(() => {})
  }, [])

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
      const response = await fetch('/api/windows', {
        method: 'POST', headers: getAuthHeaders(),
        body: JSON.stringify({
          name: formData.name, description: formData.description,
          coverImage: formData.coverImage || '/images/default.svg',
          category: formData.category, version: formData.version,
          fileSize: formData.fileSize, downloadLinks: validLinks, tags, author: formData.author
        })
      })
      if (response.ok) {
        setSuccess('添加成功！')
        setTimeout(() => router.push('/admin/windows'), 1500)
      } else {
        const data = await response.json()
        setError(data.error || '添加失败')
      }
    } catch { setError('网络错误') } finally { setLoading(false) }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">添加Windows应用</h2>
      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">{error}</div>}
      {success && <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput label="应用名称" name="name" value={formData.name} onChange={handleChange} required />
          <FormSelect label="分类" name="category" value={formData.category} onChange={handleChange} options={categories} required />
          <FormInput label="版本" name="version" value={formData.version} onChange={handleChange} />
          <FormInput label="文件大小" name="fileSize" value={formData.fileSize} onChange={handleChange} placeholder="例如：45.2 MB" />
        </div>
        <FormInput label="封面图片链接" name="coverImage" value={formData.coverImage} onChange={handleChange} placeholder="留空使用默认封面" />
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
            {loading ? '提交中...' : '添加应用'}
          </button>
        </div>
      </form>
    </div>
  )
}

