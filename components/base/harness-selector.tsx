'use client'

import { Menu } from '@base-ui/react/menu'
import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { agentHarnesses, type AgentHarness } from '@/lib/agent-comparison'
import { cn } from '@/lib/utils'

interface HarnessSelectorProps {
  selectedHarness: AgentHarness
  onHarnessChange: (harness: AgentHarness) => void
  disabled?: boolean
  size?: 'small' | 'medium'
  showAgentLabel?: boolean
  className?: string
}

export function HarnessSelector({
  selectedHarness,
  onHarnessChange,
  disabled = false,
  size = 'medium',
  showAgentLabel = true,
  className,
}: HarnessSelectorProps) {
  return (
    <Menu.Root>
      <Menu.Trigger
        disabled={disabled}
        className={cn(
          'inline-flex h-8 w-full items-center gap-2 rounded-lg border border-[#e7e6e2] bg-white px-3 text-[#4f4e4a] transition-colors',
          'hover:bg-[#f5f5f5] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
          disabled ? 'cursor-not-allowed opacity-65' : 'cursor-pointer',
          size === 'small' ? 'text-[14px]' : 'text-[15px]',
          className
        )}
      >
        <Image
          src={selectedHarness.icon}
          alt=""
          width={16}
          height={16}
          className="size-4 shrink-0 rounded-sm"
        />
        {showAgentLabel ? (
          <>
            <span className="shrink-0 font-medium">Agent</span>
            <span className="text-[#9e9c98]">·</span>
          </>
        ) : null}
        <span className="min-w-0 flex-1 truncate text-left">{selectedHarness.name}</span>
        <ChevronDown className="size-4 shrink-0 text-[#9e9c98]" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={8} align="start">
          <Menu.Popup className="z-50 min-w-[190px] rounded-lg border border-[#e7e6e2] bg-white p-1.5 shadow-lg">
            {agentHarnesses.map(harness => (
              <Menu.Item
                key={harness.id}
                onClick={() => onHarnessChange(harness)}
                className={cn(
                  'flex h-9 cursor-pointer items-center gap-2 rounded-md px-2.5 text-[14px] text-[#292827] outline-none',
                  selectedHarness.id === harness.id
                    ? 'bg-[#f0fdf4] font-medium text-[#008a34]'
                    : 'hover:bg-[#f5f5f5] focus:bg-[#f5f5f5]'
                )}
              >
                <Image
                  src={harness.icon}
                  alt=""
                  width={16}
                  height={16}
                  className="size-4 shrink-0 rounded-sm"
                />
                {harness.name}
              </Menu.Item>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
