'use client'

import AdminTable, { type AdminTableConfig } from '@/components/admin/AdminTable'
import type { Mod } from '@/lib/mod'

const config: AdminTableConfig<Mod> = {
  title: 'MOD管理',
  apiUrl: '/api/mods',
  dataKey: 'mods',
  addHref: '/admin/mods',
  addLabel: '添加MOD',
  emptyLabel: '暂无MOD',
  columns: [
    {
      header: '标题',
      render: (m) => <div className="text-sm font-medium text-gray-900">{m.title}</div>,
    },
    {
      header: '游戏',
      render: (m) => <span className="text-sm text-gray-500">{m.gameName}</span>,
    },
    {
      header: '分类',
      render: (m) => <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">{m.category}</span>,
    },
    {
      header: '下载',
      render: (m) => <span className="text-sm text-gray-500">{m.downloadCount.toLocaleString()}</span>,
    },
  ],
}

export default function ModsManagePage() {
  return <AdminTable config={config} />
}
