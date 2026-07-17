import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { models, getAPIConfig } from '@/lib/config'
import { checkAppOwnerPermission } from '@/lib/permissions'
import * as Sentry from '@sentry/nextjs'
import { buildGenerationMessages } from '@/lib/generation-prompts'

// Next.js Route Segment Config
// This is a streaming endpoint, so we need edge-compatible settings
export const runtime = 'nodejs' // Use Node.js runtime for Supabase and streaming
export const dynamic = 'force-dynamic' // Always fresh data, no caching for generation requests
export const maxDuration = 900

// Keep the demo responsive when a reasoning model spends tokens before emitting HTML.
const GENERATION_MAX_TOKENS = 16384

/**
 * POST /api/apps/[id]/generate
 * 流式生成 HTML（SSE）- 直接透传 Novita API 的原始 SSE 流
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const { slot, temperature } = body

  if (!slot || !['a', 'b'].includes(slot)) {
    return new Response(JSON.stringify({ error: 'Invalid slot parameter. Must be "a" or "b"' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabase = await createClient()
  const adminClient = await createAdminClient()

  // 获取 App
  const { data: app, error } = await adminClient.from('apps').select('*').eq('id', id).single()

  if (error || !app) {
    return new Response(JSON.stringify({ error: 'App not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // 获取当前用户（用于权限检查）
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 权限检查：只有作者或匿名创建者可以生成
  const { canAccess } = await checkAppOwnerPermission(user, app)

  if (!canAccess) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const modelId = app.model_a
  if (!models.some(model => model.id === modelId)) {
    return new Response(JSON.stringify({ error: 'The app has an invalid model.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // 创建 AbortController，用于在前端断开连接时取消 Novita API 请求
  const abortController = new AbortController()

  // 监听前端请求中断
  request.signal.addEventListener('abort', () => {
    abortController.abort()
  })

  // Get API configuration based on model
  const apiConfig = getAPIConfig(modelId)

  // Kimi K2.5 only supports temperature 0.6
  const isKimiK25 = modelId === 'moonshotai/kimi-k2.5'
  const finalTemperature = isKimiK25
    ? 0.6
    : Number.isNaN(Number(temperature))
      ? 0.7
      : Number(temperature) < 0
        ? 0
        : Number(temperature) > 2
          ? 2
          : Number(temperature)

  const messages = buildGenerationMessages(slot, app.prompt)

  const span = Sentry.startInactiveSpan({
    op: 'gen_ai.request',
    name: `chat ${modelId}`,
    attributes: {
      'gen_ai.request.model': modelId,
      'gen_ai.request.temperature': finalTemperature,
      'gen_ai.request.max_tokens': GENERATION_MAX_TOKENS,
      'gen_ai.request.stream': true,
      'gen_ai.system': 'novita',
      'gen_ai.api.endpoint': apiConfig.url,
      'gen_ai.request.messages': JSON.stringify(
        messages.map(m => ({ role: m.role, content: m.content?.substring(0, 100) }))
      ),
    },
  })

  const response = await fetch(apiConfig.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiConfig.apiKey}`,
    },
    body: JSON.stringify({
      model: apiConfig.modelId,
      messages,
      temperature: finalTemperature,
      max_tokens: GENERATION_MAX_TOKENS,
      stream: true,
      ...(modelId === 'zai-org/glm-5.2' ? { thinking: { type: 'disabled' } } : {}),
      // separate_reasoning: true,
    }),
    signal: abortController.signal,
  })

  if (!response.ok) {
    const errorText = await response.text()
    span?.setStatus({
      code: 2,
      message: `API error: ${response.status} ${errorText}`,
    })
    span?.end()
    return new Response(JSON.stringify({ error: 'API error', message: errorText }), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Create a TransformStream to intercept and parse SSE data for Sentry
  const responseTexts: string[] = []
  let inputTokens = 0
  let outputTokens = 0
  const decoder = new TextDecoder()
  let buffer = ''

  const { readable, writable } = new TransformStream({
    transform(chunk, controller) {
      controller.enqueue(chunk)

      try {
        const text = decoder.decode(chunk, { stream: true })
        buffer += text

        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)

              if (parsed.choices?.[0]?.delta?.content) {
                responseTexts.push(parsed.choices[0].delta.content)
              }

              if (parsed.usage) {
                inputTokens = parsed.usage.prompt_tokens || 0
                outputTokens = parsed.usage.completion_tokens || 0
              }
            } catch {
              // Silently ignore JSON parse errors - monitoring should never fail the request
            }
          }
        }
      } catch {
        // Silently ignore all monitoring errors - user experience is paramount
      }
    },
    flush() {
      try {
        const fullResponse = responseTexts.join('')
        if (fullResponse) {
          span?.setAttribute('gen_ai.response.text', JSON.stringify([fullResponse]))
        }
        if (inputTokens > 0) {
          span?.setAttribute('gen_ai.usage.input_tokens', inputTokens)
        }
        if (outputTokens > 0) {
          span?.setAttribute('gen_ai.usage.output_tokens', outputTokens)
        }
        span?.setStatus({ code: 1 })
        span?.end()
      } catch {
        span?.end()
      }
    },
  })

  response.body?.pipeTo(writable).catch(() => {
    try {
      span?.end()
    } catch {
      // Ignore span cleanup errors
    }
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
