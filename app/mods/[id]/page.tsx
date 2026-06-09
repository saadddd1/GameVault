'use client'

import DetailPage, { type DetailConfig } from '@/components/DetailPage'
import type { Mod } from '@/lib/mod'

const config: DetailConfig<Mod> = {
  apiUrl: '/api/mods',
  dataKey: 'mods',
  listHref: '/mods',
  listLabel: '游戏MOD',
  notFoundLabel: 'MOD不存在',
  notFoundBackLabel: '返回MOD列表',
  getName: (m) => m.title,
  downloadType: 'mod',
  feedbackType: 'mod',
  getDateField: (m) => m.updatedAt,
  renderMetaExtra: (m) => (
    <>
      <span className="text-stone-500 text-sm">游戏：{m.gameName}</span>
      {m.version && <span className="text-stone-500 text-sm">版本：{m.version}</span>}
      {m.fileSize && <span className="text-stone-500 text-sm">大小：{m.fileSize}</span>}
    </>
  ),
  renderTags: (m) => m.tags?.length ? (
    <div className="flex flex-wrap gap-2 mb-6">
      {m.tags.map((t, i) => <span key={i} className="px-3 py-1 bg-stone-100 text-stone-600 text-sm rounded-sm">{t}</span>)}
    </div>
  ) : null,
  renderExtra: (m) => m.installInstructions ? (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-[#1C1917] mb-3">安装说明</h3>
      <p className="text-stone-500 leading-relaxed whitespace-pre-wrap">{m.installInstructions}</p>
    </div>
  ) : null,
  renderBottomLeft: (m) => (
    <>
      <span>作者：{m.author || '未知'}</span>
      <span>更新：{new Date(m.updatedAt).toLocaleDateString('zh-CN')}</span>
    </>
  ),
}

export default function ModDetailPage() {
  return <DetailPage config={config} />
}
