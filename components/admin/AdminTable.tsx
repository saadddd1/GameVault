'use client'

import { useState, useEffect, ReactNode } from 'react'
import Link from 'next/link'
import { getAuthHeaders } from '@/components/AuthProvider'

interface Column<T> {
  header: string
  render: (item: T) => ReactNode
  className?: string
}

export interface AdminTableConfig<T extends { id: number }> {
  title: string
  apiUrl: string
  dataKey: string
  addHref: string
  addLabel: string
  emptyLabel: string
  columns: Column<T>[]
  renderExtraHeader?: () => ReactNode
}

export default function AdminTable<T extends { id: number }>({ config }: { config: AdminTableConfig<T> }) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  const fetchItems = async () => {
    try {
      const res = await fetch(config.apiUrl)
      const data = await res.json()
      if (data[config.dataKey]) setItems(data[config.dataKey])
    } catch (e) {
      console.error('获取列表失败:', e)
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchItems() }, [])

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`${config.apiUrl}?id=${deleteId}`, { method: 'DELETE', headers: getAuthHeaders() })
      if (res.ok) {
        setItems(items.filter(i => i.id !== deleteId))
        setShowConfirm(false)
        setDeleteId(null)
      }
    } catch { /* */ }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A5F]"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-sm border border-stone-200">
      <div className="p-5 border-b border-stone-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#1C1917]">{config.title}</h2>
          <div className="flex items-center gap-3">
            {config.renderExtraHeader?.()}
            <Link href={config.addHref} className="px-4 py-2 bg-[#1E3A5F] text-white rounded-sm text-sm font-medium hover:bg-[#162d47] transition-colors">
              + {config.addLabel}
            </Link>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-stone-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">ID</th>
              {config.columns.map((col, i) => (
                <th key={i} className={`px-5 py-3 text-left text-xs font-medium text-stone-500 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
              <th className="px-5 py-3 text-left text-xs font-medium text-stone-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-stone-50">
                <td className="px-5 py-3.5 whitespace-nowrap text-sm text-stone-500">#{item.id}</td>
                {config.columns.map((col, i) => (
                  <td key={i} className={`px-5 py-3.5 whitespace-nowrap ${col.className || ''}`}>
                    {col.render(item)}
                  </td>
                ))}
                <td className="px-5 py-3.5 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    <Link href={`${config.addHref}/${item.id}/edit`} className="text-green-600 hover:text-green-900">编辑</Link>
                    <button onClick={() => { setDeleteId(item.id); setShowConfirm(true) }} className="text-red-600 hover:text-red-900">删除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {items.length === 0 && <div className="p-12 text-center text-stone-500">{config.emptyLabel}</div>}

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-sm border border-stone-200 p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-[#1C1917] mb-2">确认删除</h3>
            <p className="text-stone-500 text-sm mb-6">确定要删除吗？此操作不可恢复。</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowConfirm(false); setDeleteId(null) }} className="px-4 py-2 border border-stone-300 text-stone-600 rounded-sm hover:bg-stone-50 text-sm">取消</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded-sm hover:bg-red-600 text-sm">确认删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
