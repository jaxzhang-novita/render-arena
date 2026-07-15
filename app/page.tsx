'use client'

import { useRouter } from 'next/navigation'
import { Header } from '@/components/app/header'
import { Footer } from '@/components/app/footer'
import { ArenaBattleModal } from '@/components/app/arena-battle-modal'
import { GalleryGrid } from '@/components/app/gallery-grid'
import { FreeTierBanner } from '@/components/app/overwhelming-banner'
import { CodingPackageBanner } from '@/components/app/coding-package-banner'
import { HackathonBanner } from '@/components/app/hackathon-banner'
import { ArrowRight, ChevronUp, MessageSquareText } from 'lucide-react'
import { Accordion } from '@base-ui/react/accordion'

import { useState, useEffect, useId, useRef } from 'react'
import { Button } from '@/components/base/button'
import { FeaturedCasesSection } from '@/components/app/featured-case'

import {
  playgroundModes,
  galleryCategories,
  type GalleryCategoryId,
  models,
  type LLMModel,
  defaultModelAId,
  getModelById,
} from '@/lib/config'
import { ModelSelector } from '@/components/base/model-selector'
import { HarnessSelector } from '@/components/base/harness-selector'
import { defaultAgentHarnessId, getAgentHarness } from '@/lib/agent-comparison'

