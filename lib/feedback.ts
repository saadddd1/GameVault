import { DataStore } from './store'

export type TargetType = 'game' | 'mod' | 'android' | 'windows'

export interface Feedback {
  id: number
  targetType: TargetType
  targetId: number
  targetName: string
  content: string
  createdAt: string
  resolved: boolean
}

const store = new DataStore<Feedback>('feedback', 'feedback.json', 'feedbacks')

export function getAllFeedbacks(): Feedback[] {
  return store.getAll()
}

export function addFeedback(f: Omit<Feedback, 'id' | 'createdAt' | 'resolved'>): Feedback {
  return store.add({ ...f, createdAt: new Date().toISOString(), resolved: false } as unknown as Omit<Feedback, 'id'>)
}

export function toggleFeedbackResolved(id: number): Feedback | null {
  const fb = store.getById(id)
  if (!fb) return null
  return store.update(id, { resolved: !fb.resolved })
}
