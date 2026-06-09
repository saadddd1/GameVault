import { getAllMods, getModById, addMod, updateMod, deleteMod } from '@/lib/mod'
import { createRoutes } from '@/lib/route-factory'

const { GET, POST, PUT, DELETE } = createRoutes({
  label: 'MOD',
  singleKey: 'mod',
  requiredFields: ['title', 'description', 'category', 'gameName'],
  listResponse: () => {
    const data = getAllMods()
    return { mods: data.mods, categories: data.categories, games: data.games }
  },
  getById: (id) => getModById(id),
  add: (body) => addMod(body),
  update: (id, body) => updateMod(id, body),
  del: (id) => deleteMod(id),
})

export { GET, POST, PUT, DELETE }
