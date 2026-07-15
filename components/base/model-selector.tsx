'use client'

import React from 'react'
import { Menu } from '@base-ui/react/menu'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { LLMModel, modelGroups } from '@/lib/config'

interface ModelSelectorProps {
  /** Currently selected model */
  selectedModel: LLMModel
  /** Callback when model selection changes */
  onModelChange: (model: LLMModel) => void
  /** Visual variant: minimal (no bg) or default (white bg) */
  variant?: 'minimal' | 'default'
  /** Size: small (homepage) or medium (playground) */
  size?: 'small' | 'medium'
  /** Additional CSS classes */
  className?: string
  /** Prevent changing the model after generation starts */
  disabled?: boolean
}

export function ModelSelector({
  selectedModel,
  onModelChange,
  variant = 'default',
  size = 'medium',
  className,
  disabled = false,
}: ModelSelectorProps) {
  // Size configurations
  const sizeConfig = {
    small: {
      triggerHeight: 'h-8',
      iconSize: 20,
      textSize: 'text-[14px]',
      padding: 'px-3 py-1.5',
    },
    medium: {
      triggerHeight: 'h-8',
      iconSize: 20,
      textSize: 'text-[16px]',
      padding: 'px-3 py-1.5',
    },
  }

  const config = sizeConfig[size]

  return (
    <div suppressHydrationWarning>
      <Menu.Root>
        <Menu.Trigger
          disabled={disabled}
          className={cn(
            'inline-flex items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
            config.triggerHeight,
            disabled ? 'cursor-not-allowed opacity-65' : 'cursor-pointer',
            'gap-2',
            config.padding,
            variant === 'minimal'
              ? 'hover:bg-[#F5F5F5]' // Minimal: no background, hover only
              : 'bg-white hover:bg-[#F5F5F5]', // Default: white background with hover
            'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
            'w-full',
            className
          )}
        >
          <Image
            src={selectedModel.icon}
            alt={selectedModel.name}
            width={config.iconSize}
            height={config.iconSize}
            className="rounded-sm"
            style={{ width: config.iconSize, height: config.iconSize }}
          />
          <span className={cn('truncate font-sans font-medium text-[#4f4e4a]', config.textSize)}>
            {selectedModel.name}
          </span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="ml-auto">
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="#9e9c98"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner sideOffset={8} align="start">
            <Menu.Popup
              className={cn(
                'z-50 min-w-[8rem] overflow-hidden rounded-[14px] border border-[#e7e6e2] bg-white shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]'
              )}
            >
              <div className="scrollbar-hide flex max-h-[400px] flex-col gap-[4px] overflow-y-auto p-[7px] pt-0 pt-[12px]">
                {modelGroups.map(group => {
                  if (group.items.length === 0) return null

                  return (
                    <div key={group.group} className="mb-2 flex flex-col">
                      <p className="px-[8px] py-1 text-[12px] font-medium tracking-tight text-[#9e9c98] uppercase">
                        {group.group}
                      </p>
                      {group.items.map(model => (
                        <Menu.Item
                          key={model.id}
                          onClick={() =>
                            onModelChange({
                              ...model,
                              group: group.group,
                              color: model.color,
                              icon: model.icon,
                            })
                          }
                          className={cn(
                            'relative flex cursor-pointer items-center rounded-[10px] px-[8px] transition-colors outline-none select-none',
                            'h-[36px] w-full',
                            selectedModel.id === model.id
                              ? 'bg-[#f5f5f5]'
                              : 'hover:bg-[#f5f5f5] focus:bg-[#f5f5f5]',
                            'gap-[8px]'
                          )}
                        >
                          <Image
                            src={model.icon}
                            alt={model.name}
                            width={20}
                            height={20}
                            className="size-[20px] shrink-0 rounded-sm"
                          />
                          <span className="truncate text-[15px] leading-tight font-normal text-[#292827]">
                            {model.name}
                          </span>
                        </Menu.Item>
                      ))}
                    </div>
                  )
                })}
              </div>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </div>
  )
}
