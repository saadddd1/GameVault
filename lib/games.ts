import fs from 'fs'
import path from 'path'

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

const dataPath = path.join(process.cwd(), 'data/games.json')

export function getAllGames(): GamesData {
  const data = fs.readFileSync(dataPath, 'utf-8')
  return JSON.parse(data)
}

export function getGameById(id: number): Game | undefined {
  const { games } = getAllGames()
  return games.find(game => game.id === id)
}

export function addGame(game: Omit<Game, 'id'>): Game {
  const data = getAllGames()
  const newId = data.games.length > 0 ? Math.max(...data.games.map(g => g.id)) + 1 : 1
  const newGame: Game = { ...game, id: newId }
  data.games.push(newGame)
  if (!data.categories.includes(newGame.category)) {
    data.categories.push(newGame.category)
  }
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
  return newGame
}

export function updateGame(id: number, updates: Partial<Omit<Game, 'id'>>): Game | null {
  const data = getAllGames()
  const index = data.games.findIndex(g => g.id === id)
  if (index === -1) return null
  data.games[index] = { ...data.games[index], ...updates, id }
  if (updates.category && !data.categories.includes(updates.category)) {
    data.categories.push(updates.category)
  }
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
  return data.games[index]
}

export function deleteGame(id: number): boolean {
  const data = getAllGames()
  const index = data.games.findIndex(g => g.id === id)
  if (index === -1) return false
  data.games.splice(index, 1)
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
  return true
}

