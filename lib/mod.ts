import { DataStore } from './store'

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

const store = new DataStore<Mod>('mods', 'mods.json', 'mods')

export function getAllMods(): ModsData {
  const container = store.getContainer()
  return { mods: container.mods as Mod[], categories: container.categories as string[], games: container.games as string[] }
}

export function getModById(id: number): Mod | undefined {
  return store.getById(id)
}

export async function addMod(mod: Omit<Mod, 'id' | 'downloadCount' | 'createdAt' | 'updatedAt'>): Promise<Mod> {
  const now = new Date().toISOString()
  const newMod = await store.add({ ...mod, downloadCount: 0, createdAt: now, updatedAt: now } as unknown as Omit<Mod, 'id'>)
  await maintainLists(newMod.category, newMod.gameName)
  return newMod
}

export async function updateMod(id: number, updates: Partial<Omit<Mod, 'id' | 'createdAt'>>): Promise<Mod | null> {
  const result = await store.update(id, { ...updates, updatedAt: new Date().toISOString() })
  if (result) await maintainLists(updates.category, updates.gameName)
  return result
}

export async function deleteMod(id: number): Promise<boolean> {
  return store.delete(id)
}

async function maintainLists(cat?: string, game?: string) {
  const container = store.getContainer()
  const categories = container.categories as string[]
  const games = container.games as string[]
  let changed = false
  if (cat && !categories.includes(cat)) { categories.push(cat); changed = true }
  if (game && !games.includes(game)) { games.push(game); changed = true }
  if (changed) await store.updateContainer(c => ({ ...c, categories, games }))
}
