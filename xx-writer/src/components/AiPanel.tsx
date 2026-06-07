import { useState } from 'react'
import type { Editor } from '@tiptap/react'
import { useStore } from '../store'
import { Sparkles, X, Loader } from 'lucide-react'

interface Props {
  editor: Editor | null
  chapterContent: string
  onClose: () => void
}

const AI_MODES = [
  { label: '续写', prompt: '请根据以下内容继续续写，保持原有文风，续写300字左右：' },
  { label: '扩写', prompt: '请将以下内容扩写，增加细节描写和情感表达：' },
  { label: '润色', prompt: '请润色以下文字，使其更生动流畅，保持原意：' },
  { label: '对话', prompt: '请为以下场景补充合适的对话内容：' },
]

export function AiPanel({ editor, chapterContent, onClose }: Props) {
  const { user, consumeCredit } = useStore()
  const [mode, setMode] = useState(0)
  const [customPrompt, setCustomPrompt] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('ai_api_key') ?? '')

  const canUse = user.plan !== 'free' || user.aiCredits > 0

  const handleGenerate = async () => {
    if (!canUse) return
    if (!apiKey) {
      alert('请先填写 API Key')
      return
    }
    const ok = consumeCredit()
    if (!ok) return

    const contextText = chapterContent.replace(/<[^>]+>/g, '').slice(-800)
    const systemPrompt = customPrompt || AI_MODES[mode].prompt
    setLoading(true)
    setResult('')

    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-8',
          max_tokens: 1024,
          stream: true,
          messages: [{ role: 'user', content: `${systemPrompt}\n\n${contextText}` }],
        }),
      })

      if (!resp.ok) throw new Error(`API Error: ${resp.status}`)

      const reader = resp.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') continue
          try {
            const json = JSON.parse(data)
            const delta = json.delta?.text ?? ''
            if (delta) setResult((prev) => prev + delta)
          } catch { /* skip */ }
        }
      }
    } catch (e) {
      setResult(`生成失败: ${(e as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleInsert = () => {
    if (!editor || !result) return
    editor.commands.focus('end')
    editor.commands.insertContent(`<p>${result.replace(/\n/g, '</p><p>')}</p>`)
    setResult('')
    onClose()
  }

  const saveKey = () => {
    localStorage.setItem('ai_api_key', apiKey)
    alert('API Key 已保存')
  }

  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <span><Sparkles size={14} /> AI 助手</span>
        <button onClick={onClose}><X size={14} /></button>
      </div>

      <div className="ai-api-row">
        <input
          type="password"
          placeholder="Anthropic API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <button onClick={saveKey}>保存</button>
      </div>

      {user.plan === 'free' && (
        <div className="ai-credits">
          剩余免费次数：{user.aiCredits} 次 · <a href="#upgrade">升级 Pro 无限使用</a>
        </div>
      )}

      <div className="ai-modes">
        {AI_MODES.map((m, i) => (
          <button key={i} className={mode === i ? 'active' : ''} onClick={() => setMode(i)}>
            {m.label}
          </button>
        ))}
      </div>

      <textarea
        className="ai-custom-prompt"
        placeholder="自定义指令（留空则使用上方模式）"
        value={customPrompt}
        onChange={(e) => setCustomPrompt(e.target.value)}
        rows={2}
      />

      <button
        className="ai-generate-btn"
        onClick={handleGenerate}
        disabled={loading || !canUse}
      >
        {loading ? <><Loader size={13} className="spin" /> 生成中...</> : '开始生成'}
      </button>

      {result && (
        <div className="ai-result">
          <pre>{result}</pre>
          <div className="ai-result-actions">
            <button onClick={handleInsert}>插入到文章</button>
            <button onClick={() => setResult('')}>清除</button>
          </div>
        </div>
      )}
    </div>
  )
}
