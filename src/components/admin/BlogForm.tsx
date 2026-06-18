'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Blog } from '@/types'
import {
  generateSlug,
  isDuplicateSlugError,
  validateBlogField,
  validateBlogForm,
  type BlogFormFieldErrors,
} from '@/lib/validations'
import { createClient } from '@/lib/supabase/client'
import {
  isSupabaseStorageUrl,
  uploadBlogImage,
} from '@/lib/storage'
import ImageUploader from '@/components/ui/ImageUploader'

type BlogFormProps = {
  blog?: Blog
  mode: 'create' | 'edit'
}

type FormErrors = BlogFormFieldErrors & {
  cover?: string
  extra?: string
  submit?: string
}

const MAX_EXTRA_IMAGES = 6

async function deleteStorageImages(urls: string[]) {
  const storageUrls = urls.filter(isSupabaseStorageUrl)
  if (storageUrls.length === 0) return

  const res = await fetch('/api/storage/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ urls: storageUrls }),
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error || 'ลบรูปไม่สำเร็จ')
  }
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="mt-1 text-sm text-red-600" role="alert">
      {message}
    </p>
  )
}

function fieldClassName(hasError: boolean) {
  return `mt-1 w-full rounded-lg border px-4 py-2 text-zinc-700 focus:outline-none ${
    hasError ? 'border-red-500' : 'border-zinc-500'
  }`
}

