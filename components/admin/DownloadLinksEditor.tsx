'use client'

interface DownloadLink {
  platform: string
  url: string
  password: string
}

interface DownloadLinksEditorProps {
  links: DownloadLink[]
  onChange: (links: DownloadLink[]) => void
  platforms?: string[]
}

const DEFAULT_PLATFORMS = ['百度网盘', '阿里云盘', '夸克网盘', 'UC网盘', '蓝奏云', '迅雷网盘', 'GitHub', '其他']

export default function DownloadLinksEditor({ links, onChange, platforms = DEFAULT_PLATFORMS }: DownloadLinksEditorProps) {
  const addLink = () => {
    onChange([...links, { platform: platforms[0], url: '', password: '' }])
  }

  const removeLink = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index)
    onChange(newLinks.length > 0 ? newLinks : [{ platform: platforms[0], url: '', password: '' }])
  }

  const updateLink = (index: number, field: keyof DownloadLink, value: string) => {
    const newLinks = links.map((link, i) =>
      i === index ? { ...link, [field]: value } : link
    )
    onChange(newLinks)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium text-[#1C1917]">下载链接</h3>
        <button
          type="button"
          onClick={addLink}
          className="px-3 py-1.5 text-sm bg-[#1E3A5F]/10 text-[#1E3A5F] border border-[#1E3A5F]/20 rounded-sm hover:bg-[#1E3A5F]/20 transition-colors"
        >
          + 添加链接
        </button>
      </div>
      {links.map((link, i) => (
        <div key={i} className="border border-stone-200 rounded-sm p-4 bg-stone-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-stone-600">链接 {i + 1}</span>
            {links.length > 1 && (
              <button
                type="button"
                onClick={() => removeLink(i)}
                className="text-sm text-red-500 hover:text-red-700"
              >
                删除
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">平台</label>
              <select
                value={link.platform}
                onChange={(e) => updateLink(i, 'platform', e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] bg-white text-sm"
              >
                {platforms.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">链接地址</label>
              <input
                type="text"
                value={link.url}
                onChange={(e) => updateLink(i, 'url', e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] bg-white text-sm"
                placeholder="下载链接"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">提取码</label>
              <input
                type="text"
                value={link.password}
                onChange={(e) => updateLink(i, 'password', e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] bg-white text-sm"
                placeholder="可选"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

