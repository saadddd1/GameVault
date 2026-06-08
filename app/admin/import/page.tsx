'use client'

import { useState } from 'react'
import { getAuthHeaders } from '@/components/AuthProvider'

type ImportType = 'games' | 'android' | 'windows' | 'mods'

const TYPE_CONFIG: Record<ImportType, { label: string; api: string; template: string; desc: string }> = {
  games: {
    label: '游戏',
    api: '/api/games/import',
    template: '/api/games/template',
    desc: '必填列：游戏名称、游戏描述、游戏大小、游戏分类。可选：封面图片、发行日期、下载链接1-5'
  },
  android: {
    label: 'Android',
    api: '/api/android/import',
    template: '/api/android/template',
    desc: '必填列：应用名称、描述、分类。可选：版本、文件大小、封面图片、下载链接1-5、标签、作者'
  },
  windows: {
    label: 'Windows',
    api: '/api/windows/import',
    template: '/api/windows/template',
    desc: '必填列：应用名称、描述、分类。可选：版本、文件大小、封面图片、下载链接1-5、标签、作者'
  },
  mods: {
    label: 'MOD',
    api: '/api/mods/import',
    template: '/api/mods/template',
    desc: '必填列：MOD标题、描述、分类、所属游戏。可选：版本、文件大小、封面图片、下载链接1-5、标签、作者、安装说明'
  }
}

const TYPES: ImportType[] = ['games', 'android', 'windows', 'mods']

export default function ImportPage() {
  const [importType, setImportType] = useState<ImportType>('games')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    results?: { total: number; success: number; failed: number; errors: string[] }
  } | null>(null)

  const config = TYPE_CONFIG[importType]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(config.api, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      })

      const data = await response.json()
      setResult(data)
    } catch {
      setResult({ success: false, message: '网络错误，请稍后再试' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">批量导入</h2>
      <p className="text-sm text-gray-500 mb-6">通过 Excel 文件批量导入内容</p>

      {/* 类型选择 */}
      <div className="flex gap-2 mb-6">
        {TYPES.map(t => (
          <button
            key={t}
            type="button"
            onClick={() => { setImportType(t); setResult(null); setFile(null) }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              importType === t
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {TYPE_CONFIG[t].label}
          </button>
        ))}
      </div>

      {/* 说明 */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700 font-medium mb-1">{config.label} 导入说明</p>
        <p className="text-sm text-blue-600">{config.desc}</p>
      </div>

      {/* 下载模板 */}
      <div className="mb-6">
        <a
          href={config.template}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 border border-green-200 rounded-lg text-sm hover:bg-green-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          下载 {config.label} 模板
        </a>
        <span className="ml-3 text-xs text-gray-400">先下载模板，按格式填写后上传</span>
      </div>

      {/* 上传表单 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="text-3xl mb-2">📁</div>
            <p className="text-sm text-gray-600 mb-1">
              {file ? file.name : '点击选择 Excel 文件'}
            </p>
            <p className="text-xs text-gray-400">支持 .xlsx / .xls</p>
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!file || loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '导入中...' : '开始导入'}
          </button>
        </div>
      </form>

      {/* 结果 */}
      {result && (
        <div className={`mt-6 p-4 rounded-lg border ${
          result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <p className={`font-medium ${result.success ? 'text-green-700' : 'text-red-700'}`}>
            {result.message}
          </p>
          {result.results && (
            <div className="mt-2 text-sm">
              <p className="text-gray-600">
                总计 {result.results.total} 条，成功 {result.results.success} 条，失败 {result.results.failed} 条
              </p>
              {result.results.errors.length > 0 && (
                <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                  {result.results.errors.map((err, i) => (
                    <li key={i} className="text-red-600 text-xs">{err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

