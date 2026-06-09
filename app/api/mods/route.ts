import { NextRequest } from 'next/server'
import { getAllMods, getModById, addMod, updateMod, deleteMod } from '@/lib/mod'
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
      const mod = getModById(parseInt(id))
      if (!mod) return notFound('MOD 不存在')
      return json({ mod })
    }
    const data = getAllMods()
    return json({ mods: data.mods, categories: data.categories, games: data.games })
  } catch {
    return err('获取失败')
  }
}

export async function POST(request: NextRequest) {
  const blocked = guard(request); if (blocked) return blocked
  try {
    const mod = addMod(await request.json())
    return json({ mod }, 201)
  } catch {
    return err('添加失败')
  }
}

export async function PUT(request: NextRequest) {
  const blocked = guard(request); if (blocked) return blocked
  try {
    const { id, ...updates } = await request.json()
    if (!id) return err('缺少 ID', 400)
    const mod = updateMod(id, updates)
    if (!mod) return notFound('MOD 不存在')
    return json({ mod })
  } catch {
    return err('更新失败')
  }
}

export async function DELETE(request: NextRequest) {
  const blocked = guard(request); if (blocked) return blocked
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return err('缺少 ID', 400)
    if (!deleteMod(parseInt(id))) return notFound('MOD 不存在')
    return json({ success: true })
  } catch {
    return err('删除失败')
  }
}