export default function BlogForm({ blog, mode }: BlogFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState(blog?.title ?? '')
  const [slug, setSlug] = useState(blog?.slug ?? '')
  const [excerpt, setExcerpt] = useState(blog?.excerpt ?? '')
  const [content, setContent] = useState(blog?.content ?? '')
  const [coverImage, setCoverImage] = useState<string | null>(blog?.cover_image ?? null)
  const [images, setImages] = useState<string[]>(blog?.images ?? [])
  const [slugManual, setSlugManual] = useState(!!blog)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof BlogFormFieldErrors, boolean>>>({})

  const formValues = { title, slug, excerpt, content }

  function clearError(key: keyof FormErrors) {
    setErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  function validateField(field: keyof BlogFormFieldErrors, values = formValues) {
    const message = validateBlogField(field, values)
    setErrors((prev) => {
      const next = { ...prev }
      if (message) next[field] = message
      else delete next[field]
      return next
    })
    return !message
  }

  function handleBlur(field: keyof BlogFormFieldErrors) {
    setTouched((prev) => ({ ...prev, [field]: true }))
    validateField(field)
  }

  function handleTitleChange(value: string) {
    setTitle(value)
    clearError('title')
    clearError('submit')

    const nextSlug = !slugManual ? generateSlug(value) : slug
    if (!slugManual) {
      setSlug(nextSlug)
      if (touched.slug) {
        validateField('slug', { title: value, slug: nextSlug, excerpt, content })
      }
    }

    if (touched.title) {
      validateField('title', { title: value, slug: nextSlug, excerpt, content })
    }
  }

  async function handleCoverUpload(file: File) {
    setUploading(true)
    clearError('cover')
    try {
      const url = await uploadBlogImage(file, supabase)
      if (coverImage) {
        await deleteStorageImages([coverImage])
      }
      setCoverImage(url)
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        cover: err instanceof Error ? err.message : 'อัปโหลดรูปปกไม่สำเร็จ',
      }))
    } finally {
      setUploading(false)
    }
  }

  async function handleExtraUpload(file: File) {
    if (images.length >= MAX_EXTRA_IMAGES) {
      setErrors((prev) => ({
        ...prev,
        extra: `อัปโหลดรูปเพิ่มเติมได้สูงสุด ${MAX_EXTRA_IMAGES} รูป`,
      }))
      return
    }
    setUploading(true)
    clearError('extra')
    try {
      const url = await uploadBlogImage(file, supabase)
      setImages((prev) => [...prev, url])
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        extra: err instanceof Error ? err.message : 'อัปโหลดรูปไม่สำเร็จ',
      }))
    } finally {
      setUploading(false)
    }
  }

  async function handleCoverRemove() {
    if (!coverImage) return
    setUploading(true)
    clearError('cover')
    try {
      await deleteStorageImages([coverImage])
      setCoverImage(null)
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        cover: err instanceof Error ? err.message : 'ลบรูปปกไม่สำเร็จ',
      }))
    } finally {
      setUploading(false)
    }
  }

  async function handleExtraRemove(url: string) {
    setUploading(true)
    clearError('extra')
    try {
      await deleteStorageImages([url])
      setImages((prev) => prev.filter((image) => image !== url))
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        extra: err instanceof Error ? err.message : 'ลบรูปไม่สำเร็จ',
      }))
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const fieldErrors = validateBlogForm(formValues)
    setTouched({ title: true, slug: true, excerpt: true, content: true })

    if (Object.keys(fieldErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...fieldErrors }))
      return
    }

    setErrors({})
    setLoading(true)
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim() || null,
        content: content.trim(),
        cover_image: coverImage,
        images,
      }

      const url = mode === 'create' ? '/api/blogs' : `/api/blogs/${blog!.id}`
      const method = mode === 'create' ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        const apiError = data.error || 'เกิดข้อผิดพลาด'
        if (isDuplicateSlugError(apiError)) {
          setErrors({ slug: 'Slug นี้ถูกใช้แล้ว กรุณาเปลี่ยน' })
          return
        }
        setErrors({ submit: apiError })
        return
      }

      router.push('/admin')
      router.refresh()
    } catch {
      setErrors({ submit: 'เกิดข้อผิดพลาด กรุณาลองใหม่' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-zinc-700">
          ชื่อบทความ *
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          onBlur={() => handleBlur('title')}
          aria-invalid={errors.title ? true : undefined}
          className={fieldClassName(!!errors.title)}
        />
        <FieldError message={errors.title} />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-zinc-700">
          Slug *
        </label>
        <input
          id="slug"
          type="text"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value)
            setSlugManual(true)
            clearError('slug')
            clearError('submit')
            if (touched.slug) {
              validateField('slug', {
                title,
                slug: e.target.value,
                excerpt,
                content,
              })
            }
          }}
          onBlur={() => handleBlur('slug')}
          aria-invalid={errors.slug ? true : undefined}
          className={fieldClassName(!!errors.slug)}
        />
        <FieldError message={errors.slug} />
      </div>

      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium text-zinc-700">
          คำอธิบายสั้น
        </label>
        <textarea
          id="excerpt"
          value={excerpt}
          onChange={(e) => {
            setExcerpt(e.target.value)
            clearError('excerpt')
            clearError('submit')
            if (touched.excerpt) {
              validateField('excerpt', { title, slug, excerpt: e.target.value, content })
            }
          }}
          onBlur={() => handleBlur('excerpt')}
          rows={2}
          aria-invalid={errors.excerpt ? true : undefined}
          className={fieldClassName(!!errors.excerpt)}
        />
        <FieldError message={errors.excerpt} />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-zinc-700">
          เนื้อหา *
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            clearError('content')
            clearError('submit')
            if (touched.content) {
              validateField('content', { title, slug, excerpt, content: e.target.value })
            }
          }}
          onBlur={() => handleBlur('content')}
          rows={12}
          aria-invalid={errors.content ? true : undefined}
          className={fieldClassName(!!errors.content)}
        />
        <FieldError message={errors.content} />
      </div>

      <ImageUploader
        label="รูปปก"
        currentUrl={coverImage}
        onUpload={handleCoverUpload}
        onRemove={handleCoverRemove}
        disabled={uploading}
        error={errors.cover}
      />

      <ImageUploader
        label={`รูปเพิ่มเติม (${images.length}/${MAX_EXTRA_IMAGES})`}
        galleryUrls={images}
        onUpload={handleExtraUpload}
        onRemoveGalleryImage={handleExtraRemove}
        disabled={uploading || images.length >= MAX_EXTRA_IMAGES}
        error={errors.extra}
      />

      {errors.submit && (
        <p className="rounded-lg bg-red-50 p-3 text-red-700" role="alert">
          {errors.submit}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading || uploading}
          className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 hover:cursor-pointer disabled:opacity-50"
        >
          {loading ? 'กำลังบันทึก...' : mode === 'create' ? 'สร้างบทความ' : 'บันทึกการแก้ไข'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="rounded-lg border border-zinc-300 px-6 py-2 font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-800 hover:cursor-pointer"
        >
          ยกเลิก
        </button>
      </div>
    </form>
  )
}
