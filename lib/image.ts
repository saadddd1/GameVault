// 服务端专用 — 使用 sharp 处理图片
import sharp from 'sharp'
import path from 'path'

const COVER_WIDTH = 400
const THUMB_WIDTH = 200

// 压缩封面图并生成缩略图，返回 { cover, thumb } 本地路径
export async function compressImage(inputPath: string): Promise<{ cover: string; thumb: string }> {
  const dir = path.dirname(inputPath)
  const name = path.basename(inputPath, path.extname(inputPath))
  const coverPath = path.join(dir, `${name}.webp`)
  const thumbPath = path.join(dir, `${name}_thumb.webp`)

  await sharp(inputPath)
    .resize(COVER_WIDTH, null, { withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(coverPath)

  await sharp(inputPath)
    .resize(THUMB_WIDTH, null, { withoutEnlargement: true })
    .webp({ quality: 75 })
    .toFile(thumbPath)

  const rel = (p: string) => '/' + path.relative(path.join(process.cwd(), 'public'), p).replace(/\\/g, '/')

  return { cover: rel(coverPath), thumb: rel(thumbPath) }
}

// 旧 API 兼容 — 仅生成缩略图
export async function generateThumbnail(inputPath: string): Promise<string> {
  const result = await compressImage(inputPath)
  return result.thumb
}
