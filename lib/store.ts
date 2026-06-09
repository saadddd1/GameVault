import fs from 'fs'
import path from 'path'
import { getCached, invalidate } from './cache'
import { Mutex } from './lock'

export class DataStore<T extends { id: number }> {
  private dataPath: string
  private mutex = new Mutex()

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

  // 原子写入：先写临时文件，再 rename，防止进程崩溃时文件损坏
  private writeContainer(container: Record<string, unknown>) {
    const tmp = this.dataPath + '.tmp'
    fs.writeFileSync(tmp, JSON.stringify(container))
    fs.renameSync(tmp, this.dataPath)
    invalidate(this.cacheKey)
  }

  // -- 读操作（无锁） --

  getAll(): T[] {
    return (this.readContainer()[this.listKey] as T[]) || []
  }

  getById(id: number): T | undefined {
    return this.getAll().find((item: T) => item.id === id)
  }

  // -- 写操作（持锁 + 原子写） --

  async add(item: Omit<T, 'id'>): Promise<T> {
    const release = await this.mutex.acquire()
    try {
      const container = this.readContainer()
      const items = (container[this.listKey] as T[]) || []
      const newId = items.length > 0 ? Math.max(...items.map((i: T) => i.id)) + 1 : 1
      const newItem = { ...item, id: newId } as unknown as T
      items.push(newItem)
      container[this.listKey] = items
      this.writeContainer(container)
      return newItem
    } finally {
      release()
    }
  }

  async update(id: number, updates: Partial<T>): Promise<T | null> {
    const release = await this.mutex.acquire()
    try {
      const container = this.readContainer()
      const items = (container[this.listKey] as T[]) || []
      const index = items.findIndex((i: T) => i.id === id)
      if (index === -1) return null
      items[index] = { ...items[index], ...updates, id }
      container[this.listKey] = items
      this.writeContainer(container)
      return items[index]
    } finally {
      release()
    }
  }

  async delete(id: number): Promise<boolean> {
    const release = await this.mutex.acquire()
    try {
      const container = this.readContainer()
      const items = (container[this.listKey] as T[]) || []
      const index = items.findIndex((i: T) => i.id === id)
      if (index === -1) return false
      items.splice(index, 1)
      container[this.listKey] = items
      this.writeContainer(container)
      return true
    } finally {
      release()
    }
  }

  getContainer(): Record<string, unknown> {
    return this.readContainer()
  }

  async updateContainer(updater: (c: Record<string, unknown>) => Record<string, unknown>) {
    const release = await this.mutex.acquire()
    try {
      this.writeContainer(updater(this.readContainer()))
    } finally {
      release()
    }
  }
}
