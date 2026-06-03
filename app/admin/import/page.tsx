'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

interface ImportResult {
  total: number
  success: number
  failed: number
  errors: string[]
}

export default function ImportGamesPage() {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile)
        setError('')
        setResult(null)
      } else {
        setError('请选择Excel文件（.xlsx或.xls格式）')
        setFile(null)
      }
    }
  }

  const handleDownloadTemplate = () => {
    window.open('/api/games/template', '_blank')
  }

  const handleImport = async () => {
    if (!file) {
      setError('请先选择文件')
      return
    }

    setImporting(true)
    setError('')
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/games/import', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.results)
        setFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        setError(data.error || '导入失败')
      }
    } catch (err) {
      setError('导入失败，请重试')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">批量导入游戏</h1>
            </div>
            <Link href="/admin/games" className="text-blue-500 hover:text-blue-600 text-sm">
              返回游戏列表
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* 说明卡片 */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">导入说明</h2>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="font-medium text-blue-500">1.</span>
                <span>下载Excel模板，按照模板格式填写游戏数据</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-blue-500">2.</span>
                <span>必填字段：游戏名称、游戏描述、游戏大小、游戏分类、下载平台1、下载链接1</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-blue-500">3.</span>
                <span>可选字段：封面图片、提取码、多个下载链接、发行日期、更新日期等</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-blue-500">4.</span>
                <span>游戏分类：动作冒险、角色扮演、策略模拟、休闲益智、射击竞速、恐怖解谜、体育格斗</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-blue-500">5.</span>
                <span>日期格式：YYYY-MM-DD（如：2024-01-01）</span>
              </li>
            </ol>

            <button
              onClick={handleDownloadTemplate}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              下载Excel模板
            </button>
          </div>

          {/* 上传区域 */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">上传文件</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="fileInput"
              />
              <label htmlFor="fileInput" className="cursor-pointer">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-gray-600 mb-2">
                  {file ? (
                    <span className="text-blue-500 font-medium">{file.name}</span>
                  ) : (
                    <>点击或拖拽文件到此处上传</>
                  )}
                </p>
                <p className="text-sm text-gray-400">支持 .xlsx、.xls 格式</p>
              </label>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleImport}
              disabled={!file || importing}
              className={`mt-4 w-full py-3 rounded-lg font-medium transition-colors ${
                !file || importing
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg'
              }`}
            >
              {importing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  导入中...
                </span>
              ) : (
                '开始导入'
              )}
            </button>
          </div>

          {/* 导入结果 */}
          {result && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">导入结果</h2>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{result.total}</p>
                  <p className="text-sm text-gray-500">总计</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{result.success}</p>
                  <p className="text-sm text-green-500">成功</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{result.failed}</p>
                  <p className="text-sm text-red-500">失败</p>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="font-medium text-red-800 mb-2">错误详情：</p>
                  <ul className="space-y-1">
                    {result.errors.map((err, index) => (
                      <li key={index} className="text-sm text-red-600">• {err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.success > 0 && (
                <Link
                  href="/admin/games"
                  className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  查看游戏列表
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
