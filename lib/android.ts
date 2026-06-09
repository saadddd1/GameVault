import { DataStore } from './store'

export interface AndroidApp {
  id: number
  name: string
  description: string
  coverImage: string
  category: string
  version: string
  fileSize: string
  downloadLinks: {
    platform: string
    url: string
    password: string
  }[]
  tags: string[]
  author: string
  downloadCount: number
  createdAt: string
  updatedAt: string
}

export interface AndroidData {
  apps: AndroidApp[]
  categories: string[]
}

const store = new DataStore<AndroidApp>('android', 'android.json', 'apps')

export function getAllAndroid(): AndroidData {
  const container = store.getContainer()
  return { apps: container.apps as AndroidApp[], categories: container.categories as string[] }
}

export function getAndroidById(id: number): AndroidApp | undefined {
  return store.getById(id)
}

export function addAndroid(app: Omit<AndroidApp, 'id' | 'downloadCount' | 'createdAt' | 'updatedAt'>): AndroidApp {
  const now = new Date().toISOString()
  const newApp = store.add({ ...app, downloadCount: 0, createdAt: now, updatedAt: now } as unknown as Omit<AndroidApp, 'id'>)
  maintainCategory(newApp.category)
  return newApp
}

export function updateAndroid(id: number, updates: Partial<Omit<AndroidApp, 'id' | 'createdAt'>>): AndroidApp | null {
  const result = store.update(id, { ...updates, updatedAt: new Date().toISOString() })
  if (result && updates.category) maintainCategory(updates.category)
  return result
}

export function deleteAndroid(id: number): boolean {
  return store.delete(id)
}

function maintainCategory(cat: string) {
  const container = store.getContainer()
  const categories = container.categories as string[]
  if (!categories.includes(cat)) {
    categories.push(cat)
    store.updateContainer(c => ({ ...c, categories }))
  }
}
