import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { json, err, notFound, unauthorized, checkBodySize } from '@/lib/api-helpers'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Item = Record<string, any>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...args: any[]) => any

interface Config {
  label: string
  singleKey: string
  requiredFields: string[]
  listResponse: () => Record<string, unknown>
  getById: (id: number) => Item | undefined
  add: AnyFn
  update: AnyFn
  del: AnyFn
}

function guard(req: NextRequest) {
  return requireAdmin(req) ? null : unauthorized()
}

export function createRoutes(config: Config) {
  const notFoundMsg = `${config.label}不存在`

  async function GET(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url)
      const id = searchParams.get('id')
      if (id) {
        const item = config.getById(parseInt(id))
        if (!item) return notFound(notFoundMsg)
        return json({ [config.singleKey]: item })
      }
      return json(config.listResponse())
    } catch {
      return err('获取失败')
    }
  }

  async function POST(request: NextRequest) {
    const blocked = guard(request); if (blocked) return blocked
    const tooLarge = checkBodySize(request, 2 * 1024 * 1024); if (tooLarge) return tooLarge
    try {
      const body = await request.json()
      for (const f of config.requiredFields) {
        if (!body[f]) return err('缺少必填字段', 400)
      }
      if (!body.downloadLinks?.length) return err('至少需要一个下载链接', 400)
      const item = await config.add(body)
      return json({ [config.singleKey]: item }, 201)
    } catch {
      return err('添加失败')
    }
  }

  async function PUT(request: NextRequest) {
    const blocked = guard(request); if (blocked) return blocked
    const tooLarge = checkBodySize(request, 2 * 1024 * 1024); if (tooLarge) return tooLarge
    try {
      const { id, ...updates } = await request.json()
      if (!id) return err('缺少 ID', 400)
      const item = await config.update(id, updates)
      if (!item) return notFound(notFoundMsg)
      return json({ [config.singleKey]: item })
    } catch {
      return err('更新失败')
    }
  }

  async function DELETE(request: NextRequest) {
    const blocked = guard(request); if (blocked) return blocked
    try {
      const { searchParams } = new URL(request.url)
      const id = searchParams.get('id')
      if (!id) return err('缺少 ID', 400)
      if (!(await config.del(parseInt(id)))) return notFound(notFoundMsg)
      return json({ success: true })
    } catch {
      return err('删除失败')
    }
  }

  return { GET, POST, PUT, DELETE }
}
