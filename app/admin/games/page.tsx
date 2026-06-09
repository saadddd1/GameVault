'use client'

import Link from 'next/link'
import AdminTable, { type AdminTableConfig } from '@/components/admin/AdminTable'
import type { Game } from '@/lib/games'

const config: AdminTableConfig<Game> = {
  title: '游戏管理',
  apiUrl: '/api/games',
  dataKey: 'games',
  addHref: '/admin/games',
  addLabel: '添加游戏',
  emptyLabel: '暂无游戏数据',
  renderExtraHeader: () => (
    <Link href="/admin/import" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all">
      <span className="flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        批量导入
      </span>
    </Link>
  ),
  columns: [
    {
      header: '游戏名称',
      render: (g) => <div className="text-sm font-medium text-gray-900">{g.title}</div>,
    },
    {
      header: '分类',
      render: (g) => <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">{g.category}</span>,
    },
    {
      header: '大小',
      render: (g) => <span className="text-sm text-gray-500">{g.size}</span>,
    },
    {
      header: '下载次数',
      render: (g) => <span className="text-sm text-gray-500">{g.downloadCount.toLocaleString()}</span>,
    },
    {
      header: '状态',
      render: (g) => (
        <div className="flex gap-1">
          {g.isHot && <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">热门</span>}
          {g.isNew && <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">新游</span>}
          {g.isFeatured && <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">精选</span>}
        </div>
      ),
    },
    {
      header: '更新时间',
      render: (g) => <span className="text-sm text-gray-500">{new Date(g.updateDate).toLocaleDateString('zh-CN')}</span>,
    },
  ],
}

export default function GamesManagePage() {
  return <AdminTable config={config} />
}
