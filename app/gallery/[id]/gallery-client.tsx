'use client'

import { useState, useCallback, useEffect, useId } from 'react'
import Link from 'next/link'
import { Button } from '@/components/base/button'
import {
  ArrowLeft,
  Heart,
  Copy,
  ExternalLink,
  Maximize,
  Check,
  Loader2,
  Video,
  Square,
  Share2,
  DollarSign,
  Clock,
  Braces,
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { UserAvatar } from '@/components/app/user-avatar'
import { cn } from '@/lib/utils'
import { getModelById, models } from '@/lib/models'
import type { App } from '@/types'

import { showToast } from '@/lib/toast'
import { trackRemixStarted, trackSharedItemViewed } from '@/lib/analytics'
import { useScreenRecorder } from '@/hooks/use-screen-recorder'
import { ShareModal } from '@/components/playground/share-modal'
import { useAuth } from '@/hooks/use-auth'
import { Tooltip } from '@base-ui/react/tooltip'
import { calculateTokensAndCost } from '@/lib/pricing'

interface GalleryClientProps {
  app: App & { isOwner: boolean; isLiked: boolean }
}

export default function GalleryClient({ app }: GalleryClientProps) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'a' | 'b' | 'split'>('split')
  const [liked, setLiked] = useState(app.isLiked)
  const [likeCount, setLikeCount] = useState(app.like_count)
  const [isLiking, setIsLiking] = useState(false)
  const [copied, setCopied] = useState(false)

  // 录屏和分享相关状态
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareMode, setShareMode] = useState<'video' | 'poster'>('poster')
  const [recordedFormat, setRecordedFormat] = useState<'webm' | 'mp4' | null>(null)

  const { user, loading: authLoading } = useAuth()
  const recordTooltipId = useId()
  const shareTooltipId = useId()
  const isGuest = !authLoading && !user

  const modelA = getModelById(app.model_a) || models[0]
  const modelB = getModelById(app.model_b) || models[1]

  // 屏幕录制
  const {
    isRecording,
    isRecordingSupported,
    recordedBlob,
    previewContainerRef,
    startRecording,
    stopRecording,
  } = useScreenRecorder({
    onRecordingComplete: (blob: Blob, format: 'webm') => {
      setRecordedFormat(format)
      setShareMode('video')
      setTimeout(() => {
        setShowShareModal(true)
      }, 300)
    },
    onError: () => {
      showToast.error('Recording failed')
    },
  })

  useEffect(() => {
    trackSharedItemViewed(app.id)
  }, [app.id])

  const handleLike = useCallback(async () => {
    if (isLiking) return
    setIsLiking(true)
    try {
      const response = await fetch(`/api/apps/${app.id}/like`, {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        setLiked(data.liked)
        setLikeCount(data.likeCount)
      } else if (response.status === 401) {
        showToast.login('Log in to like this post', 'like')
      }
    } catch (error) {
      console.error('Like error:', error)
      showToast.error('Failed to like')
    } finally {
      setIsLiking(false)
    }
  }, [app.id, isLiking])

  const handleCopyPrompt = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(app.prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy error:', error)
      showToast.error('Failed to copy')
    }
  }, [app.prompt])

  const handleOpenPlayground = useCallback(() => {
    trackRemixStarted(app.id)
    const params = new URLSearchParams()
    params.set('prompt', app.prompt)
    if (app.category) {
      params.set('category', app.category)
    }
    router.push(`/playground/new?${params.toString()}`)
  }, [app.id, app.prompt, app.category, router])

  const handleRecordToggle = async () => {
    if (!isRecordingSupported || isGuest || authLoading) {
      return
    }
    if (isRecording) {
      stopRecording()
    } else {
      if (
        recordedBlob &&
        !window.confirm(
          'Starting a new recording will discard your previous recording. Do you want to continue?'
        )
      ) {
        return
      }
      await startRecording()
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      {/* Header */}
      <header className="z-30 flex h-16 shrink-0 items-center justify-between border-b border-[#f3f4f6] bg-white px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-muted/80 size-9 cursor-pointer rounded-full p-2"
            >
              <ArrowLeft className="size-5" />
            </Button>
          </Link>
          <h1 className="font-sans text-[20px] font-semibold tracking-tight text-black">
            {app.name || 'Untitled App'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* 点赞按钮 */}
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'gap-2 rounded-lg border-[#e4e4e7] transition-colors',
              liked && 'border-red-200 bg-red-50 text-red-500 hover:bg-red-100'
            )}
            onClick={handleLike}
            disabled={isLiking}
          >
            {isLiking ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Heart className={cn('size-4', liked && 'fill-current')} />
            )}
            <span>{likeCount}</span>
          </Button>
          {/* 录屏按钮 */}
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
                    !isRecordingSupported || isGuest ? 'opacity-50' : ''
                  )}
                  onClick={handleRecordToggle}
                  title={
                    !isRecordingSupported
                      ? 'Browser not supported'
                      : isGuest
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
            {!isRecordingSupported || (isGuest && !authLoading) ? (
              <Tooltip.Portal>
                <Tooltip.Positioner sideOffset={4}>
                  <Tooltip.Popup className="z-50 overflow-hidden rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-lg">
                    {!isRecordingSupported
                      ? 'Screen recording is not supported in this browser'
                      : 'Log in to record'}
                  </Tooltip.Popup>
                </Tooltip.Positioner>
              </Tooltip.Portal>
            ) : null}
          </Tooltip.Root>

          {/* 分享按钮 */}
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
                    isGuest ? 'opacity-50' : ''
                  )}
                  title={isGuest ? undefined : 'Share'}
                  onClick={() => {
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
            {isGuest && !authLoading ? (
              <Tooltip.Portal>
                <Tooltip.Positioner sideOffset={4}>
                  <Tooltip.Popup className="z-50 overflow-hidden rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-lg">
                    Log in to share
                  </Tooltip.Popup>
                </Tooltip.Positioner>
              </Tooltip.Portal>
            ) : null}
          </Tooltip.Root>
          {/* 复制 Prompt */}
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-lg border-[#e4e4e7]"
            onClick={handleCopyPrompt}
          >
            {copied ? (
              <>
                <Check className="size-4 text-green-500" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="size-4" />
                <span>Copy Prompt</span>
              </>
            )}
          </Button>

          {/* Remix */}
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-lg border-[#e4e4e7]"
            onClick={handleOpenPlayground}
          >
            <ExternalLink className="size-4" />
            <span>Remix</span>
          </Button>

          <UserAvatar />
        </div>
      </header>

      {/* Main Content - 左右分屏预览 */}
      <main ref={previewContainerRef} className="relative flex w-screen flex-1 overflow-hidden">
        <div className="flex w-full flex-1">
          {/* Model A Preview */}
          {viewMode !== 'b' && (
            <div
              className={` ${viewMode === 'split' ? 'w-1/2' : 'flex-1'} relative flex flex-col overflow-hidden border-r border-[#f4f4f5] bg-white`}
            >
              <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#e7e6e2] bg-white px-4">
                <div className="flex items-center gap-2">
                  <Image
                    src={modelA.icon}
                    alt={modelA.name}
                    width={16}
                    height={16}
                    className="size-4 rounded-sm"
                  />
                  <span className="text-sm font-medium text-[#4f4e4a]">{modelA.name}</span>
                  {(app.duration_a || app.tokens_a) &&
                    (() => {
                      const { tokens, cost } = calculateTokensAndCost(app.tokens_a, app.model_a)

                      return (
                        <div className="flex items-center gap-2">
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
                                      {modelA.inputPrice !== undefined && (
                                        <div className="flex items-center justify-between">
                                          <span className="text-[#666]">Input Price</span>
                                          <span className="font-medium text-[#292827]">
                                            ${modelA.inputPrice}/Mt
                                          </span>
                                        </div>
                                      )}
                                      {modelA.outputPrice !== undefined && (
                                        <div className="flex items-center justify-between">
                                          <span className="text-[#666]">Output Price</span>
                                          <span className="font-medium text-[#292827]">
                                            ${modelA.outputPrice}/Mt
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
                          {app.duration_a && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-sm font-semibold text-blue-700 ring-1 ring-blue-700/10 ring-inset">
                              <Clock className="size-3.5" />
                              <span>{app.duration_a.toFixed(1)}s</span>
                            </span>
                          )}

                          {/* Token Badge */}
                          {tokens !== null && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-sm font-semibold text-gray-600 ring-1 ring-gray-600/10 ring-inset">
                              <span>{tokens.toLocaleString()} tokens</span>
                            </span>
                          )}
                        </div>
                      )
                    })()}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-muted/80 size-8 cursor-pointer rounded-lg"
                  onClick={() => setViewMode(viewMode === 'a' ? 'split' : 'a')}
                >
                  <Maximize className="size-4 text-[#9e9c98]" />
                </Button>
              </div>

              <div className="relative flex-1 overflow-hidden">
                {app.html_content_a ? (
                  <iframe
                    srcDoc={app.html_content_a}
                    className="size-full border-0"
                    title="Model A Preview"
                    sandbox="allow-scripts allow-forms"
                    allow="accelerometer; autoplay; fullscreen; clipboard-write; web-share; encrypted-media; gyroscope;"
                  />
                ) : (
                  <div className="text-muted-foreground flex h-full items-center justify-center">
                    No HTML content available
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Model B Preview */}
          {viewMode !== 'a' && (
            <div
              className={` ${viewMode === 'split' ? 'w-1/2' : 'flex-1'} relative flex flex-col overflow-hidden bg-white`}
            >
              <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#e7e6e2] bg-white px-4">
                <div className="flex items-center gap-2">
                  <Image
                    src={modelB.icon}
                    alt={modelB.name}
                    width={16}
                    height={16}
                    className="size-4 rounded-sm"
                  />
                  <span className="text-sm font-medium text-[#4f4e4a]">{modelB.name}</span>
                  {(app.duration_b || app.tokens_b) &&
                    (() => {
                      const { tokens, cost } = calculateTokensAndCost(app.tokens_b, app.model_b)

                      return (
                        <div className="flex items-center gap-2">
                          {/* Cost Badge with Tooltip */}
                          {cost !== null && (
                            <Tooltip.Root>
                              <Tooltip.Trigger
                                delay={100}
                                className="inline-flex cursor-default items-center gap-1 rounded-md bg-green-50 px-2.5 py-1 text-sm font-semibold text-green-700 ring-1 ring-green-700/10 transition-colors ring-inset hover:bg-green-100"
                              >
                                <DollarSign className="size-3.5" />
                                <span>{cost.toFixed(4)}</span>
                              </Tooltip.Trigger>
                              <Tooltip.Portal>
                                <Tooltip.Positioner sideOffset={8}>
                                  <Tooltip.Popup className="z-50 min-w-[180px] rounded-lg border border-[#e7e6e2] bg-white p-2 shadow-lg">
                                    <div className="flex flex-col gap-1.5 text-sm">
                                      {modelB.inputPrice !== undefined && (
                                        <div className="flex items-center justify-between">
                                          <span className="text-[#666]">Input Price</span>
                                          <span className="font-medium text-[#292827]">
                                            ${modelB.inputPrice}/Mt
                                          </span>
                                        </div>
                                      )}
                                      {modelB.outputPrice !== undefined && (
                                        <div className="flex items-center justify-between">
                                          <span className="text-[#666]">Output Price</span>
                                          <span className="font-medium text-[#292827]">
                                            ${modelB.outputPrice}/Mt
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
                          {app.duration_b && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-sm font-semibold text-blue-700 ring-1 ring-blue-700/10 ring-inset">
                              <Clock className="size-3.5" />
                              <span>{app.duration_b.toFixed(1)}s</span>
                            </span>
                          )}

                          {/* Token Badge */}
                          {tokens !== null && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2.5 py-1 text-sm font-semibold text-gray-600 ring-1 ring-gray-600/10 ring-inset">
                              <Braces className="size-3.5" />
                              <span>{tokens.toLocaleString()} tokens</span>
                            </span>
                          )}
                        </div>
                      )
                    })()}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-muted/80 size-8 cursor-pointer rounded-lg"
                  onClick={() => setViewMode(viewMode === 'b' ? 'split' : 'b')}
                >
                  <Maximize className="size-4 text-[#9e9c98]" />
                </Button>
              </div>

              <div className="relative flex-1 overflow-hidden">
                {app.html_content_b ? (
                  <iframe
                    srcDoc={app.html_content_b}
                    className="size-full border-0"
                    title="Model B Preview"
                    sandbox="allow-scripts allow-forms"
                    allow="accelerometer; autoplay; fullscreen; clipboard-write; web-share; encrypted-media; gyroscope;"
                  />
                ) : (
                  <div className="text-muted-foreground flex h-full items-center justify-center">
                    No HTML content available
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 分享弹窗 */}
      <ShareModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        appId={app.id}
        shareUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/gallery/${app.id}`}
        videoBlob={recordedBlob}
        videoFormat={recordedFormat}
        showVideoSection={shareMode === 'video'}
        isPublished={true}
        prompt={app.prompt}
        category={app.category}
        skipSaveToDatabase={true}
        modelA={modelA}
        modelB={modelB}
      />
    </div>
  )
}
