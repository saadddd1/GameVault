// 简单内存缓存，减少磁盘 I/O
const store = new Map<string, { data: unknown; ts: number }>()
const DEFAULT_TTL = 60000 // 60 秒，减少 GC 压力

// 每 5 分钟清理过期条目，防止内存慢慢增长
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (now - entry.ts > DEFAULT_TTL) store.delete(key)
    }
  }, 300000)
}

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
