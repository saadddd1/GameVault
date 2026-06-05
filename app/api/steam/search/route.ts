import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')
  if (!q) return NextResponse.json({ error: '缺少搜索词' }, { status: 400 })

  try {
    const res = await fetch(
      `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(q)}&l=zh`,
      { headers: { 'Accept': 'application/json', 'User-Agent': 'GameVault/1.0' } }
    )
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Steam API 请求失败' }, { status: 500 })
  }
}
