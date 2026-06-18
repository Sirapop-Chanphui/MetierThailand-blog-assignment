const SKELETON_COUNT = 6

function BlogCardSkeleton() {
  return (
    <article
      aria-hidden="true"
      className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
    >
      <div className="aspect-video w-full animate-pulse bg-zinc-200" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />
        <div className="h-6 w-full animate-pulse rounded bg-zinc-200" />
        <div className="h-6 w-4/5 animate-pulse rounded bg-zinc-200" />
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-zinc-200" />
          <div className="h-4 w-full animate-pulse rounded bg-zinc-200" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-200" />
        </div>
      </div>
    </article>
  )
}

export default function BlogListSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="กำลังโหลดบทความ"
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: SKELETON_COUNT }, (_, index) => (
        <BlogCardSkeleton key={index} />
      ))}
    </div>
  )
}
