import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { compressImage } from '@/lib/image'
import { checkBodySize } from '@/lib/api-helpers'
import fs from 'fs'
import path from 'path'

const MAX_IMAGE_BYTES = 20 * 1024 * 1024
const STEAM_CDN_DOMAINS = ['steampowered.com', 'steamstatic.com', 'steamusercontent.com']

function isSteamCDN(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase()
    return STEAM_CDN_DOMAINS.some(d => host === d || host.endsWith('.' + d))
  } catch { return false }
}

export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
  }
  const tooLarge = checkBodySize(request, 1024 * 1024); if (tooLarge) return tooLarge

  try {
    const { url, filename } = await request.json()
    if (!url) return NextResponse.json({ error: '缺少图片URL' }, { status: 400 })
    if (!isSteamCDN(url)) return NextResponse.json({ error: '仅支持 Steam CDN 图片' }, { status: 400 })

    try {
      const head = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } })
      const cl = head.headers.get('content-length')
      if (cl && parseInt(cl) > MAX_IMAGE_BYTES) {
        return NextResponse.json({ error: '远程图片过大，最大 20MB' }, { status: 400 })
      }
    } catch { /* HEAD 失败继续 */ }

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    })
    if (!res.ok) return NextResponse.json({ error: '下载失败' }, { status: 502 })

    const buffer = Buffer.from(await res.arrayBuffer())
    const ct = res.headers.get('content-type') || ''
    const extMap: Record<string, string> = { 'image/png': '.png', 'image/webp': '.webp', 'image/jpeg': '.jpg' }
    const ext = extMap[ct.split(';')[0]] || '.jpg'

    const safe = (filename || `steam_${Date.now()}`)
      .replace(/[^\x00-\x7F]/g, '')  // strip non-ASCII
      .replace(/[\\/:*?"<>|]/g, '_')
      .replace(/\s+/g, '_')
    const baseName = safe.length > 2 ? safe : `steam_${Date.now()}`

    const dir = path.join(process.cwd(), 'public', 'images')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

    // 检查是否已有压缩后的文件
    const webpPath = `/images/${baseName}.webp`
    const thumbPath = `/images/${baseName}_thumb.webp`
    if (fs.existsSync(path.join(dir, `${baseName}.webp`))) {
      return NextResponse.json({ success: true, path: webpPath, thumb: thumbPath })
    }

    // 下载原图到临时文件
    const tmpPath = path.join(dir, `${baseName}_tmp${ext}`)
    fs.writeFileSync(tmpPath, buffer)

    // 压缩并生成缩略图
    let result: { cover: string; thumb: string }
    try {
      result = await compressImage(tmpPath)
      fs.unlinkSync(tmpPath) // 删除临时原图
    } catch {
      // 压缩失败，保留原图
      fs.renameSync(tmpPath, path.join(dir, `${baseName}${ext}`))
      return NextResponse.json({ success: true, path: `/images/${baseName}${ext}`, thumb: `/images/${baseName}${ext}` })
    }

    return NextResponse.json({ success: true, path: result.cover, thumb: result.thumb })
  } catch {
    return NextResponse.json({ error: '下载图片失败' }, { status: 500 })
  }
}
