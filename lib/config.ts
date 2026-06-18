import { Box, Sparkles, Gamepad2, RefreshCcwDot } from 'lucide-react'

export const ANONYMOUS_QUOTA = 6
export const AUTHENTICATED_QUOTA = 20
export const PAID_QUOTA = 60

// Free tier disable configuration - set to true to disable anonymous and authenticated non-paid users
export const FREE_TIER_DISABLED = false

// Complete disable configuration - set to true to disable ALL users (including paid users)
export const ALL_GENERATION_DISABLED = false

// Novita balance threshold in integer units (1 unit = 0.0001 USD)
// Example: 100000 units = 10 USD
export const PAID_USER_BALANCE_THRESHOLD = 100000

// Coding Plan resource package name (for subscription detection)
// Set to undefined to accept any active resource package
// Set to specific name to check for exact resource package match
export const CODING_PLAN_PACKAGE_NAME: string | undefined = undefined

export const galleryCategories = [
  { id: 'all', label: 'All' },
  { id: 'physics', label: 'Physics' },
  { id: 'visual', label: 'Visual Magic' },
  { id: 'game', label: 'Micro Game Jam' },
  { id: 'general', label: 'General' },
] as const

export type GalleryCategoryId = (typeof galleryCategories)[number]['id']

export const playgroundModes = [
  {
    id: 'physics',
    label: 'Physics Playground',
    description: 'Which model can master the laws of nature?',
    color: 'bg-violet-400/80',
    icon: Box,
    prompts: [
      'Create an interactive 2D simulation of three identical balls inside a continuously rotating regular hexagon. The balls are affected by Earth-like gravity, damping, and wall friction, and must collide realistically with the moving/rotating walls and with each other (proper momentum transfer, no overlap, no tunneling, no sticking, stable over long runs). The hexagon rotation must be smooth and adjustable (speed + direction). Provide minimal controls: reset, pause, gravity toggle, restitution slider, rotation speed slider, and a slow-motion slider that scales simulation time smoothly. Add a small HUD showing FPS, total kinetic energy, and impacts per second.',
      'Create a 3D simulation of a formula 1 car performing a continuous drifting donut in the street',
      'Create a simple physics playground with hundreds of particles. Particles float, drift, and gently collide inside the canvas. Include gravity toggle, mouse interaction, and soft boundary constraints. Smooth motion, visually pleasing trails, dark background.',
    ],
    theme: {
      badge: 'bg-violet-100 text-violet-700',
      dot: 'bg-violet-500',
    },
    featuredAppId: '2f40ffd2-1e27-42e4-91a2-db16f0a9dc2d',
    videoUrl: '141bd195b3f9da2a14184dc0923555db',
    coverImage: '/images/physics-cover.png',
  },
  {
    id: 'visual',
    label: 'Visual Magic',
    description: 'Which model can turn math and code into breathtaking visuals?',
    color: 'bg-pink-400/80',
    icon: Sparkles,
    prompts: [
      `Build a "Sacred Geometry Morphing" animation using Three.js. Start with a wireframe Platonic solid (like a Dodecahedron) that smoothly morphs into a complex Menger Sponge or a Mandelbulb-inspired fractal. The lines should glow with a gradient of gold and electric blue. Add a "cinematic camera" script that slowly orbits and zooms according to a mathematical sine wave.`,
      `Create a flow field. Use 2D Perlin noise to determine the angle of movement for 5,000 particles. Particles should leave a persistent, semi-transparent trail to create a silk-like texture, and the noise offset should evolve over time`,
      `Create a flat illustration of a Great White Pelican riding a red bicycle. The pelican is drawn in a cartoonish style with a goofy expression and holds a large yellow sphere in its beak, representing the sun.  The pelican appears to be actively pedaling, with its feet in motion on the bicycle pedals. Motion lines and pink dots emphasize speed and movement. The background is a simplified blue sky with flat white clouds and small flying birds, creating a lively and playful atmosphere.`,
      `Create A futuristic 3D scientific visualization featuring a massive rotating white wireframe sphere filled with glowing, multicolored nodes connected by fine luminous lines, floating in a pitch-black space, with smooth cinematic motion, pulsing light, crisp geometry, high contrast, and a seamless looping feel—purely abstract, precise, and non-organic.`,
      `Create a spectacular fireworks scene in a pitch-black night sky, with continuous overlapping launches that burst into massive, glowing spheres of particles, realistically rising, exploding, slowing down, drifting under gravity, fading with subtle trails, viewed from a static camera looking slightly upward, and adapting smoothly to any screen size.`,
    ],
    theme: {
      badge: 'bg-pink-100 text-pink-700',
      dot: 'bg-pink-500',
    },
    featuredAppId: 'd53d17e0-52ab-4e46-a775-4c2c81f12758',
    videoUrl: '43cf4dc1567e0c73d66fcfde5729ec7a',
    coverImage: '/images/visual-cover.png',
  },
  {
    id: 'game',
    label: 'Micro Game Jam',
    description: 'Which model can create the most fun game in minutes?',
    color: 'bg-cyan-400/80',
    icon: Gamepad2,
    prompts: [
      'Create a playable Snake game with increasing difficulty.',
      'Create a Breakout-style game with paddle control and ball physics.',
    ],
    theme: {
      badge: 'bg-cyan-100 text-cyan-700',
      dot: 'bg-cyan-500',
    },
    featuredAppId: '522f487f-3c52-40d3-95fb-b988bec41aff',
    videoUrl: '1ae1febdc7b45c9204b1b2b06e4d6a96',
    coverImage: '/images/game-cover.png',
  },
  {
    id: 'general',
    label: 'General',
    description: 'Universal category for all types of prompts',
    color: 'bg-gray-400/80',
    icon: RefreshCcwDot,
    prompts: [
      'Design an elegant data visualization dashboard',
      'Create a responsive landing page with modern design',
    ],
    theme: {
      badge: 'bg-gray-100 text-gray-700',
      dot: 'bg-gray-500',
    },
    featuredAppId: null,
    videoUrl: null,
    coverImage: null,
  },
] as const

