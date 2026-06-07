import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { isHF } from '@/lib/store'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
  }

  try {
    const { url, filename } = await request.json()
    if (!url) return NextResponse.json({ error: '缺少图片URL' }, { status: 400 })

    // HF Spaces 文件系统不持久，跳过本地下载直接返回原始 URL
    if (isHF()) {
      return NextResponse.json({ success: true, path: url })
    }

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    })
    if (!res.ok) return NextResponse.json({ error: '下载失败' }, { status: 502 })

    const buffer = Buffer.from(await res.arrayBuffer())

    const ext = path.extname(new URL(url).pathname) || '.jpg'
    const name = (filename || `steam_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '_')
    const finalName = `${name}${ext}`

    const dir = path.join(process.cwd(), 'public', 'images')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

    const filePath = path.join(dir, finalName)
    fs.writeFileSync(filePath, buffer)

    return NextResponse.json({
      success: true,
      path: `/images/${finalName}`
    })
  } catch {
    return NextResponse.json({ error: '下载图片失败' }, { status: 500 })
  }
}
