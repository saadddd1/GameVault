import fs from 'fs'
import path from 'path'
import { syncToHF } from './store'

export interface Feedback {
  id: number
  targetType: 'game' | 'mod' | 'tool'
  targetId: number
  targetName: string
  content: string
  createdAt: string
  resolved: boolean
}

export interface FeedbackData {
  feedbacks: Feedback[]
}

const dataPath = path.join(process.cwd(), 'data/feedback.json')

export function getAllFeedbacks(): FeedbackData {
  const data = fs.readFileSync(dataPath, 'utf-8')
  return JSON.parse(data)
}

export function addFeedback(feedback: Omit<Feedback, 'id' | 'createdAt' | 'resolved'>): Feedback {
  const data = getAllFeedbacks()
  const newId = data.feedbacks.length > 0 ? Math.max(...data.feedbacks.map(f => f.id)) + 1 : 1
  const newFeedback: Feedback = {
    ...feedback,
    id: newId,
    createdAt: new Date().toISOString(),
    resolved: false
  }
  data.feedbacks.push(newFeedback)
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
  syncToHF('feedback.json')
  return newFeedback
}

export function toggleFeedbackResolved(id: number): Feedback | null {
  const data = getAllFeedbacks()
  const feedback = data.feedbacks.find(f => f.id === id)
  if (!feedback) return null
  feedback.resolved = !feedback.resolved
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
  syncToHF('feedback.json')
  return feedback
}
