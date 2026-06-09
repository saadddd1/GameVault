import { getAllAndroid, getAndroidById, addAndroid, updateAndroid, deleteAndroid } from '@/lib/android'
import { createRoutes } from '@/lib/route-factory'

const { GET, POST, PUT, DELETE } = createRoutes({
  label: '应用',
  singleKey: 'app',
  requiredFields: ['name', 'description', 'category'],
  listResponse: () => {
    const data = getAllAndroid()
    return { apps: data.apps, categories: data.categories }
  },
  getById: (id) => getAndroidById(id),
  add: (body) => addAndroid(body),
  update: (id, body) => updateAndroid(id, body),
  del: (id) => deleteAndroid(id),
})

export { GET, POST, PUT, DELETE }
