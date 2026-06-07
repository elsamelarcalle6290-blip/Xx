import { useState } from 'react'
import { BookOpen, Plus, ChevronRight, ChevronDown, Users, Globe, CreditCard } from 'lucide-react'
import { useStore } from '../store'

export function Sidebar() {
  const { books, activeBookId, activeChapterId, addBook, addChapter, setActiveBook, setActiveChapter } = useStore()
  const [expandedBooks, setExpandedBooks] = useState<Set<string>>(new Set())
  const [view, setView] = useState<'books' | 'characters' | 'world'>('books')

  const toggleBook = (id: string) => {
    setExpandedBooks((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
    setActiveBook(id)
  }

  const handleAddBook = () => {
    const title = prompt('书名：')
    if (!title) return
    const genre = prompt('类型（如：玄幻、都市、言情）：') ?? '其他'
    const book = addBook(title, genre)
    setExpandedBooks((prev) => new Set([...prev, book.id]))
    setActiveBook(book.id)
  }

  const handleAddChapter = (bookId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const title = prompt('章节名：')
    if (!title) return
    const chapter = addChapter(bookId, title)
    setActiveChapter(chapter.id)
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <BookOpen size={18} />
        <span>XX Writer</span>
      </div>

      <nav className="sidebar-nav">
        <button className={view === 'books' ? 'active' : ''} onClick={() => setView('books')}>
          <BookOpen size={14} /> 书籍
        </button>
        <button className={view === 'characters' ? 'active' : ''} onClick={() => setView('characters')}>
          <Users size={14} /> 角色
        </button>
        <button className={view === 'world' ? 'active' : ''} onClick={() => setView('world')}>
          <Globe size={14} /> 世界观
        </button>
      </nav>

      {view === 'books' && (
        <div className="book-list">
          <div className="section-header">
            <span>我的书籍</span>
            <button onClick={handleAddBook} title="新建书籍"><Plus size={14} /></button>
          </div>
          {books.map((book) => (
            <div key={book.id}>
              <div
                className={`book-item ${activeBookId === book.id ? 'active' : ''}`}
                onClick={() => toggleBook(book.id)}
              >
                {expandedBooks.has(book.id) ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                <span>{book.title}</span>
                <button onClick={(e) => handleAddChapter(book.id, e)} title="新增章节">
                  <Plus size={12} />
                </button>
              </div>
              {expandedBooks.has(book.id) && book.chapters.map((ch) => (
                <div
                  key={ch.id}
                  className={`chapter-item ${activeChapterId === ch.id ? 'active' : ''}`}
                  onClick={() => { setActiveBook(book.id); setActiveChapter(ch.id) }}
                >
                  {ch.isPaid && <CreditCard size={10} className="paid-icon" />}
                  <span>{ch.title}</span>
                  <span className="word-count">{ch.wordCount}字</span>
                </div>
              ))}
            </div>
          ))}
          {books.length === 0 && (
            <p className="empty-hint">点击 + 创建第一本书</p>
          )}
        </div>
      )}

      {view === 'characters' && <CharactersPanel />}
      {view === 'world' && <WorldPanel />}
    </aside>
  )
}

function CharactersPanel() {
  const { characters, activeBookId, addCharacter } = useStore()
  const list = characters.filter((c) => c.bookId === activeBookId)

  const handleAdd = () => {
    if (!activeBookId) return alert('请先选择一本书')
    const name = prompt('角色名：')
    if (!name) return
    const description = prompt('角色描述：') ?? ''
    addCharacter({ bookId: activeBookId, name, role: 'supporting', description, traits: [] })
  }

  return (
    <div className="book-list">
      <div className="section-header">
        <span>角色列表</span>
        <button onClick={handleAdd}><Plus size={14} /></button>
      </div>
      {list.map((c) => (
        <div key={c.id} className="chapter-item">
          <span>{c.name}</span>
          <span className="word-count">{c.role === 'protagonist' ? '主角' : c.role === 'antagonist' ? '反派' : '配角'}</span>
        </div>
      ))}
      {list.length === 0 && <p className="empty-hint">暂无角色</p>}
    </div>
  )
}

function WorldPanel() {
  const { worldSettings, activeBookId, addWorldSetting } = useStore()
  const list = worldSettings.filter((w) => w.bookId === activeBookId)

  const handleAdd = () => {
    if (!activeBookId) return alert('请先选择一本书')
    const title = prompt('条目名称：')
    if (!title) return
    const content = prompt('内容描述：') ?? ''
    addWorldSetting({ bookId: activeBookId, category: 'other', title, content })
  }

  return (
    <div className="book-list">
      <div className="section-header">
        <span>世界观设定</span>
        <button onClick={handleAdd}><Plus size={14} /></button>
      </div>
      {list.map((w) => (
        <div key={w.id} className="chapter-item">
          <span>{w.title}</span>
          <span className="word-count">{w.category}</span>
        </div>
      ))}
      {list.length === 0 && <p className="empty-hint">暂无设定</p>}
    </div>
  )
}
