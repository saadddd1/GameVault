import { NextResponse } from 'next/server'
import { getAllGames } from '@/lib/games'
import { getAllUsers } from '@/lib/auth'

export async function GET() {
  try {
    const { games } = getAllGames()
    const { users } = getAllUsers()
    
    return NextResponse.json({
      totalGames: games.length,
      totalUsers: users.length,
      hotGames: games.filter(g => g.isHot).length,
      newGames: games.filter(g => g.isNew).length
    })
  } catch (error) {
    return NextResponse.json(
      { error: '获取统计数据失败' },
      { status: 500 }
    )
  }
}
