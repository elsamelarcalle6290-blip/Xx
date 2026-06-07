import { useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useStore } from '../store'
import { AiPanel } from './AiPanel'
import { Sparkles, CreditCard } from 'lucide-react'

export function Editor() {
  const { books, activeBookId, activeChapterId, updateChapter } = useStore()
  const [showAi, setShowAi] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activeBook = books.find((b) => b.id === activeBookId)
  const activeChapter = activeBook?.chapters.find((c) => c.id === activeChapterId)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: '开始创作...' }),
    ],
    content: activeChapter?.content ?? '',
    onUpdate: ({ editor }) => {
      if (!activeBookId || !activeChapterId) return
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        updateChapter(activeBookId, activeChapterId, editor.getHTML())
      }, 800)
    },
  })

  // 切换章节时重置编辑器内容
  useEffect(() => {
    if (editor && activeChapter) {
      const current = editor.getHTML()
      if (current !== activeChapter.content) {
        editor.commands.setContent(activeChapter.content || '')
      }
    }
  }, [activeChapterId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!activeChapter) {
    return (
      <div className="editor-empty">
        <BookIcon />
        <p>选择或新建章节开始写作</p>
      </div>
    )
  }

  return (
    <div className="editor-wrapper">
      <div className="editor-topbar">
        <div>
          <h2>{activeChapter.title}</h2>
          <span className="word-count-badge">{activeChapter.wordCount} 字</span>
          {activeChapter.isPaid && (
            <span className="paid-badge"><CreditCard size={11} /> 付费章节</span>
          )}
        </div>
        <button className="ai-btn" onClick={() => setShowAi((v) => !v)}>
          <Sparkles size={14} /> AI 续写
        </button>
      </div>

      <div className="editor-body">
        <EditorContent editor={editor} className="tiptap-editor" />
        {showAi && (
          <AiPanel
            editor={editor}
            chapterContent={activeChapter.content}
            onClose={() => setShowAi(false)}
          />
        )}
      </div>
    </div>
  )
}

function BookIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}
