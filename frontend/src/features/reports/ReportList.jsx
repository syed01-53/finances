import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ActionMenu from '../../components/ui/ActionMenu'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { deleteReport } from './reportApi'
import { useReports } from '../../hooks/useReports'

export default function ReportList({ clientId }) {
  const navigate = useNavigate()
  const { data: reports, loading, error, refetch } = useReports(clientId)
  const [deletingId, setDeletingId] = useState(null)
  const [actionError, setActionError] = useState(null)

  async function handleDelete(report) {
    const confirmed = window.confirm(
      `Delete ${report.title}? This will permanently remove the report and its balances.`,
    )
    if (!confirmed) return

    setDeletingId(report.id)
    setActionError(null)
    try {
      await deleteReport(report.id)
      refetch()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) return <LoadingSpinner label="Loading reports..." />
  if (error) {
    return (
      <div className="alert-error p-4">
        {error}
      </div>
    )
  }

  if (!reports?.length) {
    return <p className="text-sm text-slate-500">No reports found yet.</p>
  }

  return (
    <div className="space-y-3">
      {actionError && (
        <div className="alert-error">
          {actionError}
        </div>
      )}
      <ul className="divide-y panel-list">
        {reports.map((report) => (
          <li key={report.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-brand-50/50">
            <Link
              to={`/reports/${report.id}`}
              className="min-w-0 flex-1 link-brand"
            >
              <p className="font-medium text-navy-900">{report.title}</p>
              <p className="text-sm text-slate-500">
                {report.client_name ? `${report.client_name} · ` : ''}
                {report.year} Q{report.quarter}
              </p>
            </Link>
            <ActionMenu
              disabled={deletingId === report.id}
              items={[
                {
                  label: 'Edit',
                  onClick: () => navigate(`/reports/${report.id}`, { state: { edit: true } }),
                },
                {
                  label: deletingId === report.id ? 'Deleting...' : 'Delete',
                  danger: true,
                  disabled: deletingId === report.id,
                  onClick: () => handleDelete(report),
                },
              ]}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
