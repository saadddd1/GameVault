import { NextRequest, NextResponse } from 'next/server'
import { validateUser, generateToken, getAllUsers, createUser, requireAdmin } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'

function getIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || '127.0.0.1'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, username, password } = body

    // Register
    if (action === 'register') {
      const { email } = body
      if (!username || !password || !email) {
        return NextResponse.json({ error: '请填写用户名、邮箱和密码' }, { status: 400 })
      }
      if (password.length < 6) {
        return NextResponse.json({ error: '密码至少 6 位' }, { status: 400 })
      }

      const { users } = getAllUsers()
      const hasAdmin = users.some(u => u.role === 'admin')

      try {
        // Setup mode: no admin exists, allow first admin creation
        if (!hasAdmin) {
          const user = createUser({ username, password, email, role: 'admin' })
          const token = generateToken(user.id, user.role)
          return NextResponse.json({ success: true, user, token })
        }

        // Normal mode: require existing admin auth
        const admin = requireAdmin(request)
        if (!admin) {
          return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
        }
        const user = createUser({ username, password, email, role: body.role || 'admin' })
        const token = generateToken(user.id, user.role)
        return NextResponse.json({ success: true, user, token })
      } catch {
        return NextResponse.json({ error: '注册失败，请检查信息是否已存在' }, { status: 400 })
      }
    }

    // Login (default)
    if (!username || !password) {
      return NextResponse.json({ error: '请输入用户名和密码' }, { status: 400 })
    }

    // 频率限制：IP + 用户名双重维度，各 5 次/15 分钟
    const ip = getIP(request)
    if (!rateLimit(`login:ip:${ip}`, 5) || !rateLimit(`login:user:${username}`, 5)) {
      return NextResponse.json({ error: '尝试次数过多，请 15 分钟后再试' }, { status: 429 })
    }

    const user = validateUser(username, password)
    if (!user) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 })
    }

    const token = generateToken(user.id, user.role)
    return NextResponse.json({ success: true, user, token })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '服务器错误'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