export type PlaygroundModeId = (typeof playgroundModes)[number]['id']

/** Get the category ID from playground mode label */
export function getCategoryFromModeLabel(modeLabel: string): PlaygroundModeId | '' {
  const mode = playgroundModes.find(m => m.label === modeLabel)
  return mode?.id || ''
}

/** Get playground mode by category ID */
export function getModeByCategory(categoryId: string) {
  return playgroundModes.find(m => m.id === categoryId)
}

// Models Configuration

export type LLMModel = {
  id: string
  name: string
  color: string
  icon: string
  group: string
  socialTag?: string // Tag for social media sharing hashtags
  inputPrice?: number // Price per million tokens (Mt)
  outputPrice?: number // Price per million tokens (Mt)
}

// Complete model list with all fields - single source of truth
const allModels: LLMModel[] = [
  // DeepSeek
  {
    id: 'deepseek/deepseek-v4-pro',
    name: 'DeepSeek V4 Pro',
    icon: '/logo/models/deepseek-color.svg',
    color: '#4D6BFE',
    group: 'DeepSeek',
    socialTag: 'DeepSeek',
    inputPrice: 1.6,
    outputPrice: 3.2,
  },
  {
    id: 'deepseek/deepseek-v3.2',
    name: 'DeepSeek V3.2',
    icon: '/logo/models/deepseek-color.svg',
    color: '#4D6BFE',
    group: 'DeepSeek',
    socialTag: 'DeepSeek',
    inputPrice: 0.269,
    outputPrice: 0.4,
  },
  {
    id: 'deepseek/deepseek-v3.1',
    name: 'DeepSeek V3.1',
    icon: '/logo/models/deepseek-color.svg',
    color: '#4D6BFE',
    group: 'DeepSeek',
    socialTag: 'DeepSeek',
    inputPrice: 0.269,
    outputPrice: 0.4,
  },
  // GLM
  {
    id: 'zai-org/glm-4.7',
    name: 'GLM 4.7',
    icon: '/logo/models/zai.svg',
    color: '#000',
    group: 'GLM',
    socialTag: 'GLM',
    inputPrice: 0.6,
    outputPrice: 2.2,
  },
  {
    id: 'zai-org/glm-4.6',
    name: 'GLM 4.6',
    icon: '/logo/models/zai.svg',
    color: '#000',
    group: 'GLM',
    socialTag: 'GLM',
    inputPrice: 0.6,
    outputPrice: 2.2,
  },
  {
    id: 'zai-org/glm-5',
    name: 'GLM 5',
    icon: '/logo/models/zai.svg',
    color: '#000',
    group: 'GLM',
    socialTag: 'GLM',
    inputPrice: 0.6,
    outputPrice: 2.2,
  },
  {
    id: 'zai-org/glm-5.1',
    name: 'GLM 5.1',
    icon: '/logo/models/zai.svg',
    color: '#000',
    group: 'GLM',
    socialTag: 'GLM',
    inputPrice: 1.38,
    outputPrice: 4.4,
  },
  {
    id: 'zai-org/glm-5.2',
    name: 'GLM 5.2',
    icon: '/logo/models/zai.svg',
    color: '#000',
    group: 'GLM',
    socialTag: 'GLM',
    inputPrice: 1.4,
    outputPrice: 4.4,
  },
  // Minimax
  {
    id: 'minimax/minimax-m3',
    name: 'Minimax M3',
    icon: '/logo/models/minimax-color.svg',
    color: '#F23F5D',
    group: 'Minimax',
    socialTag: 'Minimax',
    inputPrice: 0.3,
    outputPrice: 1.2,
  },
  {
    id: 'minimax/minimax-m2.1',
    name: 'Minimax M2.1',
    icon: '/logo/models/minimax-color.svg',
    color: '#F23F5D',
    group: 'Minimax',
    socialTag: 'Minimax',
    inputPrice: 0.3,
    outputPrice: 1.2,
  },
  {
    id: 'minimax/minimax-m2.5',
    name: 'Minimax M2.5',
    icon: '/logo/models/minimax-color.svg',
    color: '#F23F5D',
    group: 'Minimax',
    socialTag: 'Minimax',
    inputPrice: 0.3,
    outputPrice: 1.2,
  },
  {
    id: 'minimax/minimax-m2.7',
    name: 'Minimax M2.7',
    icon: '/logo/models/minimax-color.svg',
    color: '#F23F5D',
    group: 'Minimax',
    socialTag: 'Minimax',
    inputPrice: 0.3,
    outputPrice: 1.2,
  },
  {
    id: 'minimax/minimax-m2',
    name: 'Minimax M2',
    icon: '/logo/models/minimax-color.svg',
    color: '#F23F5D',
    group: 'Minimax',
    socialTag: 'Minimax',
    inputPrice: 0.3,
    outputPrice: 1.2,
  },
  // Kimi
  {
    id: 'moonshotai/kimi-k2.5',
    name: 'Kimi K2.5 Thinking',
    icon: '/logo/models/kimi-color.svg',
    color: '#000',
    group: 'Kimi',
    socialTag: 'Kimi',
    inputPrice: 0.6,
    outputPrice: 3.0,
  },
  {
    id: 'moonshotai/kimi-k2-thinking',
    name: 'Kimi K2 Thinking',
    icon: '/logo/models/kimi-color.svg',
    color: '#000',
    group: 'Kimi',
    socialTag: 'Kimi',
    inputPrice: 0.6,
    outputPrice: 3.0,
  },
  {
    id: 'moonshotai/kimi-k2.6',
    name: 'Kimi K2.6',
    icon: '/logo/models/kimi-color.svg',
    color: '#000',
    group: 'Kimi',
    socialTag: 'Kimi',
    inputPrice: 0.8,
    outputPrice: 3.4,
  },
  // Qwen
  {
    id: 'qwen/qwen3.7-max',
    name: 'Qwen3.7 Max',
    icon: '/logo/models/qwen-color.svg',
    color: '#615CED',
    group: 'Qwen',
    socialTag: 'Qwen',
    inputPrice: 1.25,
    outputPrice: 3.75,
  },
  {
    id: 'qwen/qwen3-coder-next',
    name: 'Qwen3 Coder Next',
    icon: '/logo/models/qwen-color.svg',
    color: '#615CED',
    group: 'Qwen',
    socialTag: 'Qwen',
    inputPrice: 0.2,
    outputPrice: 1.5,
  },
  {
    id: 'qwen/qwen3.5-397b-a17b',
    name: 'Qwen3.5-397B-A17B',
    icon: '/logo/models/qwen-color.svg',
    color: '#615CED',
    group: 'Qwen',
    socialTag: 'Qwen',
    inputPrice: 0.6,
    outputPrice: 3.6,
  },
  // InclusionAI
  {
    id: 'inclusionai/ring-2.6-1t',
    name: 'Ring 2.6 1T',
    icon: '/logo/models/antgroup-color.svg',
    color: '#1677FF',
    group: 'InclusionAI',
    socialTag: 'Ring',
    inputPrice: 0.3,
    outputPrice: 2.5,
  },
  {
    id: 'inclusionai/ling-2.6-1t',
    name: 'Ling 2.6 1T',
    icon: '/logo/models/antgroup-color.svg',
    color: '#1677FF',
    group: 'Ling',
    socialTag: 'Ling',
    inputPrice: 0,
    outputPrice: 0,
  },
  // Xiaomi MiMo
  {
    id: 'xiaomimimo/mimo-v2.5-pro',
    name: 'MiMo V2.5 Pro',
    icon: '/logo/models/xiaomi-color.svg',
    color: '#FF6900',
    group: 'Xiaomi',
    socialTag: 'MiMo',
    inputPrice: 0.522,
    outputPrice: 1.044,
  },
  // GPT
  {
    id: 'pa/gpt-5.5',
    name: 'GPT 5.5',
    icon: '/logo/models/openai.svg',
    color: '#000',
    group: 'GPT',
    socialTag: 'ChatGPT',
    inputPrice: 2.5,
    outputPrice: 15.0,
  },
  {
    id: 'pa/gpt-5.2',
    name: 'GPT 5.2',
    icon: '/logo/models/openai.svg',
    color: '#000',
    group: 'GPT',
    socialTag: 'ChatGPT',
    inputPrice: 1.75,
    outputPrice: 14.0,
  },
  {
    id: 'pa/gpt-5.4',
    name: 'GPT 5.4',
    icon: '/logo/models/openai.svg',
    color: '#000',
    group: 'GPT',
    socialTag: 'ChatGPT',
    inputPrice: 2.5,
    outputPrice: 15.0,
  },
  {
    id: 'pa/gpt-5.1-codex',
    name: 'GPT 5.1 Codex',
    icon: '/logo/models/openai.svg',
    color: '#000',
    group: 'GPT',
    socialTag: 'ChatGPT',
    inputPrice: 1.5,
    outputPrice: 12.0,
  },
  {
    id: 'pa/gt-4.1',
    name: 'GPT 4.1',
    icon: '/logo/models/openai.svg',
    color: '#000',
    group: 'GPT',
    socialTag: 'ChatGPT',
    inputPrice: 1.0,
    outputPrice: 8.0,
  },
  // Claude
  {
    id: 'pa/claude-opus-4-8',
    name: 'Claude Opus 4.8',
    icon: '/logo/models/claude-color.svg',
    color: '#D97757',
    group: 'Claude',
    socialTag: 'Claude',
    inputPrice: 5.0,
    outputPrice: 25.0,
  },
  {
    id: 'pa/claude-opus-4-6',
    name: 'Claude Opus 4.6',
    icon: '/logo/models/claude-color.svg',
    color: '#D97757',
    group: 'Claude',
    socialTag: 'Claude',
    inputPrice: 5.0,
    outputPrice: 25.0,
  },
  {
    id: 'pa/claude-opus-4-5-20251101',
    name: 'Claude Opus 4.5',
    icon: '/logo/models/claude-color.svg',
    color: '#D97757',
    group: 'Claude',
    socialTag: 'Claude',
    inputPrice: 4.0,
    outputPrice: 20.0,
  },
  {
    id: 'pa/claude-sonnet-4-5-20250929',
    name: 'Claude Sonnet 4.5',
    icon: '/logo/models/claude-color.svg',
    color: '#D97757',
    group: 'Claude',
    socialTag: 'Claude',
    inputPrice: 3,
    outputPrice: 15,
  },
  {
    id: 'pa/claude-haiku-4-5-20251001',
    name: 'Claude Haiku 4.5',
    icon: '/logo/models/claude-color.svg',
    color: '#D97757',
    group: 'Claude',
    socialTag: 'Claude',
    inputPrice: 0.5,
    outputPrice: 2.5,
  },
  // Gemini
  {
    id: 'pa/gemini-3.5-flash',
    name: 'Gemini 3.5 Flash',
    icon: '/logo/models/gemini-color.svg',
    color: '#FFF',
    group: 'Gemini',
    socialTag: 'Gemini',
    inputPrice: 0.5,
    outputPrice: 3.0,
  },
  {
    id: 'pa/gemini-3-pro-preview',
    name: 'Gemini 3 Pro',
    icon: '/logo/models/gemini-color.svg',
    color: '#FFF',
    group: 'Gemini',
    socialTag: 'Gemini',
    inputPrice: 2.0,
    outputPrice: 12.0,
  },
  {
    id: 'pa/gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro',
    icon: '/logo/models/gemini-color.svg',
    color: '#FFF',
    group: 'Gemini',
    socialTag: 'Gemini',
    inputPrice: 2.0,
    outputPrice: 12.0,
  },
  {
    id: 'pa/gemini-3-flash-preview',
    name: 'Gemini 3 Flash',
    icon: '/logo/models/gemini-color.svg',
    color: '#FFF',
    group: 'Gemini',
    socialTag: 'Gemini',
    inputPrice: 0.5,
    outputPrice: 3.0,
  },
  // Grok
  {
    id: 'pa/grok-4.20-0309-reasoning',
    name: 'Grok 4.20 Reasoning',
    icon: '/logo/models/grok.svg',
    color: '#000',
    group: 'Grok',
    socialTag: 'Grok',
    inputPrice: 0.2,
    outputPrice: 0.5,
  },
  {
    id: 'pa/grok-4-1-fast-reasoning',
    name: 'Grok 4.1 Fast Reasoning',
    icon: '/logo/models/grok.svg',
    color: '#000',
    group: 'Grok',
    socialTag: 'Grok',
    inputPrice: 0.2,
    outputPrice: 0.5,
  },
  {
    id: 'pa/grok-code-fast-1',
    name: 'Grok Code Fast 1',
    icon: '/logo/models/grok.svg',
    color: '#000',
    group: 'Grok',
    socialTag: 'Grok',
    inputPrice: 0.15,
    outputPrice: 0.4,
  },
  // Doubao
  {
    id: 'pa/doubao-1-5-pro-32k-250115',
    name: 'Doubao 1.5 Pro',
    icon: '/logo/models/doubao-color.svg',
    color: '#FFF',
    group: 'Doubao',
    socialTag: 'Doubao',
    inputPrice: 0.8,
    outputPrice: 2.0,
  },
  {
    id: 'pa/doubao-seed-1.6',
    name: 'Doubao Seed 1.6',
    icon: '/logo/models/doubao-color.svg',
    color: '#FFF',
    group: 'Doubao',
    socialTag: 'Doubao',
    inputPrice: 0.5,
    outputPrice: 1.5,
  },
]

