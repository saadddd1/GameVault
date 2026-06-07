import { NextRequest, NextResponse } from 'next/server'
import { getAllMods, getModById, addMod, updateMod, deleteMod } from '@/lib/mod'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (id) {
      const mod = getModById(parseInt(id))
      if (!mod) return NextResponse.json({ error: 'MOD不存在' }, { status: 404 })
      return NextResponse.json({ mod })
    }
    const data = getAllMods()
    return NextResponse.json({ mods: data.mods, categories: data.categories, games: data.games })
  } catch {
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) return NextResponse.json({ error: '未授权' }, { status: 401 })
  try {
    const body = await request.json()
    const mod = addMod(body)
    return NextResponse.json({ mod }, { status: 201 })
  } catch {
    return NextResponse.json({ error: '添加失败' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  if (!requireAdmin(request)) return NextResponse.json({ error: '未授权' }, { status: 401 })
  try {
    const { id, ...updates } = await request.json()
    if (!id) return NextResponse.json({ error: '缺少ID' }, { status: 400 })
    const mod = updateMod(id, updates)
    if (!mod) return NextResponse.json({ error: 'MOD不存在' }, { status: 404 })
    return NextResponse.json({ mod })
  } catch {
    return NextResponse.json({ error: '更新失败' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!requireAdmin(request)) return NextResponse.json({ error: '未授权' }, { status: 401 })
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: '缺少ID' }, { status: 400 })
    const ok = deleteMod(parseInt(id))
    if (!ok) return NextResponse.json({ error: 'MOD不存在' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: '删除失败' }, { status: 500 })
  }
}
