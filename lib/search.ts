import fs from 'fs'
import path from 'path'
import { getCached, invalidate } from './cache'

interface SearchStats {
  queries: Record<string, number>
}

const dataPath = path.join(process.cwd(), 'data/search-stats.json')
const CACHE_KEY = 'search-stats'

function read(): SearchStats {
  return getCached<SearchStats>(CACHE_KEY, () => {
    const data = fs.readFileSync(dataPath, 'utf-8')
    return JSON.parse(data)
  })
}

function write(stats: SearchStats) {
  fs.writeFileSync(dataPath, JSON.stringify(stats))
  invalidate(CACHE_KEY)
}

export function trackSearch(query: string) {
  const q = query.trim().toLowerCase()
  if (!q || q.length < 2) return
  const stats = read()
  stats.queries[q] = (stats.queries[q] || 0) + 1
  write(stats)
}

export function getHotSearches(limit = 10): { query: string; count: number }[] {
  const stats = read()
  return Object.entries(stats.queries)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([query, count]) => ({ query, count }))
}
