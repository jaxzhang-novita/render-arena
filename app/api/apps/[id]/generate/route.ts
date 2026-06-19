import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  models,
  ANONYMOUS_QUOTA,
  AUTHENTICATED_QUOTA,
  PAID_QUOTA,
  getAPIConfig,
} from '@/lib/config'
import { getFreeTierDisabled, getAllGenerationDisabled } from '@/lib/dynamic-config'
import { checkAppOwnerPermission, isPaidUser } from '@/lib/permissions'
import { getNovitaBalance } from '@/lib/novita'
import * as Sentry from '@sentry/nextjs'

// Next.js Route Segment Config
// This is a streaming endpoint, so we need edge-compatible settings
export const runtime = 'nodejs' // Use Node.js runtime for Supabase and streaming
export const dynamic = 'force-dynamic' // Always fresh data, no caching for generation requests

function getClientIP(request: NextRequest): string {
  const headersList = request.headers

  const forwardedFor = headersList.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIP = headersList.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  return '127.0.0.1'
}

function getQuotaLimit(isAuthenticated: boolean, isPaid: boolean): number {
  if (!isAuthenticated) {
    return ANONYMOUS_QUOTA
  }
  if (isPaid) {
    return PAID_QUOTA
  }
  return AUTHENTICATED_QUOTA
}

async function incrementQuota(
  adminClient: Awaited<ReturnType<typeof createAdminClient>>,
  identifier: string
) {
  // Use atomic SQL function to prevent race conditions
  const { error } = await adminClient.rpc('increment_quota', {
    iden: identifier,
  })

  if (error) {
    console.error('Failed to increment quota:', error)
    throw new Error(`Failed to increment quota: ${error.message}`)
  }
}

/**
 * POST /api/apps/[id]/generate
 * 流式生成 HTML（SSE）- 直接透传 Novita API 的原始 SSE 流
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const { slot, model: modelIdParam, temperature } = body

  if (!slot || !['a', 'b'].includes(slot)) {
    return new Response(JSON.stringify({ error: 'Invalid slot parameter. Must be "a" or "b"' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabase = await createClient()
  const adminClient = await createAdminClient()

  const clientIP = getClientIP(request)

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

  let quotaLimit: number
  let novitaBalance: number | null = null
  let identifier: string
  let isPaid = false

  if (user) {
    novitaBalance = await getNovitaBalance()
    isPaid = await isPaidUser(novitaBalance)
    quotaLimit = getQuotaLimit(true, isPaid)
    identifier = user.id
  } else {
    quotaLimit = getQuotaLimit(false, false)
    identifier = clientIP
  }

  const allGenerationDisabled = await getAllGenerationDisabled()
  if (allGenerationDisabled) {
    return new Response(
      JSON.stringify({
        error: 'ALL_GENERATION_DISABLED',
        message:
          'Due to high demand, our service is temporarily paused. We&apos;ll be back online soon!',
      }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const freeTierDisabled = await getFreeTierDisabled()
  if (freeTierDisabled) {
    if (!isPaid) {
      const message = user
        ? 'Due to high demand, free access is temporarily limited. Add balance to get instant access.'
        : 'Due to high demand, anonymous access is temporarily paused. Log in and add balance to continue.'

      return new Response(JSON.stringify({ error: 'FREE_TIER_DISABLED', message }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  const { data: quotaData } = await adminClient
    .from('generation_quotas')
    .select('*')
    .eq('identifier', identifier)
    .single()

  const usedCount = quotaData?.used_count || 0

  if (usedCount >= quotaLimit) {
    let error, message
    if (!user) {
      error = 'QUOTA_EXCEEDED_T0'
      message = `You have reached your generation limit (${usedCount}/${quotaLimit}). Log in to continue.`
    } else if (!isPaid) {
      error = 'QUOTA_EXCEEDED_T1'
      message = `You have reached your generation limit (${usedCount}/${quotaLimit}). Add balance or subscribe to get more generations.`
    } else {
      error = 'QUOTA_EXCEEDED_T2'
      message = `You have reached your paid generation limit (${usedCount}/${quotaLimit}). Need more? Contact us to increase your limit.`
    }
    return new Response(JSON.stringify({ error, message }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let modelId = slot === 'a' ? app.model_a : app.model_b

  // 如果传入了 specific model (id)，验证并使用
  if (modelIdParam) {
    const isAllowed = models.some(m => m.id === modelIdParam)
    if (!isAllowed) {
      return new Response(
        JSON.stringify({ error: 'Invalid model. Must be one of the allowed models.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 如果模型ID发生了变化，更新数据库
    if (modelId !== modelIdParam) {
      const updateField = slot === 'a' ? 'model_a' : 'model_b'
      await adminClient
        .from('apps')
        .update({ [updateField]: modelIdParam })
        .eq('id', id)

      modelId = modelIdParam
    }
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

  const messages = [
    {
      role: 'system',
      content: `You are an expert web developer. Generate a self-contained HTML file based on the user's prompt. The HTML will run in a sandboxed iframe (allow-scripts, allow-forms). Do not use localStorage, sessionStorage, or cookies.`,
    },
    { role: 'user', content: app.prompt },
  ]

  const span = Sentry.startInactiveSpan({
    op: 'gen_ai.request',
    name: `chat ${modelId}`,
    attributes: {
      'gen_ai.request.model': modelId,
      'gen_ai.request.temperature': finalTemperature,
      'gen_ai.request.max_tokens': 32000,
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
      max_tokens: 32000,
      stream: true,
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

  incrementQuota(adminClient, identifier)

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
