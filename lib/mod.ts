import fs from 'fs'
import path from 'path'

export interface Mod {
  id: number
  title: string
  description: string
  coverImage: string
  category: string
  gameName: string
  author: string
  version: string
  fileSize: string
  downloadLinks: {
    platform: string
    url: string
    password: string
  }[]
  tags: string[]
  installInstructions: string
  downloadCount: number
  createdAt: string
  updatedAt: string
}

export interface ModsData {
  mods: Mod[]
  categories: string[]
  games: string[]
}

const dataPath = path.join(process.cwd(), 'data/mods.json')

export function getAllMods(): ModsData {
  const data = fs.readFileSync(dataPath, 'utf-8')
  return JSON.parse(data)
}

export function getModById(id: number): Mod | undefined {
  const { mods } = getAllMods()
  return mods.find(m => m.id === id)
}

export function addMod(mod: Omit<Mod, 'id' | 'downloadCount' | 'createdAt' | 'updatedAt'>): Mod {
  const data = getAllMods()
  const newId = data.mods.length > 0 ? Math.max(...data.mods.map(m => m.id)) + 1 : 1
  const now = new Date().toISOString()
  const newMod: Mod = { ...mod, id: newId, downloadCount: 0, createdAt: now, updatedAt: now }
  data.mods.push(newMod)
  if (!data.games.includes(newMod.gameName)) data.games.push(newMod.gameName)
  if (!data.categories.includes(newMod.category)) data.categories.push(newMod.category)
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
  return newMod
}

export function updateMod(id: number, updates: Partial<Omit<Mod, 'id' | 'createdAt'>>): Mod | null {
  const data = getAllMods()
  const index = data.mods.findIndex(m => m.id === id)
  if (index === -1) return null
  data.mods[index] = { ...data.mods[index], ...updates, updatedAt: new Date().toISOString() }
  if (updates.gameName && !data.games.includes(updates.gameName)) data.games.push(updates.gameName)
  if (updates.category && !data.categories.includes(updates.category)) data.categories.push(updates.category)
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
  return data.mods[index]
}

export function deleteMod(id: number): boolean {
  const data = getAllMods()
  const index = data.mods.findIndex(m => m.id === id)
  if (index === -1) return false
  data.mods.splice(index, 1)
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
  return true
}
