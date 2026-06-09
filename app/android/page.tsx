'use client'

import { Suspense } from 'react'
import SoftwareCard from '@/components/SoftwareCard'
import DataList, { type DataListConfig } from '@/components/DataList'
import type { AndroidApp } from '@/lib/android'

const config: DataListConfig = {
  title: (cat, q) => cat ? cat : q ? `搜索：${q}` : '安卓软件',
  emptyTitle: '没有找到应用',
  emptyDesc: '尝试更换筛选条件',
  emptyLink: '/android',
  emptyLinkText: '查看全部',
  unit: '款应用',
  apiUrl: '/api/android',
  dataKey: 'apps',
  hrefPrefix: '/android',
  searchFields: ['name', 'description', 'category'],
  sortOptions: [
    { value: 'default', label: '默认排序' },
    { value: 'hot', label: '最热门' },
    { value: 'new', label: '最新发布' },
    { value: 'name', label: '按名称' },
  ],
  renderCard: (item) => <SoftwareCard key={(item as AndroidApp).id} app={item as AndroidApp} href={`/android/${(item as AndroidApp).id}`} />,
}

export default function AndroidPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A5F]"></div></div>}>
      <DataList config={config} />
    </Suspense>
  )
}
