import { NextResponse } from 'next/server'
import { getAllUsers } from '@/lib/auth'

export async function GET() {
  try {
    const { users } = getAllUsers()
    
    // 不返回密码字段
    const safeUsers = users.map(({ password, ...user }) => user)
    
    return NextResponse.json({ users: safeUsers })
  } catch (error) {
    return NextResponse.json(
      { error: '获取用户列表失败' },
      { status: 500 }
    )
  }
}
