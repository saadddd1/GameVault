'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getAuthHeaders } from '@/components/AuthProvider'
import type { AndroidApp } from '@/lib/android'

export default function EditAndroidPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [categories, setCategories] = useState<string[]>([])

  const [formData, setFormData] = useState({
    name: '', description: '', coverImage: '', category: '', version: '', fileSize: '',
    platform1: '蓝奏云', url1: '', password1: '',
    platform2: '百度网盘', url2: '', password2: '',
    tags: '', author: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/android')
        const data = await res.json()
        if (data.categories) setCategories(data.categories)
        if (data.apps) {
          const app = data.apps.find((a: AndroidApp) => a.id === parseInt(params.id as string))
          if (app) {
            setFormData({
              name: app.name, description: app.description, coverImage: app.coverImage || '',
              category: app.category, version: app.version || '', fileSize: app.fileSize || '',
              platform1: app.downloadLinks[0]?.platform || '蓝奏云', url1: app.downloadLinks[0]?.url || '', password1: app.downloadLinks[0]?.password || '',
              platform2: app.downloadLinks[1]?.platform || '百度网盘', url2: app.downloadLinks[1]?.url || '', password2: app.downloadLinks[1]?.password || '',
              tags: app.tags?.join(', ') || '', author: app.author || ''
            })
          }
        }
      } catch { /* */ } finally { setPageLoading(false) }
    }
    fetchData()
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const downloadLinks = []
    if (formData.url1) downloadLinks.push({ platform: formData.platform1, url: formData.url1, password: formData.password1 })
    if (formData.url2) downloadLinks.push({ platform: formData.platform2, url: formData.url2, password: formData.password2 })
    const tags = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : []

    try {
      const response = await fetch('/api/android', {
        method: 'PUT', headers: getAuthHeaders(),
        body: JSON.stringify({
          id: parseInt(params.id as string),
          name: formData.name, description: formData.description,
          coverImage: formData.coverImage || '/images/default.svg',
          category: formData.category, version: formData.version,
          fileSize: formData.fileSize, downloadLinks, tags, author: formData.author
        })
      })
      if (response.ok) {
        setSuccess('更新成功！')
        setTimeout(() => router.push('/admin/android'), 1500)
      } else {
        const data = await response.json()
        setError(data.error || '更新失败')
      }
    } catch {
      setError('网络错误')
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">编辑安卓应用</h2>
      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">{error}</div>}
      {success && <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm font-medium text-gray-700 mb-2">应用名称 <span className="text-red-500">*</span></label><input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">分类 <span className="text-red-500">*</span></label><select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required><option value="">请选择</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">版本</label><input type="text" name="version" value={formData.version} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">文件大小</label><input type="text" name="fileSize" value={formData.fileSize} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">封面图片链接</label><input type="text" name="coverImage" value={formData.coverImage} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">应用简介 <span className="text-red-500">*</span></label><textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">标签</label><input type="text" name="tags" value={formData.tags} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">作者</label><input type="text" name="author" value={formData.author} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
        {[1, 2].map(n => (
          <div key={n} className="border-t pt-6"><h3 className="text-lg font-medium text-gray-900 mb-4">下载链接 {n}</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-2">平台</label><select name={`platform${n}`} value={(formData as any)[`platform${n}`]} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="蓝奏云">蓝奏云</option><option value="百度网盘">百度网盘</option><option value="阿里云盘">阿里云盘</option><option value="夸克网盘">夸克网盘</option><option value="GitHub">GitHub</option><option value="其他">其他</option></select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">链接地址</label><input type="text" name={`url${n}`} value={(formData as any)[`url${n}`]} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">提取码</label><input type="text" name={`password${n}`} value={(formData as any)[`password${n}`]} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          </div></div>
        ))}
        <div className="border-t pt-6 flex justify-end gap-4">
          <button type="button" onClick={() => router.back()} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">取消</button>
          <button type="submit" disabled={loading} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50">{loading ? '提交中...' : '保存修改'}</button>
        </div>
      </form>
    </div>
  )
}
