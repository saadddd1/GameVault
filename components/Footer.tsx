import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-[#1C1917] text-stone-400">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="Geme Vault" className="w-10 h-10 rounded-sm object-contain" />
              <div>
                <span className="text-xl font-bold text-white">Geme Vault</span>
                <span className="block text-xs text-stone-400">精品免费单机游戏</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-md">
              致力于为玩家提供优质的游戏资源分享服务，所有游戏均来自网络收集，仅供学习交流使用。
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">免责声明</h3>
            <p className="text-xs leading-relaxed">
              本站资源均收集于互联网，仅供学习和交流使用，严禁用于商业用途。版权归原作者所有，与本站无关。您应在下载后 24 小时内从设备中彻底删除上述内容。如需使用，请前往官方渠道购买正版。访问或下载本站内容即视为您已同意以上条款。
            </p>
            <p className="text-xs mt-4">
              联系邮箱：admin@nemwish.onaliyun.com
            </p>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-8 pt-8 text-center">
          <p className="text-xs">
            © 2026 Geme Vault. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
