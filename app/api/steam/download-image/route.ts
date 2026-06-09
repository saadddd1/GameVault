import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { generateThumbnail } from '@/lib/image'
import { checkBodySize } from '@/lib/api-helpers'
import fs from 'fs'
import path from 'path'

const MAX_IMAGE_BYTES = 20 * 1024 * 1024 // 远程图片最大 20MB

const STEAM_CDN_DOMAINS = ['steampowered.com', 'steamstatic.com', 'steamusercontent.com']

function isSteamCDN(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase()
    return STEAM_CDN_DOMAINS.some(d => host === d || host.endsWith('.' + d))
  } catch {
    return false
  }
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

    // HEAD 预检远程图片大小
    try {
      const head = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } })
      const cl = head.headers.get('content-length')
      if (cl && parseInt(cl) > MAX_IMAGE_BYTES) {
        return NextResponse.json({ error: '远程图片过大，最大 20MB' }, { status: 400 })
      }
    } catch { /* HEAD 失败继续尝试下载 */ }

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    })
    if (!res.ok) return NextResponse.json({ error: '下载失败' }, { status: 502 })

    const buffer = Buffer.from(await res.arrayBuffer())

    // Detect real extension from Content-Type
    const ct = res.headers.get('content-type') || ''
    const extMap: Record<string, string> = { 'image/png': '.png', 'image/webp': '.webp', 'image/jpeg': '.jpg' }
    const ext = extMap[ct.split(';')[0]] || '.jpg'

    // Sanitize filename, strip non-ASCII but keep basic chars
    const safe = (filename || `steam_${Date.now()}`).replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, '_')
    const finalName = safe.length > 2 ? `${safe}${ext}` : `steam_${Date.now()}${ext}`

    const dir = path.join(process.cwd(), 'public', 'images')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

    const filePath = path.join(dir, finalName)
    // Skip if already exists
    if (fs.existsSync(filePath)) {
      return NextResponse.json({ success: true, path: `/images/${finalName}`, thumb: `/images/${finalName.replace(ext, '_thumb.webp')}` })
    }
    fs.writeFileSync(filePath, buffer)

    // 生成缩略图（后台异步，失败不影响主流程）
    let thumbPath = `/images/${finalName}`
    try {
      thumbPath = await generateThumbnail(filePath)
    } catch { /* 缩略图生成失败，用原图 */ }

    return NextResponse.json({
      success: true,
      path: `/images/${finalName}`,
      thumb: thumbPath,
    })
  } catch {
    return NextResponse.json({ error: '下载图片失败' }, { status: 500 })
  }
}
