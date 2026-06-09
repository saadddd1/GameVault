// 简易异步互斥锁 — 保护 DataStore 写操作
type Resolver = () => void

export class Mutex {
  private queue: Resolver[] = []
  private locked = false

  async acquire(): Promise<() => void> {
    if (!this.locked) {
      this.locked = true
      return () => this.release()
    }
    return new Promise<() => void>((resolve) => {
      this.queue.push(() => {
        this.locked = true
        resolve(() => this.release())
      })
    })
  }

  private release() {
    if (this.queue.length > 0) {
      this.queue.shift()!()
    } else {
      this.locked = false
    }
  }
}
