import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: '缺少 App ID' }, { status: 400 })

  try {
    const res = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${id}&l=zh`,
      { headers: { 'Accept': 'application/json', 'User-Agent': 'GameVault/1.0' } }
    )
    const data = await res.json()
    const appData = data?.[id]?.data
    if (!appData) {
      return NextResponse.json({ error: '未找到该游戏' }, { status: 404 })
    }
    return NextResponse.json({
      name: appData.name,
      description: appData.short_description || appData.about_the_game || '',
      cover: appData.header_image || '',
      screenshots: (appData.screenshots || []).map((s: { path_full: string }) => s.path_full),
      releaseDate: appData.release_date?.date || '',
      developers: appData.developers || [],
      publishers: appData.publishers || [],
      genres: (appData.genres || []).map((g: { description: string }) => g.description),
      categories: (appData.categories || []).map((c: { description: string }) => c.description)
    })
  } catch {
    return NextResponse.json({ error: 'Steam API 请求失败' }, { status: 500 })
  }
}
