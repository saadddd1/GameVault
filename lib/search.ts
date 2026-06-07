import fs from 'fs'
import path from 'path'

interface SearchStats {
  queries: Record<string, number>
}

const dataPath = path.join(process.cwd(), 'data/search-stats.json')

export function getAllStats(): SearchStats {
  const data = fs.readFileSync(dataPath, 'utf-8')
  return JSON.parse(data)
}

export function trackSearch(query: string) {
  const q = query.trim().toLowerCase()
  if (!q || q.length < 2) return
  const stats = getAllStats()
  stats.queries[q] = (stats.queries[q] || 0) + 1
  fs.writeFileSync(dataPath, JSON.stringify(stats, null, 2))
}

export function getHotSearches(limit = 10): { query: string; count: number }[] {
  const stats = getAllStats()
  return Object.entries(stats.queries)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([query, count]) => ({ query, count }))
}
