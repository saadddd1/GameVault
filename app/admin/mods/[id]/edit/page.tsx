'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getAuthHeaders } from '@/components/AuthProvider'
import FormInput from '@/components/admin/FormInput'
import FormSelect from '@/components/admin/FormSelect'
import FormTextarea from '@/components/admin/FormTextarea'
import DownloadLinksEditor from '@/components/admin/DownloadLinksEditor'
import AdminFormShell from '@/components/admin/AdminFormShell'

const PLATFORMS = ['百度网盘', '阿里云盘', '夸克网盘', '蓝奏云', '其他']

export default function EditModPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [categories, setCategories] = useState<string[]>([])

  const [formData, setFormData] = useState({
    title: '', description: '', coverImage: '', category: '', gameName: '',
    version: '', fileSize: '', tags: '', author: '', installInstructions: ''
  })
  const [downloadLinks, setDownloadLinks] = useState<{ platform: string; url: string; password: string }[]>([])

  useEffect(() => {
    fetch('/api/mods').then(r => r.json()).then(data => {
      if (data.categories) setCategories(data.categories)
      const mod = data.mods?.find((m: { id: number }) => m.id === parseInt(params.id as string))
      if (mod) {
        setFormData({
          title: mod.title, description: mod.description,
          coverImage: mod.coverImage || '', category: mod.category,
          gameName: mod.gameName || '', version: mod.version || '',
          fileSize: mod.fileSize || '', tags: (mod.tags || []).join(', '),
          author: mod.author || '', installInstructions: mod.installInstructions || ''
        })
        setDownloadLinks(mod.downloadLinks?.length > 0 ? mod.downloadLinks : [{ platform: '百度网盘', url: '', password: '' }])
      } else { setError('MOD不存在') }
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
      const res = await fetch('/api/mods', {
        method: 'PUT', headers: getAuthHeaders(),
        body: JSON.stringify({
          id: parseInt(params.id as string),
          title: formData.title, description: formData.description,
          coverImage: formData.coverImage || '/images/default.svg',
          category: formData.category, gameName: formData.gameName,
          version: formData.version, fileSize: formData.fileSize,
          downloadLinks: validLinks, tags, author: formData.author,
          installInstructions: formData.installInstructions
        })
      })
      if (res.ok) { setSuccess('更新成功！'); setTimeout(() => router.push('/admin/mods'), 1000) }
      else { const d = await res.json(); setError(d.error || '更新失败') }
    } catch { setError('网络错误') } finally { setLoading(false) }
  }

  return (
    <AdminFormShell title="编辑MOD" mode="edit" loading={loading} fetching={fetching} error={error} success={success} backHref="/admin/mods" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput label="MOD标题" name="title" value={formData.title} onChange={handleChange} required />
        <FormInput label="所属游戏" name="gameName" value={formData.gameName} onChange={handleChange} required />
        <FormSelect label="分类" name="category" value={formData.category} onChange={handleChange} options={categories} required />
        <FormInput label="版本" name="version" value={formData.version} onChange={handleChange} />
      </div>
      <FormInput label="封面图片" name="coverImage" value={formData.coverImage} onChange={handleChange} />
      <FormTextarea label="简介" name="description" value={formData.description} onChange={handleChange} required />
      <FormTextarea label="安装说明" name="installInstructions" value={formData.installInstructions} onChange={handleChange} rows={2} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormInput label="标签" name="tags" value={formData.tags} onChange={handleChange} placeholder="逗号分隔" />
        <FormInput label="作者" name="author" value={formData.author} onChange={handleChange} />
        <FormInput label="文件大小" name="fileSize" value={formData.fileSize} onChange={handleChange} />
      </div>
      <div className="border-t pt-6">
        <DownloadLinksEditor links={downloadLinks} onChange={setDownloadLinks} platforms={PLATFORMS} />
      </div>
    </AdminFormShell>
  )
}
