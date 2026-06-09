'use client'

interface Props {
  total: number
  page: number
  pageSize: number
  pageSizes?: number[]
  unit?: string
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

const DEFAULT_SIZES = [12, 20, 40, 60]

export default function Pagination({
  total, page, pageSize, pageSizes = DEFAULT_SIZES, unit = '项',
  onPageChange, onPageSizeChange
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safe = Math.min(page, totalPages)

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(n => n === 1 || n === totalPages || Math.abs(n - safe) <= 1)
    .reduce<(number | '...')[]>((acc, n, i, arr) => {
      if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push('...')
      acc.push(n)
      return acc
    }, [])

  if (total <= pageSizes[0]) return null

  return (
    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-1 text-sm text-stone-500 font-number">
        <span>共 {total} {unit}</span>
        <span className="text-stone-300">·</span>
        <span>第 {safe}/{totalPages} 页</span>
      </div>

      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={safe <= 1}
          className="px-3 py-1.5 text-sm border border-stone-200 rounded-sm hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          上一页
        </button>
        {pages.map((item, i) =>
          item === '...'
            ? <span key={`dots-${i}`} className="px-2 text-stone-300 text-sm">...</span>
            : <button key={item} onClick={() => onPageChange(item)}
                className={`w-8 h-8 text-sm rounded-sm transition-colors font-number ${
                  safe === item ? 'bg-[#1E3A5F] text-white' : 'border border-stone-200 hover:bg-stone-100 text-stone-600'
                }`}>{item}</button>
        )}
        <button onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={safe >= totalPages}
          className="px-3 py-1.5 text-sm border border-stone-200 rounded-sm hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          下一页
        </button>
      </div>

      <div className="flex items-center gap-2 text-sm text-stone-500">
        <span>每页</span>
        <select value={pageSize} onChange={e => onPageSizeChange(Number(e.target.value))}
          className="px-2 py-1.5 border border-stone-200 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]">
          {pageSizes.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span>{unit}</span>
      </div>
    </div>
  )
}
