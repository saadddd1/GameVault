'use client'

import { Suspense } from 'react'
import SoftwareCard from '@/components/SoftwareCard'
import DataList, { type DataListConfig } from '@/components/DataList'
import type { WindowsApp } from '@/lib/windows'

const config: DataListConfig = {
  title: (cat, q) => cat ? cat : q ? `搜索：${q}` : 'Windows 软件',
  emptyTitle: '没有找到软件',
  emptyDesc: '尝试更换筛选条件',
  emptyLink: '/windows',
  emptyLinkText: '查看全部',
  unit: '款软件',
  apiUrl: '/api/windows',
  dataKey: 'apps',
  hrefPrefix: '/windows',
  searchFields: ['name', 'description', 'category'],
  sortOptions: [
    { value: 'default', label: '默认排序' },
    { value: 'hot', label: '最热门' },
    { value: 'new', label: '最新发布' },
    { value: 'name', label: '按名称' },
  ],
  renderCard: (item) => <SoftwareCard key={(item as WindowsApp).id} app={item as WindowsApp} href={`/windows/${(item as WindowsApp).id}`} />,
}

export default function WindowsPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A5F]"></div></div>}>
      <DataList config={config} />
    </Suspense>
  )
}
