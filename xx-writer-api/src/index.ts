export interface Env {
  DEEPSEEK_API_KEY: string
  ALLOWED_ORIGIN: string
  DB: D1Database
  SESSIONS: KVNamespace
}

const ALLOWED_ORIGINS = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://xx-writer.pages.dev',
])

const SESSION_TTL = 60 * 60 * 24 * 30 // 30天

function cors(req: Request, env: Env): Record<string, string> {
  const origin = req.headers.get('Origin') ?? ''
  const allowed = ALLOWED_ORIGINS.has(origin) || env.ALLOWED_ORIGIN === origin
    ? origin
    : ALLOWED_ORIGINS.values().next().value!
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

function json(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return Response.json(data, { status, headers })
}

// Web Crypto: hash password with PBKDF2
async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    key, 256
  )
  const hashArr = new Uint8Array(bits)
  const toHex = (b: Uint8Array) => Array.from(b).map(x => x.toString(16).padStart(2, '0')).join('')
  return `${toHex(salt)}:${toHex(hashArr)}`
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(':')
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map(h => parseInt(h, 16)))
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    key, 256
  )
  const computed = Array.from(new Uint8Array(bits)).map(x => x.toString(16).padStart(2, '0')).join('')
  return computed === hashHex
}

async function getSession(req: Request, env: Env): Promise<{ userId: number; email: string } | null> {
  const auth = req.headers.get('Authorization') ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return null
  const val = await env.SESSIONS.get(token)
  return val ? JSON.parse(val) : null
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const h = cors(req, env)

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: h })

    const url = new URL(req.url)

    // POST /api/auth/register
    if (url.pathname === '/api/auth/register' && req.method === 'POST') {
      const { email, password } = await req.json<{ email: string; password: string }>()
      if (!email || !password || password.length < 6)
        return json({ error: '邮箱或密码无效（密码至少6位）' }, 400, h)

      const exists = await env.DB.prepare('SELECT id FROM users WHERE email=?').bind(email).first()
      if (exists) return json({ error: '该邮箱已注册' }, 409, h)

      const hash = await hashPassword(password)
      const result = await env.DB.prepare('INSERT INTO users (email,password_hash) VALUES (?,?)').bind(email, hash).run()
      const userId = result.meta.last_row_id as number

      const token = crypto.randomUUID()
      await env.SESSIONS.put(token, JSON.stringify({ userId, email }), { expirationTtl: SESSION_TTL })
      return json({ token, email }, 201, h)
    }

    // POST /api/auth/login
    if (url.pathname === '/api/auth/login' && req.method === 'POST') {
      const { email, password } = await req.json<{ email: string; password: string }>()
      const user = await env.DB.prepare('SELECT id,password_hash FROM users WHERE email=?').bind(email).first<{ id: number; password_hash: string }>()
      if (!user || !(await verifyPassword(password, user.password_hash)))
        return json({ error: '邮箱或密码错误' }, 401, h)

      const token = crypto.randomUUID()
      await env.SESSIONS.put(token, JSON.stringify({ userId: user.id, email }), { expirationTtl: SESSION_TTL })
      return json({ token, email }, 200, h)
    }

    // POST /api/auth/logout
    if (url.pathname === '/api/auth/logout' && req.method === 'POST') {
      const auth = req.headers.get('Authorization') ?? ''
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
      if (token) await env.SESSIONS.delete(token)
      return json({ ok: true }, 200, h)
    }

    // GET /api/auth/me
    if (url.pathname === '/api/auth/me') {
      const session = await getSession(req, env)
      if (!session) return json({ error: '未登录' }, 401, h)
      return json({ email: session.email }, 200, h)
    }

    // GET /api/health
    if (url.pathname === '/api/health') {
      return json({ ok: true, model: 'deepseek-chat', providerConfigured: Boolean(env.DEEPSEEK_API_KEY) }, 200, h)
    }

    // POST /api/ai/chat
    if (url.pathname === '/api/ai/chat' && req.method === 'POST') {
      const session = await getSession(req, env)
      if (!session) return json({ error: '请先登录' }, 401, h)

      if (!env.DEEPSEEK_API_KEY)
        return json({ error: '未配置 DEEPSEEK_API_KEY' }, 503, h)

      const body = await req.json<{
        taskTitle: string; taskDescription: string; userPrompt: string; context: string
      }>()

      const systemPrompt = `你是一名专业的中文小说写作助手，擅长各种题材的长篇小说创作。
任务：${body.taskTitle}
任务说明：${body.taskDescription}

以下是当前作品的上下文信息：
${body.context}`

      const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          max_tokens: 2048,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: body.userPrompt },
          ],
        }),
      })

      if (!resp.ok) {
        const err = await resp.json<{ error?: { message?: string } }>()
        return json({ error: err.error?.message ?? `DeepSeek API 错误 ${resp.status}` }, resp.status, h)
      }

      const data = await resp.json<{ choices: Array<{ message: { content: string } }> }>()
      const content = data.choices[0]?.message?.content ?? ''
      return json({ content }, 200, h)
    }

    return json({ error: '404 Not Found' }, 404, h)
  },
}
