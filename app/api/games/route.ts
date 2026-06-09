import { NextRequest } from 'next/server'
import { getAllGames, getGameById, addGame, updateGame, deleteGame } from '@/lib/games'
import { requireAdmin } from '@/lib/auth'
import { json, err, notFound, unauthorized } from '@/lib/api-helpers'

function guard(req: NextRequest) {
  return requireAdmin(req) ? null : unauthorized()
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (id) {
      const game = getGameById(parseInt(id))
      if (!game) return notFound('游戏不存在')
      return json({ game })
    }
    return json(getAllGames())
  } catch {
    return err('获取列表失败')
  }
}

export async function POST(request: NextRequest) {
  const blocked = guard(request); if (blocked) return blocked
  try {
    const body = await request.json()
    if (!body.title || !body.description || !body.size || !body.category) return err('缺少必填字段', 400)
    if (!body.downloadLinks?.length) return err('至少需要一个下载链接', 400)

    const game = addGame({
      title: body.title,
      description: body.description,
      coverImage: body.coverImage || '/images/default.svg',
      size: body.size,
      category: body.category,
      downloadLinks: body.downloadLinks,
      screenshots: body.screenshots || [],
      releaseDate: body.releaseDate || new Date().toISOString().split('T')[0],
      updateDate: body.updateDate || new Date().toISOString().split('T')[0],
      downloadCount: body.downloadCount || 0,
      isHot: body.isHot || false,
      isNew: body.isNew !== undefined ? body.isNew : true,
      isFeatured: body.isFeatured !== undefined ? body.isFeatured : false,
    })
    return json({ success: true, game }, 201)
  } catch {
    return err('添加失败')
  }
}

export async function PUT(request: NextRequest) {
  const blocked = guard(request); if (blocked) return blocked
  try {
    const { id, ...updates } = await request.json()
    if (!id) return err('缺少ID', 400)
    const game = updateGame(id, updates)
    if (!game) return notFound('游戏不存在')
    return json({ success: true, game })
  } catch {
    return err('更新失败')
  }
}

export async function DELETE(request: NextRequest) {
  const blocked = guard(request); if (blocked) return blocked
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return err('缺少ID', 400)
    if (!deleteGame(parseInt(id))) return notFound('游戏不存在')
    return json({ success: true })
  } catch {
    return err('删除失败')
  }
}
