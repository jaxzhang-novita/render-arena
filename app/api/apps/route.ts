import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getModelById } from '@/lib/config'
import type { GalleryResponse, GalleryApp, CreateAppRequest, CreateAppResponse, App } from '@/types'

/**
 * GET /api/apps
 * 获取应用列表（画廊）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryFilter = searchParams.get('category') || 'all' // 分类筛选: all, physics, visual, game
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = (page - 1) * limit

    const adminClient = await createAdminClient()

    // 构建查询 - 直接查询 apps 表（user_email 已冗余存储）
    let query = adminClient.from('apps').select('*', { count: 'exact' }).eq('is_public', true)

    // 分类筛选
    if (categoryFilter && categoryFilter !== 'all') {
      query = query.eq('category', categoryFilter)
    }

    // 默认按点赞数排序，增加创建时间作为二级排序保证稳定性
    query = query
      .order('like_count', { ascending: false })
      .order('created_at', { ascending: false })

    // 分页
    query = query.range(offset, offset + limit - 1)

    const { data: apps, error, count } = await query

    if (error) {
      console.error('Error fetching apps:', error)
      return NextResponse.json({ error: 'Failed to fetch apps' }, { status: 500 })
    }

    // 查询当前用户的点赞状态
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    let userLikes: Set<string> = new Set()
    if (user && apps && apps.length > 0) {
      const appIds = apps.map(app => app.id)
      const { data: likes } = await adminClient
        .from('likes')
        .select('app_id')
        .eq('user_id', user.id)
        .in('app_id', appIds)

      if (likes) {
        userLikes = new Set(likes.map(like => like.app_id))
      }
    }

    // apps 表已包含 user_email，添加用户点赞状态
    const appsWithLikeStatus: GalleryApp[] = (apps || []).map((app: App) => ({
      ...app,
      isLiked: userLikes.has(app.id),
    }))

    const response: GalleryResponse = {
      apps: appsWithLikeStatus,
      total: count || 0,
      page,
      limit,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in GET /api/apps:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateAppRequest = await request.json()
    const { prompt, model, category = '', name } = body

    // Read fingerprint from cookie (set by client-side FingerprintJS)
    const fingerprint = request.cookies.get('browser_fingerprint')?.value || null

    if (!prompt?.trim()) {
      return NextResponse.json(
        { success: false, error: 'INVALID_PROMPT', message: 'Prompt is required' },
        { status: 400 }
      )
    }

    if (!model || !getModelById(model)) {
      return NextResponse.json(
        { success: false, error: 'INVALID_MODEL', message: 'A valid model is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const adminClient = await createAdminClient()

    // 获取当前用户
    const {
      data: { user },
    } = await supabase.auth.getUser()

    let userId: string | null = null
    let userEmail: string | null = null

    if (user) {
      userId = user.id

      const { data: userData } = await adminClient
        .from('users')
        .select('email')
        .eq('id', user.id)
        .single()

      userEmail = userData?.email || null
    }

    const { data: app, error: appError } = await adminClient
      .from('apps')
      .insert({
        user_id: userId,
        user_email: userEmail,
        fingerprint_id: userId ? null : fingerprint || null,
        prompt: prompt.trim(),
        model_a: model,
        model_b: model,
        category: category,
        name: name ? name.slice(0, 100) : null,
      })
      .select('id')
      .single()

    if (appError) {
      console.error('Error creating app:', appError)
      return NextResponse.json(
        { success: false, error: 'CREATE_FAILED', message: 'Failed to create app' },
        { status: 500 }
      )
    }

    const response: CreateAppResponse = {
      success: true,
      appId: app.id,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in POST /api/apps:', error)
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    )
  }
}
