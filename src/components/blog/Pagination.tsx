'use client'

export type PaginationClassNames = {
  nav?: string
  button: string
  label: string
}

type PaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  classNames: PaginationClassNames
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  classNames,
}: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav
      aria-label="การแบ่งหน้า"
      className={`flex items-center justify-center gap-2 ${classNames.nav ?? ''}`}
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className={classNames.button}
      >
        ก่อนหน้า
      </button>
      <span className={classNames.label}>
        หน้า {page} จาก {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className={classNames.button}
      >
        ถัดไป
      </button>
    </nav>
  )
}
