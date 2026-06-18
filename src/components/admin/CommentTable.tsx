'use client'

import { useState } from 'react'
import { Comment, Blog } from '@/types'
import { formatDate, getCommentStatusLabel, isCommentReviewed, resolveCommentReviewStatus } from '@/lib/utils'

type CommentWithBlog = Comment & {
  blog?: Pick<Blog, 'title' | 'slug'>
}

type CommentTableProps = {
  comments: CommentWithBlog[]
  onRefresh: () => void
}

export default function CommentTable({ comments, onRefresh }: CommentTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleReview(id: string, action: 'approve' | 'reject') {
    setLoadingId(id)
    setError('')
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'ดำเนินการไม่สำเร็จ')
        return
      }

      onRefresh()
    } catch {
      setError('ดำเนินการไม่สำเร็จ')
    } finally {
      setLoadingId(null)
    }
  }

  if (comments.length === 0) {
    return <p className="text-zinc-500">ยังไม่มีความคิดเห็น</p>
  }

  return (
    <div>
      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-zinc-200">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50">
            <tr>
              <th className="px-4 py-3 font-medium text-zinc-700">ชื่อผู้ส่ง</th>
              <th className="px-4 py-3 font-medium text-zinc-700">ข้อความ</th>
              <th className="px-4 py-3 font-medium text-zinc-700">บทความ</th>
              <th className="px-4 py-3 font-medium text-zinc-700">วันที่</th>
              <th className="px-4 py-3 font-medium text-zinc-700">สถานะ</th>
              <th className="px-4 py-3 font-medium text-zinc-700">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {comments.map((comment) => {
              const reviewStatus = resolveCommentReviewStatus(comment)
              const reviewed = isCommentReviewed(reviewStatus)

              return (
                <tr key={comment.id} className="bg-white">
                  <td className="px-4 py-3 font-medium text-zinc-900">{comment.sender_name}</td>
                  <td className="max-w-xs px-4 py-3 text-zinc-600">
                    <p className="line-clamp-2">{comment.message}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {comment.blog?.title ?? comment.blog_id}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{formatDate(comment.created_at)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        reviewed
                          ? 'bg-zinc-100 text-zinc-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {getCommentStatusLabel(reviewStatus)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleReview(comment.id, 'approve')}
                        disabled={loadingId === comment.id || reviewStatus === 'approved'}
                        aria-pressed={reviewStatus === 'approved'}
                        className={`rounded-lg px-3 py-1 text-xs font-medium hover:cursor-pointer transition-colors disabled:cursor-not-allowed ${
                          reviewStatus === 'approved'
                            ? 'bg-green-600 text-white'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReview(comment.id, 'reject')}
                        disabled={loadingId === comment.id || reviewStatus === 'rejected'}
                        aria-pressed={reviewStatus === 'rejected'}
                        className={`rounded-lg px-3 py-1 text-xs font-medium hover:cursor-pointer transition-colors disabled:cursor-not-allowed ${
                          reviewStatus === 'rejected'
                            ? 'bg-red-600 text-white'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
