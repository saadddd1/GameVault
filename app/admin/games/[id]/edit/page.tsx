'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getAuthHeaders } from '@/components/AuthProvider'

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
    downloadLinks: [] as { platform: string; url: string; password: string }[],
    isHot: false,
    isNew: false
  })

  useEffect(() => {
    fetchGameAndCategories()
  }, [])

  const fetchGameAndCategories = async () => {
    try {
      const response = await fetch('/api/games')
      const data = await response.json()
      if (data.categories) setCategories(data.categories)

      const game = data.games?.find((g: { id: number }) => g.id === parseInt(params.id as string))
      if (game) {
        setFormData({
          title: game.title,
          description: game.description,
          coverImage: game.coverImage || '',
          size: game.size,
          category: game.category,
          releaseDate: game.releaseDate,
          downloadLinks: game.downloadLinks || [],
          isHot: game.isHot,
          isNew: game.isNew
        })
      } else {
        setError('游戏不存在')
      }
    } catch {
      setError('获取游戏信息失败')
    } finally {
      setFetching(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleLinkChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const links = [...prev.downloadLinks]
      links[index] = { ...links[index], [field]: value }
      return { ...prev, downloadLinks: links }
    })
  }

  const addDownloadLink = () => {
    setFormData(prev => ({
      ...prev,
      downloadLinks: [...prev.downloadLinks, { platform: '', url: '', password: '' }]
    }))
  }

  const removeDownloadLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      downloadLinks: prev.downloadLinks.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const validLinks = formData.downloadLinks.filter(l => l.url)

      if (validLinks.length === 0) {
        setError('请至少填写一个下载链接')
        setLoading(false)
        return
      }

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
          isNew: formData.isNew
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

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              游戏名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              游戏大小 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="size"
              value={formData.size}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              游戏分类 <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">请选择分类</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              发行日期
            </label>
            <input
              type="date"
              name="releaseDate"
              value={formData.releaseDate}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            封面图片链接
          </label>
          <input
            type="text"
            name="coverImage"
            value={formData.coverImage}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="请输入图片URL（留空使用默认封面）"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            游戏简介 <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">下载链接</h3>
            <button
              type="button"
              onClick={addDownloadLink}
              className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
            >
              + 添加链接
            </button>
          </div>
          {formData.downloadLinks.map((link, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">平台</label>
                <select
                  value={link.platform}
                  onChange={(e) => handleLinkChange(index, 'platform', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">选择平台</option>
                  <option value="百度网盘">百度网盘</option>
                  <option value="阿里云盘">阿里云盘</option>
                  <option value="夸克网盘">夸克网盘</option>
                  <option value="迅雷网盘">迅雷网盘</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">链接地址</label>
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入下载链接"
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">提取码</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={link.password}
                    onChange={(e) => handleLinkChange(index, 'password', e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="提取码（可选）"
                  />
                  <button
                    type="button"
                    onClick={() => removeDownloadLink(index)}
                    className="px-3 py-3 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-6">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isHot"
                checked={formData.isHot}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">标记为热门</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isNew"
                checked={formData.isNew}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">标记为新游</span>
            </label>
          </div>
        </div>

        <div className="border-t pt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '保存中...' : '保存修改'}
          </button>
        </div>
      </form>
    </div>
  )
}
