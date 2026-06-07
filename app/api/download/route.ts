import { NextRequest, NextResponse } from 'next/server'
import { getAllGames } from '@/lib/games'
import { getModById, getAllMods } from '@/lib/mod'
import { getToolById, getAllTools } from '@/lib/tool'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'game'
  const itemId = searchParams.get('id')
  const linkIndex = parseInt(searchParams.get('index') || '0')

  if (!itemId) {
    return NextResponse.json({ error: '缺少参数' }, { status: 400 })
  }

  const id = parseInt(itemId)
  let link: { url: string } | undefined

  try {
    if (type === 'game') {
      const data = getAllGames()
      const item = data.games.find(g => g.id === id)
      if (!item) return NextResponse.json({ error: '游戏不存在' }, { status: 404 })
      link = item.downloadLinks[linkIndex]
      if (!link) return NextResponse.json({ error: '下载链接不存在' }, { status: 404 })
      item.downloadCount++
      fs.writeFileSync(path.join(process.cwd(), 'data/games.json'), JSON.stringify(data, null, 2))
    } else if (type === 'mod') {
      const data = getAllMods()
      const item = getModById(id)
      if (!item) return NextResponse.json({ error: 'MOD不存在' }, { status: 404 })
      link = item.downloadLinks[linkIndex]
      if (!link) return NextResponse.json({ error: '下载链接不存在' }, { status: 404 })
      item.downloadCount++
      const index = data.mods.findIndex(m => m.id === id)
      if (index !== -1) {
        data.mods[index] = item
        fs.writeFileSync(path.join(process.cwd(), 'data/mods.json'), JSON.stringify(data, null, 2))
      }
    } else if (type === 'tool') {
      const data = getAllTools()
      const item = getToolById(id)
      if (!item) return NextResponse.json({ error: '工具不存在' }, { status: 404 })
      link = item.downloadLinks[linkIndex]
      if (!link) return NextResponse.json({ error: '下载链接不存在' }, { status: 404 })
      item.downloadCount++
      const index = data.tools.findIndex(t => t.id === id)
      if (index !== -1) {
        data.tools[index] = item
        fs.writeFileSync(path.join(process.cwd(), 'data/tools.json'), JSON.stringify(data, null, 2))
      }
    } else {
      return NextResponse.json({ error: '无效的type参数' }, { status: 400 })
    }

    return NextResponse.redirect(link.url)
  } catch (error) {
    return NextResponse.json({ error: '下载处理失败' }, { status: 500 })
  }
}
