import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import BlogViewCount from '@/components/blog/BlogViewCount'
import CommentSection from '@/components/blog/CommentSection'

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: blog } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!blog) notFound()

  const allImages = [
    ...(blog.cover_image ? [blog.cover_image] : []),
    ...(blog.images ?? []).slice(0, 6),
  ]

  return (
    <article className="min-h-screen">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <Link
            href="/"
            className="text-sm text-black transition-colors hover:text-zinc-600"
          >
            ← กลับหน้าหลัก
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl font-bold text-zinc-100 sm:text-4xl">
          {blog.title}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-zinc-500">
          <time dateTime={blog.created_at}>{formatDate(blog.created_at)}</time>
          <BlogViewCount slug={slug} initialCount={blog.view_count} />
        </div>

        {allImages.length > 0 && (
          <figure className="mt-8 space-y-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-zinc-100">
              <Image
                src={allImages[0]}
                alt={blog.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
              />
            </div>
            {allImages.length > 1 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {allImages.slice(1).map((url, index) => (
                  <div
                    key={url}
                    className="relative aspect-video overflow-hidden rounded-lg bg-zinc-100"
                  >
                    <Image
                      src={url}
                      alt={`${blog.title} รูปที่ ${index + 2}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 256px"
                    />
                  </div>
                ))}
              </div>
            )}
          </figure>
        )}

        <div className="prose prose-zinc mt-8 max-w-none whitespace-pre-wrap text-zinc-400">
          {blog.content}
        </div>

        <CommentSection blogId={blog.id} />
      </main>
    </article>
  )
}
