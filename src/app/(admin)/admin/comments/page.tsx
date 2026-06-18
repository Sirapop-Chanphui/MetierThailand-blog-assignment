'use client'

import { useCallback, useEffect, useState } from 'react'
import { Blog, Comment, PaginatedResponse } from '@/types'
import CommentTable from '@/components/admin/CommentTable'
import Pagination from '@/components/blog/Pagination'

type CommentWithBlog = Comment & {
  blog?: Pick<Blog, 'title' | 'slug'>
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<CommentWithBlog[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchComments = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({
        admin: 'true',
        page: String(page),
      })

      const [commentsRes, blogsRes] = await Promise.all([
        fetch(`/api/comments?${params}`),
        fetch('/api/blogs?admin=true&all=true'),
      ])

      if (!commentsRes.ok || !blogsRes.ok) throw new Error()

      const commentsData: PaginatedResponse<Comment> = await commentsRes.json()
      const blogsData = await blogsRes.json()
      const blogMap = new Map<string, Pick<Blog, 'title' | 'slug'>>(
        blogsData.data.map((b: Blog) => [b.id, { title: b.title, slug: b.slug }])
      )

      setComments(
        commentsData.data.map((c) => ({
          ...c,
          blog: blogMap.get(c.blog_id),
        }))
      )
      setTotalPages(commentsData.totalPages)
    } catch {
      setError('โหลดข้อมูลไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">จัดการ Comment</h1>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-red-700" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-zinc-500">กำลังโหลด...</p>
      ) : (
        <>
          <CommentTable comments={comments} onRefresh={fetchComments} />
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
