import { NextResponse } from 'next/server'
import { getAllGames } from '@/lib/games'
import { getAllMods } from '@/lib/mod'
import { getAllTools } from '@/lib/tool'

export async function GET() {
  try {
    const { games } = getAllGames()
    const { mods } = getAllMods()
    const { tools } = getAllTools()

    return NextResponse.json({
      totalGames: games.length,
      hotGames: games.filter(g => g.isHot).length,
      newGames: games.filter(g => g.isNew).length,
      totalMods: mods.length,
      totalTools: tools.length
    })
  } catch (error) {
    return NextResponse.json(
      { error: '获取统计数据失败' },
      { status: 500 }
    )
  }
}
