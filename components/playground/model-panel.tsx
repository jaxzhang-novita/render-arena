'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/base/button'
import { Tooltip } from '@base-ui/react/tooltip'
import { Maximize, RotateCcw, DollarSign, Clock, Code2, Eye, MessageSquareText } from 'lucide-react'
import { HarnessSelector } from '@/components/base/harness-selector'
import { ModelSettingsPopover } from '@/components/playground/model-settings-modal'
import { StreamingCodeDisplay } from '@/components/playground/streaming-code-display'
import { cn } from '@/lib/utils'
import { LLMModel } from '@/lib/config'
import type { AgentHarness } from '@/lib/agent-comparison'
import { ModelResponse, ModelSettings, ViewMode } from '@/hooks/use-model-generation'
import { calculateTokensAndCost } from '@/lib/pricing'

// Re-export types for convenience
export type { ModelResponse, ModelSettings, ViewMode }

interface ModelPanelProps {
  /** 当前选中的模型 */
  selectedModel: LLMModel
  /** 固定的执行 profile */
  profile: 'direct' | 'agent'
  /** Agent 侧展示的 harness */
  agentHarness: AgentHarness
  /** Agent harness 变更回调 */
  onAgentHarnessChange: (harness: AgentHarness) => void
  /** 生成开始后锁定 harness */
  configurationLocked: boolean
  /** 模型响应状态 */
  response: ModelResponse
  /** 更新响应状态 */
  onResponseChange: (updater: (prev: ModelResponse) => ModelResponse) => void
  /** 当前视图模式 (code/preview) */
  viewMode: ViewMode
  /** 视图模式变更回调 */
  onViewModeChange: (mode: ViewMode) => void
  /** 模型设置 */
  settings: ModelSettings
  /** 设置变更回调 */
  onSettingsChange: (settings: ModelSettings) => void
  /** 重新生成回调 */
  onRegenerate: () => void
  /** 最大化/恢复回调 */
  onToggleMaximize: () => void
  /** 是否显示右边框 */
  showRightBorder?: boolean
  /** 自定义类名 */
  className?: string
  /** 滚动到底部按钮的位置 */
  scrollButtonPosition?: 'left' | 'right'
}

