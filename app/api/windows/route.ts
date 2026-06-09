import { NextRequest } from 'next/server'
import { getAllWindows, getWindowsById, addWindows, updateWindows, deleteWindows } from '@/lib/windows'
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
      const app = getWindowsById(parseInt(id))
      if (!app) return notFound('应用不存在')
      return json({ app })
    }
    const data = getAllWindows()
    return json({ apps: data.apps, categories: data.categories })
  } catch {
    return err('获取列表失败')
  }
}

export async function POST(request: NextRequest) {
  const blocked = guard(request); if (blocked) return blocked
  try {
    const app = addWindows(await request.json())
    return json({ app }, 201)
  } catch {
    return err('添加失败')
  }
}

export async function PUT(request: NextRequest) {
  const blocked = guard(request); if (blocked) return blocked
  try {
    const { id, ...updates } = await request.json()
    if (!id) return err('缺少 ID', 400)
    const app = updateWindows(id, updates)
    if (!app) return notFound('应用不存在')
    return json({ app })
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
    if (!deleteWindows(parseInt(id))) return notFound('应用不存在')
    return json({ success: true })
  } catch {
    return err('删除失败')
  }
}
