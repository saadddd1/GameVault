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
  const id = request.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: '缺少 App ID' }, { status: 400 })

  try {
    const data = await steamFetch(`/appdetails?appids=${id}&l=zh`)
    const app = data?.[id]?.data
    if (!app) return NextResponse.json({ error: '未找到' }, { status: 404 })

    return NextResponse.json({
      name: app.name,
      description: (app.short_description || app.about_the_game || '').replace(/<[^>]*>/g, ''),
      cover: app.header_image || '',
      screenshots: (app.screenshots || []).map((s: { path_full: string }) => s.path_full),
      releaseDate: app.release_date?.date || '',
      genres: (app.genres || []).map((g: { description: string }) => g.description),
      developers: app.developers || [],
      size: app.pc_requirements?.minimum ? '50GB' : ''
    })
  } catch {
    return NextResponse.json({ error: 'Steam 不可达' }, { status: 502 })
  }
}
