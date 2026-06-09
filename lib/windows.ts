import { DataStore } from './store'

export interface WindowsApp {
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

export interface WindowsData {
  apps: WindowsApp[]
  categories: string[]
}

const store = new DataStore<WindowsApp>('windows', 'windows.json', 'apps')

export function getAllWindows(): WindowsData {
  const container = store.getContainer()
  return { apps: container.apps as WindowsApp[], categories: container.categories as string[] }
}

export function getWindowsById(id: number): WindowsApp | undefined {
  return store.getById(id)
}

export async function addWindows(app: Omit<WindowsApp, 'id' | 'downloadCount' | 'createdAt' | 'updatedAt'>): Promise<WindowsApp> {
  const now = new Date().toISOString()
  const newApp = await store.add({ ...app, downloadCount: 0, createdAt: now, updatedAt: now } as unknown as Omit<WindowsApp, 'id'>)
  await maintainCategory(newApp.category)
  return newApp
}

export async function updateWindows(id: number, updates: Partial<Omit<WindowsApp, 'id' | 'createdAt'>>): Promise<WindowsApp | null> {
  const result = await store.update(id, { ...updates, updatedAt: new Date().toISOString() })
  if (result && updates.category) await maintainCategory(updates.category)
  return result
}

export async function deleteWindows(id: number): Promise<boolean> {
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
