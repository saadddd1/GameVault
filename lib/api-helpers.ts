import { NextResponse } from 'next/server'

export function json(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status })
}

export function err(msg: string, status = 500): NextResponse {
  return NextResponse.json({ error: msg }, { status })
}

export function notFound(msg = '不存在'): NextResponse {
  return err(msg, 404)
}

export function unauthorized(): NextResponse {
  return err('未授权', 401)
}
