'use client'

import { Suspense } from 'react'
import GameCard from '@/components/GameCard'
import DataList, { type DataListConfig } from '@/components/DataList'
import type { Game } from '@/lib/games'

const config: DataListConfig = {
  title: (cat, q) => cat ? cat : q ? `搜索：${q}` : '全部游戏',
  emptyTitle: '没有找到游戏',
  emptyDesc: '尝试更换筛选条件或搜索关键词',
  emptyLink: '/games',
  emptyLinkText: '查看全部游戏',
  unit: '款游戏',
  apiUrl: '/api/games',
  dataKey: 'games',
  hrefPrefix: '/games',
  searchFields: ['title', 'description', 'category'],
  sortOptions: [
    { value: 'default', label: '默认排序' },
    { value: 'hot', label: '最热门' },
    { value: 'new', label: '最新上架' },
    { value: 'name', label: '按名称' },
  ],
  renderCard: (item) => <GameCard key={(item as Game).id} game={item as Game} />,
}

export default function GamesPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A5F]"></div></div>}>
      <DataList config={config} />
    </Suspense>
  )
}
