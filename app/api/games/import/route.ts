import { NextRequest, NextResponse } from 'next/server'
import { addGame } from '@/lib/games'
import { requireAdmin } from '@/lib/auth'
import { checkBodySize } from '@/lib/api-helpers'
import { autoFillGame } from '@/lib/auto-fill'
import * as XLSX from 'xlsx'

const ALLOWED_EXTENSIONS = ['.xlsx', '.xls']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// 列名映射（兼容中英文）
const COL = {
  name: ['游戏名称', 'title', 'name'],
  quarkUrl: ['夸克网盘链接', '夸克链接'],
  quarkPwd: ['夸克提取码', '夸克密码'],
  xunleiUrl: ['迅雷网盘链接', '迅雷链接'],
  xunleiPwd: ['迅雷提取码', '迅雷密码'],
  ucUrl: ['UC网盘链接', 'UC链接'],
  ucPwd: ['UC提取码', 'UC密码'],
  baiduUrl: ['百度网盘链接', '百度链接'],
  baiduPwd: ['百度提取码', '百度密码'],
}

function getCell(row: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null) return String(row[k]).trim()
  }
  return ''
}

export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
  }

  const tooLarge = checkBodySize(request, MAX_FILE_SIZE); if (tooLarge) return tooLarge

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) return NextResponse.json({ error: '请上传文件' }, { status: 400 })

    const fileName = file.name.toLowerCase()
    if (!ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext))) {
      return NextResponse.json({ error: '仅支持 .xlsx / .xls 文件' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: '文件过大，最大 10MB' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)

    if (data.length === 0) {
      return NextResponse.json({ error: 'Excel文件为空' }, { status: 400 })
    }

    const results = { total: data.length, success: 0, failed: 0, errors: [] as string[] }

    for (let i = 0; i < data.length; i++) {
      const row = data[i] as Record<string, unknown>
      const rowNum = i + 2

      try {
        const title = getCell(row, COL.name)
        if (!title) {
          results.errors.push(`第${rowNum}行：缺少游戏名称`)
          results.failed++
          continue
        }

        // 构建下载链接
        const downloadLinks: { platform: string; url: string; password: string }[] = []
        const platforms = [
          { name: '夸克网盘', url: getCell(row, COL.quarkUrl), pwd: getCell(row, COL.quarkPwd) },
          { name: '迅雷网盘', url: getCell(row, COL.xunleiUrl), pwd: getCell(row, COL.xunleiPwd) },
          { name: 'UC网盘', url: getCell(row, COL.ucUrl), pwd: getCell(row, COL.ucPwd) },
          { name: '百度网盘', url: getCell(row, COL.baiduUrl), pwd: getCell(row, COL.baiduPwd) },
        ]
        for (const p of platforms) {
          if (p.url) downloadLinks.push({ platform: p.name, url: p.url, password: p.pwd })
        }

        if (downloadLinks.length === 0) {
          results.errors.push(`第${rowNum}行：至少需要一个下载链接`)
          results.failed++
          continue
        }

        // 自动填充
        let description = ''; let coverImage = '/images/default.svg'; let size = ''; let category = '动作冒险'
        try {
          const filled = await autoFillGame(title)
          description = filled.description
          coverImage = filled.coverImage
          size = filled.size
          category = filled.category
        } catch { /* auto-fill 失败不阻塞 */ }

        await addGame({
          title, description, coverImage, size, category,
          downloadLinks, screenshots: [],
          releaseDate: new Date().toISOString().split('T')[0],
          updateDate: new Date().toISOString().split('T')[0],
          downloadCount: 0, isHot: false, isNew: true, isFeatured: false,
        })

        results.success++
      } catch (error) {
        results.errors.push(`第${rowNum}行：导入失败 - ${error}`)
        results.failed++
      }
    }

    return NextResponse.json({
      success: true,
      message: `导入完成：成功 ${results.success} 个，失败 ${results.failed} 个`,
      results
    })
  } catch (error) {
    return NextResponse.json({ error: '批量导入失败：' + error }, { status: 500 })
  }
}
