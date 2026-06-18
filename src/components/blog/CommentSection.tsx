'use client'

import { useEffect, useState } from 'react'
import { Comment } from '@/types'
import { formatDate } from '@/lib/utils'
import { validateThaiComment } from '@/lib/validations'

type CommentSectionProps = {
  blogId: string
}

const COMMENTS_PAGE_SIZE = 5

type CommentsResponse = {
  data: Comment[]
  total: number
}

export default function CommentSection({ blogId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [senderName, setSenderName] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function fetchComments(offset = 0, append = false) {
    const res = await fetch(
      `/api/comments?blog_id=${blogId}&limit=${COMMENTS_PAGE_SIZE}&offset=${offset}`
    )
    if (!res.ok) return

    const data: CommentsResponse = await res.json()
    setTotalCount(data.total)
    setComments((prev) => (append ? [...prev, ...data.data] : data.data))
  }

  useEffect(() => {
    setComments([])
    setTotalCount(0)
    setLoading(true)

    async function loadComments() {
      try {
        await fetchComments()
      } finally {
        setLoading(false)
      }
    }
    loadComments()
  }, [blogId])

  async function handleLoadMore() {
    setLoadingMore(true)
    try {
      await fetchComments(comments.length, true)
    } finally {
      setLoadingMore(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!senderName.trim()) {
      setError('กรุณากรอกชื่อผู้ส่ง')
      return
    }

    if (!validateThaiComment(message)) {
      setError('ข้อความ Comment ต้องเป็นภาษาไทย ตัวเลข หรือ / เท่านั้น')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blog_id: blogId,
          sender_name: senderName.trim(),
          message: message.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'เกิดข้อผิดพลาด')
        return
      }

      setSenderName('')
      setMessage('')
      setSubmitted(true)
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mt-12 border-t border-zinc-200 pt-8">
      <h2 className="text-2xl font-semibold text-zinc-100">ความคิดเห็น</h2>

      {loading ? (
        <p className="mt-4 text-zinc-500">กำลังโหลดความคิดเห็น...</p>
      ) : comments.length > 0 ? (
        <>
          <ul className="mt-6 space-y-4">
            {comments.map((comment) => (
              <li
                key={comment.id}
                className="rounded-lg border border-zinc-200 bg-zinc-100 p-4"
              >
                <div className="flex items-center justify-between">
                  <strong className="text-zinc-800">{comment.sender_name}</strong>
                  <time className="text-sm text-zinc-500" dateTime={comment.created_at}>
                    {formatDate(comment.created_at)}
                  </time>
                </div>
                <p className="mt-2 text-zinc-600">{comment.message}</p>
              </li>
            ))}
          </ul>
          {comments.length < totalCount && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="rounded-lg border border-zinc-300 bg-white px-6 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingMore ? 'กำลังโหลด...' : 'ดูความคิดเห็นเพิ่มเติม'}
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="mt-1 text-sm text-zinc-400">
          บทความนี้มี {totalCount.toLocaleString('th-TH')} ความคิดเห็น
        </p>
      )}



      <form onSubmit={handleSubmit} autoComplete="off" className="mt-8 space-y-4">
        <h3 className="text-lg font-medium text-zinc-200 border-t border-zinc-200 pt-8">แสดงความคิดเห็น</h3>

        {submitted && (
          <p className="rounded-lg bg-green-50 p-3 text-green-700" role="status">
            ความคิดเห็นของคุณอยู่ระหว่างการตรวจสอบ
          </p>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-red-700" role="alert">
            {error}
          </p>
        )}

        <div>
          <label htmlFor="sender-name" className="block text-sm font-medium text-zinc-400">
            ชื่อผู้ส่ง
          </label>
          <input
            id="sender-name"
            type="text"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 focus:outline-none"
            required
          />
        </div>

        <div>
          <label htmlFor="comment-message" className="block text-sm font-medium text-zinc-400">
            ข้อความ (ภาษาไทย ตัวเลข หรือ / เท่านั้น)
          </label>
          <textarea
            id="comment-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 focus:outline-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 hover:cursor-pointer disabled:opacity-50"
        >
          {submitting ? 'กำลังส่ง...' : 'ส่งความคิดเห็น'}
        </button>
      </form>
    </section>
  )
}
