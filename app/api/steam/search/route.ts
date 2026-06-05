import { NextRequest, NextResponse } from 'next/server'

const STEAM_API = 'https://store.steampowered.com/api'

async function steamFetch(path: string) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(`${STEAM_API}${path}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: controller.signal
    })
    return await res.json()
  } finally {
    clearTimeout(timeout)
  }
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')
  if (!q) return NextResponse.json({ items: [] })

  try {
    const data = await steamFetch(`/storesearch/?term=${encodeURIComponent(q)}&l=zh`)
    return NextResponse.json({ items: data.items || [] })
  } catch {
    return NextResponse.json({ items: [], error: 'Steam 不可达' })
  }
}
