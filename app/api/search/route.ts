import { NextRequest, NextResponse } from 'next/server'
import { getAllGames } from '@/lib/games'
import { getAllMods } from '@/lib/mod'
import { getAllAndroid } from '@/lib/android'
import { getAllWindows } from '@/lib/windows'
import { trackSearch, getHotSearches } from '@/lib/search'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()
  const hot = searchParams.get('hot')

  // 热门搜索
  if (hot === '1') {
    return NextResponse.json({ hot: getHotSearches(10) })
  }

  // 搜索
  if (!q || q.length < 2) {
    return NextResponse.json({ results: { games: [], mods: [], android: [], windows: [] }, hot: getHotSearches(10) })
  }

  trackSearch(q)
  const query = q.toLowerCase()

  try {
    const { games } = getAllGames()
    const { mods } = getAllMods()
    const { apps: androidApps } = getAllAndroid()
    const { apps: windowsApps } = getAllWindows()

    const match = (text: string) => text.toLowerCase().includes(query)

    return NextResponse.json({
      query: q,
      results: {
        games: games.filter(g => match(g.title) || match(g.description) || match(g.category)),
        mods: mods.filter(m => match(m.title) || match(m.description) || match(m.gameName) || match(m.category)),
        android: androidApps.filter(a => match(a.name) || match(a.description) || match(a.category)),
        windows: windowsApps.filter(a => match(a.name) || match(a.description) || match(a.category))
      },
      hot: getHotSearches(10)
    })
  } catch {
    return NextResponse.json({ error: '搜索失败' }, { status: 500 })
  }
}