export function ModelPanel({
  selectedModel,
  profile,
  agentHarness,
  onAgentHarnessChange,
  configurationLocked,
  response,
  onResponseChange,
  viewMode,
  onViewModeChange,
  settings,
  onSettingsChange,
  onRegenerate,
  onToggleMaximize,
  showRightBorder = false,
  className,
  scrollButtonPosition = 'right',
}: ModelPanelProps) {
  const [currentTime, setCurrentTime] = useState(0)

  // Update current time during generation
  useEffect(() => {
    if (!response.loading || !response.startTime) return

    const updateTime = () => {
      setCurrentTime((Date.now() - response.startTime!) / 1000)
    }

    updateTime()
    const interval = setInterval(updateTime, 100)

    return () => clearInterval(interval)
  }, [response.loading, response.startTime])

  // Use duration when not loading
  const displayTime = response.loading ? currentTime : response.duration || 0

  // Calculate tokens - estimate from content if no token data available
  const actualTokens = response.outputTokens ?? response.tokens
  const estimatedTokens = actualTokens
    ? actualTokens
    : response.content
      ? Math.ceil(response.content.length / 3) // Rough estimation: ~3.5 chars per token
      : null

  const { tokens, cost } = calculateTokensAndCost(estimatedTokens, selectedModel.id)

  return (
    <div
      className={cn(
        'relative flex flex-col overflow-hidden bg-white',
        showRightBorder && 'border-b border-[#f4f4f5] md:border-r md:border-b-0',
        className
      )}
    >
      {/* Header */}
      <div className="flex min-h-16 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[#e7e6e2] bg-white px-2 py-2 md:px-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex min-w-0 flex-col items-start gap-0.5">
            {profile === 'direct' ? (
              <div className="inline-flex h-8 items-center gap-2 px-1 text-[15px] font-semibold text-[#292827]">
                <MessageSquareText className="size-4 text-[#6b7280]" />
                Direct
              </div>
            ) : (
              <HarnessSelector
                selectedHarness={agentHarness}
                onHarnessChange={onAgentHarnessChange}
                disabled={configurationLocked}
                showAgentLabel={false}
                className="w-[180px] max-w-full"
              />
            )}
          </div>

          {/* Status Indicator - neutral real-time metrics */}
          {response.loading || (response.completed && response.tokens) ? (
            <div className="hidden items-center gap-2 xl:flex">
              {response.loading && (
                <div className="size-4 animate-spin rounded-full border-2 border-[#23d57c] border-t-transparent" />
              )}

              {/* Cost Badge with Tooltip */}
              {cost !== null && (
                <Tooltip.Root>
                  <Tooltip.Trigger
                    delay={100}
                    className="inline-flex cursor-default items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-sm font-semibold text-green-700 ring-1 ring-green-700/10 transition-colors ring-inset hover:bg-green-100"
                  >
                    <DollarSign className="size-3.5" />
                    <span>{cost.toFixed(4)}</span>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Positioner sideOffset={8}>
                      <Tooltip.Popup className="z-50 min-w-[180px] rounded-lg border border-[#e7e6e2] bg-white p-2 shadow-lg">
                        <div className="flex flex-col gap-1.5 text-sm">
                          {selectedModel.inputPrice !== undefined && (
                            <div className="flex items-center justify-between">
                              <span className="text-[#666]">Input Price</span>
                              <span className="font-medium text-[#292827]">
                                ${selectedModel.inputPrice}/Mt
                              </span>
                            </div>
                          )}
                          {selectedModel.outputPrice !== undefined && (
                            <div className="flex items-center justify-between">
                              <span className="text-[#666]">Output Price</span>
                              <span className="font-medium text-[#292827]">
                                ${selectedModel.outputPrice}/Mt
                              </span>
                            </div>
                          )}
                        </div>
                      </Tooltip.Popup>
                    </Tooltip.Positioner>
                  </Tooltip.Portal>
                </Tooltip.Root>
              )}

              {/* Duration Badge */}
              <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-sm font-semibold text-blue-700 ring-1 ring-blue-700/10 ring-inset">
                <Clock className="size-3.5" />
                <span>{displayTime.toFixed(1)}s</span>
              </span>

              {/* Token Badge - De-emphasized */}
              {tokens !== null && (
                <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-sm font-semibold text-gray-600 ring-1 ring-gray-600/10 ring-inset">
                  <span>{tokens.toLocaleString()} tokens</span>
                </span>
              )}
            </div>
          ) : null}
        </div>

        {/* Actions */}
        <div className="ml-auto flex items-center">
          {/* View Mode Toggle */}
          <div className="mr-2 flex rounded-lg border border-[#e7e6e2] bg-[#f5f5f5] p-0.5">
            <button
              onClick={() => onViewModeChange('code')}
              className={cn(
                'cursor-pointer rounded-md px-2 py-1 transition-all',
                viewMode === 'code'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-[#666] hover:text-black'
              )}
              title="Code"
            >
              <Code2 className="size-4" />
            </button>
            <button
              onClick={() => onViewModeChange('preview')}
              disabled={response.loading}
              className={cn(
                'cursor-pointer rounded-md px-2 py-1 transition-all',
                viewMode === 'preview'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-[#666] hover:text-black',
                response.loading && 'cursor-not-allowed opacity-50'
              )}
              title="Preview"
            >
              <Eye className="size-4" />
            </button>
          </div>

          {/* Regenerate Button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'size-8 rounded-lg',
              response.completed ? 'hover:bg-muted/80 cursor-pointer' : 'cursor-not-allowed'
            )}
            onClick={onRegenerate}
            disabled={!response.completed}
            title="Retry generation"
          >
            <RotateCcw
              className={cn('size-4', response.completed ? 'text-[#9e9c98]' : 'text-gray-300')}
            />
          </Button>

          <ModelSettingsPopover settings={settings} onSettingsChange={onSettingsChange} />

          {/* Maximize Button */}
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-muted/80 size-8 cursor-pointer rounded-lg"
            onClick={onToggleMaximize}
          >
            <Maximize className="size-4 text-[#9e9c98]" />
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative flex-1 overflow-hidden">
        {/* Code View - 始终渲染，用 CSS 控制显示 */}
        <div className={cn('absolute inset-0', viewMode === 'code' ? 'block' : 'hidden')}>
          <StreamingCodeDisplay
            content={response.content}
            reasoning={response.reasoning}
            isStreaming={response.loading}
            scrollButtonPosition={scrollButtonPosition}
            onPreview={html => {
              onResponseChange(prev => ({ ...prev, html }))
              onViewModeChange('preview')
            }}
          />
        </div>

        {/* Preview View - 始终渲染，用 CSS 控制显示 */}
        <div className={cn('absolute inset-0', viewMode === 'preview' ? 'block' : 'hidden')}>
          {response.html ? (
            <iframe
              srcDoc={response.html}
              className="size-full border-0"
              title="Preview"
              sandbox="allow-scripts allow-forms"
              allow="accelerometer; autoplay; fullscreen; clipboard-write; web-share; encrypted-media; gyroscope;"
            />
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center">
              {response.loading ? 'Rendering HTML...' : 'No HTML available for preview.'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
