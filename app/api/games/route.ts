import { getAllGames, getGameById, addGame, updateGame, deleteGame } from '@/lib/games'
import { createRoutes } from '@/lib/route-factory'

const { GET, POST, PUT, DELETE } = createRoutes({
  label: '游戏',
  singleKey: 'game',
  requiredFields: ['title', 'description', 'size', 'category'],
  listResponse: () => {
    const data = getAllGames()
    return { games: data.games, categories: data.categories }
  },
  getById: (id) => getGameById(id),
  add: (body) => addGame({
    title: body.title, description: body.description,
    coverImage: body.coverImage || '/images/default.svg',
    size: body.size, category: body.category,
    downloadLinks: body.downloadLinks, screenshots: body.screenshots || [],
    releaseDate: body.releaseDate || new Date().toISOString().split('T')[0],
    updateDate: body.updateDate || new Date().toISOString().split('T')[0],
    downloadCount: body.downloadCount || 0,
    isHot: body.isHot || false,
    isNew: body.isNew !== undefined ? body.isNew : true,
    isFeatured: body.isFeatured !== undefined ? body.isFeatured : false,
  }),
  update: (id, body) => updateGame(id, body),
  del: (id) => deleteGame(id),
})

export { GET, POST, PUT, DELETE }
