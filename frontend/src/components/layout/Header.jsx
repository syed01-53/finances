export default function Header() {
  return (
    <header className="app-header px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">AW Client Report Portal</h1>
          <p className="text-sm text-slate-300">Financial reporting MVP demo</p>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-teal-300 sm:flex">
          <span className="h-2 w-2 rounded-full bg-teal-400" />
          Live workspace
        </div>
      </div>
    </header>
  )
}
