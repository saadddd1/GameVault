'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from './AuthProvider'

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAdmin, isLoading, logout } = useAuth()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/games?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const closeMenus = () => {
    setShowMobileMenu(false)
    setShowUserMenu(false)
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
              游戏 · MOD · 资源
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
              href="/tools"
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname === '/tools' ? 'text-[#1E3A5F]' : 'text-stone-500 hover:text-[#1C1917]'
              }`}
            >
              MOD工具
            </Link>
            {!isLoading && isAdmin && (
              <Link
                href="/admin"
                className="px-3 py-1.5 text-sm font-medium text-stone-500 hover:text-[#1C1917] transition-colors"
              >
                管理后台
              </Link>
            )}
          </nav>

          {/* 右侧区域 */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* 搜索框 */}
            <form onSubmit={handleSearch} className="hidden sm:flex items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索游戏、MOD..."
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

            {/* 用户区域 */}
            {isLoading ? (
              <div className="w-8 h-8" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-stone-50 transition-colors rounded-sm"
                >
                  <div className="w-7 h-7 bg-[#1E3A5F] rounded-sm flex items-center justify-center">
                    <span className="text-white text-xs font-semibold font-number">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden lg:block text-sm font-medium text-[#1C1917]">
                    {user.username}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-stone-200 rounded-sm shadow-sm py-1 z-50">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-sm font-medium text-[#1C1917]">{user.username}</p>
                      <p className="text-xs text-stone-400">{user.email}</p>
                    </div>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-[#1E3A5F] hover:bg-stone-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        管理后台
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout()
                        setShowUserMenu(false)
                        router.push('/')
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3 py-1.5 bg-[#1E3A5F] text-white text-sm font-medium rounded-sm hover:bg-[#162d47] transition-colors"
              >
                登录
              </Link>
            )}
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
              href="/mods"
              onClick={closeMenus}
              className={`block px-3 py-2 text-sm font-medium rounded-sm ${
                pathname === '/mods' ? 'text-[#1E3A5F] bg-stone-50' : 'text-stone-600'
              }`}
            >
              MOD
            </Link>
            <Link
              href="/tools"
              onClick={closeMenus}
              className={`block px-3 py-2 text-sm font-medium rounded-sm ${
                pathname === '/tools' ? 'text-[#1E3A5F] bg-stone-50' : 'text-stone-600'
              }`}
            >
              MOD工具
            </Link>
            {!isLoading && isAdmin && (
              <Link
                href="/admin"
                onClick={closeMenus}
                className="block px-3 py-2 text-sm font-medium text-[#1E3A5F]"
              >
                管理后台
              </Link>
            )}
            {/* 移动端搜索 */}
            <form onSubmit={(e) => { handleSearch(e); closeMenus() }} className="pt-2">
              <input
                type="text"
                placeholder="搜索游戏、MOD..."
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
          {user ? (
            <button onClick={() => setShowUserMenu(!showUserMenu)} className={`flex flex-col items-center px-3 py-1 text-[11px] ${showUserMenu ? 'text-[#1E3A5F]' : 'text-stone-400'}`}>
              <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              我的
            </button>
          ) : (
            <Link href="/login" className={`flex flex-col items-center px-3 py-1 text-[11px] ${pathname === '/login' ? 'text-[#1E3A5F]' : 'text-stone-400'}`}>
            <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            我的
          </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
