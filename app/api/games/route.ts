import { NextRequest, NextResponse } from 'next/server'
import { addGame, getAllGames } from '@/lib/games'
import fs from 'fs'
import path from 'path'

const dataPath = path.join(process.cwd(), 'data/games.json')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证必填字段
    if (!body.title || !body.description || !body.size || !body.category) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      )
    }

    // 验证下载链接
    if (!body.downloadLinks || body.downloadLinks.length === 0) {
      return NextResponse.json(
        { error: '至少需要一个下载链接' },
        { status: 400 }
      )
    }

    const newGame = addGame({
      title: body.title,
      description: body.description,
      coverImage: body.coverImage || '/images/default.jpg',
      size: body.size,
      category: body.category,
      downloadLinks: body.downloadLinks,
      releaseDate: body.releaseDate || new Date().toISOString().split('T')[0],
      updateDate: body.updateDate || new Date().toISOString().split('T')[0],
      downloadCount: body.downloadCount || 0,
      isHot: body.isHot || false,
      isNew: body.isNew !== undefined ? body.isNew : true
    })

    return NextResponse.json({ success: true, game: newGame }, { status: 201 })
  } catch (error) {
    console.error('添加游戏失败:', error)
    return NextResponse.json(
      { error: '添加游戏失败' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const data = getAllGames()
    return NextResponse.json(data)
  } catch (error) {
    console.error('获取游戏失败:', error)
    return NextResponse.json(
      { error: '获取游戏失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: '缺少游戏ID' },
        { status: 400 }
      )
    }

    const data = getAllGames()
    const gameIndex = data.games.findIndex(g => g.id === parseInt(id))
    
    if (gameIndex === -1) {
      return NextResponse.json(
        { error: '游戏不存在' },
        { status: 404 }
      )
    }

    data.games.splice(gameIndex, 1)
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))

    return NextResponse.json({ success: true, message: '删除成功' })
  } catch (error) {
    console.error('删除游戏失败:', error)
    return NextResponse.json(
      { error: '删除游戏失败' },
      { status: 500 }
    )
  }
}
