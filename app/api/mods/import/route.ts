import { NextRequest, NextResponse } from 'next/server'
import { addMod, getAllMods } from '@/lib/mod'
import { requireAdmin } from '@/lib/auth'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
  }
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: '请上传文件' }, { status: 400 })

    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)

    if (data.length === 0) return NextResponse.json({ error: 'Excel文件为空' }, { status: 400 })

    const results = { total: data.length, success: 0, failed: 0, errors: [] as string[] }

    for (let i = 0; i < data.length; i++) {
      const row = data[i] as Record<string, unknown>
      const rowNum = i + 2

      try {
        const title = row['MOD标题'] || row['title']
        const description = row['描述'] || row['description']
        const category = row['分类'] || row['category']
        const gameName = row['所属游戏'] || row['gameName']

        if (!title || !description || !category || !gameName) {
          results.errors.push(`第${rowNum}行：缺少必填字段（MOD标题/描述/分类/所属游戏）`)
          results.failed++
          continue
        }

        const downloadLinks = []
        for (let j = 1; j <= 5; j++) {
          const platform = row[`下载平台${j}`] || row[`platform${j}`]
          const url = row[`下载链接${j}`] || row[`url${j}`]
          const password = row[`提取码${j}`] || row[`password${j}`] || ''
          if (platform && url) {
            downloadLinks.push({ platform: String(platform), url: String(url), password: String(password) })
          }
        }

        const tags = row['标签'] ? String(row['标签']).split(',').map(t => t.trim()).filter(Boolean) : (row['tags'] || [])

        await addMod({
          title: String(title),
          description: String(description),
          coverImage: row['封面图片'] ? String(row['封面图片']) : '/images/default.svg',
          category: String(category),
          gameName: String(gameName),
          version: row['版本'] ? String(row['版本']) : (row['version'] ? String(row['version']) : ''),
          fileSize: row['文件大小'] ? String(row['文件大小']) : (row['fileSize'] ? String(row['fileSize']) : ''),
          downloadLinks,
          tags: Array.isArray(tags) ? tags : [],
          author: row['作者'] ? String(row['作者']) : (row['author'] ? String(row['author']) : ''),
          installInstructions: row['安装说明'] ? String(row['安装说明']) : (row['installInstructions'] ? String(row['installInstructions']) : '')
        })
        results.success++
      } catch (error) {
        results.errors.push(`第${rowNum}行：导入失败 - ${error}`)
        results.failed++
      }
    }

    return NextResponse.json({ success: true, message: `导入完成：成功 ${results.success} 个，失败 ${results.failed} 个`, results })
  } catch (error) {
    return NextResponse.json({ error: '批量导入失败：' + error }, { status: 500 })
  }
}

