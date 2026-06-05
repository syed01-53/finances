import { useEffect, useRef, useState } from 'react'

function DotsIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="10" cy="4" r="1.5" />
      <circle cx="10" cy="10" r="1.5" />
      <circle cx="10" cy="16" r="1.5" />
    </svg>
  )
}

export default function ActionMenu({ items = [], disabled = false, className = '' }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  if (!items.length) return null

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        type="button"
        aria-label="Open actions menu"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <DotsIcon />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 min-w-[8.5rem] overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-elevated"
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                setOpen(false)
                item.onClick?.()
              }}
              className={`block w-full px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                item.danger
                  ? 'text-rose-600 hover:bg-rose-50'
                  : 'text-slate-700 hover:bg-brand-50 hover:text-brand-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
