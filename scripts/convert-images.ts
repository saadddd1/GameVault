// 一次性脚本：将 public/images/ 下所有图片生成 WebP 缩略图
// 用法: npx tsx scripts/convert-images.ts

import { generateThumbnail } from '../lib/image'
import fs from 'fs'
import path from 'path'

const dir = path.join(process.cwd(), 'public', 'images')

async function main() {
  const files = fs.readdirSync(dir).filter(f =>
    /\.(jpg|jpeg|png)$/i.test(f) && !f.includes('_thumb') && f !== 'default.svg'
  )

  console.log(`找到 ${files.length} 张图片`)

  for (const file of files) {
    const inputPath = path.join(dir, file)
    try {
      const thumbPath = await generateThumbnail(inputPath)
      const stat = fs.statSync(path.join(dir, path.basename(thumbPath)))
      const sizeKB = (stat.size / 1024).toFixed(1)
      console.log(`  ✓ ${file} → thumb ${sizeKB}KB`)
    } catch (e) {
      console.error(`  ✗ ${file}:`, e)
    }
  }

  console.log('完成')
}

main()
