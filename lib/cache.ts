// 简单内存缓存，减少磁盘 I/O
const store = new Map<string, { data: unknown; ts: number }>()
const DEFAULT_TTL = 5000 // 5 秒

export function getCached<T>(key: string, loader: () => T, ttl = DEFAULT_TTL): T {
  const entry = store.get(key)
  const now = Date.now()
  if (entry && now - entry.ts < ttl) {
    return entry.data as T
  }
  const data = loader()
  store.set(key, { data, ts: now })
  return data
}

// 写操作后调用，使缓存失效
export function invalidate(key: string) {
  store.delete(key)
}
