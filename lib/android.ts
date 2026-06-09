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

export async function addAndroid(app: Omit<AndroidApp, 'id' | 'downloadCount' | 'createdAt' | 'updatedAt'>): Promise<AndroidApp> {
  const now = new Date().toISOString()
  const newApp = await store.add({ ...app, downloadCount: 0, createdAt: now, updatedAt: now } as unknown as Omit<AndroidApp, 'id'>)
  await maintainCategory(newApp.category)
  return newApp
}

export async function updateAndroid(id: number, updates: Partial<Omit<AndroidApp, 'id' | 'createdAt'>>): Promise<AndroidApp | null> {
  const result = await store.update(id, { ...updates, updatedAt: new Date().toISOString() })
  if (result && updates.category) await maintainCategory(updates.category)
  return result
}

export async function deleteAndroid(id: number): Promise<boolean> {
  return store.delete(id)
}

async function maintainCategory(cat: string) {
  const container = store.getContainer()
  const categories = container.categories as string[]
  if (!categories.includes(cat)) {
    categories.push(cat)
    await store.updateContainer(c => ({ ...c, categories }))
  }
}
