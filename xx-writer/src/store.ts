import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Book, Chapter, Character, WorldSetting, User } from './types'

const mockUser: User = { id: '1', name: '作者', plan: 'free', aiCredits: 10 }

interface AppState {
  user: User
  books: Book[]
  characters: Character[]
  worldSettings: WorldSetting[]
  activeBookId: string | null
  activeChapterId: string | null

  setActiveBook: (id: string) => void
  setActiveChapter: (id: string) => void
  addBook: (title: string, genre: string) => Book
  addChapter: (bookId: string, title: string) => Chapter
  updateChapter: (bookId: string, chapterId: string, content: string) => void
  addCharacter: (char: Omit<Character, 'id'>) => void
  addWorldSetting: (ws: Omit<WorldSetting, 'id'>) => void
  consumeCredit: () => boolean
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: mockUser,
      books: [],
      characters: [],
      worldSettings: [],
      activeBookId: null,
      activeChapterId: null,

      setActiveBook: (id) => set({ activeBookId: id, activeChapterId: null }),
      setActiveChapter: (id) => set({ activeChapterId: id }),

      addBook: (title, genre) => {
        const book: Book = {
          id: crypto.randomUUID(),
          title,
          description: '',
          genre,
          chapters: [],
          createdAt: Date.now(),
        }
        set((s) => ({ books: [...s.books, book] }))
        return book
      },

      addChapter: (bookId, title) => {
        const chapter: Chapter = {
          id: crypto.randomUUID(),
          title,
          content: '',
          isPaid: false,
          wordCount: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        set((s) => ({
          books: s.books.map((b) =>
            b.id === bookId ? { ...b, chapters: [...b.chapters, chapter] } : b
          ),
        }))
        return chapter
      },

      updateChapter: (bookId, chapterId, content) => {
        set((s) => ({
          books: s.books.map((b) =>
            b.id !== bookId
              ? b
              : {
                  ...b,
                  chapters: b.chapters.map((c) =>
                    c.id !== chapterId
                      ? c
                      : { ...c, content, wordCount: content.replace(/<[^>]+>/g, '').length, updatedAt: Date.now() }
                  ),
                }
          ),
        }))
      },

      addCharacter: (char) =>
        set((s) => ({ characters: [...s.characters, { ...char, id: crypto.randomUUID() }] })),

      addWorldSetting: (ws) =>
        set((s) => ({ worldSettings: [...s.worldSettings, { ...ws, id: crypto.randomUUID() }] })),

      consumeCredit: () => {
        const { user } = get()
        if (user.plan !== 'free' || user.aiCredits > 0) {
          set((s) => ({ user: { ...s.user, aiCredits: Math.max(0, s.user.aiCredits - 1) } }))
          return true
        }
        return false
      },
    }),
    { name: 'xx-writer-store' }
  )
)
