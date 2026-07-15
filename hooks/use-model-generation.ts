import { useState, useRef, useCallback } from 'react'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { extractHTMLFromMarkdown } from '@/lib/html-extractor'
import { LLMModel, getModelById, models } from '@/lib/models'
import { showToast } from '@/lib/toast'

/**
 * API 错误接口
 */
interface ApiErrorData {
  error: string
  message: string
}

/**
 * 自定义 API 错误类
 * 用于携带结构化的错误信息
 */
class ApiError extends Error {
  public readonly code: string
  public readonly isApiError = true as const

  constructor(data: ApiErrorData) {
    super(data.message)
    this.name = 'ApiError'
    this.code = data.error
  }

  // 判断是否为配额/层级相关错误
  isQuotaOrTierError(): boolean {
    return [
      'QUOTA_EXCEEDED_T0',
      'QUOTA_EXCEEDED_T1',
      'QUOTA_EXCEEDED_T2',
      'FREE_TIER_DISABLED',
      'ALL_GENERATION_DISABLED',
    ].includes(this.code)
  }
}

/**
 * 模型响应状态
 */
export interface ModelResponse {
  content: string
  reasoning?: string
  loading: boolean
  completed: boolean
  html?: string
  tokens?: number
  outputTokens?: number
  duration?: number
  startTime?: number
}

/**
 * 模型设置
 */
export interface ModelSettings {
  temperature: number
}

/**
 * 初始响应状态
 */
export const initialModelResponse: ModelResponse = {
  content: '',
  reasoning: '',
  loading: false,
  completed: false,
}

/**
 * 初始模型设置
 */
export const initialModelSettings: ModelSettings = {
  temperature: 0.7,
}

export type ViewMode = 'code' | 'preview'
export type ModelSlot = 'a' | 'b'

interface UseModelGenerationOptions {
  /** 模型槽位 (a 或 b) */
  slot: ModelSlot
  /** 初始模型 ID */
  initialModelId?: string
  /** 默认模型 ID（如果初始模型 ID 无效） */
  defaultModelId?: string
  /** 初始 HTML 内容 */
  initialHtml?: string
  /** 初始生成时间 */
  initialDuration?: number
  /** 初始 token 数 */
  initialTokens?: number
  /** 当生成完成时的回调，用于协调另一个模型 */
  onGenerationComplete?: (html: string | undefined) => void
}

interface UseModelGenerationReturn {
  /** 当前选中的模型 */
  selectedModel: LLMModel
  /** 设置选中的模型 */
  setSelectedModel: (model: LLMModel) => void
  /** 模型响应状态 */
  response: ModelResponse
  /** 设置响应状态 */
  setResponse: React.Dispatch<React.SetStateAction<ModelResponse>>
  /** 响应状态的 ref（用于避免闭包陷阱） */
  responseRef: React.RefObject<ModelResponse>
  /** 当前视图模式 */
  viewMode: ViewMode
  /** 设置视图模式 */
  setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>
  /** 模型设置 */
  settings: ModelSettings
  /** 设置模型设置 */
  setSettings: React.Dispatch<React.SetStateAction<ModelSettings>>
  /** 生成内容 */
  generate: (appId: string) => Promise<void>
  /** 停止生成 */
  stop: () => void
  /** 是否正在加载 */
  isLoading: boolean
}

/**
 * 单个模型生成的 Hook
 *
 * 封装了单个模型的所有状态和生成逻辑
 */
