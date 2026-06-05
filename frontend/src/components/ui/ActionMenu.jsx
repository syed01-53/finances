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

    const timer = window.setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
    }, 0)

    document.addEventListener('keydown', handleEscape)

    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  if (!items.length) return null

  return (
    <div
      className={`action-menu ${open ? 'action-menu-open' : ''} ${className}`.trim()}
      ref={menuRef}
    >
      <button
        type="button"
        aria-label="Open actions menu"
        aria-expanded={open}
        aria-haspopup="menu"
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
        className="action-menu-toggle"
      >
        <DotsIcon />
      </button>

      {open && (
        <div role="menu" className="action-menu-dropdown">
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
              className={`action-menu-item ${item.danger ? 'action-menu-item-danger' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
