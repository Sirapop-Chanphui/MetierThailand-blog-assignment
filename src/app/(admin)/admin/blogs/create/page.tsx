import BlogForm from '@/components/admin/BlogForm'

export default function CreateBlogPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">สร้างบทความใหม่</h1>
      <BlogForm mode="create" />
    </div>
  )
}
