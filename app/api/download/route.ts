import { NextRequest, NextResponse } from 'next/server'
import { getAllGames, updateGame } from '@/lib/games'
import { getAllMods, updateMod } from '@/lib/mod'
import { getAllAndroid, updateAndroid } from '@/lib/android'
import { getAllWindows, updateWindows } from '@/lib/windows'
import { err } from '@/lib/api-helpers'

const ALLOWED_DOMAINS = [
  'pan.baidu.com',
  'lanzou.com', 'lanzoui.com', 'lanzoux.com', 'lanzoub.com', 'lanzouw.com',
  'aliyundrive.com',
  '123pan.com',
  'cloud.189.cn',
  'pan.quark.cn',
  'drive.uc.cn',
  'caiyun.139.com',
]

function isAllowedRedirect(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase()
    return ALLOWED_DOMAINS.some(d => host === d || host.endsWith('.' + d))
  } catch {
    return false
  }
}

interface Downloadable {
  id: number
  downloadCount: number
  downloadLinks: { platform: string; url: string; password: string }[]
}

type ModuleHandler = {
  getAll: () => { items: Downloadable[] }
  updateCount: (id: number, count: number) => Promise<void>
}

const handlers: Record<string, ModuleHandler> = {
  game: {
    getAll: () => ({ items: getAllGames().games }),
    updateCount: (id, count) => updateGame(id, { downloadCount: count }).then(() => {}),
  },
  mod: {
    getAll: () => ({ items: getAllMods().mods }),
    updateCount: (id, count) => updateMod(id, { downloadCount: count }).then(() => {}),
  },
  android: {
    getAll: () => ({ items: getAllAndroid().apps }),
    updateCount: (id, count) => updateAndroid(id, { downloadCount: count }).then(() => {}),
  },
  windows: {
    getAll: () => ({ items: getAllWindows().apps }),
    updateCount: (id, count) => updateWindows(id, { downloadCount: count }).then(() => {}),
  },
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'game'
  const itemId = searchParams.get('id')
  const linkIndex = parseInt(searchParams.get('index') || '0')

  if (!itemId) return err('缺少参数', 400)

  const handler = handlers[type]
  if (!handler) return err('无效的 type 参数', 400)

  const id = parseInt(itemId)
  const { items } = handler.getAll()
  const item = items.find((i: Downloadable) => i.id === id)
  if (!item) return err('内容不存在', 404)

  const link = item.downloadLinks[linkIndex]
  if (!link) return err('下载链接不存在', 404)

  if (!isAllowedRedirect(link.url)) return err('不支持的下载链接', 400)

  // 通过 lib 层的 update 函数更新计数（走锁保护的 DataStore）
  await handler.updateCount(id, item.downloadCount + 1)

  return NextResponse.redirect(link.url)
}
