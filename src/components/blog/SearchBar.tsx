'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { PaginatedResponse } from '@/types'

const SUGGEST_MIN_LENGTH = 2
const SUGGEST_DEBOUNCE_MS = 300
const SUGGEST_LIMIT = 5

export type SearchSuggestion = {
  title: string
  slug: string
  excerpt: string | null
}

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  onSearch: () => void
  onClear?: () => void
  onSelectSuggestion?: (title: string) => void
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  onClear,
  onSelectSuggestion,
}: SearchBarProps) {
  const listboxId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  useEffect(() => {
    const trimmed = value.trim()

    if (trimmed.length < SUGGEST_MIN_LENGTH) {
      setSuggestions([])
      setShowSuggestions(false)
      setActiveIndex(-1)
      return
    }

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoadingSuggestions(true)
      try {
        const params = new URLSearchParams({
          search: trimmed,
          limit: String(SUGGEST_LIMIT),
        })
        const res = await fetch(`/api/blogs?${params}`, { signal: controller.signal })
        if (!res.ok) throw new Error()

        const data: PaginatedResponse<SearchSuggestion> = await res.json()
        setSuggestions(data.data)
        setShowSuggestions(true)
        setActiveIndex(-1)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setSuggestions([])
        setShowSuggestions(false)
      } finally {
        setLoadingSuggestions(false)
      }
    }, SUGGEST_DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [value])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setShowSuggestions(false)
        setActiveIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleClear() {
    onChange('')
    onClear?.()
    setSuggestions([])
    setShowSuggestions(false)
    setActiveIndex(-1)
  }

  function handleSelectSuggestion(title: string) {
    if (onSelectSuggestion) {
      onSelectSuggestion(title)
    } else {
      onChange(title)
      onSearch()
    }
    setShowSuggestions(false)
    setActiveIndex(-1)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Escape') setShowSuggestions(false)
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => (prev + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handleSelectSuggestion(suggestions[activeIndex].title)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setActiveIndex(-1)
    }
  }

  const activeSuggestionId =
    activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined

  return (
    <form
      className="flex gap-2"
      autoComplete="off"
      onSubmit={(e) => {
        e.preventDefault()
        setShowSuggestions(false)
        onSearch()
      }}
    >
      <label htmlFor="blog-search" className="sr-only">
        ค้นหาบทความ
      </label>
      <div ref={containerRef} className="relative flex-1">
        <input
          id="blog-search"
          type="text"
          inputMode="search"
          enterKeyHint="search"
          name="blog-title-search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            if (value.trim().length >= SUGGEST_MIN_LENGTH) setShowSuggestions(true)
          }}
          onKeyDown={handleKeyDown}
          placeholder="ค้นหาจากชื่อบทความ..."
          spellCheck={false}
          data-lpignore="true"
          data-form-type="other"
          role="combobox"
          aria-expanded={showSuggestions}
          aria-controls={listboxId}
          aria-activedescendant={activeSuggestionId}
          aria-autocomplete="list"
          className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-4 pr-10 text-zinc-900 placeholder:text-zinc-500  focus:outline-none"
        />
        {value.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="ล้างการค้นหา"
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        )}

        {showSuggestions && (
          <ul
            id={listboxId}
            role="listbox"
            aria-label="คำแนะนำการค้นหา"
            className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-lg"
          >
            {loadingSuggestions ? (
              <li className="px-4 py-2 text-sm text-zinc-500">กำลังค้นหา...</li>
            ) : suggestions.length === 0 ? (
              <li className="px-4 py-3 text-sm text-zinc-500">ไม่พบผลคำค้นหาที่ใกล้เคียง</li>
            ) : (
              suggestions.map((item, index) => (
                <li key={item.slug} role="presentation">
                  <button
                    id={`${listboxId}-option-${index}`}
                    type="button"
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => handleSelectSuggestion(item.title)}
                    className={`w-full px-4 py-2 text-left transition-colors hover:bg-zinc-100 hover:cursor-pointer ${
                      index === activeIndex ? 'bg-zinc-50' : ''
                    }`}
                  >
                    <span className="block text-sm font-medium text-zinc-900">{item.title}</span>
                    {item.excerpt && (
                      <span className="mt-0.5 block text-xs text-zinc-500 line-clamp-1">
                        {item.excerpt}
                      </span>
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      <button
        type="submit"
        className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white transition-colors hover:bg-blue-700 hover:cursor-pointer"
      >
        ค้นหา
      </button>
    </form>
  )
}
