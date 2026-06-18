export type Blog = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  cover_image: string | null
  images: string[]
  is_published: boolean
  view_count: number
  created_at: string
  updated_at: string
}

export type CommentReviewStatus = 'pending' | 'approved' | 'rejected'

export type Comment = {
  id: string
  blog_id: string
  sender_name: string
  message: string
  is_approved: boolean
  review_status: CommentReviewStatus
  created_at: string
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  totalPages: number
}
