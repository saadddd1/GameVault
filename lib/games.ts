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

export function addGame(game: Omit<Game, 'id'>): Game {
  const newGame = store.add(game)
  // 维护 categories
  const container = store.getContainer()
  const categories = container.categories as string[]
  if (!categories.includes(newGame.category)) {
    categories.push(newGame.category)
    store.updateContainer(c => ({ ...c, categories }))
  }
  return newGame
}

export function updateGame(id: number, updates: Partial<Omit<Game, 'id'>>): Game | null {
  const result = store.update(id, updates)
  if (result && updates.category) {
    const container = store.getContainer()
    const categories = container.categories as string[]
    if (!categories.includes(updates.category)) {
      categories.push(updates.category)
      store.updateContainer(c => ({ ...c, categories }))
    }
  }
  return result
}

export function deleteGame(id: number): boolean {
  return store.delete(id)
}
