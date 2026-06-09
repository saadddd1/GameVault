'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface Stats {
  totalGames: number
  hotGames: number
  newGames: number
  totalAndroid: number
  totalWindows: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalGames: 0, hotGames: 0, newGames: 0, totalAndroid: 0, totalWindows: 0
  })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [updateMsg, setUpdateMsg] = useState('')

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(console.error).finally(() => setLoading(false))
  }, [])

  const handleUpdate = async () => {
    if (!confirm('确定要从 GitHub 拉取最新代码并重启服务？')) return
    setUpdating(true)
    setUpdateMsg('')
    try {
      const res = await fetch('/api/admin/update', { method: 'POST' })
      const data = await res.json()
      setUpdateMsg(data.success ? '更新成功！服务已重启' : '更新失败: ' + data.error)
    } catch {
      setUpdateMsg('请求失败，请检查服务器状态')
    }
    setUpdating(false)
  }

  const statCards = [
    { title: '游戏总数', value: stats.totalGames, color: 'from-blue-500 to-blue-600', link: '/admin/games' },
    { title: '热门游戏', value: stats.hotGames, color: 'from-orange-500 to-red-500', link: '/admin/games' },
    { title: '最新上架', value: stats.newGames, color: 'from-green-500 to-green-600', link: '/admin/games' },
    { title: '安卓软件', value: stats.totalAndroid || 0, color: 'from-emerald-500 to-teal-600', link: '/admin/android' },
    { title: 'Windows软件', value: stats.totalWindows || 0, color: 'from-sky-500 to-blue-600', link: '/admin/windows' },
  ]

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {statCards.map(card => (
          <Link key={card.title} href={card.link} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className={`w-14 h-14 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center text-white mb-4`}>
              <span className="text-2xl font-bold">{card.value}</span>
            </div>
            <div className="text-sm text-gray-500">{card.title}</div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">快捷操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/games/add" className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg></div>
            <div><div className="font-medium text-gray-900">添加新游戏</div><div className="text-sm text-gray-500">上传游戏资源信息</div></div>
          </Link>
          <Link href="/admin/games" className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"><svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg></div>
            <div><div className="font-medium text-gray-900">管理游戏</div><div className="text-sm text-gray-500">编辑或删除游戏</div></div>
          </Link>
          <Link href="/" className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></div>
            <div><div className="font-medium text-gray-900">预览网站</div><div className="text-sm text-gray-500">查看前台效果</div></div>
          </Link>
          <Link href="/admin/android/add" className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-teal-400 hover:bg-teal-50 transition-all">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center"><svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg></div>
            <div><div className="font-medium text-gray-900">添加安卓软件</div><div className="text-sm text-gray-500">发布安卓应用资源</div></div>
          </Link>
          <Link href="/admin/windows/add" className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-sky-400 hover:bg-sky-50 transition-all">
            <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center"><svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg></div>
            <div><div className="font-medium text-gray-900">添加Windows软件</div><div className="text-sm text-gray-500">发布Windows应用资源</div></div>
          </Link>
          <button
            onClick={handleUpdate}
            disabled={updating}
            className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-amber-400 hover:bg-amber-50 transition-all disabled:opacity-50"
          >
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              {updating ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-600"></div>
              ) : (
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              )}
            </div>
            <div><div className="font-medium text-gray-900">{updating ? '更新中...' : '更新代码'}</div><div className="text-sm text-gray-500">从 GitHub 拉取并重启</div></div>
          </button>
        </div>
        {updateMsg && (
          <div className={`mt-4 p-3 rounded text-sm font-medium ${updateMsg.includes('成功') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {updateMsg}
          </div>
        )}
      </div>
    </div>
  )
}