export function useModelGeneration({
  slot,
  initialModelId,
  defaultModelId,
  initialHtml,
  initialDuration,
  initialTokens,
  onGenerationComplete,
}: UseModelGenerationOptions): UseModelGenerationReturn {
  // 获取初始模型
  const getInitialModel = (): LLMModel => {
    const targetId = initialModelId || defaultModelId
    if (targetId) {
      const model = getModelById(targetId)
      if (model) return model
    }
    return models[0]
  }

  // 模型选择状态
  const [selectedModel, setSelectedModel] = useState<LLMModel>(getInitialModel)

  // 响应状态
  const [response, setResponse] = useState<ModelResponse>({
    ...initialModelResponse,
    content: initialHtml ? `\`\`\`html\n${initialHtml}\n\`\`\`` : '',
    html: initialHtml || undefined,
    completed: !!initialHtml,
    duration: initialDuration,
    tokens: initialTokens,
  })

  // 视图模式
  const [viewMode, setViewMode] = useState<ViewMode>(initialHtml ? 'preview' : 'code')

  // 模型设置
  const [settings, setSettings] = useState<ModelSettings>(initialModelSettings)

  // 响应状态的 ref（避免闭包陷阱）
  const responseRef = useRef(response)
  responseRef.current = response

  // Token 缓冲（用于批量更新，避免每个 token 都触发渲染）
  const contentBufferRef = useRef('')
  const reasoningBufferRef = useRef('')
  const flushIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // AbortController 用于中断请求
  const abortControllerRef = useRef<AbortController | null>(null)

  // 刷新缓冲区到状态（批量更新）
  const flushBuffer = useCallback(() => {
    const contentDelta = contentBufferRef.current
    const reasoningDelta = reasoningBufferRef.current

    if (contentDelta || reasoningDelta) {
      setResponse(prev => ({
        ...prev,
        content: prev.content + contentDelta,
        reasoning: (prev.reasoning || '') + reasoningDelta,
      }))
      contentBufferRef.current = ''
      reasoningBufferRef.current = ''
    }
  }, [])

  // 停止生成
  const stop = useCallback(() => {
    // 停止批量更新定时器
    if (flushIntervalRef.current) {
      clearInterval(flushIntervalRef.current)
      flushIntervalRef.current = null
    }
    // 最后一次刷新确保所有内容都被渲染
    flushBuffer()

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }

    setResponse(prev => {
      if (prev.loading) {
        const duration = prev.startTime ? (Date.now() - prev.startTime) / 1000 : undefined
        const tokens = Math.floor(prev.content.length / 4)
        return { ...prev, loading: false, completed: true, duration, tokens }
      }
      return prev
    })
  }, [flushBuffer])

  // 生成内容
  const generate = useCallback(
    async (appId: string) => {
      const startTime = Date.now()

      // 停止之前的生成
      stop()

      // 创建新的 AbortController
      abortControllerRef.current = new AbortController()
      const signal = abortControllerRef.current.signal

      // 切换到代码视图并重置状态
      setViewMode('code')
      setResponse({ content: '', reasoning: '', loading: true, completed: false, startTime })

      // 重置缓冲区
      contentBufferRef.current = ''
      reasoningBufferRef.current = ''

      // 启动批量更新定时器（每 50ms 刷新一次，即每秒最多 20 次渲染）
      if (flushIntervalRef.current) {
        clearInterval(flushIntervalRef.current)
      }
      flushIntervalRef.current = setInterval(flushBuffer, 50)

      try {
        await fetchEventSource(`/api/apps/${appId}/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            slot,
            temperature: settings.temperature,
          }),
          openWhenHidden: true,
          signal,
          onopen: async res => {
            if (!res.ok) {
              const errorText = await res.text()
              try {
                const errorData: ApiErrorData = JSON.parse(errorText)
                if (errorData.error) {
                  throw new ApiError(errorData)
                }
              } catch (err) {
                if (err instanceof ApiError) {
                  throw err
                }
                throw new Error(`HTTP error: ${res.status} ${errorText}`)
              }
            }
          },
          onmessage: msg => {
            if (msg.data === '[DONE]') {
              return
            }

            try {
              const data = JSON.parse(msg.data)
              const delta = data.choices?.[0]?.delta

              if (delta) {
                // 只更新缓冲区，不触发渲染（由定时器批量刷新）
                contentBufferRef.current += delta.content || ''
                reasoningBufferRef.current += delta.reasoning_content || ''
              }

              // 接收 usage 信息（只保存输出 token）
              if (data.usage) {
                const outputTokens = data.usage.completion_tokens || 0
                setResponse(prev => ({
                  ...prev,
                  outputTokens,
                  tokens: outputTokens,
                }))
              }
            } catch {
              // Ignore parsing errors
            }
          },
          onerror: error => {
            throw error
          },
          onclose: () => {
            // 停止定时器并最后一次刷新
            if (flushIntervalRef.current) {
              clearInterval(flushIntervalRef.current)
              flushIntervalRef.current = null
            }
            // 确保所有缓冲内容都被刷新
            const finalContent = contentBufferRef.current
            const finalReasoning = reasoningBufferRef.current
            contentBufferRef.current = ''
            reasoningBufferRef.current = ''

            setResponse(prev => {
              // 合并最后的缓冲内容
              const mergedContent = prev.content + finalContent
              const mergedReasoning = (prev.reasoning || '') + finalReasoning
              const html = extractHTMLFromMarkdown(mergedContent)
              const duration = (Date.now() - startTime) / 1000
              // 使用实际的 token 数据，如果没有则回退到估算
              const tokens = prev.tokens || Math.floor(mergedContent.length / 3)
              const outputTokens = prev.outputTokens || tokens

              // 如果当前模型生成了 HTML，则切换到预览模式
              if (html) {
                setViewMode('preview')
              }

              // 通知生成完成
              onGenerationComplete?.(html || undefined)

              return {
                ...prev,
                content: mergedContent,
                reasoning: mergedReasoning,
                loading: false,
                completed: true,
                html: html || undefined,
                duration,
                tokens,
                outputTokens,
              }
            })
          },
        })
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          setResponse(prev => {
            const duration = prev.startTime ? (Date.now() - prev.startTime) / 1000 : undefined
            const tokens = Math.floor(prev.content.length / 4)
            return { ...prev, loading: false, completed: true, duration, tokens }
          })
          return
        }

        console.error(`Model ${slot} error:`, error)

        const err = error as Error & { isApiError?: true; code?: string }
        const isApiError = err.isApiError === true && err.code !== undefined

        if (isApiError) {
          const apiError = err as ApiError
          const errorCode = apiError.code
          const errorMessage = apiError.message

          if (errorCode === 'QUOTA_EXCEEDED_T0') {
            showToast.quotaExceeded(errorMessage, 'T0')
          } else if (errorCode === 'QUOTA_EXCEEDED_T1') {
            showToast.quotaExceeded(errorMessage, 'T1')
          } else if (errorCode === 'QUOTA_EXCEEDED_T2') {
            showToast.quotaExceeded(errorMessage, 'T2')
          } else if (errorCode === 'FREE_TIER_DISABLED') {
            const isAuthenticated = errorMessage.includes('free tier access')
            showToast.freeTierDisabled(errorMessage, isAuthenticated)
          } else if (errorCode === 'ALL_GENERATION_DISABLED') {
            showToast.allGenerationDisabled(errorMessage)
          } else {
            showToast.error(errorMessage || 'Generation failed. Please try again.')
          }
        } else {
          showToast.error('Network error. Please try again.')
        }

        setResponse(prev => ({
          ...prev,
          content: prev.content + '\n\nError: ' + (err.message || 'Generation failed'),
          loading: false,
          completed: true,
        }))
      }
    },
    [stop, flushBuffer, slot, settings.temperature, onGenerationComplete]
  )

  return {
    selectedModel,
    setSelectedModel,
    response,
    setResponse,
    responseRef,
    viewMode,
    setViewMode,
    settings,
    setSettings,
    generate,
    stop,
    isLoading: response.loading,
  }
}
