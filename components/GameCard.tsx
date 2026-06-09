import Link from 'next/link'
import type { Game } from '@/lib/games'
import { getThumbPath } from '@/lib/image-paths'

interface GameCardProps {
  game: Game
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <Link href={`/games/${game.id}`} className="group block">
      <article className="bg-white border border-stone-200 rounded-sm overflow-hidden hover:border-stone-400 transition-colors duration-200">
        {/* 封面图 */}
        <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
          {game.coverImage && game.coverImage !== '/images/default.svg' ? (
            <img
              src={getThumbPath(game.coverImage)}
              alt={game.title}
              width={600}
              height={450}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-12 h-12 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}

          {/* 标签 */}
          <div className="absolute top-2 left-2 flex gap-1.5">
            {game.isHot && (
              <span className="px-2 py-0.5 bg-red-600 text-white text-[11px] font-semibold rounded-sm font-number">
                热门
              </span>
            )}
            {game.isNew && (
              <span className="px-2 py-0.5 bg-emerald-600 text-white text-[11px] font-semibold rounded-sm font-number">
                新游
              </span>
            )}
          </div>

          {/* 精选标记 */}
          {game.isFeatured && (
            <div className="absolute top-2 right-2">
              <span className="px-2 py-0.5 bg-[#1E3A5F] text-white text-[10px] font-semibold rounded-sm font-number">
                精选
              </span>
            </div>
          )}
        </div>

        {/* 游戏信息 */}
        <div className="p-3 lg:p-4">
          <h3 className="font-bold text-[#1C1917] mb-1.5 line-clamp-1 text-sm lg:text-base">
            {game.title}
          </h3>
          <p className="text-xs lg:text-sm text-stone-500 mb-3 line-clamp-2 leading-relaxed">
            {game.description}
          </p>
          <div className="flex items-center justify-between text-xs text-stone-400 font-number">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {game.downloadCount.toLocaleString()}
            </span>
            <span>{game.size}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}
