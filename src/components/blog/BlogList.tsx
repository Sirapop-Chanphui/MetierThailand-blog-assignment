import { Blog } from '@/types'
import BlogCard from './BlogCard'

type BlogListProps = {
  blogs: Blog[]
}

export default function BlogList({ blogs }: BlogListProps) {
  if (blogs.length === 0) {
    return (
      <p className="py-12 text-center text-zinc-500">ไม่พบบทความ</p>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {blogs.map((blog) => (
        <BlogCard key={blog.id} blog={blog} />
      ))}
    </div>
  )
}
