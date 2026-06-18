import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { deleteImagesFromStorage } from '@/lib/storage'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const urls = Array.isArray(body.urls) ? body.urls.filter((u: unknown) => typeof u === 'string') : []

  if (urls.length === 0) {
    return NextResponse.json({ success: true, deleted: 0 })
  }

  try {
    const storageClient = createAdminClient() ?? supabase
    await deleteImagesFromStorage(storageClient, urls)
    return NextResponse.json({ success: true, deleted: urls.length })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'ลบรูปไม่สำเร็จ'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
