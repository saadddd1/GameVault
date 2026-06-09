import { NextRequest } from 'next/server'
import { getAllGames } from '@/lib/games'
import { getAllMods } from '@/lib/mod'
import { getAllAndroid } from '@/lib/android'
import { getAllWindows } from '@/lib/windows'
import { trackSearch, getHotSearches } from '@/lib/search'
import { SEARCHABLE_MODULES } from '@/lib/modules'
import { json, err } from '@/lib/api-helpers'

// 各模块的数据获取 + 搜索字段映射
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SearchItem = Record<string, any>

function getSearchData() {
  return [
    { key: 'games' as const,   items: getAllGames().games as unknown as SearchItem[],   fields: ['title', 'description', 'category'] },
    { key: 'mods' as const,    items: getAllMods().mods as unknown as SearchItem[],       fields: ['title', 'description', 'gameName', 'category'] },
    { key: 'android' as const, items: getAllAndroid().apps as unknown as SearchItem[],   fields: ['name', 'description', 'category'] },
    { key: 'windows' as const, items: getAllWindows().apps as unknown as SearchItem[],   fields: ['name', 'description', 'category'] },
  ]
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()
  const hot = searchParams.get('hot')

  if (hot === '1') {
    return json({ hot: getHotSearches(10) })
  }

  if (!q || q.length < 2) {
    return json({ results: { games: [], mods: [], android: [], windows: [] }, hot: getHotSearches(10) })
  }

  trackSearch(q)
  const query = q.toLowerCase()

  try {
    const results: Record<string, unknown[]> = {}
    const match = (text: unknown) => typeof text === 'string' && text.toLowerCase().includes(query)

    for (const { key, items, fields } of getSearchData()) {
      results[key] = items.filter(item =>
        fields.some(f => match(item[f]))
      )
    }

    return json({ query: q, results, hot: getHotSearches(10) })
  } catch {
    return err('搜索失败')
  }
}
