import Image from 'next/image'
import Link from 'next/link'
import { Blog } from '@/types'
import { formatDate } from '@/lib/utils'

type BlogCardProps = {
  blog: Blog
}

export default function BlogCard({ blog }: BlogCardProps) {
  return (
    <article className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/blog/${blog.slug}`}>
        {blog.cover_image ? (
          <div className="relative aspect-video w-full overflow-hidden bg-zinc-100">
            <Image
              src={blog.cover_image}
              alt={blog.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        ) : (
          <div className="flex aspect-video w-full items-center justify-center bg-zinc-100 text-zinc-400">
            ไม่มีรูปปก
          </div>
        )}
        <div className="p-5">
          <time className="text-sm text-zinc-500" dateTime={blog.created_at}>
            {formatDate(blog.created_at)}
          </time>
          <h2 className="mt-1 text-xl font-semibold text-zinc-900 line-clamp-2">
            {blog.title}
          </h2>
          {blog.excerpt && (
            <p className="mt-2 text-zinc-600 line-clamp-3">{blog.excerpt}</p>
          )}
        </div>
      </Link>
    </article>
  )
}
