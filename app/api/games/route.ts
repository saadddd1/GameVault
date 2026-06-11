import { getAllGames, getGameById, addGame, updateGame, deleteGame } from '@/lib/games'
import { createRoutes } from '@/lib/route-factory'
import { autoFillGame } from '@/lib/auto-fill'

const { GET, POST, PUT, DELETE } = createRoutes({
  label: '游戏',
  singleKey: 'game',
  requiredFields: ['title'],
  listResponse: () => {
    const data = getAllGames()
    return { games: data.games, categories: data.categories }
  },
  getById: (id) => getGameById(id),
  add: async (body) => {
    // 自动填充：如果缺少描述/分类/封面，从 metadata 或 Steam 获取
    let coverImage = body.coverImage || '/images/default.svg'
    let description = body.description || ''
    let size = body.size || ''
    let category = body.category || ''

    if (!body.description || !body.category || !body.coverImage || body.coverImage === '/images/default.svg') {
      try {
        const filled = await autoFillGame(body.title)
        description = body.description || filled.description
        size = body.size || filled.size
        category = body.category || filled.category
        if (!body.coverImage || body.coverImage === '/images/default.svg') {
          coverImage = filled.coverImage
        }
      } catch { /* auto-fill 失败不阻塞 */ }
    }

    return addGame({
      title: body.title, description,
      coverImage,
      size, category,
      downloadLinks: body.downloadLinks, screenshots: body.screenshots || [],
      releaseDate: body.releaseDate || new Date().toISOString().split('T')[0],
      updateDate: body.updateDate || new Date().toISOString().split('T')[0],
      downloadCount: body.downloadCount || 0,
      isHot: body.isHot || false,
      isNew: body.isNew !== undefined ? body.isNew : true,
      isFeatured: body.isFeatured !== undefined ? body.isFeatured : false,
      steamUrl: body.steamUrl || undefined,
      developer: body.developer || undefined,
      publisher: body.publisher || undefined,
      supportedLanguages: body.supportedLanguages || undefined,
      systemRequirements: body.systemRequirements || undefined,
    })
  },
  update: (id, body) => updateGame(id, body),
  del: (id) => deleteGame(id),
})

export { GET, POST, PUT, DELETE }
