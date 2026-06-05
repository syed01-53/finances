import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/clients', label: 'Clients' },
  { to: '/reports', label: 'Reports' },
]

export default function Sidebar() {
  return (
    <aside className="app-sidebar w-64 shrink-0">
      <div className="border-b border-slate-700 px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-teal-300">AW Portal</p>
        <p className="mt-1 text-sm font-medium text-slate-100">Client Reports</p>
      </div>
      <nav className="flex flex-col gap-1 p-4">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `app-nav-link ${isActive ? 'app-nav-link-active' : ''}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
