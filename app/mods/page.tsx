'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { getThumbPath } from '@/lib/image-paths'
import DataList, { type DataListConfig } from '@/components/DataList'
import type { Mod } from '@/lib/mod'

const config: DataListConfig = {
  title: (cat, q) => cat ? cat : q ? `搜索：${q}` : 'MOD',
  emptyTitle: '没有找到 MOD',
  emptyDesc: '尝试更换筛选条件',
  emptyLink: '/mods',
  emptyLinkText: '查看全部 MOD',
  unit: '个 MOD',
  apiUrl: '/api/mods',
  dataKey: 'mods',
  hrefPrefix: '/mods',
  searchFields: ['title', 'description', 'gameName', 'category'],
  sortOptions: [
    { value: 'default', label: '默认排序' },
    { value: 'hot', label: '最热门' },
    { value: 'new', label: '最新发布' },
  ],
  extraFilter: (item, params) => {
    const game = params.get('game')
    return !game || (item as Mod).gameName === game
  },
  renderCard: (item) => {
    const mod = item as Mod
    return (
      <Link key={mod.id} href={`/mods/${mod.id}`} className="group block">
        <article className="bg-white border border-stone-200 rounded-sm overflow-hidden hover:border-stone-400 transition-colors duration-200">
          <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
            {mod.coverImage && mod.coverImage !== '/images/default.svg' ? (
              <img src={getThumbPath(mod.coverImage)} alt={mod.title} width={400} height={300} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">{'⚙'}</div>
            )}
            <div className="absolute top-2 left-2">
              <span className="px-2 py-0.5 bg-[#1E3A5F] text-white text-[11px] font-semibold rounded-sm">{mod.category}</span>
            </div>
          </div>
          <div className="p-3 lg:p-4">
            <h3 className="font-bold text-[#1C1917] mb-1 line-clamp-1 text-sm">{mod.title}</h3>
            <p className="text-xs text-stone-500 mb-1">{mod.gameName}</p>
            <p className="text-xs text-stone-400 mb-2 line-clamp-2">{mod.description}</p>
            <div className="flex items-center justify-between text-xs text-stone-400 font-number">
              <span>{mod.downloadCount.toLocaleString()} 次下载</span>
              <span>{mod.fileSize}</span>
            </div>
          </div>
        </article>
      </Link>
    )
  },
}

export default function ModsPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A5F]"></div></div>}>
      <DataList config={config} />
    </Suspense>
  )
}
