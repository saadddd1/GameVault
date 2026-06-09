// 泛型数据存储 — 统一 CRUD + 缓存，消除 5 个 lib 文件的重复代码
import fs from 'fs'
import path from 'path'
import { getCached, invalidate } from './cache'

export class DataStore<T extends { id: number }> {
  private dataPath: string

  constructor(
    private cacheKey: string,
    dataFile: string,
    private listKey: string,
  ) {
    this.dataPath = path.join(process.cwd(), 'data', dataFile)
  }

  private readContainer() {
    return getCached<Record<string, unknown>>(this.cacheKey, () => {
      const raw = fs.readFileSync(this.dataPath, 'utf-8')
      return JSON.parse(raw)
    })
  }

  private writeContainer(container: Record<string, unknown>) {
    fs.writeFileSync(this.dataPath, JSON.stringify(container))
    invalidate(this.cacheKey)
  }

  // -- 列表操作 --

  getAll(): T[] {
    return (this.readContainer()[this.listKey] as T[]) || []
  }

  getById(id: number): T | undefined {
    return this.getAll().find((item: T) => item.id === id)
  }

  // -- 写操作 --

  add(item: Omit<T, 'id'>): T {
    const container = this.readContainer()
    const items = this.getAll()
    const newId = items.length > 0 ? Math.max(...items.map((i: T) => i.id)) + 1 : 1
    const newItem = { ...item, id: newId } as unknown as T
    items.push(newItem)
    container[this.listKey] = items
    this.writeContainer(container)
    return newItem
  }

  update(id: number, updates: Partial<T>): T | null {
    const container = this.readContainer()
    const items = this.getAll()
    const index = items.findIndex((i: T) => i.id === id)
    if (index === -1) return null
    items[index] = { ...items[index], ...updates, id }
    container[this.listKey] = items
    this.writeContainer(container)
    return items[index]
  }

  delete(id: number): boolean {
    const container = this.readContainer()
    const items = this.getAll()
    const index = items.findIndex((i: T) => i.id === id)
    if (index === -1) return false
    items.splice(index, 1)
    container[this.listKey] = items
    this.writeContainer(container)
    return true
  }

  // -- 容器级操作（给需要管理 categories/games 等额外字段的模块） --

  getContainer(): Record<string, unknown> {
    return this.readContainer()
  }

  updateContainer(updater: (c: Record<string, unknown>) => Record<string, unknown>) {
    this.writeContainer(updater(this.readContainer()))
  }
}
