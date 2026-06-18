import type { CommentReviewStatus } from '@/types'

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function getCommentStatusLabel(reviewStatus: CommentReviewStatus): string {
  return reviewStatus === 'pending' ? 'รอตรวจสอบ' : 'ตรวจสอบแล้ว'
}

export function isCommentReviewed(reviewStatus: CommentReviewStatus): boolean {
  return reviewStatus !== 'pending'
}

export function resolveCommentReviewStatus(comment: {
  review_status?: CommentReviewStatus
  is_approved: boolean
}): CommentReviewStatus {
  if (comment.review_status) return comment.review_status
  if (comment.is_approved) return 'approved'
  return 'pending'
}
