'use client'

interface Props {
  message?: string
  onRetry?: () => void
}

export default function ErrorState({ message = '加载失败，请稍后重试', onRetry }: Props) {
  return (
    <div className="min-h-[300px] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <p className="text-stone-500 text-sm mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-[#1E3A5F] text-white text-sm rounded-sm hover:opacity-90 transition-opacity"
        >
          重新加载
        </button>
      )}
    </div>
  )
}
