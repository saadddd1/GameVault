import fs from 'fs'
import path from 'path'

export interface Tool {
  id: number
  name: string
  description: string
  coverImage: string
  category: string
  language: string
  githubUrl: string
  stars: number
  downloadLinks: {
    platform: string
    url: string
    password: string
  }[]
  tags: string[]
  author: string
  version: string
  fileSize: string
  downloadCount: number
  createdAt: string
  updatedAt: string
}

export interface ToolsData {
  tools: Tool[]
  categories: string[]
  languages: string[]
}

const dataPath = path.join(process.cwd(), 'data/tools.json')

export function getAllTools(): ToolsData {
  const data = fs.readFileSync(dataPath, 'utf-8')
  const parsed = JSON.parse(data)
  if (!parsed.languages) {
    parsed.languages = [...new Set(parsed.tools.map((t: Tool) => t.language).filter(Boolean))]
  }
  return parsed
}

export function getToolById(id: number): Tool | undefined {
  const { tools } = getAllTools()
  return tools.find(t => t.id === id)
}

export function addTool(tool: Omit<Tool, 'id' | 'downloadCount' | 'createdAt' | 'updatedAt'>): Tool {
  const data = getAllTools()
  const newId = data.tools.length > 0 ? Math.max(...data.tools.map(t => t.id)) + 1 : 1
  const now = new Date().toISOString()
  const newTool: Tool = {
    ...tool,
    id: newId,
    downloadCount: 0,
    createdAt: now,
    updatedAt: now
  }
  data.tools.push(newTool)

  if (!data.categories.includes(newTool.category)) {
    data.categories.push(newTool.category)
  }
  if (newTool.language && !data.languages.includes(newTool.language)) {
    data.languages.push(newTool.language)
  }

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
return newTool
}

export function updateTool(id: number, updates: Partial<Omit<Tool, 'id' | 'createdAt'>>): Tool | null {
  const data = getAllTools()
  const index = data.tools.findIndex(t => t.id === id)
  if (index === -1) return null

  data.tools[index] = { ...data.tools[index], ...updates, updatedAt: new Date().toISOString() }

  if (updates.category && !data.categories.includes(updates.category)) {
    data.categories.push(updates.category)
  }
  if (updates.language && !data.languages.includes(updates.language)) {
    data.languages.push(updates.language)
  }

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
return data.tools[index]
}

export function deleteTool(id: number): boolean {
  const data = getAllTools()
  const index = data.tools.findIndex(t => t.id === id)
  if (index === -1) return false
  data.tools.splice(index, 1)
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
return true
}
