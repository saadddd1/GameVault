'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getAuthHeaders } from '@/components/AuthProvider'
import type { Mod } from '@/lib/mod'

export default function ModsManagePage() {
  const [mods, setMods] = useState<Mod[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    fetch('/api/mods').then(r => r.json()).then(d => { if (d.mods) setMods(d.mods) }).finally(() => setLoading(false))
  }, [])

  const handleDelete = async () => {
    if (!deleteId) return
    const res = await fetch(`/api/mods?id=${deleteId}`, { method: 'DELETE', headers: getAuthHeaders() })
    if (res.ok) { setMods(mods.filter(m => m.id !== deleteId)); setShowConfirm(false); setDeleteId(null) }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">MOD管理</h2>
        <Link href="/admin/mods/add" className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg">+ 添加MOD</Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50"><tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">标题</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">游戏</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">分类</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">下载</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {mods.map(m => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-500">#{m.id}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{m.title}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{m.gameName}</td>
                <td className="px-6 py-4"><span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">{m.category}</span></td>
                <td className="px-6 py-4 text-sm text-gray-500">{m.downloadCount.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm font-medium"><div className="flex gap-2">
                  <Link href={`/admin/mods/${m.id}/edit`} className="text-green-600 hover:text-green-900">编辑</Link>
                  <button onClick={() => { setDeleteId(m.id); setShowConfirm(true) }} className="text-red-600 hover:text-red-900">删除</button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {mods.length === 0 && <div className="p-12 text-center text-gray-500">暂无MOD</div>}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white rounded-2xl p-6 max-w-sm mx-4">
          <h3 className="text-lg font-semibold mb-2">确认删除</h3><p className="text-gray-500 mb-6">确定删除？不可恢复。</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => { setShowConfirm(false); setDeleteId(null) }} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">取消</button>
            <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">确认删除</button>
          </div>
        </div></div>
      )}
    </div>
  )
}
