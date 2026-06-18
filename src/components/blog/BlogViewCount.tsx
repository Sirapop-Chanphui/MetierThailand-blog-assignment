'use client'

import { useEffect, useState } from 'react'

type BlogViewCountProps = {
  slug: string
  initialCount: number
}

export default function BlogViewCount({ slug, initialCount }: BlogViewCountProps) {
  const [count, setCount] = useState(initialCount)

  useEffect(() => {
    setCount(initialCount)
  }, [initialCount, slug])

  useEffect(() => {
    async function trackView() {
      try {
        const res = await fetch(`/api/blogs/${slug}/view`, { method: 'POST' })
        if (!res.ok) return

        const data = await res.json()
        if (typeof data.view_count === 'number') {
          setCount(data.view_count)
        }
      } catch {
        // ไม่ต้องแสดง error ให้ผู้ใช้
      }
    }

    trackView()
  }, [slug])

  return (
    <span>ผู้เข้าชม {count.toLocaleString('th-TH')} ครั้ง</span>
  )
}
