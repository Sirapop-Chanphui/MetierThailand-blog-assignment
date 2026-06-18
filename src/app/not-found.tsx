import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold text-zinc-900">404</h1>
      <p className="mt-2 text-zinc-600">ไม่พบหน้าที่คุณต้องการ</p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
      >
        กลับหน้าหลัก
      </Link>
    </div>
  )
}
