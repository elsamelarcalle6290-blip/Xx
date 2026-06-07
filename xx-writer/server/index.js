import http from 'node:http'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnvFile() {
  const envPath = resolve(process.cwd(), '.env')

  if (!existsSync(envPath)) {
    return
  }

  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/)

  for (const line of lines) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const separatorIndex = trimmed.indexOf('=')

    if (separatorIndex === -1) {
      continue
    }

    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, '')

    if (key && process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

loadEnvFile()

const PORT = Number(process.env.PORT ?? 8787)
const OPENAI_BASE_URL = (process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1').replace(/\/+$/, '')
const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? ''
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4.1-mini'
const MAX_BODY_SIZE = 900_000

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
  })
  response.end(JSON.stringify(payload))
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = ''

    request.on('data', (chunk) => {
      body += chunk

      if (body.length > MAX_BODY_SIZE) {
        reject(new Error('请求内容过大'))
        request.destroy()
      }
    })

    request.on('end', () => resolve(body))
    request.on('error', reject)
  })
}

async function handleAiChat(request, response) {
  if (!OPENAI_API_KEY) {
    sendJson(response, 500, { error: '服务端未配置 OPENAI_API_KEY' })
    return
  }

  let payload

  try {
    payload = JSON.parse(await readBody(request))
  } catch {
    sendJson(response, 400, { error: '请求 JSON 无法解析' })
    return
  }

  const taskTitle = String(payload.taskTitle ?? '').trim()
  const taskDescription = String(payload.taskDescription ?? '').trim()
  const userPrompt = String(payload.userPrompt ?? '').trim()
  const context = String(payload.context ?? '').trim()

  if (!userPrompt) {
    sendJson(response, 400, { error: '缺少用户写作要求' })
    return
  }

  const upstream = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.75,
      messages: [
        {
          role: 'system',
          content:
            '你是面向长篇小说创作的软件助手。必须严格尊重已有大纲、人物状态、世界观、时间线和伏笔，不擅自引入破坏连续性的设定。输出自然中文，少解释，多给可直接放入小说项目的内容。',
        },
        {
          role: 'user',
          content: `当前任务：${taskTitle}\n任务说明：${taskDescription}\n\n用户要求：${userPrompt}\n\n项目上下文：\n${context}`,
        },
      ],
    }),
  })

  if (!upstream.ok) {
    const details = await upstream.text()
    sendJson(response, upstream.status, { error: details || `上游模型请求失败：${upstream.status}` })
    return
  }

  const data = await upstream.json()
  const content = data?.choices?.[0]?.message?.content?.trim()

  if (!content) {
    sendJson(response, 502, { error: '上游模型没有返回正文内容' })
    return
  }

  sendJson(response, 200, { content })
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {})
    return
  }

  if (request.method === 'GET' && request.url === '/api/health') {
    sendJson(response, 200, {
      ok: true,
      model: OPENAI_MODEL,
      providerConfigured: Boolean(OPENAI_API_KEY),
    })
    return
  }

  if (request.method === 'POST' && request.url === '/api/ai/chat') {
    try {
      await handleAiChat(request, response)
    } catch (error) {
      sendJson(response, 500, {
        error: error instanceof Error ? error.message : '服务端处理失败',
      })
    }
    return
  }

  sendJson(response, 404, { error: '接口不存在' })
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Xx Writer AI gateway listening on http://127.0.0.1:${PORT}`)
})
