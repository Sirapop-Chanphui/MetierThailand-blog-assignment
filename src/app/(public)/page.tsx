'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Blog, PaginatedResponse } from '@/types'
import BlogList from '@/components/blog/BlogList'
import BlogListSkeleton from '@/components/blog/BlogListSkeleton'
import SearchBar from '@/components/blog/SearchBar'
import Pagination from '@/components/blog/Pagination'

export default function HomePage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchBlogs = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({
        page: String(page),
        search: searchQuery,
      })
      const res = await fetch(`/api/blogs?${params}`)
      if (!res.ok) throw new Error('โหลดข้อมูลไม่สำเร็จ')
      const data: PaginatedResponse<Blog> = await res.json()
      setBlogs(data.data)
      setTotalPages(data.totalPages)
    } catch {
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } finally {
      setLoading(false)
    }
  }, [page, searchQuery])

  useEffect(() => {
    fetchBlogs()
  }, [fetchBlogs])

  function handleSearch() {
    setPage(1)
    setSearchQuery(search)
  }

  function handleClear() {
    setSearch('')
    setSearchQuery('')
    setPage(1)
  }

  function handleSelectSuggestion(title: string) {
    setSearch(title)
    setSearchQuery(title)
    setPage(1)
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
          <h1 className="text-2xl font-bold text-zinc-900">
            <Link href="/">Blog</Link>
          </h1>
          <Link
            href="/admin"
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
          >
            Admin
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <section className="mb-8">
          <SearchBar
            value={search}
            onChange={setSearch}
            onSearch={handleSearch}
            onClear={handleClear}
            onSelectSuggestion={handleSelectSuggestion}
          />
        </section>

        {error && (
          <p className="mb-6 rounded-lg bg-red-50 p-4 text-red-700" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <BlogListSkeleton />
        ) : (
          <>
            <BlogList blogs={blogs} />
            <div className="mt-8">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                classNames={{
                  button:
                    'rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 hover:cursor-pointer',
                  label: 'px-3 text-sm text-zinc-600',
                }}
              />
            </div>
          </>
        )}
      </main>
    </div>
  )
}
