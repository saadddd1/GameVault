import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo 和简介 */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">G</span>
              </div>
              <div>
                <span className="text-xl font-bold text-white">GameVault</span>
                <span className="block text-xs text-gray-500">精品游戏分享平台</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-md">
              致力于为玩家提供优质的游戏资源分享服务，所有游戏均来自网络收集，仅供学习交流使用。
            </p>
          </div>

          {/* 快速链接 */}
          <div>
            <h3 className="text-white font-semibold mb-4">快速链接</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm hover:text-white transition-colors">
                  首页
                </Link>
              </li>
              <li>
                <Link href="/games" className="text-sm hover:text-white transition-colors">
                  全部游戏
                </Link>
              </li>
              <li>
                <Link href="/games?sort=hot" className="text-sm hover:text-white transition-colors">
                  热门游戏
                </Link>
              </li>
              <li>
                <Link href="/games?sort=new" className="text-sm hover:text-white transition-colors">
                  最新上架
                </Link>
              </li>
            </ul>
          </div>

          {/* 免责声明 */}
          <div>
            <h3 className="text-white font-semibold mb-4">免责声明</h3>
            <p className="text-xs leading-relaxed">
              本站所有游戏资源均来自互联网，仅供学习交流使用。如有侵权，请联系我们删除。
            </p>
            <p className="text-xs mt-4">
              联系邮箱：admin@gamevault.com
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs">
            © 2024-2026 GameVault. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="text-xs hover:text-white transition-colors">
              关于我们
            </Link>
            <Link href="/privacy" className="text-xs hover:text-white transition-colors">
              隐私政策
            </Link>
            <Link href="/terms" className="text-xs hover:text-white transition-colors">
              使用条款
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
