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

export function getGamesByCategory(category: string): Game[] {
  const { games } = getAllGames()
  return games.filter(game => game.category === category)
}

export function searchGames(keyword: string): Game[] {
  const { games } = getAllGames()
  return games.filter(game =>
    game.title.toLowerCase().includes(keyword.toLowerCase())
  )
}

export function getHotGames(): Game[] {
  const { games } = getAllGames()
  return games.filter(game => game.isHot).sort((a, b) => b.downloadCount - a.downloadCount)
}

export function getNewGames(): Game[] {
  const { games } = getAllGames()
  return games.filter(game => game.isNew).sort((a, b) => new Date(b.updateDate).getTime() - new Date(a.updateDate).getTime())
}

export function getCategories(): string[] {
  const { categories } = getAllGames()
  return categories
}

export function addGame(game: Omit<Game, 'id'>): Game {
  const data = getAllGames()
  const newId = data.games.length > 0 ? Math.max(...data.games.map(g => g.id)) + 1 : 1
  const newGame: Game = { ...game, id: newId }
  data.games.push(newGame)
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
  return newGame
}
