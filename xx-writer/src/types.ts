export interface Chapter {
  id: string
  title: string
  content: string
  isPaid: boolean
  wordCount: number
  createdAt: number
  updatedAt: number
}

export interface Book {
  id: string
  title: string
  description: string
  genre: string
  chapters: Chapter[]
  createdAt: number
}

export interface Character {
  id: string
  bookId: string
  name: string
  role: 'protagonist' | 'antagonist' | 'supporting'
  description: string
  traits: string[]
}

export interface WorldSetting {
  id: string
  bookId: string
  category: 'location' | 'rule' | 'history' | 'other'
  title: string
  content: string
}

export type PlanTier = 'free' | 'pro' | 'team'

export interface User {
  id: string
  name: string
  plan: PlanTier
  aiCredits: number
}
