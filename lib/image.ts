// 服务端专用 — 使用 sharp 处理图片
import sharp from 'sharp'
import path from 'path'

const THUMB_WIDTH = 600

export async function generateThumbnail(inputPath: string): Promise<string> {
  const dir = path.dirname(inputPath)
  const name = path.basename(inputPath, path.extname(inputPath))
  const outputPath = path.join(dir, `${name}_thumb.webp`)

  await sharp(inputPath)
    .resize(THUMB_WIDTH)
    .webp({ quality: 75 })
    .toFile(outputPath)

  const relativePath = path.relative(path.join(process.cwd(), 'public'), outputPath)
  return '/' + relativePath.replace(/\\/g, '/')
}
