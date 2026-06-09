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

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(console.error).finally(() => setLoading(false))
  }, [])

  const statCards = [
    { title: '游戏总数', value: stats.totalGames, link: '/admin/games' },
    { title: '热门游戏', value: stats.hotGames, link: '/admin/games' },
    { title: '最新上架', value: stats.newGames, link: '/admin/games' },
    { title: '安卓软件', value: stats.totalAndroid || 0, link: '/admin/android' },
    { title: 'Windows软件', value: stats.totalWindows || 0, link: '/admin/windows' },
  ]

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A5F]"></div></div>
  }

  return (
    <div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map(card => (
          <Link key={card.title} href={card.link} className="bg-white rounded-sm border border-stone-200 p-5 hover:border-stone-400 transition-colors">
            <div className="text-3xl font-bold text-[#1C1917] mb-1">{card.value}</div>
            <div className="text-sm text-stone-500">{card.title}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-sm border border-stone-200 p-6">
        <h2 className="text-base font-semibold text-[#1C1917] mb-4">快捷操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link href="/admin/games/add" className="flex items-center gap-3 p-4 rounded-sm border border-stone-200 hover:border-[#1E3A5F] hover:bg-stone-50 transition-colors">
            <div className="w-10 h-10 bg-[#1E3A5F] rounded-sm flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </div>
            <div><div className="font-medium text-[#1C1917] text-sm">添加新游戏</div><div className="text-xs text-stone-500">Steam 导入或手动录入</div></div>
          </Link>
          <Link href="/admin/games" className="flex items-center gap-3 p-4 rounded-sm border border-stone-200 hover:border-[#1E3A5F] hover:bg-stone-50 transition-colors">
            <div className="w-10 h-10 bg-stone-100 rounded-sm flex items-center justify-center">
              <svg className="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            </div>
            <div><div className="font-medium text-[#1C1917] text-sm">管理游戏</div><div className="text-xs text-stone-500">编辑或删除游戏</div></div>
          </Link>
          <Link href="/admin/import" className="flex items-center gap-3 p-4 rounded-sm border border-stone-200 hover:border-[#1E3A5F] hover:bg-stone-50 transition-colors">
            <div className="w-10 h-10 bg-stone-100 rounded-sm flex items-center justify-center">
              <svg className="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            </div>
            <div><div className="font-medium text-[#1C1917] text-sm">批量导入</div><div className="text-xs text-stone-500">Excel 批量导入资源</div></div>
          </Link>
        </div>
      </div>
    </div>
  )
}