// Create a map for quick lookup
const modelMap = new Map(allModels.map(m => [m.id, m]))

// UI selector group configuration - only declares structure and IDs
interface ModelGroupConfig {
  group: string
  modelIds: string[]
}

const modelGroupConfigs: ModelGroupConfig[] = [
  {
    group: 'Open Source',
    modelIds: [
      'deepseek/deepseek-v4-pro',
      'zai-org/glm-5.2',
      'minimax/minimax-m3',
      'moonshotai/kimi-k2.6',
      'qwen/qwen3.7-max',
      'inclusionai/ring-2.6-1t',
      'xiaomimimo/mimo-v2.5-pro',
    ],
  },
  {
    group: 'Proprietary',
    modelIds: [
      'pa/gpt-5.5',
      'pa/claude-opus-4-8',
      'pa/gemini-3.5-flash',
      'pa/grok-4.20-0309-reasoning',
    ],
  },
]

// Generate model groups with full data from allModels
interface ModelGroup {
  group: string
  items: Array<{
    id: string
    name: string
    icon: string
    color: string
    inputPrice: number
    outputPrice: number
  }>
}

export const modelGroups: ModelGroup[] = modelGroupConfigs.map(config => ({
  group: config.group,
  items: config.modelIds
    .map(id => {
      const model = modelMap.get(id)
      if (!model) {
        console.warn(`Model ${id} not found in allModels`)
        return null
      }
      return {
        id: model.id,
        name: model.name,
        icon: model.icon,
        color: model.color,
        inputPrice: model.inputPrice ?? 0,
        outputPrice: model.outputPrice ?? 0,
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null),
}))

// Export all models for backward compatibility
export const models: LLMModel[] = allModels

export const defaultModelAId = 'xiaomimimo/mimo-v2.5-pro'
export const defaultModelBId = 'pa/claude-opus-4-8'

export function getModelById(modelId: string): LLMModel | undefined {
  return models.find(m => m.id === modelId)
}

// Hackathon Configuration
export const HACKATHON_END_TIME = '2026-02-14T23:59:59Z' // Hardcoded date for now
export const HACKATHON_PARTICIPANTS = 1234

// Coding Plan Configuration
// Toggle between 'waitlist' and 'live' mode
export const CODING_PLAN_MODE: 'waitlist' | 'live' = 'live'

export const NOVITA_CODING_PLAN_URL = 'https://novita.ai/coding-plan'

export const codingPlanConfig = {
  waitlist: {
    badge: 'CODING PLAN · WAITLIST',
    title: {
      normal: 'Get early access to the',
      highlight: 'newest open-source models',
    },
    description:
      'Join the Coding Plan waitlist for priority access and pricing advantages compared to Claude Code.',
    features: [
      { icon: '/logo/early-access.svg', label: 'Early access' },
      { icon: '/logo/pricing-advantage.svg', label: 'Pricing advantage' },
      { icon: '/logo/latest-open-source-models.svg', label: 'Latest models' },
    ],
    button: {
      default: 'Join waitlist',
      checking: 'Checking...',
      joined: 'Joined',
      login: 'Log in to join',
    },
  },
  live: {
    badge: 'CODING PLAN · 1000 Slots',
    title: {
      normal: 'More tokens.',
      highlight: 'Lower cost.',
    },
    description:
      'Get more tokens per dollar with novita coding plan.\nAccess cutting-edge SOTA open-source models at unbeatable prices.',
    features: [
      { icon: '/logo/latest-open-source-models.svg', label: 'Latest models' },
      { icon: '/logo/pricing-advantage.svg', label: 'Lower cost' },
      { icon: '/logo/early-access.svg', label: 'Flexible billing' },
    ],
    button: {
      text: 'View Plans',
    },
    url: NOVITA_CODING_PLAN_URL,
  },
} as const

// External Links
export const NOVITA_BILLING_URL = 'https://novita.ai/billing'
export const DISCORD_INVITE_URL = 'https://discord.gg/MU2hWB4sYd'

// External API
export const KIMI_API_URL = 'https://api.moonshot.cn/v1/chat/completions'
export const KIMI_EXTERNAL_ID = 'kimi-k2.5'
export const ZAI_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
export const ZAI_EXTERNAL_ID = 'glm-4.7'
export const MINIMAX_API_URL = 'https://api.minimax.io/v1/chat/completions'
export const MINIMAX_EXTERNAL_ID = 'MiniMax-M2.1'

// External API Configuration
// Set to true to use vendor's direct API instead of Novita for specific models
export const USE_DIRECT_KIMI_API = false
export const USE_DIRECT_ZAI_API = false
export const USE_DIRECT_MINIMAX_API = false

// API Configuration Type
export type APIConfig = {
  url: string
  apiKey: string
  modelId: string
}

/**
 * Get API configuration based on model ID
 * Returns the appropriate API endpoint, key, and model identifier
 */
export function getAPIConfig(modelId: string): APIConfig {
  const NOVITA_API_KEY = process.env.NEXT_NOVITA_API_KEY || ''
  const NOVITA_API_URL = 'https://api.novita.ai/openai/v1/chat/completions'

  // Check if model should use direct vendor API
  if (modelId.startsWith('moonshotai/') && USE_DIRECT_KIMI_API) {
    return {
      url: KIMI_API_URL,
      apiKey: process.env.KIMI_API_KEY || '',
      modelId: KIMI_EXTERNAL_ID,
    }
  }

  if (modelId.startsWith('zai-org/') && USE_DIRECT_ZAI_API) {
    return {
      url: ZAI_API_URL,
      apiKey: process.env.ZAI_API_KEY || '',
      modelId: ZAI_EXTERNAL_ID,
    }
  }

  if (modelId.startsWith('minimax/') && USE_DIRECT_MINIMAX_API) {
    return {
      url: MINIMAX_API_URL,
      apiKey: process.env.MINIMAX_API_KEY || '',
      modelId: MINIMAX_EXTERNAL_ID,
    }
  }

  // Default: use Novita API
  return {
    url: NOVITA_API_URL,
    apiKey: NOVITA_API_KEY,
    modelId: modelId,
  }
}
