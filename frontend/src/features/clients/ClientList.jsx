import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ActionMenu from '../../components/ui/ActionMenu'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { deleteClient } from './clientApi'
import { useClients } from '../../hooks/useClients'

export default function ClientList() {
  const navigate = useNavigate()
  const { data: clients, loading, error, refetch } = useClients()
  const [deletingId, setDeletingId] = useState(null)
  const [actionError, setActionError] = useState(null)

  async function handleDelete(client) {
    const confirmed = window.confirm(
      `Delete ${client.name}? This will also remove all accounts and reports for this client.`,
    )
    if (!confirmed) return

    setDeletingId(client.id)
    setActionError(null)
    try {
      await deleteClient(client.id)
      refetch()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) return <LoadingSpinner label="Loading clients..." />
  if (error) {
    return (
      <div className="alert-error p-4">
        {error}
      </div>
    )
  }

  if (!clients?.length) {
    return <p className="text-sm text-slate-500">No clients found yet.</p>
  }

  return (
    <div className="space-y-3">
      {actionError && (
        <div className="alert-error">
          {actionError}
        </div>
      )}
      <ul className="divide-y panel-list">
        {clients.map((client) => (
          <li key={client.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-brand-50/50">
            <Link
              to={`/clients/${client.id}`}
              className="min-w-0 flex-1 link-brand"
            >
              <p className="font-medium text-navy-900">{client.name}</p>
              <p className="text-sm text-slate-500">
                {client.email}
                {client.age != null ? ` · Age ${client.age}` : ''}
                {client.last_report_date
                  ? ` · Last report ${new Date(client.last_report_date).toLocaleDateString()}`
                  : ' · No reports yet'}
              </p>
            </Link>
            <ActionMenu
              disabled={deletingId === client.id}
              items={[
                {
                  label: 'Edit',
                  onClick: () => navigate(`/clients/${client.id}`, { state: { edit: true } }),
                },
                {
                  label: deletingId === client.id ? 'Deleting...' : 'Delete',
                  danger: true,
                  disabled: deletingId === client.id,
                  onClick: () => handleDelete(client),
                },
              ]}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
