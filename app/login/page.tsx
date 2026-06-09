'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const success = await login(username, password)
    if (success) {
      router.push('/admin')
    } else {
      setError('用户名或密码错误')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAF9' }}>
      <div className="w-full max-w-sm mx-4">
        <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-8">
          <div className="text-center mb-8">
            <img src="/logo.png" alt="Geme Vault" className="w-12 h-12 rounded-sm mx-auto mb-4 object-contain" />
            <h1 className="text-xl font-bold text-[#1C1917]">Geme Vault</h1>
            <p className="text-sm text-stone-400 mt-1">管理后台</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#1C1917] mb-1.5">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] text-sm"
                placeholder="请输入用户名"
                required
                autoFocus
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-[#1C1917] mb-1.5">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] text-sm"
                placeholder="请输入密码"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#1E3A5F] text-white text-sm font-medium rounded-sm hover:bg-[#162d47] disabled:opacity-50 transition-colors"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-stone-400 mt-6">
          忘记密码？运行 <code className="bg-stone-100 px-1 py-0.5 rounded">node scripts/reset-password.js admin 新密码</code>
        </p>
      </div>
    </div>
  )
}
