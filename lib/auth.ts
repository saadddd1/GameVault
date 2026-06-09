import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { DataStore } from './store'

export interface User {
  id: number
  username: string
  email: string
  password: string
  role: 'user' | 'admin'
  createdAt: string
}

export interface SafeUser {
  id: number
  username: string
  email: string
  role: 'user' | 'admin'
  createdAt: string
}

export interface UsersData {
  users: User[]
  nextId: number
}

const store = new DataStore<User>('users', 'users.json', 'users')

export function getAllUsers(): UsersData {
  const container = store.getContainer()
  return { users: container.users as User[], nextId: container.nextId as number }
}

export function getSafeUsers(): SafeUser[] {
  return store.getAll().map(({ password, ...safe }) => safe)
}

export function getUserById(id: number): User | undefined {
  return store.getById(id)
}

export function getUserByUsername(username: string): User | undefined {
  return store.getAll().find(u => u.username === username)
}

export function getUserByEmail(email: string): User | undefined {
  return store.getAll().find(u => u.email === email)
}

export function createUser(userData: Omit<User, 'id' | 'createdAt' | 'role'> & { role?: 'user' | 'admin' }): SafeUser {
  if (getUserByUsername(userData.username)) throw new Error('用户名已存在')
  if (getUserByEmail(userData.email)) throw new Error('邮箱已被注册')

  const container = store.getContainer()
  const nextId = container.nextId as number
  const hashedPassword = bcrypt.hashSync(userData.password, 10)

  const newUser: User = {
    ...userData,
    password: hashedPassword,
    id: nextId,
    role: userData.role || 'user',
    createdAt: new Date().toISOString()
  }

  const users = [...store.getAll(), newUser]
  store.updateContainer(c => ({ ...c, users, nextId: nextId + 1 }))

  const { password: _, ...safeUser } = newUser
  return safeUser
}

export function validateUser(username: string, password: string): SafeUser | null {
  const user = getUserByUsername(username)
  if (user && bcrypt.compareSync(password, user.password)) {
    const { password: _, ...safeUser } = user
    return safeUser
  }
  return null
}

// -- Token --

let _secret = ''

function getSecret(): string {
  if (_secret) return _secret
  const fs = require('fs')
  const path = require('path')
  const secretPath = path.join(process.cwd(), 'data/.secret')
  try {
    _secret = fs.readFileSync(secretPath, 'utf-8').trim()
  } catch {
    _secret = crypto.randomBytes(32).toString('hex')
    fs.writeFileSync(secretPath, _secret)
  }
  return _secret
}

export function generateToken(userId: number, role: string): string {
  const payload = JSON.stringify({ userId, role, exp: Date.now() + 7 * 24 * 3600 * 1000 })
  const b64 = Buffer.from(payload).toString('base64url')
  const sig = crypto.createHmac('sha256', getSecret()).update(b64).digest('base64url')
  return `${b64}.${sig}`
}

export function verifyToken(token: string): { userId: number; role: string } | null {
  try {
    const [b64, sig] = token.split('.')
    const expectedSig = crypto.createHmac('sha256', getSecret()).update(b64).digest('base64url')
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null
    const payload = JSON.parse(Buffer.from(b64, 'base64url').toString())
    if (payload.exp < Date.now()) return null
    return { userId: payload.userId, role: payload.role }
  } catch { return null }
}

export function requireAdmin(request: Request): SafeUser | null {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const token = auth.slice(7)
  const result = verifyToken(token)
  if (!result || result.role !== 'admin') return null
  const user = getUserById(result.userId)
  if (!user) return null
  const { password: _, ...safeUser } = user
  return safeUser
}
