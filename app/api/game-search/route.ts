import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getCached } from '@/lib/cache'

const dataPath = path.join(process.cwd(), 'data/game-metadata.json')

function loadMetadata() {
  return JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
}

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get('q') || '').toLowerCase()
  const data = getCached<{ games: { name: string; nameEn: string }[] }>('game-metadata', loadMetadata, 30000)

  if (!q) {
    return NextResponse.json({ games: data.games.slice(0, 10) })
  }

  const results = data.games.filter(
    (g: { name: string; nameEn: string }) =>
      g.name.toLowerCase().includes(q) ||
      (g.nameEn && g.nameEn.toLowerCase().includes(q))
  )

  return NextResponse.json({ games: results })
}
