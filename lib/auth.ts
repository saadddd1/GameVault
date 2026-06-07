import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

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

const dataPath = path.join(process.cwd(), 'data/users.json')

export function getAllUsers(): UsersData {
  const data = fs.readFileSync(dataPath, 'utf-8')
  return JSON.parse(data)
}

export function getSafeUsers(): SafeUser[] {
  const { users } = getAllUsers()
  return users.map(({ password, ...safe }) => safe)
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

export function createUser(userData: Omit<User, 'id' | 'createdAt' | 'role'> & { role?: 'user' | 'admin' }): SafeUser {
  const data = getAllUsers()

  if (getUserByUsername(userData.username)) {
    throw new Error('用户名已存在')
  }

  if (getUserByEmail(userData.email)) {
    throw new Error('邮箱已被注册')
  }

  const hashedPassword = bcrypt.hashSync(userData.password, 10)

  const newUser: User = {
    ...userData,
    password: hashedPassword,
    id: data.nextId,
    role: userData.role || 'user',
    createdAt: new Date().toISOString()
  }

  data.users.push(newUser)
  data.nextId++

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))

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

let _secret: string | null = null

function getSecret(): string {
  if (_secret) return _secret
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
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
      return null
    }
    const payload = JSON.parse(Buffer.from(b64, 'base64url').toString())
    if (payload.exp < Date.now()) return null
    return { userId: payload.userId, role: payload.role }
  } catch {
    return null
  }
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
