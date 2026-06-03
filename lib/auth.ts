import fs from 'fs'
import path from 'path'

export interface User {
  id: number
  username: string
  email: string
  password: string
  role: 'user' | 'admin'
  createdAt: string
}

export interface UsersData {
  users: User[]
  nextId: number
}

const dataPath = path.join(process.cwd(), 'data/users.json')

export function getAllUsers(): UsersData {
  const data = fs.readFileSync(dataPath, 'utf-8')
  return JSON.parse(data)
}

export function getUserById(id: number): User | undefined {
  const { users } = getAllUsers()
  return users.find(user => user.id === id)
}

export function getUserByUsername(username: string): User | undefined {
  const { users } = getAllUsers()
  return users.find(user => user.username === username)
}

export function getUserByEmail(email: string): User | undefined {
  const { users } = getAllUsers()
  return users.find(user => user.email === email)
}

export function createUser(userData: Omit<User, 'id' | 'createdAt' | 'role'> & { role?: 'user' | 'admin' }): User {
  const data = getAllUsers()
  
  // 检查用户名是否已存在
  if (getUserByUsername(userData.username)) {
    throw new Error('用户名已存在')
  }
  
  // 检查邮箱是否已存在
  if (getUserByEmail(userData.email)) {
    throw new Error('邮箱已被注册')
  }
  
  const newUser: User = {
    ...userData,
    id: data.nextId,
    role: userData.role || 'user',
    createdAt: new Date().toISOString()
  }
  
  data.users.push(newUser)
  data.nextId++
  
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
  return newUser
}

export function validateUser(username: string, password: string): User | null {
  const user = getUserByUsername(username)
  if (user && user.password === password) {
    return user
  }
  return null
}

export function isAdmin(userId: number): boolean {
  const user = getUserById(userId)
  return user?.role === 'admin'
}
