export type ModelName = 'Claude 3.5' | 'GPT-4o' | 'Llama 3' | 'DeepSeek' | 'GLM-4' | 'Mistral'

export interface AppCard {
  id: string
  title: string
  author: string
  modelA: ModelName
  modelB: ModelName
  thumbnailA: string
  thumbnailB: string
  category: string
  likes: number
}

// Database types
export interface App {
  id: string
  user_id: string | null
  user_email: string | null
  name: string | null
  description: string | null
  prompt: string
  category: string
  model_a: string
  model_b: string
  html_content_a: string | null
  html_content_b: string | null
  preview_video_url: string | null
  cover_image_url: string | null
  like_count: number
  view_count: number
  is_public: boolean
  created_at: string
  updated_at: string
  duration_a: number | null
  tokens_a: number | null
  duration_b: number | null
  tokens_b: number | null
}

export interface IpUsage {
  ip: string
  used_count: number
  first_used_at: string
  last_used_at: string
}

export interface GenerationQuota {
  id: string
  identifier: string
  used_count: number
  last_used_at: string
  created_at: string
}

export interface Like {
  id: string
  app_id: string
  user_id: string
  created_at: string
}

// API types
export interface CreateAppRequest {
  prompt: string
  model: string
  category?: string
  name?: string
}

export interface CreateAppResponse {
  success: boolean
  appId?: string
  error?: string
  message?: string
}

export interface AppDetailResponse {
  app: App & {
    isOwner: boolean
    isLiked?: boolean
  }
}

export interface GalleryApp extends App {
  isLiked?: boolean
}

export interface GalleryResponse {
  apps: GalleryApp[]
  total: number
  page: number
  limit: number
}

export interface UserInfoResponse {
  user: {
    id: string | null
    email: string | null
  }
  quota: {
    used: number
    limit: number
    remaining: number
    type: 'anonymous' | 'authenticated' | 'paid'
  }
  novitaBalance: number | null
  novitaTokenExpired: boolean
}
