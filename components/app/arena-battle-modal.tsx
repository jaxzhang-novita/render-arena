'use client'

import { Dialog } from '@base-ui/react/dialog'
import { X, Trophy, Gift, Calendar, Users, Zap, Check } from 'lucide-react'
import { Button } from '@/components/base/button'
import { cn } from '@/lib/utils'
import { DISCORD_INVITE_URL } from '@/lib/config'

interface ArenaBattleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ArenaBattleModal({ open, onOpenChange }: ArenaBattleModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Popup
          className={cn(
            'fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
            'flex h-[90vh] max-w-150 flex-col overflow-hidden rounded-[10px]',
            'bg-black p-0'
          )}
        >
          {/* Close Button */}
          <button
            onClick={() => onOpenChange(false)}
            className="border-primary absolute top-4 right-4 z-50 cursor-pointer rounded-full border p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white focus:outline-none"
            type="button"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>

          <div
            className={cn(
              'flex-1 overflow-y-auto pb-40',
              '[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#333] hover:[&::-webkit-scrollbar-thumb]:bg-[#444] [&::-webkit-scrollbar-track]:bg-[#0f0f0f]'
            )}
          >
            {/* Header */}
            <div className="space-y-4 px-6 pt-6 pb-4">
              <div className="flex items-center gap-3">
                <Trophy className="size-6 text-[#fdc700]" />
                <h2 className="font-sans text-[32px] leading-10 font-semibold tracking-[-0.64px] text-white">
                  Novita Render Arena
                </h2>
              </div>
              <h3 className="font-sans text-[18px]/6 font-semibold text-[#05df72]">
                Build it. Compare it. Make it glow.
              </h3>
            </div>

            {/* Scrollable Content */}
            <div className="space-y-8 px-6 pb-6">
              {/* Promo Banner */}
              <div className="rounded-r-[10px] border-l-4 border-[rgba(0,201,80,0.5)] bg-[rgba(13,84,43,0.1)] p-4">
                <p className="font-sans text-base/6 text-[#e7e6e2]">
                  Render Arena focuses on visual comparison, vibes, and shareability — not
                  benchmarks, but creative expression.
                </p>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Zap className="size-5 text-[#fdc700]" />
                    <h3 className="font-sans text-2xl leading-9.5 font-semibold text-white">
                      What You&apos;ll Build
                    </h3>
                  </div>

                  <div className="space-y-3 rounded-[14px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] p-5">
                    <p className="font-sans text-sm/5 text-[#d1d5dc]">
                      Create visual, comparable demos using{' '}
                      <span className="font-semibold text-[#f5f5f5]">Novita Render Arena</span>,
                      focusing on Particle Effects.
                    </p>

                    <div className="space-y-2">
                      <p className="font-sans text-sm/5">
                        <span className="font-bold text-[#7bf1a8]">Core idea:</span>
                        <span className="text-[#cbc9c4]">
                          {' '}
                          Use the same prompt across different models and showcase output
                          differences in style, motion, and vibe.
                        </span>
                      </p>

                      <ul className="space-y-1 font-sans text-sm/5 text-[#cbc9c4]">
                        <li>Different models, same prompt</li>
                        <li>Visual contrast worth sharing</li>
                        <li>Energy, Motion, Abstract Vibe, Sci-Fi</li>
                      </ul>
                    </div>

                    <p className="font-mono text-xs/5 tracking-[0.24px] text-[#6a7282]">
                      No requirement for a full product, repo, or complex system.
                    </p>
                  </div>
                </div>

                {/* Prize Pool */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Gift className="size-5 text-[#fdc700]" />
                    <h3 className="font-sans text-2xl leading-9.5 font-semibold text-white">
                      Prize Pool
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {/* 1st Place */}
                    <div className="flex items-center justify-between rounded-[14px] border border-[rgba(240,177,0,0.2)] bg-linear-to-r from-[rgba(115,62,10,0.2)] to-[rgba(0,0,0,0)] p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🥇</span>
                        <span className="text-base font-bold text-[#fff085]">1st Place</span>
                      </div>
                      <span className="text-base font-medium text-white">$800 Credits</span>
                    </div>

                    {/* 2nd Place */}
                    <div className="flex items-center justify-between rounded-[14px] border border-[rgba(106,114,130,0.2)] bg-linear-to-r from-[rgba(30,41,57,0.4)] to-[rgba(0,0,0,0)] p-3.5">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🥈</span>
                        <span className="text-base font-medium text-[#d1d5dc]">2nd Place</span>
                      </div>
                      <span className="text-base font-medium text-white">$300 Credits</span>
                    </div>

                    {/* 3rd Place */}
                    <div className="flex items-center justify-between rounded-[14px] border border-[rgba(255,105,0,0.2)] bg-linear-to-r from-[rgba(126,42,12,0.2)] to-[rgba(0,0,0,0)] p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🥉</span>
                        <span className="text-base font-medium text-[#ffd6a7]">3rd Place</span>
                      </div>
                      <span className="text-base font-medium text-white">$200 Credits</span>
                    </div>

                    {/* 4th-10th Place */}
                    <div className="flex items-center justify-between rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.05)] p-3">
                      <span className="text-sm font-medium text-[#cbc9c4]">4th - 10th Place</span>
                      <span className="text-base font-medium text-[#e7e6e2]">$100 Credits</span>
                    </div>

                    {/* Community Bonus */}
                    <div className="rounded-[10px] border border-[rgba(0,201,80,0.2)] bg-[rgba(13,84,43,0.2)] p-2.5">
                      <p className="font-sans text-sm/5 text-[#23d57c]">
                        Community Bonus: $30 Credits for high-quality feedback
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="size-5 text-[#fdc700]" />
                  <h3 className="font-['Inter',sans-serif] text-xl/7 font-bold tracking-[-0.45px] text-white">
                    Timeline (Fully Remote)
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1 rounded-[14px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] p-4 text-center">
                    <p className="text-base font-bold tracking-[-0.31px] text-[#05df72]">
                      Build & Submit
                    </p>
                    <p className="text-sm tracking-[-0.15px] text-[#99a1af]">Ends Feb 28</p>
                  </div>

                  <div className="space-y-1 rounded-[14px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] p-4 text-center">
                    <p className="text-base font-bold tracking-[-0.31px] text-[#51a2ff]">
                      Review Period
                    </p>
                    <p className="text-sm tracking-[-0.15px] text-[#99a1af]">Mar 2 - Mar 4</p>
                  </div>

                  <div className="space-y-1 rounded-[14px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] p-4 text-center">
                    <p className="text-base font-bold tracking-[-0.31px] text-[#c27aff]">
                      Winners Announced
                    </p>
                    <p className="text-sm tracking-[-0.15px] text-[#99a1af]">Mar 5 - Mar 6</p>
                  </div>
                </div>
              </div>

              {/* How to Participate */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="size-5 text-[#fdc700]" />
                  <h3 className="font-['Inter',sans-serif] text-xl/7 font-bold tracking-[-0.45px] text-white">
                    How to Participate
                  </h3>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {/* Step 1 */}
                  <div className="relative overflow-hidden rounded-[14px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] p-4">
                    <div className="absolute -top-2 right-2 text-[60px] leading-15 font-bold tracking-[0.26px] text-[rgba(255,255,255,0.05)]">
                      1
                    </div>
                    <div className="relative z-10 space-y-2">
                      <h4 className="text-[18px]/7 font-bold tracking-[-0.44px] text-white">
                        Use Arena
                      </h4>
                      <p className="text-xs/4 text-[#99a1af]">
                        Compare at least 2 models (e.g. GLM 5.1 vs Claude Opus 4.6)
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative overflow-hidden rounded-[14px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] p-4">
                    <div className="absolute -top-2 right-2 text-[60px] leading-15 font-bold tracking-[0.26px] text-[rgba(255,255,255,0.05)]">
                      2
                    </div>
                    <div className="relative z-10 space-y-2">
                      <h4 className="text-[18px]/7 font-bold tracking-[-0.44px] text-white">
                        Showcase
                      </h4>
                      <p className="text-xs/4 text-[#99a1af]">
                        Create a short video (≤ 60s). Demo link optional.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative overflow-hidden rounded-[14px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] p-4">
                    <div className="absolute -top-2 right-2 text-[60px] leading-15 font-bold tracking-[0.26px] text-[rgba(255,255,255,0.05)]">
                      3
                    </div>
                    <div className="relative z-10 space-y-2">
                      <h4 className="text-[18px]/7 font-bold tracking-[-0.44px] text-white">
                        Post on X
                      </h4>
                      <p className="text-xs/4 text-[#99a1af]">
                        Tag @novita_labs #RenderArena <span className="italic">(required)</span>
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="relative overflow-hidden rounded-[14px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] p-4">
                    <div className="absolute -top-2 right-2 text-[60px] leading-15 font-bold tracking-[0.26px] text-[rgba(255,255,255,0.05)]">
                      4
                    </div>
                    <div className="relative z-10 space-y-2">
                      <h4 className="text-[18px]/7 font-bold tracking-[-0.44px] text-white">
                        Submit
                      </h4>
                      <p className="text-xs/4 text-[#99a1af]">
                        Share Twitter link in Discord #arena-showcase
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Grid: How You&apos;re Judged & Why Join */}
              <div className="grid grid-cols-2 gap-8">
                {/* How You&apos;re Judged */}
                <div className="space-y-3 rounded-[14px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] p-5">
                  <h4 className="text-base font-bold tracking-[-0.31px] text-white">
                    How You&apos;re Judged
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm tracking-[-0.15px] text-[#d1d5dc]">
                          Public Twitter Engagement
                        </span>
                        <span className="text-sm font-bold tracking-[-0.15px] text-[#05df72]">
                          50%
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.1)]">
                        <div className="h-full w-1/2 bg-[#00c950]" />
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm tracking-[-0.15px] text-[#d1d5dc]">
                          Novita Team Review
                        </span>
                        <span className="text-sm font-bold tracking-[-0.15px] text-[#51a2ff]">
                          50%
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.1)]">
                        <div className="h-full w-1/2 bg-[#2b7fff]" />
                      </div>
                    </div>

                    <p className="text-xs/4 text-[#6a7282]">
                      Criteria: Visual impact, vibe, comparison clarity.
                    </p>
                  </div>
                </div>

                {/* Why Join */}
                <div
                  className="space-y-3 rounded-[14px] border border-[rgba(0,201,80,0.2)] p-5"
                  style={{
                    backgroundImage:
                      'linear-gradient(135.11deg, rgba(13, 84, 43, 0.2) 0%, rgb(0, 0, 0) 100%)',
                  }}
                >
                  <h4 className="text-base font-bold tracking-[-0.31px] text-white">Why Join?</h4>

                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-[#23d57c]" />
                      <span className="text-sm/5 tracking-[-0.15px] text-[#d1d5dc]">
                        Try cutting-edge models side by side
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-[#23d57c]" />
                      <span className="text-sm/5 tracking-[-0.15px] text-[#d1d5dc]">
                        Create viral, visual AI demos
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-[#23d57c]" />
                      <span className="text-sm/5 tracking-[-0.15px] text-[#d1d5dc]">
                        Get rewarded for insight, not code volume
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer (Floating) */}
          <div className="absolute right-0 bottom-0 left-0 z-40 flex flex-col items-center gap-4 border-t border-[rgba(255,255,255,0.1)] bg-black/80 p-6 backdrop-blur-md">
            <Button
              className="h-12 w-full max-w-[420px] rounded-[14px] bg-[#23d57c] font-mono text-base font-normal text-black shadow-[0px_0px_20px_0px_rgba(34,197,94,0.3)] hover:bg-[#1fc76f]"
              onClick={() => window.open(DISCORD_INVITE_URL, '_blank')}
            >
              👉 Join via Discord
            </Button>
            <p className="text-center text-sm tracking-[-0.15px] text-[#6a7282] italic">
              Build fast. Compare clearly. Make it share-worthy.
            </p>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
