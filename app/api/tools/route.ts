import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const dataPath = path.join(process.cwd(), 'data/tools.json')

export async function GET() {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: '获取工具列表失败' }, { status: 500 })
  }
}
