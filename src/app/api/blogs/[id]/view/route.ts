import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // ไม่นับเมื่อ admin login อยู่
  if (user) {
    const { id: slug } = await params
    const { data: blog } = await supabase
      .from('blogs')
      .select('view_count')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()

    return NextResponse.json({
      skipped: true,
      view_count: blog?.view_count ?? 0,
    })
  }

  const { id: slug } = await params

  const { data: viewCount, error } = await supabase.rpc('increment_blog_view', {
    blog_slug: slug,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (viewCount === null) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true, view_count: viewCount })
}
