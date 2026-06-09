import { DataStore } from './store'

export interface Game {
  id: number
  title: string
  description: string
  coverImage: string
  size: string
  category: string
  downloadLinks: {
    platform: string
    url: string
    password: string
  }[]
  screenshots: string[]
  releaseDate: string
  updateDate: string
  downloadCount: number
  isHot: boolean
  isNew: boolean
  isFeatured: boolean
  steamUrl?: string
  developer?: string
  publisher?: string
  supportedLanguages?: string[]
  systemRequirements?: {
    minimum?: string
    recommended?: string
  }
}

export interface GamesData {
  games: Game[]
  categories: string[]
}

const store = new DataStore<Game>('games', 'games.json', 'games')

export function getAllGames(): GamesData {
  const container = store.getContainer()
  return { games: container.games as Game[], categories: container.categories as string[] }
}

export function getGameById(id: number): Game | undefined {
  return store.getById(id)
}

export async function addGame(game: Omit<Game, 'id'>): Promise<Game> {
  const newGame = await store.add(game)
  const container = store.getContainer()
  const categories = container.categories as string[]
  if (!categories.includes(newGame.category)) {
    categories.push(newGame.category)
    await store.updateContainer(c => ({ ...c, categories }))
  }
  return newGame
}

export async function updateGame(id: number, updates: Partial<Omit<Game, 'id'>>): Promise<Game | null> {
  const result = await store.update(id, updates)
  if (result && updates.category) {
    const container = store.getContainer()
    const categories = container.categories as string[]
    if (!categories.includes(updates.category)) {
      categories.push(updates.category)
      await store.updateContainer(c => ({ ...c, categories }))
    }
  }
  return result
}

export async function deleteGame(id: number): Promise<boolean> {
  return store.delete(id)
}
