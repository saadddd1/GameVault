'use client'

import { useState, useEffect } from 'react'
import { getAuthHeaders } from '@/components/AuthProvider'
import type { Feedback } from '@/lib/feedback'

export default function FeedbackManagePage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch('/api/feedback', { headers: getAuthHeaders() })
      const data = await res.json()
      if (data.feedbacks) setFeedbacks(data.feedbacks)
    } catch (err) {
      console.error('获取反馈失败:', err)
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    fetchFeedbacks()
  }, [])

  const handleToggle = async (id: number) => {
    try {
      const res = await fetch('/api/feedback', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id })
      })
      const data = await res.json()
      if (data.feedback) {
        setFeedbacks(prev => prev.map(f => f.id === id ? data.feedback : f))
      }
    } catch (err) {
      console.error('更新反馈失败:', err)
    }
  }

  const typeLabel = (t: string) => t === 'game' ? '游戏' : t === 'mod' ? 'MOD' : '工具'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900">反馈管理</h2>
      </div>

      {feedbacks.length === 0 ? (
        <div className="p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500">暂无用户反馈</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">资源名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">问题描述</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">提交时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {feedbacks.map((fb) => (
                <tr key={fb.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{fb.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      fb.targetType === 'game' ? 'bg-blue-100 text-blue-700' :
                      fb.targetType === 'mod' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {typeLabel(fb.targetType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{fb.targetName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{fb.content}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(fb.createdAt).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      fb.resolved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {fb.resolved ? '已处理' : '待处理'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleToggle(fb.id)}
                      className={`${fb.resolved ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}`}
                    >
                      {fb.resolved ? '标为未处理' : '标为已处理'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
