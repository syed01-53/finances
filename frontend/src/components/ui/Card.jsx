export default function Card({ title, actions, children, className = '' }) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-6 shadow-card ${className}`}
    >
      {(title || actions) && (
        <div className={`relative z-10 flex items-center justify-between gap-3 ${title || actions ? 'mb-4' : ''}`}>
          {title ? (
            <h3 className="text-lg font-semibold text-navy-900">{title}</h3>
          ) : (
            <span />
          )}
          {actions}
        </div>
      )}
      {children}
    </div>
  )
}
