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

export function addWindows(app: Omit<WindowsApp, 'id' | 'downloadCount' | 'createdAt' | 'updatedAt'>): WindowsApp {
  const now = new Date().toISOString()
  const newApp = store.add({ ...app, downloadCount: 0, createdAt: now, updatedAt: now } as unknown as Omit<WindowsApp, 'id'>)
  maintainCategory(newApp.category)
  return newApp
}

export function updateWindows(id: number, updates: Partial<Omit<WindowsApp, 'id' | 'createdAt'>>): WindowsApp | null {
  const result = store.update(id, { ...updates, updatedAt: new Date().toISOString() })
  if (result && updates.category) maintainCategory(updates.category)
  return result
}

export function deleteWindows(id: number): boolean {
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
