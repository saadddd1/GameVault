import Link from 'next/link'
import { getThumbPath } from '@/lib/image-paths'

interface SoftwareCardProps {
  app: {
    id: number
    name: string
    description: string
    coverImage: string
    category: string
    version?: string
    fileSize?: string
    downloadCount: number
  }
  href: string
}

export default function SoftwareCard({ app, href }: SoftwareCardProps) {
  return (
    <Link href={href} className="group block">
      <article className="bg-white border border-stone-200 rounded-sm overflow-hidden hover:border-stone-400 transition-colors duration-200">
        <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
          {app.coverImage && app.coverImage !== '/images/default.svg' ? (
            <img
              src={getThumbPath(app.coverImage)}
              alt={app.name}
              width={600}
              height={450}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-12 h-12 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
          )}
          <div className="absolute top-2 left-2">
            <span className="px-2 py-0.5 bg-[#1E3A5F] text-white text-[11px] font-semibold rounded-sm">
              {app.category}
            </span>
          </div>
        </div>
        <div className="p-3 lg:p-4">
          <h3 className="font-bold text-[#1C1917] mb-1.5 line-clamp-1 text-sm lg:text-base">
            {app.name}
          </h3>
          <p className="text-xs lg:text-sm text-stone-500 mb-3 line-clamp-2 leading-relaxed">
            {app.description}
          </p>
          <div className="flex items-center justify-between text-xs text-stone-400 font-number">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {app.downloadCount.toLocaleString()}
            </span>
            <span>{app.fileSize || app.category}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}
