'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Props {
  title: string
  mode: 'add' | 'edit'
  loading: boolean
  fetching?: boolean
  error: string
  success: string
  backHref: string
  submitLabel?: string
  children: React.ReactNode
  onSubmit: (e: React.FormEvent) => void
}

export default function AdminFormShell({
  title, mode, loading, fetching, error, success, backHref,
  submitLabel, children, onSubmit
}: Props) {
  const router = useRouter()

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A5F]"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-sm border border-stone-200 p-6">
      <h2 className="text-xl font-semibold text-[#1C1917] mb-6">{title}</h2>

      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-sm text-red-600 text-sm">{error}</div>}
      {success && <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-sm text-green-600 text-sm">{success}</div>}

      <form onSubmit={onSubmit} className="space-y-6">
        {children}

        <div className="border-t pt-6 flex justify-end gap-4">
          <Link href={backHref} className="px-5 py-2.5 border border-stone-300 text-stone-600 rounded-sm hover:bg-stone-50 transition-colors text-sm">
            取消
          </Link>
          <button type="submit" disabled={loading}
            className="px-5 py-2.5 bg-[#1E3A5F] text-white rounded-sm font-medium hover:bg-[#162d47] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm">
            {loading ? '提交中...' : (submitLabel || (mode === 'add' ? '添加' : '保存修改'))}
          </button>
        </div>
      </form>
    </div>
  )
}
