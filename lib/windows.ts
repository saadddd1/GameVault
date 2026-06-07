import fs from 'fs'
import path from 'path'

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

const dataPath = path.join(process.cwd(), 'data/windows.json')

export function getAllWindows(): WindowsData {
  const data = fs.readFileSync(dataPath, 'utf-8')
  return JSON.parse(data)
}

export function getWindowsById(id: number): WindowsApp | undefined {
  const { apps } = getAllWindows()
  return apps.find(a => a.id === id)
}

export function addWindows(app: Omit<WindowsApp, 'id' | 'downloadCount' | 'createdAt' | 'updatedAt'>): WindowsApp {
  const data = getAllWindows()
  const newId = data.apps.length > 0 ? Math.max(...data.apps.map(a => a.id)) + 1 : 1
  const now = new Date().toISOString()
  const newApp: WindowsApp = {
    ...app,
    id: newId,
    downloadCount: 0,
    createdAt: now,
    updatedAt: now
  }
  data.apps.push(newApp)
  if (!data.categories.includes(newApp.category)) {
    data.categories.push(newApp.category)
  }
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
  return newApp
}

export function updateWindows(id: number, updates: Partial<Omit<WindowsApp, 'id' | 'createdAt'>>): WindowsApp | null {
  const data = getAllWindows()
  const index = data.apps.findIndex(a => a.id === id)
  if (index === -1) return null
  data.apps[index] = { ...data.apps[index], ...updates, updatedAt: new Date().toISOString() }
  if (updates.category && !data.categories.includes(updates.category)) {
    data.categories.push(updates.category)
  }
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
  return data.apps[index]
}

export function deleteWindows(id: number): boolean {
  const data = getAllWindows()
  const index = data.apps.findIndex(a => a.id === id)
  if (index === -1) return false
  data.apps.splice(index, 1)
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
  return true
}
