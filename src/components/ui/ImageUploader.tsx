'use client'

import { useId, useRef } from 'react'
import Image from 'next/image'

type ImageUploaderProps = {
  label: string
  currentUrl?: string | null
  galleryUrls?: string[]
  onUpload: (file: File) => Promise<void>
  onRemove?: () => void
  onRemoveGalleryImage?: (url: string) => void
  disabled?: boolean
  error?: string
}

function ImagePreview({
  src,
  alt,
  onRemove,
  disabled,
  removeLabel,
}: {
  src: string
  alt: string
  onRemove?: () => void
  disabled?: boolean
  removeLabel: string
}) {
  return (
    <div className="relative inline-block">
      <div className="relative h-32 w-48 overflow-hidden rounded-lg border border-zinc-200">
        <Image src={src} alt={alt} fill className="object-cover" sizes="192px" />
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs text-white disabled:opacity-50 hover:cursor-pointer hover:bg-red-500"
          aria-label={removeLabel}
        >
          ×
        </button>
      )}
    </div>
  )
}

export default function ImageUploader({
  label,
  currentUrl,
  galleryUrls,
  onUpload,
  onRemove,
  onRemoveGalleryImage,
  disabled = false,
  error,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const errorId = useId()

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    await onUpload(file)
    if (inputRef.current) inputRef.current.value = ''
  }

  const hasGallery = galleryUrls && galleryUrls.length > 0
  const isGalleryMode = galleryUrls !== undefined
  const uploadButtonLabel = isGalleryMode
    ? hasGallery
      ? 'เลือกรูปเพิ่ม'
      : 'เลือกรูปภาพ'
    : currentUrl
      ? 'เปลี่ยนรูป'
      : 'เลือกรูปภาพ'

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-zinc-700">{label}</span>

      {hasGallery && (
        <ul className="flex flex-wrap gap-3">
          {galleryUrls.map((url, index) => (
            <li key={url}>
              <ImagePreview
                src={url}
                alt={`${label} ${index + 1}`}
                onRemove={
                  onRemoveGalleryImage
                    ? () => onRemoveGalleryImage(url)
                    : undefined
                }
                disabled={disabled}
                removeLabel={`ลบ${label} ${index + 1}`}
              />
            </li>
          ))}
        </ul>
      )}

      {!hasGallery && currentUrl && (
        <ImagePreview
          src={currentUrl}
          alt={label}
          onRemove={onRemove}
          disabled={disabled}
          removeLabel={`ลบ${label}`}
        />
      )}

      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="sr-only"
          tabIndex={-1}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 hover:cursor-pointer"
        >
          {uploadButtonLabel}
        </button>
        {error && (
          <p
            id={errorId}
            className="mt-2 rounded-lg bg-red-50 p-2 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
