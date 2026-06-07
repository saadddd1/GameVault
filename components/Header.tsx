'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const closeMenus = () => {
    setShowMobileMenu(false)
  }

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-stone-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between h-14 lg:h-16">

          {/* 移动端：汉堡菜单按钮 */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2 -ml-2 text-stone-600 hover:text-[#1C1917]"
            aria-label="菜单"
          >
            {showMobileMenu ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0" onClick={closeMenus}>
            <span className="text-lg lg:text-xl font-extrabold text-[#1C1917] tracking-wide">
              GAMEVAULT
            </span>
            <span className="hidden sm:block text-[11px] text-stone-400 tracking-wider">
              游戏 · MOD · 安卓 · Windows
            </span>
          </Link>

          {/* 桌面端导航 */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              href="/"
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname === '/' ? 'text-[#1E3A5F]' : 'text-stone-500 hover:text-[#1C1917]'
              }`}
            >
              首页
            </Link>
            <Link
              href="/games"
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname === '/games' ? 'text-[#1E3A5F]' : 'text-stone-500 hover:text-[#1C1917]'
              }`}
            >
              全部游戏
            </Link>
            <Link
              href="/mods"
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname === '/mods' ? 'text-[#1E3A5F]' : 'text-stone-500 hover:text-[#1C1917]'
              }`}
            >
              MOD
            </Link>
            <Link
              href="/android"
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname === '/android' ? 'text-[#1E3A5F]' : 'text-stone-500 hover:text-[#1C1917]'
              }`}
            >
              安卓
            </Link>
            <Link
              href="/windows"
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname === '/windows' ? 'text-[#1E3A5F]' : 'text-stone-500 hover:text-[#1C1917]'
              }`}
            >
              Windows软件
            </Link>
          </nav>

          {/* 右侧区域 */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* 搜索框 */}
            <form onSubmit={handleSearch} className="hidden sm:flex items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索游戏、安卓..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-36 lg:w-56 pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] focus:bg-white transition-all text-sm"
                />
                <svg
                  className="absolute left-2.5 top-2 h-4 w-4 text-stone-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* 移动端下拉菜单 */}
      {showMobileMenu && (
        <div className="lg:hidden border-t border-stone-200 bg-white">
          <div className="container mx-auto px-4 py-3 space-y-1">
            <Link
              href="/"
              onClick={closeMenus}
              className={`block px-3 py-2 text-sm font-medium rounded-sm ${
                pathname === '/' ? 'text-[#1E3A5F] bg-stone-50' : 'text-stone-600'
              }`}
            >
              首页
            </Link>
            <Link
              href="/games"
              onClick={closeMenus}
              className={`block px-3 py-2 text-sm font-medium rounded-sm ${
                pathname === '/games' ? 'text-[#1E3A5F] bg-stone-50' : 'text-stone-600'
              }`}
            >
              全部游戏
            </Link>
            <Link
              href="/android"
              onClick={closeMenus}
              className={`block px-3 py-2 text-sm font-medium rounded-sm ${
                pathname === '/android' ? 'text-[#1E3A5F] bg-stone-50' : 'text-stone-600'
              }`}
            >
              安卓
            </Link>
            <Link
              href="/windows"
              onClick={closeMenus}
              className={`block px-3 py-2 text-sm font-medium rounded-sm ${
                pathname === '/windows' ? 'text-[#1E3A5F] bg-stone-50' : 'text-stone-600'
              }`}
            >
              Windows软件
            </Link>
            {/* 移动端搜索 */}
            <form onSubmit={(e) => { handleSearch(e); closeMenus() }} className="pt-2">
              <input
                type="text"
                placeholder="搜索游戏、安卓..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#1E3A5F] text-sm"
              />
            </form>
          </div>
        </div>
      )}

      {/* 移动端底部导航 */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-stone-200 z-50 pb-safe">
        <div className="flex justify-around py-1.5">
          <Link href="/" className={`flex flex-col items-center px-3 py-1 text-[11px] ${pathname === '/' ? 'text-[#1E3A5F]' : 'text-stone-400'}`}>
            <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            首页
          </Link>
          <Link href="/games" className={`flex flex-col items-center px-3 py-1 text-[11px] ${pathname === '/games' ? 'text-[#1E3A5F]' : 'text-stone-400'}`}>
            <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            游戏
          </Link>
          <Link href="/android" className={`flex flex-col items-center px-3 py-1 text-[11px] ${pathname === '/android' ? 'text-[#1E3A5F]' : 'text-stone-400'}`}>
            <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            安卓
          </Link>
        </div>
      </nav>
    </header>
  )
}
