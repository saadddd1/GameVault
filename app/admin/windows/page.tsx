'use client'

import AdminTable, { type AdminTableConfig } from '@/components/admin/AdminTable'
import type { WindowsApp } from '@/lib/windows'

const config: AdminTableConfig<WindowsApp> = {
  title: 'Windows软件管理',
  apiUrl: '/api/windows',
  dataKey: 'apps',
  addHref: '/admin/windows',
  addLabel: '添加应用',
  emptyLabel: '暂无Windows应用',
  columns: [
    {
      header: '应用名称',
      render: (a) => <div className="text-sm font-medium text-gray-900">{a.name}</div>,
    },
    {
      header: '分类',
      render: (a) => <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">{a.category}</span>,
    },
    {
      header: '版本',
      render: (a) => <span className="text-sm text-gray-500">{a.version || '-'}</span>,
    },
    {
      header: '下载次数',
      render: (a) => <span className="text-sm text-gray-500">{a.downloadCount.toLocaleString()}</span>,
    },
    {
      header: '更新时间',
      render: (a) => <span className="text-sm text-gray-500">{new Date(a.updatedAt).toLocaleDateString('zh-CN')}</span>,
    },
  ],
}

export default function WindowsManagePage() {
  return <AdminTable config={config} />
}
