import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

type ChapterStatus = 'draft' | 'polishing' | 'done'

type Chapter = {
  id: string
  title: string
  volume: string
  status: ChapterStatus
  summary: string
  content: string
  updatedAt: string
}

type LibraryKey = 'outline' | 'characters' | 'world' | 'foreshadowing' | 'timeline' | 'notes' | 'settings'

type LibraryEntry = {
  id: string
  title: string
  body: string
  updatedAt: string
}

type AiMessage = {
  id: string
  templateTitle: string
  userPrompt: string
  content: string
  createdAt: string
}

type NovelProject = {
  id: string
  title: string
  genre: string
  premise: string
  volume: string
  targetWords: number
  chapters: Chapter[]
  library: Record<LibraryKey, LibraryEntry[]>
  aiMessages: AiMessage[]
}

type ContextKey =
  | 'currentChapter'
  | 'recentSummaries'
  | 'outline'
  | 'characters'
  | 'world'
  | 'foreshadowing'
  | 'timeline'

type Template = {
  id: string
  title: string
  category: string
  description: string
}

type AiConfig = {
  serviceUrl: string
}

type ServiceHealth = {
  status: 'idle' | 'checking' | 'online' | 'offline'
  message: string
  model?: string
  providerConfigured?: boolean
}

type NewProjectDraft = {
  title: string
  genre: string
  premise: string
  volume: string
  targetWords: number
}

type ManuscriptSelection = {
  chapterId: string
  start: number
  end: number
}

type ProjectShelfBackup = {
  app: 'xx-writer'
  version: 1
  exportedAt: string
  projects: NovelProject[]
}

const STORAGE_KEY = 'xx-writer:n novel-project:v1'.replace('n ', '')
const PROJECTS_STORAGE_KEY = 'xx-writer:projects:v1'
const AI_CONFIG_KEY = 'xx-writer:ai-config:v1'
const EDITOR_FONT_SIZE_KEY = 'xx-writer:editor-font-size:v1'
const EDITOR_LINE_HEIGHT_KEY = 'xx-writer:editor-line-height:v1'
const AUTH_TOKEN_KEY = 'xx-writer:auth-token:v1'
const DEFAULT_EDITOR_FONT_SIZE = 18
const DEFAULT_EDITOR_LINE_HEIGHT = 2

const defaultAiConfig: AiConfig = {
  serviceUrl: 'https://xx-writer-api.543845102.workers.dev/api',
}

const defaultNewProjectDraft: NewProjectDraft = {
  title: '',
  genre: '玄幻',
  premise: '',
  volume: '第一卷',
  targetWords: 300000,
}

const libraryLabels: Record<LibraryKey, string> = {
  outline: '大纲',
  characters: '人物',
  world: '世界观',
  foreshadowing: '伏笔',
  timeline: '时间线',
  notes: '备忘',
  settings: '设定集',
}

const templates: Template[] = [
  {
    id: 'continue-scene',
    title: '续写下一段',
    category: '续写',
    description: '基于当前章、最近摘要和人物状态续写 800-1200 字。',
  },
  {
    id: 'polish-chapter',
    title: '润色本章',
    category: '润色',
    description: '保留剧情信息，增强节奏、画面和人物语气。',
  },
  {
    id: 'reduce-ai',
    title: '降低 AI 味',
    category: '润色',
    description: '去掉模板腔、空泛句和过度解释，让语言更像作者草稿。',
  },
  {
    id: 'chapter-outline',
    title: '生成章纲',
    category: '大纲',
    description: '把当前剧情目标拆成冲突、转折、收束和钩子。',
  },
  {
    id: 'check-consistency',
    title: '检查一致性',
    category: '检查',
    description: '检查人物动机、时间线、伏笔和设定是否冲突。',
  },
  {
    id: 'summarize-chapter',
    title: '提炼本章摘要',
    category: '摘要',
    description: '把当前章节压缩为后续续写可用的剧情摘要，保留关键事件、人物状态和伏笔变化。',
  },
]

const contextOptions: Array<{ key: ContextKey; label: string }> = [
  { key: 'currentChapter', label: '当前章节' },
  { key: 'recentSummaries', label: '最近 3 章摘要' },
  { key: 'outline', label: '总纲/分卷纲' },
  { key: 'characters', label: '主要人物卡' },
  { key: 'world', label: '世界观设定' },
  { key: 'foreshadowing', label: '未回收伏笔' },
  { key: 'timeline', label: '时间线' },
]

const statusLabel: Record<ChapterStatus, string> = {
  draft: '草稿',
  polishing: '待润色',
  done: '已完成',
}

function createDefaultProject(): NovelProject {
  const now = new Date().toISOString()

  const entry = (title: string, body: string): LibraryEntry => ({
    id: crypto.randomUUID(),
    title,
    body,
    updatedAt: now,
  })

  return {
    id: crypto.randomUUID(),
    title: '旧城巡夜人',
    genre: '悬疑',
    premise: '沈砚回到旧城，追查父亲失踪旧案，逐步发现巡夜人和钟楼回声之间的秘密。',
    volume: '第一卷 归城',
    targetWords: 300000,
    chapters: [
      {
        id: crypto.randomUUID(),
        title: '第 1 章 雨夜归城',
        volume: '第一卷 归城',
        status: 'done',
        summary: '沈砚回到旧城，发现父亲留下的匣子被人动过，城中旧案重新浮出水面。',
        content:
          '雨下了一整夜。\n\n沈砚站在旧宅门前，手里的伞沿不断滴水。门锁换过，门缝里却夹着一张泛黄的纸条，字迹像是被潮气泡软了，只剩下最后一句还能辨认：别相信回声。\n\n他没有立刻推门。\n\n这座城已经十年没有等过他，偏偏在他回来这一晚，把所有旧事都摆到了门口。',
        updatedAt: now,
      },
      {
        id: crypto.randomUUID(),
        title: '第 2 章 匣中旧信',
        volume: '第一卷 归城',
        status: 'polishing',
        summary: '沈砚打开匣子，发现信中提到一个不存在的巡夜人，苏棠开始介入调查。',
        content:
          '木匣里的信封没有署名。\n\n沈砚拆开第一封，纸上只有三行字：巡夜人每隔七日出现一次。他不属于衙门，也不属于城防。若你见到他，记住，不要问他从哪里来。\n\n窗外雷声滚过，院墙另一头传来极轻的脚步声。',
        updatedAt: now,
      },
      {
        id: crypto.randomUUID(),
        title: '第 3 章 第七声钟',
        volume: '第一卷 归城',
        status: 'draft',
        summary: '城楼钟声多响了一次，沈砚确认有人故意引他去旧钟楼。',
        content:
          '第七声钟响起的时候，整条长街都安静了。\n\n沈砚抬头望向城楼。按旧城规矩，夜钟只敲六下，多出来的那一声像是有人把刀背轻轻磕在骨头上。',
        updatedAt: now,
      },
    ],
    aiMessages: [],
    library: {
      outline: [
        entry('主线', '沈砚追查旧城巡夜人真相，逐步发现父亲当年的失踪并非意外。'),
        entry('本卷目标', '让主角从被动归城转向主动调查，并建立与苏棠的合作关系。'),
      ],
      characters: [
        entry('沈砚', '冷静克制，回城调查父亲旧案。当前状态：不信任任何旧识。'),
        entry('苏棠', '旧城档案吏，熟悉城中禁档。当前状态：试探沈砚是否可靠。'),
      ],
      world: [
        entry('旧城', '一座保留夜钟制度的旧城，城中档案分为明档和禁档。'),
        entry('巡夜人', '传说每隔七日出现一次，不属于衙门，也不属于城防。'),
      ],
      foreshadowing: [
        entry('别相信回声', '第 1 章埋设，未回收。可能指向钟楼回音机关。'),
        entry('巡夜人七日出现', '第 2 章埋设，进行中。和第七声钟相关。'),
      ],
      timeline: [
        entry('十年前', '沈砚父亲失踪，旧城档案中缺失关键一页。'),
        entry('归城夜', '沈砚回到旧宅，发现纸条和被动过的木匣。'),
      ],
      notes: [entry('写作提示', '第一卷氛围保持克制、潮湿、压抑，不提前揭晓巡夜人身份。')],
      settings: [entry('叙事规则', '所有超自然线索先以现实机关解释，直到卷末再打开更大谜面。')],
    },
  }
}

