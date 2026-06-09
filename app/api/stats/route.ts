import { getAllGames } from '@/lib/games'
import { getAllMods } from '@/lib/mod'
import { getAllAndroid } from '@/lib/android'
import { getAllWindows } from '@/lib/windows'
import { json, err } from '@/lib/api-helpers'

export async function GET() {
  try {
    const { games } = getAllGames()
    const { mods } = getAllMods()
    const { apps: androidApps } = getAllAndroid()
    const { apps: windowsApps } = getAllWindows()

    return json({
      totalGames: games.length,
      hotGames: games.filter(g => g.isHot).length,
      newGames: games.filter(g => g.isNew).length,
      totalMods: mods.length,
      totalAndroid: androidApps.length,
      totalWindows: windowsApps.length,
    })
  } catch {
    return err('获取统计数据失败')
  }
}
