// 客户端安全 — 仅字符串操作，不引用 sharp

/**
 * 根据原图路径获取缩略图路径
 */
export function getThumbPath(imagePath: string): string {
  if (!imagePath || imagePath === '/images/default.svg' || imagePath.endsWith('.svg')) {
    return imagePath
  }
  const dot = imagePath.lastIndexOf('.')
  const base = dot > 0 ? imagePath.slice(0, dot) : imagePath
  return `${base}_thumb.webp`
}