function createBlankProject(draft: NewProjectDraft): NovelProject {
  const now = new Date().toISOString()
  const chapter: Chapter = {
    id: crypto.randomUUID(),
    title: '第 1 章 未命名章节',
    volume: draft.volume.trim() || '第一卷',
    status: 'draft',
    summary: '新章节暂无摘要。',
    content: '',
    updatedAt: now,
  }

  return {
    id: crypto.randomUUID(),
    title: draft.title.trim(),
    genre: draft.genre.trim() || '未分类',
    premise: draft.premise.trim() || '暂未填写核心设定。',
    volume: draft.volume.trim() || '第一卷',
    targetWords: Math.max(0, Number(draft.targetWords) || 0),
    chapters: [chapter],
    aiMessages: [],
    library: {
      outline: [],
      characters: [],
      world: [],
      foreshadowing: [],
      timeline: [],
      notes: [],
      settings: [],
    },
  }
}

function entriesFromTuples(items: unknown): LibraryEntry[] {
  if (!Array.isArray(items)) {
    return []
  }

  return items
    .filter((item): item is [string, string] => Array.isArray(item) && item.length >= 2)
    .map(([title, body]) => ({
      id: crypto.randomUUID(),
      title: String(title),
      body: String(body),
      updatedAt: new Date().toISOString(),
    }))
}

function normalizeProject(project: NovelProject & Partial<Record<'outline' | 'characters' | 'foreshadowing', unknown>>) {
  if (project.library) {
    return {
      ...project,
      targetWords: project.targetWords ?? 300000,
      library: {
        outline: project.library.outline ?? [],
        characters: project.library.characters ?? [],
        world: project.library.world ?? [],
        foreshadowing: project.library.foreshadowing ?? [],
        timeline: project.library.timeline ?? [],
        notes: project.library.notes ?? [],
        settings: project.library.settings ?? [],
      },
      aiMessages: project.aiMessages ?? [],
    } satisfies NovelProject
  }

  return {
    ...project,
    targetWords: project.targetWords ?? 300000,
    library: {
      outline: entriesFromTuples(project.outline),
      characters: entriesFromTuples(project.characters),
      world: [],
      foreshadowing: entriesFromTuples(project.foreshadowing),
      timeline: [],
      notes: [],
      settings: [],
    },
    aiMessages: project.aiMessages ?? [],
  } satisfies NovelProject
}

function loadProject() {
  const stored = localStorage.getItem(STORAGE_KEY)

  if (!stored) {
    return createDefaultProject()
  }

  try {
    return normalizeProject(JSON.parse(stored) as NovelProject)
  } catch {
    return createDefaultProject()
  }
}

function loadProjectShelf(fallbackProject: NovelProject) {
  const stored = localStorage.getItem(PROJECTS_STORAGE_KEY)

  if (!stored) {
    return [fallbackProject]
  }

  try {
    const parsed = JSON.parse(stored) as unknown

    if (!Array.isArray(parsed)) {
      return [fallbackProject]
    }

    const projects = parsed.filter(isImportableProject).map((item) => normalizeProject(item))
    const hasFallback = projects.some((item) => item.id === fallbackProject.id)

    return hasFallback ? projects : [fallbackProject, ...projects]
  } catch {
    return [fallbackProject]
  }
}

function loadAiConfig(): AiConfig {
  const stored = localStorage.getItem(AI_CONFIG_KEY)

  if (!stored) {
    return defaultAiConfig
  }

  try {
    return { ...defaultAiConfig, ...(JSON.parse(stored) as Partial<AiConfig>) }
  } catch {
    return defaultAiConfig
  }
}

function loadEditorFontSize() {
  const stored = Number(localStorage.getItem(EDITOR_FONT_SIZE_KEY))

  if (!Number.isFinite(stored)) {
    return DEFAULT_EDITOR_FONT_SIZE
  }

  return Math.min(24, Math.max(14, stored))
}

function loadEditorLineHeight() {
  const stored = Number(localStorage.getItem(EDITOR_LINE_HEIGHT_KEY))

  if (!Number.isFinite(stored)) {
    return DEFAULT_EDITOR_LINE_HEIGHT
  }

  return Math.min(2.4, Math.max(1.5, stored))
}

function isImportableProject(value: unknown): value is NovelProject {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<NovelProject>
  return (
    typeof candidate.title === 'string' &&
    typeof candidate.genre === 'string' &&
    Array.isArray(candidate.chapters)
  )
}

function isProjectShelfBackup(value: unknown): value is ProjectShelfBackup {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<ProjectShelfBackup>
  return candidate.app === 'xx-writer' && Array.isArray(candidate.projects)
}

function getWordCount(text: string) {
  return text.replace(/\s/g, '').length
}

function getProjectWordCount(project: NovelProject) {
  return project.chapters.reduce((sum, chapter) => sum + getWordCount(chapter.content), 0)
}

function getNextChapterTitle(project: NovelProject) {
  return `第 ${project.chapters.length + 1} 章 未命名章节`
}

function getNextChapterStatus(status: ChapterStatus): ChapterStatus {
  if (status === 'draft') {
    return 'polishing'
  }

  if (status === 'polishing') {
    return 'done'
  }

  return 'draft'
}

function getFilenameStem(filename: string) {
  return filename.replace(/\.[^.]+$/, '')
}

