import { NextRequest, NextResponse } from 'next/server'
import { validateUser, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: '请输入用户名和密码' },
        { status: 400 }
      )
    }

    const user = validateUser(username, password)

    if (!user) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      )
    }

    const token = generateToken(user.id, user.role)

    return NextResponse.json({
      success: true,
      user,
      token
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '服务器错误'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
