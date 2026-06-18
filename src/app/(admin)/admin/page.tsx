'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Blog, PaginatedResponse } from '@/types'
import BlogTable from '@/components/admin/BlogTable'
import Pagination from '@/components/blog/Pagination'

export default function AdminDashboardPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchBlogs = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({
        admin: 'true',
        page: String(page),
      })
      const res = await fetch(`/api/blogs?${params}`)
      if (!res.ok) throw new Error()
      const data: PaginatedResponse<Blog> = await res.json()
      setBlogs(data.data)
      setTotalPages(data.totalPages)
    } catch {
      setError('โหลดข้อมูลไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchBlogs()
  }, [fetchBlogs])

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
        <Link
          href="/admin/blogs/create"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          สร้างบทความใหม่
        </Link>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-red-700" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-zinc-500">กำลังโหลด...</p>
      ) : (
        <>
          <BlogTable blogs={blogs} onRefresh={fetchBlogs} />
          <div className="mt-6">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              classNames={{
                button:
                    'rounded-lg border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50 hover:cursor-pointer',
                  label: 'px-3 text-sm text-zinc-600',
              }}
            />
          </div>
        </>
      )}
    </div>
  )
}
