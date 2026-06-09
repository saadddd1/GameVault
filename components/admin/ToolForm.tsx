'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthHeaders } from '@/components/AuthProvider'
import FormInput from '@/components/admin/FormInput'
import FormSelect from '@/components/admin/FormSelect'
import FormTextarea from '@/components/admin/FormTextarea'
import DownloadLinksEditor from '@/components/admin/DownloadLinksEditor'
import AdminFormShell from '@/components/admin/AdminFormShell'

interface ToolFormConfig {
  apiUrl: string
  listUrl: string
  typeLabel: string
  sizePlaceholder: string
  defaultPlatform: string
}

const CONFIGS: Record<string, ToolFormConfig> = {
  android: {
    apiUrl: '/api/android',
    listUrl: '/admin/android',
    typeLabel: '安卓应用',
    sizePlaceholder: '例如：18.5 MB',
    defaultPlatform: '蓝奏云',
  },
  windows: {
    apiUrl: '/api/windows',
    listUrl: '/admin/windows',
    typeLabel: 'Windows应用',
    sizePlaceholder: '例如：45.2 MB',
    defaultPlatform: '蓝奏云',
  },
}

export default function ToolForm({ type, mode, editId }: { type: 'android' | 'windows'; mode: 'add' | 'edit'; editId?: number }) {
  const cfg = CONFIGS[type]
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(mode === 'edit')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [categories, setCategories] = useState<string[]>([])

  const [formData, setFormData] = useState({
    name: '', description: '', coverImage: '', category: '', version: '', fileSize: '',
    tags: '', author: ''
  })
  const [downloadLinks, setDownloadLinks] = useState<{ platform: string; url: string; password: string }[]>([
    { platform: cfg.defaultPlatform, url: '', password: '' }
  ])

  useEffect(() => {
    fetch(cfg.apiUrl).then(r => r.json()).then(d => {
      if (d.categories) setCategories(d.categories)
      if (mode === 'edit' && editId) {
        const item = (d.apps || []).find((a: { id: number }) => a.id === editId)
        if (item) {
          setFormData({
            name: item.name || '', description: item.description || '',
            coverImage: item.coverImage || '', category: item.category || '',
            version: item.version || '', fileSize: item.fileSize || '',
            tags: (item.tags || []).join(', '), author: item.author || ''
          })
          if (item.downloadLinks?.length > 0) setDownloadLinks(item.downloadLinks)
        } else { setError('应用不存在') }
      }
    }).catch(() => setError('获取数据失败')).finally(() => setFetching(false))
  }, [cfg.apiUrl, mode, editId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)
    const validLinks = downloadLinks.filter(l => l.url)
    if (validLinks.length === 0) { setError('请至少填写一个下载链接'); setLoading(false); return }
    const tags = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : []

    const method = mode === 'edit' ? 'PUT' : 'POST'
    const body: Record<string, unknown> = {
      name: formData.name, description: formData.description,
      coverImage: formData.coverImage || '/images/default.svg',
      category: formData.category, version: formData.version,
      fileSize: formData.fileSize, downloadLinks: validLinks, tags, author: formData.author
    }
    if (mode === 'edit' && editId) body.id = editId

    try {
      const res = await fetch(cfg.apiUrl, { method, headers: getAuthHeaders(), body: JSON.stringify(body) })
      if (res.ok) {
        setSuccess(mode === 'add' ? '添加成功！' : '更新成功！')
        setTimeout(() => router.push(cfg.listUrl), 1500)
      } else {
        const d = await res.json()
        setError(d.error || '操作失败')
      }
    } catch { setError('网络错误') } finally { setLoading(false) }
  }

  return (
    <AdminFormShell
      title={mode === 'add' ? `添加${cfg.typeLabel}` : `编辑${cfg.typeLabel}`}
      mode={mode}
      loading={loading}
      fetching={fetching}
      error={error}
      success={success}
      backHref={cfg.listUrl}
      submitLabel={mode === 'add' ? `添加${cfg.typeLabel}` : '保存修改'}
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput label="名称" name="name" value={formData.name} onChange={handleChange} required />
        <FormSelect label="分类" name="category" value={formData.category} onChange={handleChange} options={categories} required />
        <FormInput label="版本" name="version" value={formData.version} onChange={handleChange} />
        <FormInput label="文件大小" name="fileSize" value={formData.fileSize} onChange={handleChange} placeholder={cfg.sizePlaceholder} />
      </div>
      <FormInput label="封面图片链接" name="coverImage" value={formData.coverImage} onChange={handleChange} placeholder="留空使用默认封面" />
      <FormTextarea label="简介" name="description" value={formData.description} onChange={handleChange} required />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput label="标签" name="tags" value={formData.tags} onChange={handleChange} placeholder="多个标签用逗号分隔" />
        <FormInput label="作者" name="author" value={formData.author} onChange={handleChange} />
      </div>
      <div className="border-t pt-6">
        <DownloadLinksEditor links={downloadLinks} onChange={setDownloadLinks} />
      </div>
    </AdminFormShell>
  )
}
