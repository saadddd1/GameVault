import Link from 'next/link'
import type { Mod } from '@/lib/mod'

interface ModCardProps {
  mod: Mod
}

export default function ModCard({ mod }: ModCardProps) {
  return (
    <Link href={`/mods/${mod.id}`} className="group block">
      <article className="bg-white border border-stone-200 rounded-sm overflow-hidden hover:border-stone-400 transition-colors duration-200">
        {/* 封面图 */}
        <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
          {mod.coverImage && mod.coverImage !== '/images/default.svg' ? (
            <img
              src={mod.coverImage}
              alt={mod.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-12 h-12 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          )}

          {/* 分类标签 */}
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-0.5 text-white text-[11px] font-semibold rounded-sm font-number ${
              mod.category === '模组' ? 'bg-emerald-600' : 'bg-blue-600'
            }`}>
              {mod.category}
            </span>
          </div>
        </div>

        {/* MOD 信息 */}
        <div className="p-3 lg:p-4">
          <h3 className="font-bold text-[#1C1917] mb-1.5 line-clamp-1 text-sm lg:text-base">
            {mod.title}
          </h3>
          <p className="text-xs lg:text-sm text-stone-500 mb-3 line-clamp-1">
            {mod.gameName} · {mod.author}
          </p>
          <div className="flex items-center justify-between text-xs text-stone-400 font-number">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {mod.downloadCount.toLocaleString()}
            </span>
            <span>{mod.version}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}
