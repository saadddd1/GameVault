'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getAuthHeaders } from '@/components/AuthProvider'

export default function EditToolPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [fetchingGithub, setFetchingGithub] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    coverImage: '',
    category: '游戏引擎',
    language: '',
    githubUrl: '',
    stars: 0,
    author: '',
    version: '',
    fileSize: '',
    tags: '',
    downloadLinks: [] as { platform: string; url: string; password: string }[]
  })

  const fetchTool = async () => {
    try {
      const response = await fetch(`/api/tools?id=${params.id}`)
      const data = await response.json()

      if (data.tool) {
        const tool = data.tool
        setFormData({
          name: tool.name,
          description: tool.description,
          coverImage: tool.coverImage || '',
          category: tool.category,
          language: tool.language,
          githubUrl: tool.githubUrl || '',
          stars: tool.stars || 0,
          author: tool.author,
          version: tool.version,
          fileSize: tool.fileSize,
          tags: (tool.tags || []).join(', '),
          downloadLinks: tool.downloadLinks || []
        })
      } else {
        setError('工具不存在')
      }
    } catch {
      setError('获取工具信息失败')
    } finally {
      setFetching(false)
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    fetchTool()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'stars' ? parseInt(value) || 0 : value
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
    if (formData.downloadLinks.length >= 5) return
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

  const handleFetchGithub = async () => {
    if (!formData.githubUrl) return
    setFetchingGithub(true)
    try {
      const res = await fetch(`/api/github-stars?url=${encodeURIComponent(formData.githubUrl)}`)
      const data = await res.json()
      if (data.stars) {
        setFormData(prev => ({ ...prev, stars: data.stars }))
      }
      if (data.language) {
        setFormData(prev => ({ ...prev, language: data.language }))
      }
    } catch {
      // ignore
    } finally {
      setFetchingGithub(false)
    }
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

      const response = await fetch('/api/tools', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          id: parseInt(params.id as string),
          name: formData.name,
          description: formData.description,
          coverImage: formData.coverImage || '/images/default.svg',
          category: formData.category,
          language: formData.language,
          githubUrl: formData.githubUrl,
          stars: formData.stars,
          author: formData.author,
          version: formData.version,
          fileSize: formData.fileSize,
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [],
          downloadLinks: validLinks
        })
      })

      const data = await response.json()

      if (data.tool) {
        setSuccess('工具更新成功！')
        setTimeout(() => router.push('/admin/tools'), 1000)
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
      <h2 className="text-xl font-semibold text-gray-900 mb-6">编辑工具</h2>

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
              名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              分类 <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="游戏引擎">游戏引擎</option>
              <option value="游戏框架">游戏框架</option>
              <option value="模拟器">模拟器</option>
              <option value="游戏工具">游戏工具</option>
            </select>
          </div>
        </div>

        {/* GitHub URL + 获取信息 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GitHub URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleChange}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://github.com/owner/repo"
              />
              <button
                type="button"
                onClick={handleFetchGithub}
                disabled={fetchingGithub || !formData.githubUrl}
                className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm"
              >
                {fetchingGithub ? '获取中...' : '获取信息'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              语言
            </label>
            <input
              type="text"
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例如：C++"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Star数
            </label>
            <input
              type="number"
              name="stars"
              value={formData.stars}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="GitHub Star 数量"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              作者
            </label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入作者名称"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              版本号
            </label>
            <input
              type="text"
              name="version"
              value={formData.version}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例如：v1.0.0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              文件大小
            </label>
            <input
              type="text"
              name="fileSize"
              value={formData.fileSize}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例如：10MB"
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
            描述 <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="请输入工具描述"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            标签
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="多个标签用逗号分隔，例如：引擎,2D,跨平台"
          />
        </div>

        {/* 下载链接 */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">下载链接</h3>
            {formData.downloadLinks.length < 5 && (
              <button
                type="button"
                onClick={addDownloadLink}
                className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
              >
                + 添加链接
              </button>
            )}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">提取码</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={link.password}
                    onChange={(e) => handleLinkChange(index, 'password', e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="提取码（可选）"
                  />
                  {formData.downloadLinks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDownloadLink(index)}
                      className="px-3 py-3 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      删除
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
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
            {loading ? '保存中...' : '保存修改'}
          </button>
        </div>
      </form>
    </div>
  )
}
