import Link from 'next/link'
import { Game } from '@/lib/games'

interface GameCardProps {
  game: Game
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <Link href={`/games/${game.id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-transparent">
        {/* 封面图 */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          {game.coverImage && game.coverImage !== '/images/default.jpg' ? (
            <img
              src={game.coverImage}
              alt={game.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
          
          {/* 标签 */}
          <div className="absolute top-3 left-3 flex gap-2">
            {game.isHot && (
              <span className="px-2.5 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-semibold rounded-full shadow-lg">
                热门
              </span>
            )}
            {game.isNew && (
              <span className="px-2.5 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold rounded-full shadow-lg">
                新游
              </span>
            )}
          </div>

          {/* 分类标签 */}
          <div className="absolute bottom-3 right-3">
            <span className="px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-full">
              {game.category}
            </span>
          </div>
        </div>

        {/* 游戏信息 */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
            {game.title}
          </h3>
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
            {game.description}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>{game.downloadCount.toLocaleString()} 次下载</span>
            </div>
            <span className="font-medium text-gray-500">{game.size}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
