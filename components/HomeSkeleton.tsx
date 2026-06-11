'use client'

// 骨架屏 — 首页加载时的占位 UI，比 spinner 体验好
export default function HomeSkeleton() {
  return (
    <div style={{ backgroundColor: '#FAFAF9' }}>
      <div className="container mx-auto px-4 py-4 lg:py-6 max-w-6xl animate-pulse">
        {/* Hero skeleton */}
        <section className="mb-6 lg:mb-8">
          <div className="relative bg-[#1C1917] overflow-hidden rounded-sm p-5 lg:p-8 flex flex-col lg:flex-row items-center gap-4 lg:gap-8">
            <div className="w-20 h-28 lg:w-40 lg:h-56 bg-stone-700 rounded-sm flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-stone-700 rounded w-16" />
              <div className="h-7 bg-stone-700 rounded w-48" />
              <div className="h-4 bg-stone-700 rounded w-96" />
            </div>
          </div>
        </section>

        {/* Games section skeleton */}
        <section className="mb-6">
          <div className="h-6 bg-stone-200 rounded w-24 mb-3" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-sm overflow-hidden shadow-sm">
                <div className="aspect-[3/4] bg-stone-200" />
                <div className="p-2 space-y-1.5">
                  <div className="h-3 bg-stone-200 rounded w-full" />
                  <div className="h-3 bg-stone-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mods section skeleton */}
        <section className="mb-6">
          <div className="h-6 bg-stone-200 rounded w-24 mb-3" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-sm overflow-hidden shadow-sm">
                <div className="aspect-[4/3] bg-stone-200" />
                <div className="p-2 space-y-1.5">
                  <div className="h-3 bg-stone-200 rounded w-full" />
                  <div className="h-3 bg-stone-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