function parseChapterFile(filename: string, raw: string) {
  const normalized = raw.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n')
  const lines = normalized.split('\n')
  const firstLine = lines[0]?.trim() ?? ''
  const markdownTitle = firstLine.match(/^#\s+(.+)$/)

  if (markdownTitle) {
    return {
      title: markdownTitle[1].trim() || getFilenameStem(filename),
      content: lines.slice(1).join('\n').trim(),
    }
  }

  return {
    title: getFilenameStem(filename),
    content: normalized.trim(),
  }
}

function normalizeServiceUrl(serviceUrl: string) {
  return serviceUrl.trim().replace(/\/+$/, '')
}

function compactEntries(label: string, entries: LibraryEntry[]) {
  if (entries.length === 0) {
    return `${label}：暂无`
  }

  return `${label}：\n${entries.map((entry) => `- ${entry.title}：${entry.body}`).join('\n')}`
}

function cloneProject(project: NovelProject): NovelProject {
  const now = new Date().toISOString()
  const cloneEntry = (entry: LibraryEntry): LibraryEntry => ({
    ...entry,
    id: crypto.randomUUID(),
    updatedAt: now,
  })

  return {
    ...project,
    id: crypto.randomUUID(),
    title: `${project.title} 副本`,
    aiMessages: project.aiMessages.map((message) => ({
      ...message,
      id: crypto.randomUUID(),
    })),
    chapters: project.chapters.map((chapter) => ({
      ...chapter,
      id: crypto.randomUUID(),
      updatedAt: now,
    })),
    library: {
      outline: project.library.outline.map(cloneEntry),
      characters: project.library.characters.map(cloneEntry),
      world: project.library.world.map(cloneEntry),
      foreshadowing: project.library.foreshadowing.map(cloneEntry),
      timeline: project.library.timeline.map(cloneEntry),
      notes: project.library.notes.map(cloneEntry),
      settings: project.library.settings.map(cloneEntry),
    },
  }
}

function App() {
  const importInputRef = useRef<HTMLInputElement>(null)
  const chapterImportInputRef = useRef<HTMLInputElement>(null)
  const manuscriptRef = useRef<HTMLTextAreaElement>(null)
  const [project, setProject] = useState<NovelProject>(() => loadProject())
  const [projectShelf, setProjectShelf] = useState<NovelProject[]>(() => loadProjectShelf(project))
  const [activeChapterId, setActiveChapterId] = useState(() => project.chapters.at(-1)?.id ?? '')
  const [activeTemplateId, setActiveTemplateId] = useState(templates[0].id)
  const [activeLibraryKey, setActiveLibraryKey] = useState<LibraryKey>('outline')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [newProjectOpen, setNewProjectOpen] = useState(false)
  const [projectMetaEditing, setProjectMetaEditing] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [editorFontSize, setEditorFontSize] = useState(() => loadEditorFontSize())
  const [editorLineHeight, setEditorLineHeight] = useState(() => loadEditorLineHeight())
  const [newProjectDraft, setNewProjectDraft] = useState<NewProjectDraft>(defaultNewProjectDraft)
  const [aiConfig, setAiConfig] = useState<AiConfig>(() => loadAiConfig())
  const [chatInput, setChatInput] = useState('')
  const [aiResult, setAiResult] = useState('')
  const [aiError, setAiError] = useState('')
  const [chapterSearch, setChapterSearch] = useState('')
  const [librarySearch, setLibrarySearch] = useState('')
  const [manuscriptSelection, setManuscriptSelection] = useState<ManuscriptSelection | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [serviceHealth, setServiceHealth] = useState<ServiceHealth>({
    status: 'idle',
    message: '尚未检测服务',
  })
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem(AUTH_TOKEN_KEY))
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [notice, setNotice] = useState('项目已保存到本机')
  const [enabledContext, setEnabledContext] = useState<Record<ContextKey, boolean>>({
    currentChapter: true,
    recentSummaries: true,
    outline: true,
    characters: true,
    world: false,
    foreshadowing: true,
    timeline: false,
  })

  useEffect(() => {
    const timer = window.setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project))
      setProjectShelf((current) => {
        const nextShelf = current.some((item) => item.id === project.id)
          ? current.map((item) => (item.id === project.id ? project : item))
          : [project, ...current]

        return nextShelf
      })
    }, 250)

    return () => window.clearTimeout(timer)
  }, [project])

  useEffect(() => {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projectShelf))
  }, [projectShelf])

  useEffect(() => {
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(aiConfig))
  }, [aiConfig])

  useEffect(() => {
    localStorage.setItem(EDITOR_FONT_SIZE_KEY, String(editorFontSize))
  }, [editorFontSize])

  useEffect(() => {
    localStorage.setItem(EDITOR_LINE_HEIGHT_KEY, String(editorLineHeight))
  }, [editorLineHeight])

  useEffect(() => {
    if (!settingsOpen) {
      return
    }

    void checkServiceHealth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsOpen])

  const activeChapter =
    project.chapters.find((chapter) => chapter.id === activeChapterId) ?? project.chapters[0]
  const activeTemplate = templates.find((template) => template.id === activeTemplateId) ?? templates[0]
  const liveWordCount = activeChapter ? getWordCount(activeChapter.content) : 0
  const totalWords = useMemo(() => getProjectWordCount(project), [project])
  const writingProgress =
    project.targetWords > 0 ? Math.min(100, Math.round((totalWords / project.targetWords) * 100)) : 0
  const chapterStatusStats = useMemo(
    () =>
      project.chapters.reduce(
        (stats, chapter) => ({
          ...stats,
          [chapter.status]: stats[chapter.status] + 1,
        }),
        { draft: 0, polishing: 0, done: 0 } satisfies Record<ChapterStatus, number>,
      ),
    [project.chapters],
  )
  const filteredChapters = project.chapters.filter((chapter) => {
    const keyword = chapterSearch.trim().toLowerCase()

    if (!keyword) {
      return true
    }

    return `${chapter.title}\n${chapter.summary}\n${chapter.content}`.toLowerCase().includes(keyword)
  })
  const selectedContexts = contextOptions.filter((item) => enabledContext[item.key])
  const selectedManuscriptText =
    activeChapter && manuscriptSelection?.chapterId === activeChapter.id
      ? activeChapter.content.slice(
          Math.min(manuscriptSelection.start, manuscriptSelection.end),
          Math.max(manuscriptSelection.start, manuscriptSelection.end),
        )
      : ''
  const activeLibraryEntries = project.library[activeLibraryKey]
  const filteredLibraryEntries = activeLibraryEntries.filter((entry) => {
    const keyword = librarySearch.trim().toLowerCase()

    if (!keyword) {
      return true
    }

    return `${entry.title}\n${entry.body}`.toLowerCase().includes(keyword)
  })

  function showNotice(message: string) {
    setNotice(message)
    window.setTimeout(() => setNotice('项目已保存到本机'), 2200)
  }

  function changeEditorFontSize(delta: number) {
    setEditorFontSize((size) => Math.min(24, Math.max(14, size + delta)))
  }

  function changeEditorLineHeight(delta: number) {
    setEditorLineHeight((lineHeight) => Number(Math.min(2.4, Math.max(1.5, lineHeight + delta)).toFixed(1)))
  }

  function resetEditorDisplay() {
    setEditorFontSize(DEFAULT_EDITOR_FONT_SIZE)
    setEditorLineHeight(DEFAULT_EDITOR_LINE_HEIGHT)
    showNotice('已恢复默认编辑器显示')
  }

  function switchProject(projectId: string) {
    const nextProject = projectShelf.find((item) => item.id === projectId)

    if (!nextProject || nextProject.id === project.id) {
      return
    }

    setProject(nextProject)
    setActiveChapterId(nextProject.chapters.at(-1)?.id ?? '')
    setActiveLibraryKey('outline')
    setProjectMetaEditing(false)
    setAiResult('')
    setChatInput('')
    showNotice(`已切换到《${nextProject.title}》`)
  }

  function updateProjectMeta(
    patch: Partial<Pick<NovelProject, 'title' | 'genre' | 'premise' | 'volume' | 'targetWords'>>,
  ) {
    setProject((current) => ({
      ...current,
      ...patch,
      chapters: patch.volume
        ? current.chapters.map((chapter) => ({ ...chapter, volume: patch.volume ?? chapter.volume }))
        : current.chapters,
    }))
  }

  function duplicateProject(projectId: string) {
    const sourceProject = projectShelf.find((item) => item.id === projectId)

    if (!sourceProject) {
      return
    }

    const nextProject = cloneProject(sourceProject)
    setProjectShelf((current) => [nextProject, ...current])
    setProject(nextProject)
    setActiveChapterId(nextProject.chapters.at(-1)?.id ?? '')
    setActiveLibraryKey('outline')
    setAiResult('')
    setChatInput('')
    showNotice(`已复制《${sourceProject.title}》`)
  }

  function deleteProject(projectId: string) {
    const targetProject = projectShelf.find((item) => item.id === projectId)

    if (!targetProject) {
      return
    }

    if (projectShelf.length <= 1) {
      showNotice('作品库至少保留一本作品')
      return
    }

    if (!window.confirm(`确定删除《${targetProject.title}》吗？此操作只删除本机作品库记录。`)) {
      return
    }

    const nextShelf = projectShelf.filter((item) => item.id !== projectId)
    setProjectShelf(nextShelf)

    if (targetProject.id === project.id) {
      const nextProject = nextShelf[0]
      setProject(nextProject)
      setActiveChapterId(nextProject.chapters.at(-1)?.id ?? '')
      setActiveLibraryKey('outline')
      setAiResult('')
      setChatInput('')
    }

    showNotice(`已删除《${targetProject.title}》`)
  }

  function updateActiveChapter(patch: Partial<Chapter>) {
    if (!activeChapter) {
      return
    }

    setProject((current) => ({
      ...current,
      chapters: current.chapters.map((chapter) =>
        chapter.id === activeChapter.id
          ? { ...chapter, ...patch, updatedAt: new Date().toISOString() }
          : chapter,
      ),
    }))
  }

  function rememberManuscriptSelection(element: HTMLTextAreaElement) {
    if (!activeChapter) {
      return
    }

    setManuscriptSelection({
      chapterId: activeChapter.id,
      start: element.selectionStart,
      end: element.selectionEnd,
    })
  }

  function createChapter() {
    const now = new Date().toISOString()
    const chapter: Chapter = {
      id: crypto.randomUUID(),
      title: getNextChapterTitle(project),
      volume: project.volume,
      status: 'draft',
      summary: '新章节暂无摘要。写完后可使用“提炼本章摘要”模板生成。',
      content: '',
      updatedAt: now,
    }

    setProject((current) => ({
      ...current,
      chapters: [...current.chapters, chapter],
    }))
    setActiveChapterId(chapter.id)
  }

  function duplicateChapter(chapterId: string) {
    const sourceChapter = project.chapters.find((chapter) => chapter.id === chapterId)

    if (!sourceChapter) {
      return
    }

    const now = new Date().toISOString()
    const chapter: Chapter = {
      ...sourceChapter,
      id: crypto.randomUUID(),
      title: `${sourceChapter.title} 副本`,
      status: 'draft',
      updatedAt: now,
    }

    setProject((current) => {
      const sourceIndex = current.chapters.findIndex((item) => item.id === chapterId)
      const chapters = [...current.chapters]
      chapters.splice(sourceIndex + 1, 0, chapter)

      return {
        ...current,
        chapters,
      }
    })
    setActiveChapterId(chapter.id)
    showNotice('已复制章节')
  }

  function deleteChapter(chapterId: string) {
    const targetChapter = project.chapters.find((chapter) => chapter.id === chapterId)

    if (!targetChapter) {
      return
    }

    if (!window.confirm(`确定删除「${targetChapter.title}」吗？`)) {
      return
    }

    if (project.chapters.length === 1) {
      const now = new Date().toISOString()
      const blankChapter: Chapter = {
        id: crypto.randomUUID(),
        title: '第 1 章 未命名章节',
        volume: project.volume,
        status: 'draft',
        summary: '新章节暂无摘要。',
        content: '',
        updatedAt: now,
      }

      setProject((current) => ({
        ...current,
        chapters: [blankChapter],
      }))
      setActiveChapterId(blankChapter.id)
      showNotice('已删除章节，并保留空白章节')
      return
    }

    const nextChapters = project.chapters.filter((chapter) => chapter.id !== chapterId)
    const fallbackChapter =
      nextChapters.find((chapter) => chapter.id === activeChapter?.id) ?? nextChapters.at(-1)

    setProject((current) => ({
      ...current,
      chapters: current.chapters.filter((chapter) => chapter.id !== chapterId),
    }))
    setActiveChapterId(fallbackChapter?.id ?? '')
    showNotice('已删除章节')
  }

  function rotateChapterStatus(chapterId: string) {
    setProject((current) => ({
      ...current,
      chapters: current.chapters.map((chapter) =>
        chapter.id === chapterId
          ? { ...chapter, status: getNextChapterStatus(chapter.status), updatedAt: new Date().toISOString() }
          : chapter,
      ),
    }))
  }

  function moveChapter(chapterId: string, direction: 'up' | 'down') {
    const index = project.chapters.findIndex((chapter) => chapter.id === chapterId)
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    if (index < 0 || targetIndex < 0 || targetIndex >= project.chapters.length) {
      return
    }

    setProject((current) => {
      const chapters = [...current.chapters]
      const [chapter] = chapters.splice(index, 1)
      chapters.splice(targetIndex, 0, chapter)

      return {
        ...current,
        chapters,
      }
    })
    showNotice(direction === 'up' ? '章节已上移' : '章节已下移')
  }

  function createLibraryEntry(key = activeLibraryKey) {
    const now = new Date().toISOString()
    const entry: LibraryEntry = {
      id: crypto.randomUUID(),
      title: `新的${libraryLabels[key]}`,
      body: '',
      updatedAt: now,
    }

    setProject((current) => ({
      ...current,
      library: {
        ...current.library,
        [key]: [...current.library[key], entry],
      },
    }))
    setActiveLibraryKey(key)
  }

  function updateLibraryEntry(key: LibraryKey, entryId: string, patch: Partial<LibraryEntry>) {
    setProject((current) => ({
      ...current,
      library: {
        ...current.library,
        [key]: current.library[key].map((entry) =>
          entry.id === entryId ? { ...entry, ...patch, updatedAt: new Date().toISOString() } : entry,
        ),
      },
    }))
  }

  function deleteLibraryEntry(key: LibraryKey, entryId: string) {
    setProject((current) => ({
      ...current,
      library: {
        ...current.library,
        [key]: current.library[key].filter((entry) => entry.id !== entryId),
      },
    }))
  }

  function buildContextPayload() {
    const chunks: string[] = [
      `作品：${project.title}`,
      `类型：${project.genre}`,
      `分卷：${project.volume}`,
      `核心设定：${project.premise}`,
    ]

    if (enabledContext.currentChapter && activeChapter) {
      chunks.push(
        `当前章节：${activeChapter.title}\n摘要：${activeChapter.summary}\n正文：\n${activeChapter.content}`,
      )
    }

    if (selectedManuscriptText.trim()) {
      chunks.push(`当前选中文本：\n${selectedManuscriptText.trim()}`)
    }

    if (enabledContext.recentSummaries) {
      chunks.push(
        `最近章节摘要：\n${project.chapters
          .slice(-3)
          .map((chapter) => `- ${chapter.title}：${chapter.summary}`)
          .join('\n')}`,
      )
    }

    if (enabledContext.outline) {
      chunks.push(compactEntries('大纲', project.library.outline))
    }

    if (enabledContext.characters) {
      chunks.push(compactEntries('人物', project.library.characters))
    }

    if (enabledContext.world) {
      chunks.push(compactEntries('世界观', project.library.world))
    }

    if (enabledContext.foreshadowing) {
      chunks.push(compactEntries('伏笔', project.library.foreshadowing))
    }

    if (enabledContext.timeline) {
      chunks.push(compactEntries('时间线', project.library.timeline))
    }

    return chunks.join('\n\n---\n\n')
  }

  async function handleAuth() {
    setAuthError('')
    setAuthLoading(true)
    const serviceUrl = normalizeServiceUrl(aiConfig.serviceUrl)
    const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register'
    try {
      const res = await fetch(`${serviceUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword }),
      })
      const data = (await res.json()) as { token?: string; error?: string }
      if (!res.ok || !data.token) { setAuthError(data.error ?? '操作失败'); return }
      localStorage.setItem(AUTH_TOKEN_KEY, data.token)
      setAuthToken(data.token)
    } catch {
      setAuthError('网络错误，请检查服务地址')
    } finally {
      setAuthLoading(false)
    }
  }

  function handleLogout() {
    const token = authToken
    const serviceUrl = normalizeServiceUrl(aiConfig.serviceUrl)
    if (token) fetch(`${serviceUrl}/auth/logout`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => {})
    localStorage.removeItem(AUTH_TOKEN_KEY)
    setAuthToken(null)
  }

  async function readApiError(response: Response) {
    try {
      const data = (await response.json()) as { error?: string }
      return data.error || `请求失败：${response.status}`
    } catch {
      return (await response.text()) || `请求失败：${response.status}`
    }
  }

  async function checkServiceHealth() {
    const serviceUrl = normalizeServiceUrl(aiConfig.serviceUrl)

    if (!serviceUrl) {
      setServiceHealth({ status: 'offline', message: '服务地址为空' })
      return
    }

    setServiceHealth({ status: 'checking', message: '正在检测服务...' })

    try {
      const controller = new AbortController()
      const timer = window.setTimeout(() => controller.abort(), 5000)
      const response = await fetch(`${serviceUrl}/health`, { signal: controller.signal })
      window.clearTimeout(timer)

      if (!response.ok) {
        throw new Error(await readApiError(response))
      }

      const data = (await response.json()) as {
        ok?: boolean
        model?: string
        providerConfigured?: boolean
      }

      setServiceHealth({
        status: data.providerConfigured ? 'online' : 'offline',
        message: data.providerConfigured ? '服务可用' : '服务在线，但未配置模型密钥',
        model: data.model,
        providerConfigured: Boolean(data.providerConfigured),
      })
    } catch (error) {
      setServiceHealth({
        status: 'offline',
        message: error instanceof Error ? error.message : '服务检测失败',
      })
    }
  }

  async function sendAiRequest() {
    const serviceUrl = normalizeServiceUrl(aiConfig.serviceUrl)

    if (!serviceUrl) {
      setSettingsOpen(true)
      setAiError('请先在设置里填写应用服务地址。')
      return
    }

    if (!chatInput.trim()) {
      setAiError('请先写下这次要 AI 处理的故事要求。')
      return
    }

    setIsSending(true)
    setAiError('')

    try {
      const response = await fetch(`${serviceUrl}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          taskTitle: activeTemplate.title,
          taskDescription: activeTemplate.description,
          userPrompt: chatInput.trim(),
          context: buildContextPayload(),
        }),
      })

      if (!response.ok) {
        throw new Error(await readApiError(response))
      }

      const data = (await response.json()) as { content?: string }
      const content = data.content?.trim()

      if (!content) {
        throw new Error('模型没有返回正文内容。')
      }

      setAiResult(content)
      setProject((current) => ({
        ...current,
        aiMessages: [
          {
            id: crypto.randomUUID(),
            templateTitle: activeTemplate.title,
            userPrompt: chatInput.trim(),
            content,
            createdAt: new Date().toISOString(),
          },
          ...current.aiMessages,
        ].slice(0, 80),
      }))
      showNotice('AI 已生成结果')
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'AI 请求失败，请检查应用服务。')
    } finally {
      setIsSending(false)
    }
  }

  async function generateChapterSummary() {
    const serviceUrl = normalizeServiceUrl(aiConfig.serviceUrl)

    if (!activeChapter) {
      return
    }

    if (!serviceUrl) {
      setSettingsOpen(true)
      setAiError('请先在设置里填写应用服务地址。')
      return
    }

    if (!activeChapter.content.trim()) {
      showNotice('当前章节还没有正文，无法提炼摘要')
      return
    }

    setIsSummarizing(true)
    setAiError('')

    try {
      const response = await fetch(`${serviceUrl}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          taskTitle: '提炼本章摘要',
          taskDescription:
            '为长篇小说项目生成章节摘要。要求 80-180 字，保留本章关键事件、人物状态变化、伏笔推进和结尾钩子；不要写分析说明。',
          userPrompt: `请为「${activeChapter.title}」提炼一段后续续写可用的章节摘要。`,
          context: `作品：${project.title}\n类型：${project.genre}\n核心设定：${project.premise}\n\n章节正文：\n${activeChapter.content}`,
        }),
      })

      if (!response.ok) {
        throw new Error(await readApiError(response))
      }

      const data = (await response.json()) as { content?: string }
      const summary = data.content?.trim()

      if (!summary) {
        throw new Error('模型没有返回摘要内容。')
      }

      updateActiveChapter({ summary })
      showNotice('已生成本章摘要')
    } catch (error) {
      setAiError(error instanceof Error ? error.message : '摘要生成失败，请检查应用服务。')
    } finally {
      setIsSummarizing(false)
    }
  }

  function insertAiResult() {
    if (!aiResult.trim() || !activeChapter) {
      return
    }

    const insertText = aiResult.trim()
    const savedSelection =
      manuscriptSelection?.chapterId === activeChapter.id ? manuscriptSelection : null
    const start = savedSelection ? savedSelection.start : activeChapter.content.length
    const end = savedSelection ? savedSelection.end : activeChapter.content.length
    const prefix = activeChapter.content.slice(0, start)
    const suffix = activeChapter.content.slice(end)
    const leadingBreak = prefix && !prefix.endsWith('\n') ? '\n\n' : ''
    const trailingBreak = suffix && !suffix.startsWith('\n') ? '\n\n' : ''
    const nextContent = `${prefix}${leadingBreak}${insertText}${trailingBreak}${suffix}`
    const nextCaretPosition = prefix.length + leadingBreak.length + insertText.length

    updateActiveChapter({ content: nextContent })

    window.requestAnimationFrame(() => {
      manuscriptRef.current?.focus()
      manuscriptRef.current?.setSelectionRange(nextCaretPosition, nextCaretPosition)
      setManuscriptSelection({
        chapterId: activeChapter.id,
        start: nextCaretPosition,
        end: nextCaretPosition,
      })
    })
    showNotice('已插入到当前章节')
  }

  function saveAiResultAsChapter() {
    if (!aiResult.trim()) {
      return
    }

    const now = new Date().toISOString()
    const chapter: Chapter = {
      id: crypto.randomUUID(),
      title: `${activeChapter?.title ?? 'AI 生成'} - AI 草稿`,
      volume: project.volume,
      status: 'draft',
      summary: `由“${activeTemplate.title}”生成的草稿。`,
      content: aiResult.trim(),
      updatedAt: now,
    }

    setProject((current) => ({
      ...current,
      chapters: [...current.chapters, chapter],
    }))
    setActiveChapterId(chapter.id)
    showNotice('AI 结果已另存为新章节')
  }

  function saveAiResultToLibrary() {
    if (!aiResult.trim()) {
      return
    }

    const now = new Date().toISOString()
    const entry: LibraryEntry = {
      id: crypto.randomUUID(),
      title: `${activeTemplate.title} · ${new Date().toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })}`,
      body: aiResult.trim(),
      updatedAt: now,
    }

    setProject((current) => ({
      ...current,
      library: {
        ...current.library,
        [activeLibraryKey]: [entry, ...current.library[activeLibraryKey]],
      },
    }))
    showNotice(`已保存到${libraryLabels[activeLibraryKey]}`)
  }

  function restoreAiMessage(message: AiMessage) {
    setAiResult(message.content)
    setChatInput(message.userPrompt)
    showNotice('已恢复对话记录')
  }

  function deleteAiMessage(messageId: string) {
    setProject((current) => ({
      ...current,
      aiMessages: current.aiMessages.filter((message) => message.id !== messageId),
    }))
    showNotice('已删除对话记录')
  }

  function clearAiMessages() {
    if (project.aiMessages.length === 0) {
      return
    }

    if (!window.confirm('确定清空当前作品的全部 AI 对话记录吗？')) {
      return
    }

    setProject((current) => ({
      ...current,
      aiMessages: [],
    }))
    showNotice('已清空对话记录')
  }

  function openNewProjectPanel() {
    setNewProjectDraft({
      title: '',
      genre: project.genre || defaultNewProjectDraft.genre,
      premise: '',
      volume: '第一卷',
      targetWords: project.targetWords || defaultNewProjectDraft.targetWords,
    })
    setSettingsOpen(false)
    setNewProjectOpen(true)
  }

  function createNewProject() {
    if (!newProjectDraft.title.trim()) {
      showNotice('请先填写作品名称')
      return
    }

    const nextProject = createBlankProject(newProjectDraft)
    setProject(nextProject)
    setActiveChapterId(nextProject.chapters[0]?.id ?? '')
    setActiveLibraryKey('outline')
    setProjectMetaEditing(false)
    setAiResult('')
    setChatInput('')
    setNewProjectOpen(false)
    showNotice('已创建新的小说项目')
  }

  function downloadFile(filename: string, content: string, type: string) {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    document.body.append(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  function getSafeProjectName() {
    return project.title.replace(/[\\/:*?"<>|]/g, '_')
  }

  function getSafeFilename(name: string) {
    return name.replace(/[\\/:*?"<>|]/g, '_')
  }

  function exportProjectJson() {
    downloadFile(
      `${getSafeProjectName()}.xxwriter.json`,
      JSON.stringify(project, null, 2),
      'application/json;charset=utf-8',
    )
    showNotice('已导出项目 JSON')
  }

  function exportProjectShelfJson() {
    const backup: ProjectShelfBackup = {
      app: 'xx-writer',
      version: 1,
      exportedAt: new Date().toISOString(),
      projects: projectShelf.map((item) => (item.id === project.id ? project : item)),
    }

    downloadFile(
      `Xx Writer 作品库备份.${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(backup, null, 2),
      'application/json;charset=utf-8',
    )
    showNotice('已导出作品库备份')
  }

  function exportFullBook(format: 'markdown' | 'txt') {
    const content = project.chapters
      .map((chapter) => {
        const title = format === 'markdown' ? `# ${chapter.title}` : chapter.title
        return `${title}\n\n${chapter.content.trim()}`
      })
      .join('\n\n')

    downloadFile(
      `${getSafeProjectName()}.${format === 'markdown' ? 'md' : 'txt'}`,
      content,
      'text/plain;charset=utf-8',
    )
    showNotice(`已导出全书 ${format === 'markdown' ? 'Markdown' : 'TXT'}`)
  }

  function exportActiveChapter(format: 'markdown' | 'txt') {
    if (!activeChapter) {
      showNotice('当前没有可导出的章节')
      return
    }

    const title = format === 'markdown' ? `# ${activeChapter.title}` : activeChapter.title
    const content = `${title}\n\n${activeChapter.content.trim()}`

    downloadFile(
      `${getSafeProjectName()}-${getSafeFilename(activeChapter.title)}.${format === 'markdown' ? 'md' : 'txt'}`,
      content,
      'text/plain;charset=utf-8',
    )
    showNotice(`已导出当前章节 ${format === 'markdown' ? 'Markdown' : 'TXT'}`)
  }

  async function importProjectFile(file: File) {
    try {
      const raw = await file.text()
      const parsed = JSON.parse(raw) as unknown

      if (isProjectShelfBackup(parsed)) {
        const projects = parsed.projects.filter(isImportableProject).map((item) => normalizeProject(item))

        if (projects.length === 0) {
          showNotice('导入失败：作品库备份为空')
          return
        }

        setProjectShelf(projects)
        setProject(projects[0])
        setActiveChapterId(projects[0].chapters.at(-1)?.id ?? '')
        setActiveLibraryKey('outline')
        setProjectMetaEditing(false)
        setAiResult('')
        setChatInput('')
        showNotice(`已恢复作品库：${projects.length} 本作品`)
        return
      }

      if (!isImportableProject(parsed)) {
        showNotice('导入失败：不是有效的小说项目')
        return
      }

      const nextProject = normalizeProject(parsed)

      if (nextProject.chapters.some((chapter) => !chapter.id || typeof chapter.content !== 'string')) {
        showNotice('导入失败：章节数据不完整')
        return
      }

      setProject(nextProject)
      setActiveChapterId(nextProject.chapters.at(-1)?.id ?? '')
      setActiveLibraryKey('outline')
      setProjectMetaEditing(false)
      setAiResult('')
      setChatInput('')
      showNotice('已恢复小说项目')
    } catch {
      showNotice('导入失败：文件无法解析')
    }
  }

  async function importChapterFile(file: File) {
    try {
      const raw = await file.text()
      const parsed = parseChapterFile(file.name, raw)

      if (!parsed.content) {
        showNotice('导入失败：章节文件没有正文')
        return
      }

      const now = new Date().toISOString()
      const chapter: Chapter = {
        id: crypto.randomUUID(),
        title: parsed.title || getNextChapterTitle(project),
        volume: project.volume,
        status: 'draft',
        summary: '导入章节暂无摘要，可使用“AI 提炼”生成。',
        content: parsed.content,
        updatedAt: now,
      }

      setProject((current) => ({
        ...current,
        chapters: [...current.chapters, chapter],
      }))
      setActiveChapterId(chapter.id)
      showNotice(`已导入章节「${chapter.title}」`)
    } catch {
      showNotice('导入失败：章节文件无法读取')
    }
  }

  if (!authToken) return (
    <div className="auth-wall">
      <div className="auth-card">
        <div className="brand" style={{ justifyContent: 'center', marginBottom: 24 }}>
          <span className="brand-mark">X</span>
          <div><strong>Xx Writer</strong><span>长文小说 AI 工作台</span></div>
        </div>
        <div className="auth-tabs">
          <button className={authMode === 'login' ? 'active' : ''} onClick={() => { setAuthMode('login'); setAuthError('') }}>登录</button>
          <button className={authMode === 'register' ? 'active' : ''} onClick={() => { setAuthMode('register'); setAuthError('') }}>注册</button>
        </div>
        <input type="email" placeholder="邮箱" value={authEmail} onChange={e => setAuthEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAuth()} />
        <input type="password" placeholder="密码（至少6位）" value={authPassword} onChange={e => setAuthPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAuth()} />
        {authError && <p className="auth-error">{authError}</p>}
        <button className="auth-submit" onClick={handleAuth} disabled={authLoading}>
          {authLoading ? '处理中…' : authMode === 'login' ? '登录' : '注册'}
        </button>
      </div>
    </div>
  )

  return (
    <div className={focusMode ? 'app-shell focus-mode' : 'app-shell'}>
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">X</span>
          <div>
            <strong>Xx Writer</strong>
            <span>长文小说 AI 工作台</span>
          </div>
        </div>
        <nav className="top-actions" aria-label="主要操作">
          <button type="button" title="创建新的小说项目" onClick={openNewProjectPanel}>
            新建
          </button>
          <button type="button" title="导入项目备份" onClick={() => importInputRef.current?.click()}>
            导入
          </button>
          <button type="button" title="导入 TXT/Markdown 章节" onClick={() => chapterImportInputRef.current?.click()}>
            导入章
          </button>
          <button type="button" title="导出全书 Markdown" onClick={() => exportFullBook('markdown')}>
            导出MD
          </button>
          <button type="button" title="导出全书 TXT" onClick={() => exportFullBook('txt')}>
            导出TXT
          </button>
          <button type="button" title="导出当前章节 Markdown" onClick={() => exportActiveChapter('markdown')}>
            单章MD
          </button>
          <button type="button" title="导出当前章节 TXT" onClick={() => exportActiveChapter('txt')}>
            单章TXT
          </button>
          <button type="button" title="导出项目 JSON" onClick={exportProjectJson}>
            备份
          </button>
          <button type="button" title="导出整个作品库" onClick={exportProjectShelfJson}>
            备份库
          </button>
          <button type="button" title="切换专注写作模式" onClick={() => setFocusMode((enabled) => !enabled)}>
            {focusMode ? '退出专注' : '专注'}
          </button>
          <button type="button" title="退出登录" onClick={handleLogout} style={{ marginLeft: 8, opacity: 0.7 }}>
            退出
          </button>
          <div className="font-actions" aria-label="编辑器字号">
            <button type="button" title="缩小正文字号" onClick={() => changeEditorFontSize(-1)}>
              字-
            </button>
            <span>{editorFontSize}px</span>
            <button type="button" title="放大正文字号" onClick={() => changeEditorFontSize(1)}>
              字+
            </button>
          </div>
          <div className="font-actions" aria-label="编辑器行距">
            <button type="button" title="减小正文行距" onClick={() => changeEditorLineHeight(-0.1)}>
              距-
            </button>
            <span>{editorLineHeight.toFixed(1)}</span>
            <button type="button" title="增大正文行距" onClick={() => changeEditorLineHeight(0.1)}>
              距+
            </button>
          </div>
          <button type="button" title="恢复默认字号和行距" onClick={resetEditorDisplay}>
            默认
          </button>
          <button type="button" title="设置" onClick={() => setSettingsOpen((open) => !open)}>
            设置
          </button>
        </nav>
        <input
          ref={importInputRef}
          className="hidden-file-input"
          type="file"
          accept=".json,.xxwriter.json,application/json"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) {
              void importProjectFile(file)
            }
            event.target.value = ''
          }}
        />
        <input
          ref={chapterImportInputRef}
          className="hidden-file-input"
          type="file"
          accept=".txt,.md,text/plain,text/markdown"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) {
              void importChapterFile(file)
            }
            event.target.value = ''
          }}
        />
      </header>

      {settingsOpen ? (
        <section className="settings-panel" aria-label="AI 设置">
          <div>
            <strong>应用服务设置</strong>
            <span>模型密钥由服务端托管</span>
          </div>
          <label>
            服务地址
            <input
              value={aiConfig.serviceUrl}
              onChange={(event) => {
                setAiConfig((config) => ({ ...config, serviceUrl: event.target.value }))
                setServiceHealth({ status: 'idle', message: '服务地址已修改，尚未检测' })
              }}
              placeholder="http://127.0.0.1:8787/api"
            />
          </label>
          <div className={`service-status ${serviceHealth.status}`}>
            <strong>{serviceHealth.message}</strong>
            {serviceHealth.model ? <span>模型：{serviceHealth.model}</span> : null}
            {serviceHealth.providerConfigured === false ? <span>请在服务端 .env 填写 OPENAI_API_KEY</span> : null}
          </div>
          <button type="button" onClick={() => void checkServiceHealth()}>
            检测
          </button>
          <button type="button" onClick={() => setSettingsOpen(false)}>
            完成
          </button>
        </section>
      ) : null}

      {newProjectOpen ? (
        <section className="modal-backdrop" aria-label="新建作品">
          <form
            className="new-project-panel"
            onSubmit={(event) => {
              event.preventDefault()
              createNewProject()
            }}
          >
            <div className="modal-header">
              <div>
                <span className="eyebrow">新建作品</span>
                <h2>创建一部长篇小说</h2>
              </div>
              <button type="button" title="关闭" onClick={() => setNewProjectOpen(false)}>
                关闭
              </button>
            </div>
            <label>
              作品名称
              <input
                value={newProjectDraft.title}
                onChange={(event) =>
                  setNewProjectDraft((draft) => ({ ...draft, title: event.target.value }))
                }
                placeholder="例如：长夜渡灯人"
                autoFocus
              />
            </label>
            <div className="form-row">
              <label>
                类型
                <input
                  value={newProjectDraft.genre}
                  onChange={(event) =>
                    setNewProjectDraft((draft) => ({ ...draft, genre: event.target.value }))
                  }
                  placeholder="玄幻 / 悬疑 / 都市 / 科幻"
                />
              </label>
              <label>
                起始分卷
                <input
                  value={newProjectDraft.volume}
                  onChange={(event) =>
                    setNewProjectDraft((draft) => ({ ...draft, volume: event.target.value }))
                  }
                  placeholder="第一卷"
                />
              </label>
              <label>
                目标字数
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={newProjectDraft.targetWords}
                  onChange={(event) =>
                    setNewProjectDraft((draft) => ({ ...draft, targetWords: Number(event.target.value) }))
                  }
                  placeholder="300000"
                />
              </label>
            </div>
            <label>
              核心设定
              <textarea
                value={newProjectDraft.premise}
                onChange={(event) =>
                  setNewProjectDraft((draft) => ({ ...draft, premise: event.target.value }))
                }
                placeholder="用一两句话写清主角、目标、冲突和故事卖点。"
              />
            </label>
            <div className="modal-actions">
              <button type="button" onClick={() => setNewProjectOpen(false)}>
                取消
              </button>
              <button type="submit">创建作品</button>
            </div>
          </form>
        </section>
      ) : null}

      <main className="workspace">
        <aside className="sidebar panel">
          <section className="nav-section">
            <div className="section-title">
              <span>作品库</span>
              <button type="button" title="新建作品" onClick={openNewProjectPanel}>
                +
              </button>
            </div>
            <div className="project-list">
              {projectShelf.map((item) => (
                <article
                  key={item.id}
                  className={item.id === project.id ? 'project-list-item active' : 'project-list-item'}
                >
                  <button type="button" className="project-open-button" onClick={() => switchProject(item.id)}>
                    <span>{item.title}</span>
                    <small>
                      {item.genre} · {item.chapters.length} 章 · {getProjectWordCount(item).toLocaleString()} 字
                    </small>
                  </button>
                  <div className="project-actions">
                    <button type="button" title="复制作品" onClick={() => duplicateProject(item.id)}>
                      复制
                    </button>
                    <button type="button" title="删除作品" onClick={() => deleteProject(item.id)}>
                      删除
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </aside>

        <section className="assistant-panel panel">
          <div className="chat-title">
            <span>新对话</span>
          </div>
          <div className="quick-tools">
            {templates.slice(0, 4).map((template) => (
              <button
                type="button"
                key={template.id}
                className={template.id === activeTemplate.id ? 'active' : ''}
                onClick={() => setActiveTemplateId(template.id)}
              >
                {template.title}
              </button>
            ))}
          </div>
          <div className="welcome-card">
            <span className="app-glyph">✦</span>
            <h2>Xx Writer</h2>
            <p>长文小说创作助手</p>
            <button type="button" onClick={openNewProjectPanel}>
              新书启航
            </button>
            <button type="button" onClick={createChapter}>
              继续写作
            </button>
            <button type="button">使用教程</button>
          </div>
          <section className="ai-history">
            <div className="ai-history-header">
              <span>对话记录</span>
              <button type="button" disabled={project.aiMessages.length === 0} onClick={clearAiMessages}>
                清空 {project.aiMessages.length}
              </button>
            </div>
            {project.aiMessages.length === 0 ? (
              <p className="empty-history">还没有 AI 对话记录</p>
            ) : (
              project.aiMessages.slice(0, 6).map((message) => (
                <article className="ai-history-item" key={message.id}>
                  <button type="button" className="ai-history-open" onClick={() => restoreAiMessage(message)}>
                    <span>{message.templateTitle}</span>
                    <small>{message.userPrompt}</small>
                  </button>
                  <button type="button" className="ai-history-delete" onClick={() => deleteAiMessage(message.id)}>
                    删除
                  </button>
                </article>
              ))
            )}
          </section>
          <section className="ai-compose">
            <div className="prompt-preview">
              <span>{activeTemplate.title}</span>
              <p>{activeTemplate.description}</p>
              <small>
                将携带 {selectedContexts.length} 组上下文
                {selectedManuscriptText.trim() ? ` · 已选 ${getWordCount(selectedManuscriptText)} 字` : ''}
              </small>
            </div>
            {aiResult ? (
              <div className="ai-result">
                <span>AI 结果</span>
                <p>{aiResult}</p>
              </div>
            ) : null}
            {aiError ? <p className="assistant-error">{aiError}</p> : null}
            <textarea
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              placeholder="写下你的故事要求，例如：保持悬疑感，续写沈砚听见第七声钟后的反应。"
            />
            <div className="compose-actions">
              <button type="button" disabled={isSending} onClick={() => void sendAiRequest()}>
                {isSending ? '生成中' : '发送'}
              </button>
              <button type="button" disabled={!aiResult} onClick={insertAiResult}>
                插入
              </button>
              <button type="button" disabled={!aiResult} onClick={saveAiResultAsChapter}>
                另存
              </button>
              <button type="button" disabled={!aiResult} onClick={saveAiResultToLibrary}>
                存资料
              </button>
            </div>
          </section>
        </section>

        <section className="editor-panel panel">
          <div className="editor-header">
            <div>
              <span className="eyebrow">{activeChapter?.volume ?? project.volume}</span>
              <input
                className="chapter-title-input"
                value={activeChapter?.title ?? ''}
                onChange={(event) => updateActiveChapter({ title: event.target.value })}
                aria-label="章节标题"
              />
            </div>
            <div className="chapter-stats">
              <span>{liveWordCount.toLocaleString()} 字</span>
              <span>{notice}</span>
            </div>
          </div>

          {activeChapter ? (
            <section className="chapter-summary-editor">
              <div className="summary-editor-header">
                <span>本章摘要</span>
                <button type="button" disabled={isSummarizing} onClick={() => void generateChapterSummary()}>
                  {isSummarizing ? '生成中' : 'AI 提炼'}
                </button>
              </div>
              <textarea
                value={activeChapter.summary}
                onChange={(event) => updateActiveChapter({ summary: event.target.value })}
                placeholder="用一两句话记录本章发生了什么，后续 AI 会把它作为连续性上下文。"
              />
            </section>
          ) : null}

          {activeChapter ? (
            <textarea
              ref={manuscriptRef}
              className="manuscript"
              style={{ fontSize: `${editorFontSize}px`, lineHeight: editorLineHeight }}
              value={activeChapter.content}
              onChange={(event) => {
                updateActiveChapter({ content: event.target.value })
                rememberManuscriptSelection(event.target)
              }}
              onSelect={(event) => rememberManuscriptSelection(event.currentTarget)}
              onKeyUp={(event) => rememberManuscriptSelection(event.currentTarget)}
              onClick={(event) => rememberManuscriptSelection(event.currentTarget)}
              spellCheck={false}
              aria-label="章节正文编辑器"
            />
          ) : (
            <div className="empty-editor">
              <strong>还没有章节</strong>
              <button type="button" onClick={createChapter}>
                创建第一章
              </button>
            </div>
          )}

          <div className="source-strip">
            <article>
              <span>核心设定</span>
              <p>{project.premise}</p>
            </article>
            {project.library.outline.slice(0, 2).map((entry) => (
              <article key={entry.id}>
                <span>{entry.title}</span>
                <p>{entry.body}</p>
              </article>
            ))}
          </div>
        </section>

        <aside className="directory-panel panel">
          <section className="project-card">
            <div className="project-card-header">
              <span className="eyebrow">当前作品</span>
              <button type="button" onClick={() => setProjectMetaEditing((editing) => !editing)}>
                {projectMetaEditing ? '完成' : '编辑'}
              </button>
            </div>
            {projectMetaEditing ? (
              <div className="project-meta-form">
                <label>
                  书名
                  <input
                    value={project.title}
                    onChange={(event) => updateProjectMeta({ title: event.target.value })}
                  />
                </label>
                <label>
                  类型
                  <input
                    value={project.genre}
                    onChange={(event) => updateProjectMeta({ genre: event.target.value })}
                  />
                </label>
                <label>
                  分卷
                  <input
                    value={project.volume}
                    onChange={(event) => updateProjectMeta({ volume: event.target.value })}
                  />
                </label>
                <label>
                  目标字数
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={project.targetWords}
                    onChange={(event) => updateProjectMeta({ targetWords: Number(event.target.value) })}
                  />
                </label>
                <label>
                  核心设定
                  <textarea
                    value={project.premise}
                    onChange={(event) => updateProjectMeta({ premise: event.target.value })}
                  />
                </label>
              </div>
            ) : (
              <>
                <h1>{project.title}</h1>
                <p>
                  {project.genre} · 长篇连载 · {project.volume}
                </p>
                <p className="project-premise">{project.premise}</p>
                <div className="writing-progress">
                  <div>
                    <span>完成进度</span>
                    <strong>{writingProgress}%</strong>
                  </div>
                  <progress value={writingProgress} max="100" />
                  <small>
                    目标 {project.targetWords.toLocaleString()} 字 · 还差{' '}
                    {Math.max(project.targetWords - totalWords, 0).toLocaleString()} 字
                  </small>
                </div>
              </>
            )}
            <dl>
              <div>
                <dt>总字数</dt>
                <dd>{totalWords.toLocaleString()}</dd>
              </div>
              <div>
                <dt>章节</dt>
                <dd>{project.chapters.length}</dd>
              </div>
              <div>
                <dt>草稿</dt>
                <dd>{chapterStatusStats.draft}</dd>
              </div>
              <div>
                <dt>待润色</dt>
                <dd>{chapterStatusStats.polishing}</dd>
              </div>
              <div>
                <dt>已完成</dt>
                <dd>{chapterStatusStats.done}</dd>
              </div>
            </dl>
          </section>

          <section className="nav-section">
            <div className="section-title">
              <span>目录</span>
              <button type="button" title="新建章节" onClick={createChapter}>
                +
              </button>
            </div>
            <div className="chapter-search">
              <input
                value={chapterSearch}
                onChange={(event) => setChapterSearch(event.target.value)}
                placeholder="搜索章节"
              />
              {chapterSearch ? (
                <button type="button" onClick={() => setChapterSearch('')}>
                  清空
                </button>
              ) : null}
            </div>
            <ol className="chapter-list">
              {filteredChapters.length === 0 ? (
                <li className="empty-chapter-search">
                  <strong>没有匹配章节</strong>
                  <button type="button" onClick={() => setChapterSearch('')}>
                    清空搜索
                  </button>
                </li>
              ) : (
                filteredChapters.map((chapter) => {
                  const chapterIndex = project.chapters.findIndex((item) => item.id === chapter.id)

                  return (
                  <li key={chapter.id}>
                    <article className={chapter.id === activeChapter?.id ? 'chapter-list-item active' : 'chapter-list-item'}>
                      <button
                        type="button"
                        className="chapter-open-button"
                        onClick={() => setActiveChapterId(chapter.id)}
                      >
                        <span>{chapter.title}</span>
                        <small>
                          {statusLabel[chapter.status]} · {getWordCount(chapter.content).toLocaleString()} 字
                        </small>
                      </button>
                      <div className="chapter-actions">
                        <button
                          type="button"
                          title="上移章节"
                          disabled={chapterIndex <= 0}
                          onClick={() => moveChapter(chapter.id, 'up')}
                        >
                          上移
                        </button>
                        <button
                          type="button"
                          title="下移章节"
                          disabled={chapterIndex === project.chapters.length - 1}
                          onClick={() => moveChapter(chapter.id, 'down')}
                        >
                          下移
                        </button>
                        <button type="button" title="切换章节状态" onClick={() => rotateChapterStatus(chapter.id)}>
                          状态
                        </button>
                        <button type="button" title="复制章节" onClick={() => duplicateChapter(chapter.id)}>
                          复制
                        </button>
                        <button type="button" title="删除章节" onClick={() => deleteChapter(chapter.id)}>
                          删除
                        </button>
                      </div>
                    </article>
                  </li>
                  )
                })
              )}
            </ol>
          </section>

          <section className="context-section">
            <div className="section-title">
              <span>上下文包</span>
            </div>
            <div className="context-list">
              {contextOptions.map((option) => (
                <label key={option.key}>
                  <input
                    type="checkbox"
                    checked={enabledContext[option.key]}
                    onChange={() =>
                      setEnabledContext((state) => ({
                        ...state,
                        [option.key]: !state[option.key],
                      }))
                    }
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="nav-section library">
            <div className="section-title">
              <span>资料库</span>
              <button type="button" title="新建资料卡" onClick={() => createLibraryEntry()}>
                +
              </button>
            </div>
            {(Object.keys(libraryLabels) as LibraryKey[]).map((key) => (
              <button
                type="button"
                key={key}
                className={key === activeLibraryKey ? 'active' : ''}
                onClick={() => setActiveLibraryKey(key)}
              >
                {libraryLabels[key]}
                <small>{project.library[key].length}</small>
              </button>
            ))}
          </section>
        </aside>

        <section className="library-editor panel">
          <div className="library-editor-header">
            <div>
              <span className="eyebrow">资料库</span>
              <h2>{libraryLabels[activeLibraryKey]}</h2>
            </div>
            <button type="button" onClick={() => createLibraryEntry(activeLibraryKey)}>
              新建
            </button>
          </div>
          <div className="library-search">
            <input
              value={librarySearch}
              onChange={(event) => setLibrarySearch(event.target.value)}
              placeholder={`搜索${libraryLabels[activeLibraryKey]}标题或正文`}
            />
            {librarySearch ? (
              <button type="button" onClick={() => setLibrarySearch('')}>
                清空
              </button>
            ) : null}
          </div>
          <div className="library-card-list">
            {activeLibraryEntries.length === 0 ? (
              <div className="empty-library">
                <strong>还没有{libraryLabels[activeLibraryKey]}</strong>
                <button type="button" onClick={() => createLibraryEntry(activeLibraryKey)}>
                  创建资料卡
                </button>
              </div>
            ) : filteredLibraryEntries.length === 0 ? (
              <div className="empty-library">
                <strong>没有匹配的资料</strong>
                <button type="button" onClick={() => setLibrarySearch('')}>
                  清空搜索
                </button>
              </div>
            ) : (
              filteredLibraryEntries.map((entry) => (
                <article className="library-card-editor" key={entry.id}>
                  <input
                    value={entry.title}
                    onChange={(event) =>
                      updateLibraryEntry(activeLibraryKey, entry.id, { title: event.target.value })
                    }
                    aria-label={`${libraryLabels[activeLibraryKey]}标题`}
                  />
                  <textarea
                    value={entry.body}
                    onChange={(event) =>
                      updateLibraryEntry(activeLibraryKey, entry.id, { body: event.target.value })
                    }
                    aria-label={`${entry.title}内容`}
                  />
                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => deleteLibraryEntry(activeLibraryKey, entry.id)}
                  >
                    删除
                  </button>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
