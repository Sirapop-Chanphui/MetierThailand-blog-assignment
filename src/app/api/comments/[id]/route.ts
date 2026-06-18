import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { action } = await request.json()

  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'การดำเนินการไม่ถูกต้อง' }, { status: 400 })
  }

  const { data: existing, error: fetchError } = await supabase
    .from('comments')
    .select('review_status')
    .eq('id', id)
    .single()

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'ไม่พบความคิดเห็น' }, { status: 404 })
  }

  const updatePayload =
    action === 'approve'
      ? { review_status: 'approved' as const, is_approved: true }
      : { review_status: 'rejected' as const, is_approved: false }

  if (existing.review_status === updatePayload.review_status) {
    return NextResponse.json(
      { error: action === 'approve' ? 'ความคิดเห็นนี้อนุมัติแล้ว' : 'ความคิดเห็นนี้ถูกปฏิเสธแล้ว' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('comments')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const { error } = await supabase.from('comments').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
