'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AddGamePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [categories, setCategories] = useState<string[]>([])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverImage: '',
    size: '',
    category: '',
    platform1: '百度网盘',
    url1: '',
    password1: '',
    platform2: '阿里云盘',
    url2: '',
    password2: '',
    isHot: false,
    isNew: true
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/games')
      const data = await response.json()
      if (data.categories) {
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('获取分类失败:', error)
    }
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

    try {
      const downloadLinks = []
      
      if (formData.url1) {
        downloadLinks.push({
          platform: formData.platform1,
          url: formData.url1,
          password: formData.password1
        })
      }
      
      if (formData.url2) {
        downloadLinks.push({
          platform: formData.platform2,
          url: formData.url2,
          password: formData.password2
        })
      }

      if (downloadLinks.length === 0) {
        setError('请至少填写一个下载链接')
        setLoading(false)
        return
      }

      const gameData = {
        title: formData.title,
        description: formData.description,
        coverImage: formData.coverImage || '/images/default-cover.jpg',
        size: formData.size,
        category: formData.category,
        downloadLinks,
        releaseDate: new Date().toISOString().split('T')[0],
        updateDate: new Date().toISOString().split('T')[0],
        downloadCount: 0,
        isHot: formData.isHot,
        isNew: formData.isNew
      }

      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameData)
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('游戏添加成功！')
        setTimeout(() => {
          router.push('/admin/games')
        }, 1500)
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
        {/* 基本信息 */}
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
              placeholder="请输入游戏名称"
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
              placeholder="例如：10GB"
              required
            />
          </div>
        </div>

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
            placeholder="请输入游戏简介"
            required
          />
        </div>

        {/* 下载链接1 */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">下载链接 1</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">平台</label>
              <select
                name="platform1"
                value={formData.platform1}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
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
                name="url1"
                value={formData.url1}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入下载链接"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">提取码</label>
              <input
                type="text"
                name="password1"
                value={formData.password1}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入提取码（可选）"
              />
            </div>
          </div>
        </div>

        {/* 下载链接2 */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">下载链接 2（可选）</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">平台</label>
              <select
                name="platform2"
                value={formData.platform2}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
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
                name="url2"
                value={formData.url2}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入下载链接"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">提取码</label>
              <input
                type="text"
                name="password2"
                value={formData.password2}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入提取码（可选）"
              />
            </div>
          </div>
        </div>

        {/* 标记选项 */}
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

        {/* 提交按钮 */}
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
            {loading ? '提交中...' : '添加游戏'}
          </button>
        </div>
      </form>
    </div>
  )
}
