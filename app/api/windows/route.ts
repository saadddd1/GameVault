import { getAllWindows, getWindowsById, addWindows, updateWindows, deleteWindows } from '@/lib/windows'
import { createRoutes } from '@/lib/route-factory'

const { GET, POST, PUT, DELETE } = createRoutes({
  label: '应用',
  singleKey: 'app',
  requiredFields: ['name', 'description', 'category'],
  listResponse: () => {
    const data = getAllWindows()
    return { apps: data.apps, categories: data.categories }
  },
  getById: (id) => getWindowsById(id),
  add: (body) => addWindows(body),
  update: (id, body) => updateWindows(id, body),
  del: (id) => deleteWindows(id),
})

export { GET, POST, PUT, DELETE }
