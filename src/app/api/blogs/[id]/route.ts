import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import {
  collectBlogImageUrls,
  deleteImagesFromStorage,
  getRemovedImageUrls,
} from '@/lib/storage'

async function cleanupStorage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  urls: string[]
) {
  if (urls.length === 0) return

  const storageClient = createAdminClient() ?? supabase
  await deleteImagesFromStorage(storageClient, urls)
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const { data, error } = await supabase.from('blogs').select('*').eq('id', id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()

  const { data: existing, error: fetchError } = await supabase
    .from('blogs')
    .select('cover_image, images')
    .eq('id', id)
    .single()

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'ไม่พบบทความ' }, { status: 404 })
  }

  const removedUrls = getRemovedImageUrls(existing, {
    cover_image: body.cover_image ?? null,
    images: body.images ?? [],
  })

  try {
    await cleanupStorage(supabase, removedUrls)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'ลบรูปเก่าไม่สำเร็จ'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  const { data, error } = await supabase
    .from('blogs')
    .update(body)
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

  const { data: existing, error: fetchError } = await supabase
    .from('blogs')
    .select('cover_image, images')
    .eq('id', id)
    .single()

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'ไม่พบบทความ' }, { status: 404 })
  }

  const imageUrls = collectBlogImageUrls(existing)

  try {
    await cleanupStorage(supabase, imageUrls)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'ลบรูปไม่สำเร็จ'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  const { error } = await supabase.from('blogs').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
