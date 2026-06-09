'use client'

import DetailPage, { type DetailConfig } from '@/components/DetailPage'
import type { WindowsApp } from '@/lib/windows'

const config: DetailConfig<WindowsApp> = {
  apiUrl: '/api/windows',
  singleKey: 'app',
  listHref: '/windows',
  listLabel: 'Windows软件',
  notFoundLabel: '应用不存在',
  notFoundBackLabel: '返回Windows软件',
  getName: (a) => a.name,
  downloadType: 'windows',
  feedbackType: 'windows',
  getDateField: (a) => a.updatedAt,
  renderMetaExtra: (a) => (
    <>
      {a.version && <span className="text-stone-500 text-sm">版本：{a.version}</span>}
      {a.fileSize && <span className="text-stone-500 text-sm">大小：{a.fileSize}</span>}
    </>
  ),
  renderTags: (a) => a.tags?.length ? (
    <div className="flex flex-wrap gap-2 mb-6">
      {a.tags.map((t, i) => <span key={i} className="px-3 py-1 bg-stone-100 text-stone-600 text-sm rounded-sm">{t}</span>)}
    </div>
  ) : null,
  renderBottomLeft: (a) => (
    <>
      {a.createdAt && <span>创建日期：{new Date(a.createdAt).toLocaleDateString('zh-CN')}</span>}
      {a.author && <span>作者：{a.author}</span>}
    </>
  ),
}

export default function WindowsDetailPage() {
  return <DetailPage config={config} />
}
