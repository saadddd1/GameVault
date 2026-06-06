'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let success: boolean
      
      if (isLogin) {
        success = await login(username, password)
        if (!success) {
          setError('用户名或密码错误')
        }
      } else {
        if (!email) {
          setError('请输入邮箱')
          setLoading(false)
          return
        }
        success = await register(username, email, password)
        if (!success) {
          setError('注册失败，用户名或邮箱可能已存在')
        }
      }

      if (success) {
        router.push('/')
      }
    } catch {
      setError('操作失败，请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-stone-200 rounded-sm p-8">
          {/* 标题 */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#1E3A5F] rounded-sm flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-3xl font-bold">游</span>
            </div>
            <h1 className="text-2xl font-bold text-[#1C1917]">
              {isLogin ? '欢迎回来' : '创建账号'}
            </h1>
            <p className="text-stone-500 mt-2">
              {isLogin ? '登录后享受更多功能' : '加入我们的游戏社区'}
            </p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-sm text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1C1917] mb-2">
                用户名
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-stone-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent transition-all"
                placeholder="请输入用户名"
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-[#1C1917] mb-2">
                  邮箱
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent transition-all"
                  placeholder="请输入邮箱"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#1C1917] mb-2">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-stone-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent transition-all"
                placeholder="请输入密码"
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#1E3A5F] hover:bg-[#162d47] text-white rounded-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
            </button>
          </form>

          {/* 切换登录/注册 */}
          <div className="mt-6 text-center text-sm text-stone-500">
            {isLogin ? '还没有账号？' : '已有账号？'}
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
              }}
              className="ml-1 text-[#1E3A5F] hover:text-[#162d47] font-medium"
            >
              {isLogin ? '立即注册' : '立即登录'}
            </button>
          </div>

          {!isLogin && (
            <div className="mt-6 p-4 bg-stone-50 rounded-sm">
              <p className="text-xs text-stone-500 text-center">
                注册后即可下载游戏
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
