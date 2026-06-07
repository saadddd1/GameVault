import { NextResponse } from 'next/server'
import { getAllGames } from '@/lib/games'
import { getAllAndroid } from '@/lib/android'
import { getAllWindows } from '@/lib/windows'
import { getAllMods } from '@/lib/mod'

export async function GET() {
  try {
    const { games } = getAllGames()
    const { mods } = getAllMods()
    const { apps: androidApps } = getAllAndroid()
    const { apps: windowsApps } = getAllWindows()

    return NextResponse.json({
      totalGames: games.length,
      hotGames: games.filter(g => g.isHot).length,
      newGames: games.filter(g => g.isNew).length,
      totalMods: mods.length,
      totalAndroid: androidApps.length,
      totalWindows: windowsApps.length
    })
  } catch (error) {
    return NextResponse.json(
      { error: '获取统计数据失败' },
      { status: 500 }
    )
  }
}
