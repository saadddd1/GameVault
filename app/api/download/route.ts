import { NextRequest, NextResponse } from 'next/server'
import { getAllGames } from '@/lib/games'
import fs from 'fs'
import path from 'path'

const dataPath = path.join(process.cwd(), 'data/games.json')

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const gameId = searchParams.get('id')
  const linkIndex = parseInt(searchParams.get('index') || '0')

  if (!gameId) {
    return NextResponse.json({ error: '缺少参数' }, { status: 400 })
  }

  const data = getAllGames()
  const game = data.games.find(g => g.id === parseInt(gameId))

  if (!game) {
    return NextResponse.json({ error: '游戏不存在' }, { status: 404 })
  }

  if (!game.downloadLinks[linkIndex]) {
    return NextResponse.json({ error: '下载链接不存在' }, { status: 404 })
  }

  game.downloadCount++
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))

  return NextResponse.redirect(game.downloadLinks[linkIndex].url)
}
