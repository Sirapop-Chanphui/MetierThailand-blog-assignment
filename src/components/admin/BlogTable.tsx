'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Blog } from '@/types'
import { formatDate } from '@/lib/utils'

type BlogTableProps = {
  blogs: Blog[]
  onRefresh: () => void
}

export default function BlogTable({ blogs, onRefresh }: BlogTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handlePublish(id: string, isPublished: boolean) {
    setLoadingId(id)
    try {
      await fetch(`/api/blogs/${id}/publish`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: !isPublished }),
      })
      onRefresh()
    } finally {
      setLoadingId(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('ต้องการลบบทความนี้หรือไม่?')) return
    setLoadingId(id)
    try {
      await fetch(`/api/blogs/${id}`, { method: 'DELETE' })
      onRefresh()
    } finally {
      setLoadingId(null)
    }
  }

  if (blogs.length === 0) {
    return <p className="text-zinc-500">ยังไม่มีบทความ</p>
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50">
          <tr>
            <th className="px-4 py-3 font-medium text-zinc-700">ชื่อ</th>
            <th className="px-4 py-3 font-medium text-zinc-700">สถานะ</th>
            <th className="px-4 py-3 font-medium text-zinc-700">ผู้เข้าชม</th>
            <th className="px-4 py-3 font-medium text-zinc-700">วันที่</th>
            <th className="px-4 py-3 font-medium text-zinc-700">จัดการ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {blogs.map((blog) => (
            <tr key={blog.id} className="bg-white">
              <td className="px-4 py-3 font-medium text-zinc-900">{blog.title}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    blog.is_published
                      ? 'bg-green-100 text-green-700'
                      : 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  {blog.is_published ? 'เผยแพร่' : 'ฉบับร่าง'}
                </span>
              </td>
              <td className="px-4 py-3 text-zinc-600">{blog.view_count}</td>
              <td className="px-4 py-3 text-zinc-600">{formatDate(blog.created_at)}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handlePublish(blog.id, blog.is_published)}
                    disabled={loadingId === blog.id}
                    className="rounded-lg bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 hover:bg-amber-200 disabled:opacity-50"
                  >
                    {blog.is_published ? 'ยกเลิกเผยแพร่' : 'เผยแพร่'}
                  </button>
                  <Link
                    href={`/admin/blogs/${blog.id}/edit`}
                    className="rounded-lg bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 hover:bg-blue-200"
                  >
                    แก้ไข
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(blog.id)}
                    disabled={loadingId === blog.id}
                    className="rounded-lg bg-red-100 px-3 py-1 text-xs font-medium text-red-800 hover:bg-red-200 disabled:opacity-50"
                  >
                    ลบ
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
