import { NextRequest, NextResponse } from 'next/server'
import { createUser, validateUser, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'register') {
      const { username, email, password } = body

      if (!username || !email || !password) {
        return NextResponse.json(
          { error: '请填写所有必填字段' },
          { status: 400 }
        )
      }

      if (password.length < 6) {
        return NextResponse.json(
          { error: '密码至少需要6个字符' },
          { status: 400 }
        )
      }

      const user = createUser({ username, email, password })
      const token = generateToken(user.id, user.role)

      return NextResponse.json({
        success: true,
        user,
        token
      })
    }

    if (action === 'login') {
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
    }

    return NextResponse.json(
      { error: '无效的操作' },
      { status: 400 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '服务器错误' },
      { status: 500 }
    )
  }
}
