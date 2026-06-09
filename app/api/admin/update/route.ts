import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { exec } from 'child_process'

export async function POST(request: Request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
  }

  const cwd = process.cwd()

  try {
    const output = await new Promise<string>((resolve, reject) => {
      exec(
        'git pull origin master && npm ci --omit=dev && npm run build && pm2 reload gamevault',
        { cwd, timeout: 120000, env: { ...process.env, NODE_ENV: 'production' } },
        (err, stdout, stderr) => {
          if (err) reject(stderr || err.message)
          else resolve(stdout)
        }
      )
    })

    return NextResponse.json({ success: true, output })
  } catch (e) {
    return NextResponse.json({ error: '更新失败', detail: String(e) }, { status: 500 })
  }
}
