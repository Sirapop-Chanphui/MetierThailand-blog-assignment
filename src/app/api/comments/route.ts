import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { validateThaiComment } from '@/lib/validations'

const PAGE_SIZE = 14
const PUBLIC_COMMENT_PAGE_SIZE = 5

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const blogId = searchParams.get('blog_id')
  const adminMode = searchParams.get('admin') === 'true'
  const page = parseInt(searchParams.get('page') || '1')
  const limitParam = searchParams.get('limit')
  const offsetParam = searchParams.get('offset')

  let query = supabase
    .from('comments')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (blogId) query = query.eq('blog_id', blogId)
  if (!adminMode) query = query.eq('is_approved', true)

  if (adminMode) {
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    query = query.range(from, to)

    const { data, count, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({
      data,
      total: count ?? 0,
      page,
      totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
    })
  }

  if (blogId) {
    const limit = limitParam ? parseInt(limitParam) : PUBLIC_COMMENT_PAGE_SIZE
    const offset = offsetParam ? parseInt(offsetParam) : 0
    const { data, count, error } = await query.range(offset, offset + limit - 1)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({
      data,
      total: count ?? 0,
    })
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()

  if (!body.sender_name?.trim()) {
    return NextResponse.json({ error: 'กรุณากรอกชื่อผู้ส่ง' }, { status: 400 })
  }

  if (!body.blog_id?.trim()) {
    return NextResponse.json({ error: 'ไม่พบบทความ' }, { status: 400 })
  }

  if (!validateThaiComment(body.message)) {
    return NextResponse.json(
      { error: 'ข้อความ Comment ต้องเป็นภาษาไทย ตัวเลข หรือ / เท่านั้น' },
      { status: 400 }
    )
  }

  const { error } = await supabase.from('comments').insert({
    blog_id: body.blog_id,
    sender_name: body.sender_name.trim(),
    message: body.message.trim(),
    is_approved: false,
    review_status: 'pending',
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true }, { status: 201 })
}
