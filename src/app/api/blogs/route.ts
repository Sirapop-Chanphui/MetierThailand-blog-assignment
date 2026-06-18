import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const PAGE_SIZE = 10

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const search = searchParams.get('search') || ''
  const adminMode = searchParams.get('admin') === 'true'
  const fetchAll = adminMode && searchParams.get('all') === 'true'
  const limitParam = searchParams.get('limit')
  const limit = limitParam ? parseInt(limitParam) : null

  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase.from('blogs').select('*', { count: 'exact' })

  if (!adminMode) {
    query = query.eq('is_published', true)
  }

  if (search) {
    query = query.ilike('title', `%${search}%`)
  }

  query = query.order('created_at', { ascending: false })

  if (limit && limit > 0) {
    query = query.range(0, limit - 1)
  } else if (!fetchAll) {
    query = query.range(from, to)
  }

  const { data, count, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    data,
    total: count ?? 0,
    page,
    totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from('blogs')
    .insert(body)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
