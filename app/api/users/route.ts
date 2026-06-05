import { NextRequest, NextResponse } from 'next/server'
import { getSafeUsers, requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
  }
  try {
    const users = getSafeUsers()
    return NextResponse.json({ users })
  } catch (error) {
    return NextResponse.json(
      { error: '获取用户列表失败' },
      { status: 500 }
    )
  }
}
