import { NextRequest, NextResponse } from 'next/server'
import { getAllAndroid, getAndroidById, addAndroid, updateAndroid, deleteAndroid } from '@/lib/android'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (id) {
      const app = getAndroidById(parseInt(id))
      if (!app) return NextResponse.json({ error: '应用不存在' }, { status: 404 })
      return NextResponse.json({ app })
    }
    const data = getAllAndroid()
    return NextResponse.json({ apps: data.apps, categories: data.categories })
  } catch {
    return NextResponse.json({ error: '获取列表失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) return NextResponse.json({ error: '未授权' }, { status: 401 })
  try {
    const body = await request.json()
    const app = addAndroid(body)
    return NextResponse.json({ app }, { status: 201 })
  } catch {
    return NextResponse.json({ error: '添加失败' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  if (!requireAdmin(request)) return NextResponse.json({ error: '未授权' }, { status: 401 })
  try {
    const { id, ...updates } = await request.json()
    if (!id) return NextResponse.json({ error: '缺少ID' }, { status: 400 })
    const app = updateAndroid(id, updates)
    if (!app) return NextResponse.json({ error: '应用不存在' }, { status: 404 })
    return NextResponse.json({ app })
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
    const ok = deleteAndroid(parseInt(id))
    if (!ok) return NextResponse.json({ error: '应用不存在' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: '删除失败' }, { status: 500 })
  }
}
