'use client'

import React, { useState, useEffect, useRef, useId } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/base/button'
import { ModelSelector } from '@/components/base/model-selector'
import { Textarea } from '@/components/base/textarea'
import { Video, ArrowUp, ArrowLeft, Eye, EyeOff, Square, RotateCcw, Share2 } from 'lucide-react'
import { showToast } from '@/lib/toast'
import { ShareModal } from '@/components/playground/share-modal'
import { UserAvatar } from '@/components/app/user-avatar'
import { FreeTierBanner } from '@/components/app/overwhelming-banner'
import { ModelPanel } from '@/components/playground/model-panel'
import { useArenaPlayground } from '@/hooks/use-arena-playground'
import { useScreenRecorder } from '@/hooks/use-screen-recorder'
import { useAuth } from '@/hooks/use-auth'
import { Tooltip } from '@base-ui/react/tooltip'
import { cn } from '@/lib/utils'
import type { App } from '@/types'

interface PlaygroundClientProps {
  initialApp?: App | null
  appId?: string
}

export default function PlaygroundClient({ initialApp, appId }: PlaygroundClientProps) {
  // 使用 Arena Playground Hook 管理核心逻辑
  const {
    currentAppId,
    prompt,
    setPrompt,
    selectedModel,
    setSelectedModel,
    agentHarness,
    setAgentHarness,
    isConfigurationLocked,
    arenaViewMode,
    setArenaViewMode,
    showInputBar,
    setShowInputBar,
    modelA,
    modelB,
    handleGenerate,
    handleGenerateModelA,
    handleGenerateModelB,
    stopAllGeneration,
    isAnyLoading,
    isAllCompleted,
  } = useArenaPlayground({ initialApp, appId })

  const { user, loading: authLoading } = useAuth()
  const recordTooltipId = useId()
  const shareTooltipId = useId()
  const isGuest = !authLoading && !user

  // 分享相关状态
  const [isAppPublished, setIsAppPublished] = useState(initialApp?.is_public ?? false)
  const [appCategory, setAppCategory] = useState<string | null>(initialApp?.category ?? null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareMode, setShareMode] = useState<'video' | 'poster'>('poster')
  const [recordedFormat, setRecordedFormat] = useState<'webm' | 'mp4' | null>(null)

  const searchParams = useSearchParams()
  const autoStart = searchParams.get('autoStart') === 'true'

  const hasAutoStartedRef = useRef(false)
  const handleGenerateRef = useRef(handleGenerate)
  const modelsReady = Boolean(selectedModel.id)

  // 更新 handleGenerateRef
  useEffect(() => {
    handleGenerateRef.current = handleGenerate
  }, [handleGenerate])

  useEffect(() => {
    if (currentAppId && currentAppId !== initialApp?.id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAppPublished(false)
      setAppCategory(null)
    }
  }, [currentAppId, initialApp])

  // 执行自动生成
  useEffect(() => {
    // 只有在从未自动开始过、需要自动开始、且没有初始 App（是新会话）、且模型都准备好时才执行
    if (autoStart && !hasAutoStartedRef.current && !initialApp && !currentAppId && modelsReady) {
      // 使用 setTimeout 确保在渲染完成后执行，并且错开即时更新
      const timer = setTimeout(() => {
        if (!hasAutoStartedRef.current) {
          hasAutoStartedRef.current = true
          handleGenerateRef.current(!!user)
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [autoStart, initialApp, currentAppId, modelsReady, user])

  // 屏幕录制
  const {
    isRecording,
    isRecordingSupported,
    recordedBlob,
    previewContainerRef,
    startRecording,
    stopRecording,
  } = useScreenRecorder({
    onRecordingComplete: (_, format) => {
      setRecordedFormat(format)
      setShareMode('video')
      setTimeout(() => setShowShareModal(true), 300)
    },
    onError: error => {
      console.error('Recording error:', error)
      showToast.error('Recording failed')
    },
  })

  const handleRecordToggle = async () => {
    if (!isRecordingSupported || isGuest || authLoading || !isAllCompleted) {
      return
    }
    if (isRecording) {
      stopRecording()
      setShowInputBar(true)
    } else {
      if (
        recordedBlob &&
        !window.confirm(
          'Starting a new recording will discard your previous recording. Do you want to continue?'
        )
      ) {
        return
      }
      setShowInputBar(false)
      await startRecording()
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <FreeTierBanner />
      <header className="z-30 flex min-h-16 shrink-0 items-center justify-between gap-2 border-b border-[#f3f4f6] bg-white px-2 py-2 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-muted/80 size-9 cursor-pointer rounded-full p-2"
            >
              <ArrowLeft className="size-5" />
            </Button>
          </Link>
          <h1 className="hidden shrink-0 font-sans text-[20px] font-semibold tracking-normal text-black lg:block">
            LLM API vs LLM Agent
          </h1>
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            disabled={isConfigurationLocked}
            variant="minimal"
            size="small"
            className="w-[150px] sm:w-[190px]"
          />
        </div>

        <div className="flex items-center gap-3">
          <Tooltip.Root>
            <Tooltip.Trigger
              id={recordTooltipId}
              delay={100}
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    'hover:text-primary hover:border-primary size-9 cursor-pointer rounded-lg border-[#e4e4e7] transition-colors',
                    !isRecordingSupported || isGuest || !isAllCompleted ? 'opacity-50' : ''
                  )}
                  onClick={handleRecordToggle}
                  title={
                    !isRecordingSupported
                      ? 'Browser not supported'
                      : isGuest || !isAllCompleted
                        ? undefined
                        : isRecording
                          ? 'Stop recording'
                          : 'Start recording'
                  }
                >
                  {isRecording ? (
                    <Square className="size-4 fill-red-500 text-red-500" />
                  ) : (
                    <Video className="size-4" />
                  )}
                </Button>
              }
            />
            {!isRecordingSupported || isGuest || (!isAllCompleted && !authLoading) ? (
              <Tooltip.Portal>
                <Tooltip.Positioner sideOffset={4}>
                  <Tooltip.Popup className="z-50 overflow-hidden rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-lg">
                    {!isRecordingSupported
                      ? 'Screen recording is not supported in this browser'
                      : isGuest
                        ? 'Log in to record'
                        : 'Please wait for generation to complete'}
                  </Tooltip.Popup>
                </Tooltip.Positioner>
              </Tooltip.Portal>
            ) : null}
          </Tooltip.Root>

          <Tooltip.Root>
            <Tooltip.Trigger
              id={shareTooltipId}
              delay={100}
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    'hover:text-primary hover:border-primary size-9 cursor-pointer rounded-lg border-[#e4e4e7] transition-colors',
                    isGuest || !isAllCompleted ? 'opacity-50' : ''
                  )}
                  title={isGuest || !isAllCompleted ? undefined : 'Share'}
                  onClick={() => {
                    if (!isAllCompleted) {
                      return
                    }
                    if (isGuest) {
                      showToast.login('Log in to share', 'publish')
                      return
                    }
                    if (recordedBlob) {
                      setShareMode('video')
                    } else {
                      setShareMode('poster')
                    }
                    setShowShareModal(true)
                  }}
                >
                  <Share2 className="size-4" />
                </Button>
              }
            />
            {isGuest || (!isAllCompleted && !authLoading) ? (
              <Tooltip.Portal>
                <Tooltip.Positioner sideOffset={4}>
                  <Tooltip.Popup className="z-50 overflow-hidden rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-lg">
                    {isGuest ? 'Log in to share' : 'Please wait for generation to complete'}
                  </Tooltip.Popup>
                </Tooltip.Positioner>
              </Tooltip.Portal>
            ) : null}
          </Tooltip.Root>

          <UserAvatar />
        </div>
      </header>

      <main ref={previewContainerRef} className="relative flex w-screen flex-1 overflow-hidden">
        <div className="flex w-full flex-1 flex-col md:flex-row">
          {arenaViewMode !== 'b' ? (
            <ModelPanel
              className={arenaViewMode === 'split' ? 'h-1/2 w-full md:h-auto md:w-1/2' : 'flex-1'}
              selectedModel={modelA.selectedModel}
              profile="direct"
              agentHarness={agentHarness}
              onAgentHarnessChange={setAgentHarness}
              configurationLocked={isConfigurationLocked}
              response={modelA.response}
              onResponseChange={modelA.setResponse}
              viewMode={modelA.viewMode}
              onViewModeChange={modelA.setViewMode}
              settings={modelA.settings}
              onSettingsChange={modelA.setSettings}
              onRegenerate={handleGenerateModelA}
              onToggleMaximize={() => setArenaViewMode(arenaViewMode === 'a' ? 'split' : 'a')}
              showRightBorder={arenaViewMode === 'split'}
              scrollButtonPosition={arenaViewMode === 'split' ? 'left' : 'right'}
            />
          ) : null}

          {arenaViewMode !== 'a' ? (
            <ModelPanel
              className={arenaViewMode === 'split' ? 'h-1/2 w-full md:h-auto md:w-1/2' : 'flex-1'}
              selectedModel={selectedModel}
              profile="agent"
              agentHarness={agentHarness}
              onAgentHarnessChange={setAgentHarness}
              configurationLocked={isConfigurationLocked}
              response={modelB.response}
              onResponseChange={modelB.setResponse}
              viewMode={modelB.viewMode}
              onViewModeChange={modelB.setViewMode}
              settings={modelB.settings}
              onSettingsChange={modelB.setSettings}
              onRegenerate={handleGenerateModelB}
              onToggleMaximize={() => setArenaViewMode(arenaViewMode === 'b' ? 'split' : 'b')}
            />
          ) : null}
        </div>

        {showInputBar && (
          <div className="absolute bottom-8 left-1/2 z-50 w-[90%] max-w-[720px] -translate-x-1/2">
            <div className="relative overflow-hidden rounded-[16px] border border-white/50 bg-white/90 shadow-[0px_20px_40px_-12px_rgba(0,0,0,0.15)] backdrop-blur">
              <div className="flex flex-col gap-2 p-4 pb-0">
                <div className="relative w-full">
                  <Textarea
                    placeholder="Describe your app... (Press Enter to send)"
                    className="scrollbar-none min-h-[48px] w-full resize-none border-0 bg-transparent p-0 font-sans text-[16px] leading-[24px] font-normal text-[#292827] placeholder:text-[#9e9c98] focus-visible:ring-0"
                    style={{
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                      maxHeight: '96px',
                      fieldSizing: 'content',
                    }}
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleGenerate(!!user)
                      }
                    }}
                  />
                </div>

                <div className="relative flex w-full items-center justify-between border-t border-solid border-[#e7e6e2]/80 px-0 py-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-muted/50 inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-normal text-[#4f4e4a] transition-colors"
                      onClick={() => setShowInputBar(false)}
                      title="Hide controls"
                    >
                      <EyeOff className="relative top-[1px] size-4" />
                      Hide controls
                    </Button>
                  </div>

                  <Button
                    onClick={() => {
                      if (isAnyLoading) {
                        stopAllGeneration()
                      } else {
                        handleGenerate(!!user)
                      }
                    }}
                    size="icon"
                    className={`group size-8 shrink-0 rounded-[12px] transition-all active:scale-95 ${
                      isAnyLoading
                        ? `bg-red-500 text-white shadow-[0px_4px_6px_-4px_rgba(239,68,68,0.5)] hover:bg-red-600`
                        : isAllCompleted
                          ? `bg-orange-500 text-white shadow-[0px_4px_6px_-4px_rgba(249,115,22,0.5)] hover:bg-orange-600`
                          : `bg-[#23d57c] text-white shadow-[0px_4px_6px_-4px_rgba(35,213,124,0.5)] hover:bg-[#23d57c]/90`
                    } `}
                    disabled={!prompt.trim() && !isAnyLoading}
                  >
                    {isAnyLoading ? (
                      <Square className="size-4 fill-current" />
                    ) : isAllCompleted ? (
                      <RotateCcw className="size-4 transition-transform group-hover:-rotate-12" />
                    ) : (
                      <ArrowUp className="size-4 transition-transform group-hover:-translate-y-0.5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!showInputBar && !isRecording && (
          <Button
            onClick={() => setShowInputBar(true)}
            size="sm"
            className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer gap-2 rounded-full px-4 py-2 shadow-lg"
            title="Show prompt"
          >
            <Eye className="size-4" />
            Show Prompt
          </Button>
        )}
      </main>

      <ShareModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        appId={currentAppId}
        shareUrl={
          currentAppId
            ? `${typeof window !== 'undefined' ? window.location.origin : ''}/gallery/${currentAppId}`
            : undefined
        }
        videoBlob={recordedBlob}
        videoFormat={recordedFormat}
        showVideoSection={shareMode === 'video'}
        isPublished={isAppPublished}
        onPublishSuccess={category => {
          setIsAppPublished(true)
          if (category) setAppCategory(category)
        }}
        prompt={prompt}
        category={appCategory}
        modelA={modelA.selectedModel}
        modelB={modelB.selectedModel}
      />
    </div>
  )
}
