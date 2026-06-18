// ภาษาไทย ตัวเลข space และ / เท่านั้น
export const THAI_ONLY_REGEX = /^[ก-๙๐-๙0-9\s/]+$/

const SLUG_REGEX = /^[a-z0-9ก-๙]+(?:-[a-z0-9ก-๙]+)*$/

export const BLOG_LIMITS = {
  titleMin: 3,
  titleMax: 200,
  slugMin: 3,
  slugMax: 120,
  excerptMax: 300,
  contentMin: 10,
  contentMax: 50000,
} as const

export type BlogFormValues = {
  title: string
  slug: string
  excerpt: string
  content: string
}

export type BlogFormFieldErrors = Partial<Record<keyof BlogFormValues, string>>

export function validateThaiComment(message: string): boolean {
  return THAI_ONLY_REGEX.test(message.trim())
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-ก-๙]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function validateTitle(title: string): string | undefined {
  const value = title.trim()
  if (!value) return 'กรุณากรอกชื่อบทความ'
  if (value.length < BLOG_LIMITS.titleMin) {
    return `ชื่อบทความต้องมีอย่างน้อย ${BLOG_LIMITS.titleMin} ตัวอักษร`
  }
  if (value.length > BLOG_LIMITS.titleMax) {
    return `ชื่อบทความต้องไม่เกิน ${BLOG_LIMITS.titleMax} ตัวอักษร`
  }
  return undefined
}

function validateSlug(slug: string): string | undefined {
  const value = slug.trim()
  if (!value) return 'กรุณากรอก Slug'
  if (value.length < BLOG_LIMITS.slugMin) {
    return `Slug ต้องมีอย่างน้อย ${BLOG_LIMITS.slugMin} ตัวอักษร`
  }
  if (value.length > BLOG_LIMITS.slugMax) {
    return `Slug ต้องไม่เกิน ${BLOG_LIMITS.slugMax} ตัวอักษร`
  }
  if (!SLUG_REGEX.test(value)) {
    return 'Slug ใช้ได้เฉพาะตัวพิมพ์เล็ก ตัวเลข ขีดกลาง และภาษาไทย'
  }
  return undefined
}

function validateExcerpt(excerpt: string): string | undefined {
  const value = excerpt.trim()
  if (value.length > BLOG_LIMITS.excerptMax) {
    return `คำอธิบายสั้นต้องไม่เกิน ${BLOG_LIMITS.excerptMax} ตัวอักษร`
  }
  return undefined
}

function validateContent(content: string): string | undefined {
  const value = content.trim()
  if (!value) return 'กรุณากรอกเนื้อหา'
  if (value.length < BLOG_LIMITS.contentMin) {
    return `เนื้อหาต้องมีอย่างน้อย ${BLOG_LIMITS.contentMin} ตัวอักษร`
  }
  if (value.length > BLOG_LIMITS.contentMax) {
    return `เนื้อหาต้องไม่เกิน ${BLOG_LIMITS.contentMax.toLocaleString('th-TH')} ตัวอักษร`
  }
  return undefined
}

export function validateBlogField(
  field: keyof BlogFormValues,
  values: BlogFormValues
): string | undefined {
  switch (field) {
    case 'title':
      return validateTitle(values.title)
    case 'slug':
      return validateSlug(values.slug)
    case 'excerpt':
      return validateExcerpt(values.excerpt)
    case 'content':
      return validateContent(values.content)
  }
}

export function validateBlogForm(values: BlogFormValues): BlogFormFieldErrors {
  const errors: BlogFormFieldErrors = {}

  const titleError = validateTitle(values.title)
  const slugError = validateSlug(values.slug)
  const excerptError = validateExcerpt(values.excerpt)
  const contentError = validateContent(values.content)

  if (titleError) errors.title = titleError
  if (slugError) errors.slug = slugError
  if (excerptError) errors.excerpt = excerptError
  if (contentError) errors.content = contentError

  return errors
}

export function hasValidationErrors(errors: BlogFormFieldErrors): boolean {
  return Object.keys(errors).length > 0
}

export function isDuplicateSlugError(message: string): boolean {
  const lower = message.toLowerCase()
  return lower.includes('slug') || lower.includes('duplicate') || lower.includes('unique')
}
