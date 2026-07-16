import { Suspense } from 'react'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ForbiddenError } from '@/lib/errors'
import { checkAppOwnerPermission } from '@/lib/permissions'
import PlaygroundClient from './playground-client'
import type { App } from '@/types'
import type { Metadata } from 'next'

interface PlaygroundPageProps {
  params: Promise<{ id: string }>
}

// Static metadata - no dynamic queries for performance
export const metadata: Metadata = {
  title: 'LLM API vs LLM Agent',
  description: 'Compare LLM API and LLM Agent generation using the same AI model.',
  robots: {
    index: false, // Don't index playground pages
    follow: false,
  },
}

export default async function PlaygroundPage({ params }: PlaygroundPageProps) {
  const { id } = await params

  // 如果 id 是 'new'，则创建新的 playground
  if (id === 'new') {
    return (
      <Suspense fallback={null}>
        <PlaygroundClient />
      </Suspense>
    )
  }

  // 否则尝试加载已有的 app
  const adminClient = await createAdminClient()
  const supabase = await createClient()

  // 获取当前用户
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: app, error } = await adminClient.from('apps').select('*').eq('id', id).single()

  if (error || !app) {
    notFound()
  }

  // 检查权限：只有原作者可以访问 playground（无论公开还是私有）
  const { canAccess } = await checkAppOwnerPermission(user, app)

  if (!canAccess) {
    throw new ForbiddenError("You don't have permission to access this battle session")
  }

  return (
    <Suspense fallback={null}>
      <PlaygroundClient initialApp={app as App} appId={id} />
    </Suspense>
  )
}
