const store = new Map<string, { count: number; resetAt: number }>()

// 15 分钟后重置计数
const WINDOW_MS = 15 * 60 * 1000

function prune() {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key)
  }
}

export function rateLimit(key: string, maxAttempts: number): boolean {
  prune()
  const entry = store.get(key)

  if (!entry || Date.now() > entry.resetAt) {
    store.set(key, { count: 1, resetAt: Date.now() + WINDOW_MS })
    return true
  }

  if (entry.count >= maxAttempts) return false

  entry.count++
  return true
}
