import type { SupabaseClient } from '@supabase/supabase-js'

export const BLOG_IMAGES_BUCKET = 'blog-images'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

export function isSupabaseStorageUrl(url: string): boolean {
  return url.includes(`/storage/v1/object/public/${BLOG_IMAGES_BUCKET}/`)
}

export function getStoragePathFromPublicUrl(url: string): string | null {
  if (!isSupabaseStorageUrl(url)) return null

  const marker = `/storage/v1/object/public/${BLOG_IMAGES_BUCKET}/`
  const index = url.indexOf(marker)
  if (index === -1) return null

  return decodeURIComponent(url.slice(index + marker.length))
}

export function collectBlogImageUrls(blog: {
  cover_image: string | null
  images?: string[] | null
}): string[] {
  return [
    ...(blog.cover_image ? [blog.cover_image] : []),
    ...(blog.images ?? []),
  ]
}

export function getRemovedImageUrls(
  before: { cover_image: string | null; images?: string[] | null },
  after: { cover_image: string | null; images?: string[] | null }
): string[] {
  const beforeUrls = new Set(collectBlogImageUrls(before))
  const afterUrls = new Set(collectBlogImageUrls(after))
  return [...beforeUrls].filter((url) => !afterUrls.has(url))
}

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'รองรับเฉพาะไฟล์ JPG, PNG, WEBP หรือ GIF'
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return 'ขนาดไฟล์ต้องไม่เกิน 5MB'
  }
  return null
}

export async function uploadBlogImage(
  file: File,
  supabase: SupabaseClient
): Promise<string> {
  const validationError = validateImageFile(file)
  if (validationError) throw new Error(validationError)

  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

  const { error } = await supabase.storage
    .from(BLOG_IMAGES_BUCKET)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })

  if (error) throw error

  const { data } = supabase.storage.from(BLOG_IMAGES_BUCKET).getPublicUrl(fileName)
  return data.publicUrl
}

export async function deleteImagesFromStorage(
  supabase: SupabaseClient,
  urls: string[]
): Promise<void> {
  const paths = urls
    .map(getStoragePathFromPublicUrl)
    .filter((path): path is string => path !== null)

  if (paths.length === 0) return

  const { error } = await supabase.storage.from(BLOG_IMAGES_BUCKET).remove(paths)
  if (error) throw error
}