export default function HomePage() {
  const router = useRouter()
  const [userPrompt, setUserPrompt] = useState('')
  const [placeholderText, setPlaceholderText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [typingSpeed, setTypingSpeed] = useState(50)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [galleryCategory, setGalleryCategory] = useState<GalleryCategoryId>('all')
  const hasUserInteractedRef = useRef(false)
  const gallerySectionRef = useRef<HTMLElement>(null)

  // Static placeholder text for typewriter effect
  const STATIC_PLACEHOLDER = 'Enter a prompt to start the Arena battle.'

  // Model selection state
  const [selectedModel, setSelectedModel] = useState<LLMModel>(
    getModelById(defaultModelAId) || models[0]
  )
  const [selectedHarness, setSelectedHarness] = useState(() =>
    getAgentHarness(defaultAgentHarnessId)
  )

  // Generate stable IDs for accordion triggers
  const accordionId0 = useId()
  const accordionId1 = useId()
  const accordionId2 = useId()
  const accordionId3 = useId()

  // Fetch hackathon stats
  // useEffect(() => {
  //   const fetchHackathonStats = async () => {
  //     try {
  //       const response = await fetch('/api/hackathon/stats')
  //       if (response.ok) {
  //         const data = await response.json()
  //         setParticipantCount(data.participants)
  //       }
  //     } catch (error) {
  //       console.error('Failed to fetch hackathon stats:', error)
  //     }
  //   }

  //   fetchHackathonStats()
  // }, [])

  // Typewriter effect for placeholder
  useEffect(() => {
    // Only run typewriter effect if user hasn't interacted and prompt is empty
    if (hasUserInteractedRef.current || userPrompt) {
      setPlaceholderText('')
      return
    }

    const handleTyping = () => {
      setPlaceholderText(
        isDeleting
          ? STATIC_PLACEHOLDER.substring(0, placeholderText.length - 1)
          : STATIC_PLACEHOLDER.substring(0, placeholderText.length + 1)
      )

      setTypingSpeed(isDeleting ? 30 : 50)

      if (!isDeleting && placeholderText === STATIC_PLACEHOLDER) {
        setTimeout(() => setIsDeleting(true), 2000) // Pause before deleting
      } else if (isDeleting && placeholderText === '') {
        setIsDeleting(false)
      }
    }

    const timer = setTimeout(handleTyping, typingSpeed)
    return () => clearTimeout(timer)
  }, [placeholderText, isDeleting, userPrompt, typingSpeed])

  const handleGenerate = () => {
    const promptToUse = userPrompt.trim()

    if (!promptToUse) {
      // TODO: Show error toast
      return
    }

    // Navigate with all params
    const params = new URLSearchParams({
      prompt: promptToUse,
      model: selectedModel.id,
      harness: selectedHarness.id,
      autoStart: 'true',
    })

    router.push(`/playground/new?${params.toString()}`)
  }

  const handleModeClick = (mode: (typeof playgroundModes)[number]) => {
    // Fill textarea with a random prompt from this mode
    if (mode.prompts && mode.prompts.length > 0) {
      // eslint-disable-next-line react-hooks/purity
      const randomIndex = Math.floor(Math.random() * mode.prompts.length)
      setUserPrompt(mode.prompts[randomIndex])
      hasUserInteractedRef.current = true
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <FreeTierBanner />

      <main className="flex-1">
        {/* Hero Section */}
        <section id="home" className="relative w-full px-6 py-16">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
            {/* Live Badge */}
            <div className="inline-flex items-center gap-3 rounded-full border border-[#b9f8cf] bg-[#f0fdf4] px-3 py-1">
              <div className="size-2 rounded-full bg-[#00c950]" />
              <span className="font-['Inter',sans-serif] text-xs font-medium text-[#00a63e]">
                RenderArena · Agent Comparison
              </span>
            </div>

            {/* Heading */}
            <h1 className="max-w-[820px] font-sans text-4xl leading-tight font-semibold tracking-normal text-[#292827] md:text-[58px] md:leading-[64px]">
              One Model. Direct vs Agent.
            </h1>

            {/* Subtitle */}
            <p className="max-w-[820px] font-sans text-lg/6 font-normal text-[#4f4e4a]">
              See how the same model performs with and without an agent harness.
            </p>

            {/* Featured Case */}
            <FeaturedCasesSection />

            {/* Textarea Input Section */}
            <div className="flex w-full max-w-[787px] flex-col items-center gap-8">
              <div className="relative w-full overflow-hidden rounded-[16px] border border-[#e7e6e2] bg-white p-6 shadow-sm">
                {/* Textarea */}
                <div className="relative mb-4 min-h-[120px] w-full">
                  <textarea
                    value={userPrompt}
                    placeholder={placeholderText || 'Enter a prompt to start the Arena battle.'}
                    onChange={e => {
                      setUserPrompt(e.target.value)
                      hasUserInteractedRef.current = true
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleGenerate()
                      }
                    }}
                    className="h-[120px] w-full resize-none bg-transparent font-sans text-base font-normal text-[#4f4e4a] outline-none placeholder:text-[#9e9c98]"
                    spellCheck={false}
                  />
                </div>

                {/* Bottom Actions: shared model and execution profiles */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <ModelSelector
                      selectedModel={selectedModel}
                      onModelChange={setSelectedModel}
                      variant="minimal"
                      size="small"
                      className="w-[190px] max-sm:w-full"
                    />
                    <div className="hidden h-4 w-px bg-black/10 sm:block" />
                    <div className="inline-flex h-8 items-center gap-2 rounded-lg border border-[#e7e6e2] bg-[#f7f7f5] px-3 text-[14px] font-medium text-[#4f4e4a]">
                      <MessageSquareText className="size-4" />
                      Direct
                    </div>
                    <span className="px-0.5 text-xs font-medium text-[#9e9c98]">VS</span>
                    <HarnessSelector
                      selectedHarness={selectedHarness}
                      onHarnessChange={setSelectedHarness}
                      size="small"
                      showAgentLabel={false}
                      className="w-[180px] max-sm:flex-1"
                    />
                  </div>

                  {/* Run Arena Button */}
                  <Button
                    onClick={handleGenerate}
                    disabled={!userPrompt.trim()}
                    className="flex w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-black py-2.5 pr-4 pl-5 font-mono text-base font-normal text-white transition-all hover:scale-[1.02] hover:bg-black/90 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none sm:w-auto"
                  >
                    <span>Run Arena</span>
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Category Buttons */}
              <div className="flex w-full flex-wrap items-center justify-center gap-3">
                {playgroundModes.map(mode => {
                  const Icon = mode.icon
                  return (
                    <button
                      key={mode.label}
                      onClick={() => handleModeClick(mode)}
                      className="flex cursor-pointer items-center gap-2 rounded-full border border-[#e7e6e2] bg-white px-4 py-2 text-[#4f4e4a] transition-all duration-200 hover:bg-gray-50"
                    >
                      <Icon className="size-4" />
                      <span className="font-sans text-sm font-medium">{mode.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Hackathon & Coding Package Banners - Side by Side */}
        <section id="hackathon" className="px-6 py-4">
          <div className="mx-auto grid max-w-[1256px] grid-cols-1 gap-4 lg:grid-cols-2">
            <HackathonBanner onJoinClick={() => setIsModalOpen(true)} />
            <CodingPackageBanner />
          </div>
        </section>

        {/* Gallery Grid */}
        <section id="gallery" ref={gallerySectionRef} className="pt-16 pb-20">
          <div className="mx-auto max-w-7xl px-6">
            {/* Gallery Header */}
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-sans text-[48px] leading-[48px] font-semibold tracking-[-0.96px] text-[#292827]">
                Arena Gallery
              </h2>

              <div className="flex gap-2 rounded-full bg-gray-100/50 p-1">
                {galleryCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setGalleryCategory(cat.id)
                    }}
                    className={`flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 font-sans text-sm font-medium transition-all ${
                      galleryCategory === cat.id
                        ? 'text-foreground bg-white shadow-sm ring-1 ring-black/5'
                        : 'text-muted-foreground hover:text-foreground hover:bg-gray-200/50'
                    } `}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <GalleryGrid selectedCategory={galleryCategory} />
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="bg-background py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="mb-12 text-center font-sans text-[48px] leading-[48px] font-semibold tracking-[-0.96px] text-[#101828]">
              Frequently Asked Questions
            </h2>

            <Accordion.Root defaultValue={[]} className="w-full space-y-2">
              <Accordion.Item
                value="item-0"
                className="overflow-hidden rounded-[10px] border-none bg-[#f9fafb]"
              >
                <Accordion.Trigger
                  id={accordionId0}
                  className="group flex h-[72.75px] w-full cursor-pointer items-center justify-between px-6 py-0 font-sans text-xl leading-6 font-semibold tracking-[-0.4px] text-[#1e2939] transition-colors hover:bg-[#f0f0ed] hover:no-underline aria-expanded:text-[#23d57c]"
                >
                  <span>What am I supposed to do here?</span>
                  <ChevronUp className="size-5 rotate-180 transition-transform group-aria-expanded:rotate-0" />
                </Accordion.Trigger>
                <Accordion.Panel className="border-t border-[#f3f4f6] px-6 py-4 font-sans text-base leading-6 text-[#4f4e4a]">
                  <p>
                    Model Arena lets you submit a single task (prompt) and watch two models attempt
                    to solve it under identical conditions.
                  </p>
                  <p className="mt-2">Instead of chatting, you observe how models:</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>reason about the task</li>
                    <li>generate code or logic</li>
                    <li>build and execute a real solution</li>
                  </ul>
                  <p className="mt-2">
                    Think of it as models proving themselves by doing real work.
                  </p>
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item
                value="item-1"
                className="overflow-hidden rounded-[10px] border-none bg-[#f9fafb]"
              >
                <Accordion.Trigger
                  id={accordionId1}
                  className="group flex h-[72.75px] w-full cursor-pointer items-center justify-between px-6 py-0 font-sans text-xl leading-6 font-semibold tracking-[-0.4px] text-[#1e2939] transition-colors hover:bg-[#f0f0ed] hover:no-underline aria-expanded:text-[#23d57c]"
                >
                  <span>Is this a real build or just a demo simulation?</span>
                  <ChevronUp className="size-5 rotate-180 transition-transform group-aria-expanded:rotate-0" />
                </Accordion.Trigger>
                <Accordion.Panel className="border-t border-[#f3f4f6] px-6 py-4 font-sans text-base leading-6 text-[#4f4e4a]">
                  <p>This is a real execution, not a mock or animation.</p>
                  <p className="mt-2">Models:</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>generate actual code</li>
                    <li>run inside an isolated sandbox</li>
                    <li>build and launch real previews when applicable</li>
                  </ul>
                  <p className="mt-2">
                    Failures, delays, and unexpected behavior are all part of the evaluation — and
                    often the most informative signals.
                  </p>
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item
                value="item-2"
                className="overflow-hidden rounded-[10px] border-none bg-[#f9fafb]"
              >
                <Accordion.Trigger
                  id={accordionId2}
                  className="group flex h-[72.75px] w-full cursor-pointer items-center justify-between px-6 py-0 font-sans text-xl leading-6 font-semibold tracking-[-0.4px] text-[#1e2939] transition-colors hover:bg-[#f0f0ed] hover:no-underline aria-expanded:text-[#23d57c]"
                >
                  <span>How should I decide which model is better?</span>
                  <ChevronUp className="size-5 rotate-180 transition-transform group-aria-expanded:rotate-0" />
                </Accordion.Trigger>
                <Accordion.Panel className="border-t border-[#f3f4f6] px-6 py-4 font-sans text-base leading-6 text-[#4f4e4a]">
                  <p>Model Arena does not assign scores or rankings.</p>
                  <p className="mt-2">You evaluate models based on:</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>Task completion — does it actually work?</li>
                    <li>Engineering judgment — are the decisions reasonable?</li>
                    <li>
                      Creativity & robustness — does it handle edge cases or go beyond expectations?
                    </li>
                  </ul>
                  <p className="mt-2">The best model is the one you’d trust in a real project.</p>
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item
                value="item-3"
                className="overflow-hidden rounded-[10px] border-none bg-[#f9fafb]"
              >
                <Accordion.Trigger
                  id={accordionId3}
                  className="group flex h-[72.75px] w-full cursor-pointer items-center justify-between px-6 py-0 font-sans text-xl leading-6 font-semibold tracking-[-0.4px] text-[#1e2939] transition-colors hover:bg-[#f0f0ed] hover:no-underline aria-expanded:text-[#23d57c]"
                >
                  <span>Can I reuse or share what I see here?</span>
                  <ChevronUp className="size-5 rotate-180 transition-transform group-aria-expanded:rotate-0" />
                </Accordion.Trigger>
                <Accordion.Panel className="border-t border-[#f3f4f6] px-6 py-4 font-sans text-base leading-6 text-[#4f4e4a]">
                  <p>Yes — and you’re encouraged to.</p>
                  <p className="mt-2">You can:</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>inspect generated outputs</li>
                    <li>rerun tasks with modified prompts</li>
                    <li>share results via demos, blogs, or social posts</li>
                  </ul>
                  <p className="mt-2">
                    Model Arena is designed for reproducible, shareable model experiments.
                  </p>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion.Root>
          </div>
        </section>
      </main>

      <Footer />

      <ArenaBattleModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  )
}
