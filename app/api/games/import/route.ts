import { NextRequest, NextResponse } from 'next/server'
import { addGame, getAllGames } from '@/lib/games'
import { requireAdmin } from '@/lib/auth'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
  }
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: '请上传文件' },
        { status: 400 }
      )
    }

    // 读取Excel文件
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)

    if (data.length === 0) {
      return NextResponse.json(
        { error: 'Excel文件为空' },
        { status: 400 }
      )
    }

    const results = {
      total: data.length,
      success: 0,
      failed: 0,
      errors: [] as string[]
    }

    // 获取当前最大ID
    const currentData = getAllGames()
    let maxId = currentData.games.reduce((max, game) => Math.max(max, game.id), 0)

    // 批量导入
    for (let i = 0; i < data.length; i++) {
      const row = data[i] as Record<string, unknown>
      const rowNum = i + 2 // Excel行号（从2开始，因为第1行是表头）

      try {
        // 验证必填字段
        const title = row['游戏名称'] || row['title']
        const description = row['游戏描述'] || row['description']
        const size = row['游戏大小'] || row['size']
        const category = row['游戏分类'] || row['category']

        if (!title || !description || !size || !category) {
          results.errors.push(`第${rowNum}行：缺少必填字段（游戏名称/描述/大小/分类）`)
          results.failed++
          continue
        }

        // 解析下载链接
        const downloadLinks = []
        const platform1 = row['下载平台1'] || row['platform1']
        const url1 = row['下载链接1'] || row['url1']
        const password1 = row['提取码1'] || row['password1'] || ''

        if (platform1 && url1) {
          downloadLinks.push({
            platform: String(platform1),
            url: String(url1),
            password: String(password1)
          })
        }

        // 支持多个下载链接
        for (let j = 2; j <= 5; j++) {
          const platform = row[`下载平台${j}`] || row[`platform${j}`]
          const url = row[`下载链接${j}`] || row[`url${j}`]
          const password = row[`提取码${j}`] || row[`password${j}`] || ''
          
          if (platform && url) {
            downloadLinks.push({
              platform: String(platform),
              url: String(url),
              password: String(password)
            })
          }
        }

        if (downloadLinks.length === 0) {
          results.errors.push(`第${rowNum}行：至少需要一个下载链接`)
          results.failed++
          continue
        }

        // 添加游戏
        maxId++
        addGame({
          title: String(title),
          description: String(description),
          coverImage: row['封面图片'] ? String(row['封面图片']) : '/images/default.svg',
          size: String(size),
          category: String(category),
          downloadLinks,
          releaseDate: row['发行日期'] ? String(row['发行日期']) : new Date().toISOString().split('T')[0],
          updateDate: row['更新日期'] ? String(row['更新日期']) : new Date().toISOString().split('T')[0],
          downloadCount: row['下载次数'] ? Number(row['downloadCount']) : 0,
          isHot: row['是否热门'] === '是' || row['isHot'] === 'true' || false,
          isNew: row['是否新品'] !== '否' && row['isNew'] !== 'false',
          isFeatured: row['是否精选'] === '是' || row['isFeatured'] === 'true' || false
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
    console.error('批量导入失败:', error)
    return NextResponse.json(
      { error: '批量导入失败：' + error },
      { status: 500 }
    )
  }
}
