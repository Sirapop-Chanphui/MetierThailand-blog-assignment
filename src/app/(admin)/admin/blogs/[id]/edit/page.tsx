'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Blog } from '@/types'
import BlogForm from '@/components/admin/BlogForm'

export default function EditBlogPage() {
  const params = useParams()
  const id = typeof params?.id === 'string' ? params.id : null
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) {
      setError('ไม่พบบทความ')
      setLoading(false)
      return
    }

    async function fetchBlog() {
      try {
        const res = await fetch(`/api/blogs/${id}`)
        if (!res.ok) throw new Error()
        const data = await res.json()
        setBlog(data)
      } catch {
        setError('โหลดข้อมูลไม่สำเร็จ')
      } finally {
        setLoading(false)
      }
    }
    fetchBlog()
  }, [id])

  if (loading) return <p className="text-zinc-500">กำลังโหลด...</p>
  if (error || !blog) {
    return (
      <p className="rounded-lg bg-red-50 p-3 text-red-700" role="alert">
        {error || 'ไม่พบบทความ'}
      </p>
    )
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">แก้ไขบทความ</h1>
      <BlogForm mode="edit" blog={blog} />
    </div>
  )
}
