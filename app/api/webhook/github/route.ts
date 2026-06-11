import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { createHmac, timingSafeEqual } from 'crypto'
import fs from 'fs'
import path from 'path'

function verifySignature(payload: string, signature: string, secret: string): boolean {
  try {
    const hmac = createHmac('sha256', secret)
    const digest = 'sha256=' + hmac.update(payload).digest('hex')
    return timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  const event = request.headers.get('X-GitHub-Event')
  if (event !== 'push') {
    return NextResponse.json({ message: 'ignored' }, { status: 200 })
  }

  const signature = request.headers.get('X-Hub-Signature-256')
  if (!signature) {
    return NextResponse.json({ error: 'missing signature' }, { status: 401 })
  }

  const secretPath = path.join(process.cwd(), 'data', '.webhook_secret')
  let secret: string
  try {
    secret = fs.readFileSync(secretPath, 'utf-8').trim()
  } catch {
    return NextResponse.json({ error: 'webhook not configured' }, { status: 500 })
  }

  const body = await request.text()
  if (!verifySignature(body, signature, secret)) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 })
  }

  let payload: { ref?: string }
  try {
    payload = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  if (payload.ref !== 'refs/heads/master') {
    return NextResponse.json({ message: 'not master branch' }, { status: 200 })
  }

  const cwd = process.cwd()
  try {
    const output = await new Promise<string>((resolve, reject) => {
      exec(
        'bash update.sh',
        { cwd, timeout: 180000, env: { ...process.env, NODE_ENV: 'production' } },
        (err, stdout, stderr) => {
          if (err) reject(stderr || err.message)
          else resolve(stdout)
        }
      )
    })

    return NextResponse.json({ success: true, output })
  } catch (e) {
    return NextResponse.json({ error: 'deploy failed', detail: String(e) }, { status: 500 })
  }
}
