const variants = {
  primary: 'btn-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300',
  secondary: 'btn-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300',
  danger: 'btn-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300',
}

export default function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}) {
  return (
    <button
      type="button"
      className={`${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
