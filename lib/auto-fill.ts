// 游戏自动填充：名称 → 模糊匹配 metadata → Steam 搜索 → 下载封面 → 扩充 metadata
import fs from 'fs'
import path from 'path'

interface GameMeta {
  id: number
  name: string
  nameEn: string
  description: string
  cover: string
  size: string
  category: string
  steamAppId?: number
}

interface SteamAppResult {
  name: string
  nameEn: string
  description: string
  cover: string
  size: string
  genres: string[]
  steamAppId: number
}

interface AutoFillResult {
  title: string
  description: string
  coverImage: string
  size: string
  category: string
  steamUrl?: string
  developer?: string
  publisher?: string
}

const META_PATH = path.join(process.cwd(), 'data', 'game-metadata.json')
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images')

// ----- 模糊匹配 -----

function normalize(s: string): string {
  return s
    .replace(/[：:：，,、。《》「」『』【】（）()\s\-_/\\・·]+/g, '')
    .toLowerCase()
}

function loadMetadata(): GameMeta[] {
  try {
    const raw = fs.readFileSync(META_PATH, 'utf-8')
    return (JSON.parse(raw).games || []) as GameMeta[]
  } catch { return [] }
}

function saveMetadata(games: GameMeta[]) {
  fs.writeFileSync(META_PATH, JSON.stringify({ games }, null, 2))
}

function fuzzyMatch(title: string): GameMeta | null {
  const input = normalize(title)
  const list = loadMetadata()

  // 第1层: 精确匹配（normalize 后完全一致）
  for (const g of list) {
    if (normalize(g.name) === input || normalize(g.nameEn) === input) return g
  }
  // 第2层: 包含匹配
  for (const g of list) {
    if (normalize(g.name).includes(input) || input.includes(normalize(g.name))) return g
    if (g.nameEn && (normalize(g.nameEn).includes(input) || input.includes(normalize(g.nameEn)))) return g
  }
  return null
}

// ----- Steam API -----

async function steamFetch(path: string) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const res = await fetch(`https://store.steampowered.com/api${path}`, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: controller.signal
    })
    return await res.json()
  } finally { clearTimeout(timeout) }
}

export async function searchSteam(title: string): Promise<SteamAppResult | null> {
  try {
    // 先用英文搜索
    const searchRes = await steamFetch(`/storesearch/?term=${encodeURIComponent(title)}&l=zh&cc=cn`)
    const items = searchRes?.items || []
    if (items.length === 0) return null

    const best = items[0]
    const appId = best.id

    // 获取详情
    const detailRes = await steamFetch(`/appdetails?appids=${appId}&l=zh`)
    const app = detailRes?.[String(appId)]?.data
    if (!app) return null

    return {
      name: app.name || best.name,
      nameEn: best.name || app.name,
      description: (app.short_description || '').replace(/<[^>]*>/g, '').slice(0, 2000),
      cover: app.header_image || best.tiny_image || '',
      size: '',
      genres: (app.genres || []).map((g: { description: string }) => g.description),
      steamAppId: appId,
    }
  } catch {
    return null
  }
}

// ----- 图片下载 -----

async function downloadCoverLocally(url: string, filename: string): Promise<string> {
  if (!url) return '/images/default.svg'

  const safe = filename.replace(/[^\x00-\x7F]/g, '').replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, '_')
  const finalName = safe.length > 2 ? `${safe}.jpg` : `steam_${Date.now()}.jpg`
  const filePath = path.join(IMAGES_DIR, finalName)

  if (fs.existsSync(filePath)) return `/images/${finalName}`

  try {
    const controller = new AbortController()
    const to = setTimeout(() => controller.abort(), 15000)
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: controller.signal
    })
    clearTimeout(to)
    if (!res.ok) return '/images/default.svg'

    const buffer = Buffer.from(await res.arrayBuffer())
    if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true })
    fs.writeFileSync(filePath, buffer)
    return `/images/${finalName}`
  } catch {
    return '/images/default.svg'
  }
}

// ----- 主入口 -----

export async function autoFillGame(
  title: string,
  existingGameId?: number
): Promise<AutoFillResult> {
  // 第1层: 模糊匹配 metadata
  const meta = fuzzyMatch(title)

  if (meta) {
    let coverImage = meta.cover
    // 如果 cover 是外部 URL，下载到本地
    if (coverImage.startsWith('http')) {
      coverImage = await downloadCoverLocally(coverImage, `game_${existingGameId || meta.id}_cover`)
      // 更新 metadata 中的 cover 为本地路径
      if (!coverImage.startsWith('http')) {
        const list = loadMetadata()
        const entry = list.find(g => g.id === meta.id)
        if (entry && entry.cover.startsWith('http')) {
          entry.cover = coverImage
          saveMetadata(list)
        }
      }
    }

    return {
      title: meta.name || title,
      description: meta.description || '',
      coverImage,
      size: meta.size || '',
      category: meta.category || '动作冒险',
    }
  }

  // 第2层: 搜索 Steam
  const steam = await searchSteam(title)
  if (steam) {
    let coverImage = '/images/default.svg'
    if (steam.cover) {
      coverImage = await downloadCoverLocally(steam.cover, `steam_${steam.steamAppId}_cover`)
    }

    // 扩充 metadata
    const list = loadMetadata()
    const newId = list.length > 0 ? Math.max(...list.map(g => g.id)) + 1 : 1
    list.push({
      id: newId,
      name: steam.name || title,
      nameEn: steam.nameEn || '',
      description: steam.description || '',
      cover: coverImage,
      size: steam.size || '',
      category: steam.genres[0] || '动作冒险',
      steamAppId: steam.steamAppId,
    })
    saveMetadata(list)

    return {
      title: steam.name || title,
      description: steam.description || '',
      coverImage,
      size: steam.size || '',
      category: steam.genres[0] || '动作冒险',
      steamUrl: `https://store.steampowered.com/app/${steam.steamAppId}`,
    }
  }

  // 第3层: 无匹配，用默认值
  return {
    title,
    description: '',
    coverImage: '/images/default.svg',
    size: '',
    category: '动作冒险',
  }
}
