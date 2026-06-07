'use client'

import { useState } from 'react'

interface FeedbackButtonProps {
  targetType: 'game' | 'mod' | 'tool'
  targetId: number
  targetName: string
}

export default function FeedbackButton({ targetType, targetId, targetName }: FeedbackButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!content.trim()) return
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId, targetName, content: content.trim() })
      })
      const data = await res.json()
      if (data.success) {
        setSubmitted(true)
      } else {
        setError(data.error || '提交失败')
      }
    } catch {
      setError('网络错误')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setShowModal(false)
    setContent('')
    setSubmitted(false)
    setError('')
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-red-500 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        反馈问题
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={handleClose}>
          <div className="bg-white rounded-sm p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            {submitted ? (
              <div className="text-center py-6">
                <svg className="w-12 h-12 text-emerald-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-[#1C1917] mb-1">反馈已提交</h3>
                <p className="text-stone-500 text-sm mb-4">感谢你的反馈，我们会尽快处理</p>
                <button onClick={handleClose} className="px-6 py-2 bg-[#1E3A5F] text-white rounded-sm hover:bg-[#162d47] transition-colors text-sm">
                  关闭
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-[#1C1917] mb-4">反馈问题</h3>

                <div className="mb-4">
                  <label className="block text-sm text-stone-500 mb-1">资源名称</label>
                  <input
                    type="text"
                    value={targetName}
                    disabled
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-sm text-sm text-stone-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-stone-500 mb-1">
                    问题描述 <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="请描述你遇到的问题，比如：链接失效、文件损坏、版本不对..."
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-[#1E3A5F] h-28 resize-none"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm mb-3">{error}</p>
                )}

                <div className="flex justify-end gap-3">
                  <button onClick={handleClose} className="px-4 py-2 text-sm text-stone-500 hover:text-[#1C1917] transition-colors">
                    取消
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !content.trim()}
                    className="px-6 py-2 bg-[#1E3A5F] text-white rounded-sm hover:bg-[#162d47] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? '提交中...' : '提交反馈'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
