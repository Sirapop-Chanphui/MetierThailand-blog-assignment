'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const isLoginPage = pathname === '/admin/login'

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen">
      <aside className="relative w-56 shrink-0 border-r border-zinc-200 bg-zinc-900 text-white">
        <div className="p-6">
          <h2 className="text-lg font-bold">Admin Panel</h2>
        </div>
        <nav className="space-y-1 px-3">
          <Link
            href="/admin"
            className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
              pathname === '/admin' ? 'bg-zinc-800' : 'hover:bg-zinc-800'
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/admin/blogs/create"
            className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
              pathname === '/admin/blogs/create' ? 'bg-zinc-800' : 'hover:bg-zinc-800'
            }`}
          >
            สร้างบทความ
          </Link>
          <Link
            href="/admin/comments"
            className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
              pathname === '/admin/comments' ? 'bg-zinc-800' : 'hover:bg-zinc-800'
            }`}
          >
            จัดการ Comment
          </Link>
          <Link
            href="/"
            className="block rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            ดูหน้าเว็บ
          </Link>
        </nav>
        <div className="absolute bottom-6 left-3 right-3 w-48">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm transition-colors hover:bg-zinc-700 hover:cursor-pointer"
          >
            ออกจากระบบ
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-zinc-50 p-8">{children}</main>
    </div>
  )
}
