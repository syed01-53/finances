import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import ActionMenu from '../components/ui/ActionMenu'
import Card from '../components/ui/Card'
import AccountForm from '../features/accounts/AccountForm'
import AccountList from '../features/accounts/AccountList'
import { createAccount } from '../features/accounts/accountApi'
import ClientForm from '../features/clients/ClientForm'
import ClientList from '../features/clients/ClientList'
import { createClient, deleteClient, getClient, updateClient } from '../features/clients/clientApi'
import ReportForm from '../features/reports/ReportForm'
import ReportList from '../features/reports/ReportList'
import { createReport } from '../features/reports/reportApi'
import { formatCurrency } from '../utils/format'
import { maskSsn } from '../utils/ssn'

export default function ClientPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) return

    let cancelled = false

    async function loadClient() {
      setLoading(true)
      setError(null)
      try {
        const data = await getClient(id)
        if (!cancelled) setClient(data)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadClient()

    return () => {
      cancelled = true
    }
  }, [id, refreshKey])

  useEffect(() => {
    if (location.state?.edit) {
      setEditing(true)
    }
  }, [id, location.state])

  async function handleCreateClient(payload) {
    setSubmitting(true)
    setError(null)
    try {
      const created = await createClient(payload)
      navigate(`/clients/${created.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdateClient(payload) {
    setSubmitting(true)
    setError(null)
    try {
      const updated = await updateClient(id, payload)
      setClient(updated)
      setEditing(false)
      setRefreshKey((value) => value + 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCreateAccount(payload) {
    setSubmitting(true)
    setError(null)
    try {
      await createAccount(id, payload)
      setRefreshKey((value) => value + 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCreateReport(payload) {
    setSubmitting(true)
    setError(null)
    try {
      const report = await createReport(id, payload)
      navigate(`/reports/${report.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteClient() {
    if (!client) return

    const confirmed = window.confirm(
      `Delete ${client.name}? This will also remove all accounts and reports for this client.`,
    )
    if (!confirmed) return

    setDeleting(true)
    setError(null)
    try {
      await deleteClient(id)
      navigate('/clients')
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  if (!id) {
    return (
      <div className="space-y-6">
        <Card title="Create Client">
          {error && <div className="mb-4 alert-error p-4">{error}</div>}
          <ClientForm onSubmit={handleCreateClient} loading={submitting} />
        </Card>
        <Card title="All Clients">
          <ClientList />
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="alert-error p-4">{error}</div>
      )}

      <Card
        title="Client Details"
        actions={
          !loading && client && !editing ? (
            <ActionMenu
              disabled={deleting}
              items={[
                {
                  label: 'Edit',
                  onClick: () => setEditing(true),
                },
                {
                  label: deleting ? 'Deleting...' : 'Delete',
                  danger: true,
                  disabled: deleting,
                  onClick: handleDeleteClient,
                },
              ]}
            />
          ) : null
        }
      >
        {loading && <p className="text-sm text-slate-500">Loading client...</p>}
        {!loading && client && !editing && (
          <>
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div><dt className="text-sm text-slate-500">Name</dt><dd className="font-medium text-navy-900">{client.name}</dd></div>
              <div><dt className="text-sm text-slate-500">Email</dt><dd className="font-medium text-navy-900">{client.email}</dd></div>
              <div><dt className="text-sm text-slate-500">Phone</dt><dd className="font-medium text-navy-900">{client.phone || '-'}</dd></div>
              <div><dt className="text-sm text-slate-500">DOB / Age</dt><dd className="font-medium text-navy-900">{client.date_of_birth || '-'} {client.age != null ? `(${client.age})` : ''}</dd></div>
              <div><dt className="text-sm text-slate-500">SSN</dt><dd className="font-medium text-navy-900">{maskSsn(client.ssn)}</dd></div>
              <div><dt className="text-sm text-slate-500">Marital Status</dt><dd className="font-medium text-navy-900">{client.is_married ? 'Married' : 'Single'}</dd></div>
              {client.is_married ? (
                <>
                  <div><dt className="text-sm text-slate-500">Spouse Name</dt><dd className="font-medium text-navy-900">{client.spouse_name || '-'}</dd></div>
                  <div><dt className="text-sm text-slate-500">Spouse DOB / Age</dt><dd className="font-medium text-navy-900">{client.spouse_date_of_birth || '-'} {client.spouse_age != null ? `(${client.spouse_age})` : ''}</dd></div>
                  <div><dt className="text-sm text-slate-500">Spouse SSN</dt><dd className="font-medium text-navy-900">{maskSsn(client.spouse_ssn)}</dd></div>
                </>
              ) : null}
              <div><dt className="text-sm text-slate-500">Salary (Inflow)</dt><dd className="font-medium text-navy-900">{formatCurrency(client.salary)}</dd></div>
              <div><dt className="text-sm text-slate-500">Expense Budget (Outflow)</dt><dd className="font-medium text-navy-900">{formatCurrency(client.expense_budget)}</dd></div>
              <div><dt className="text-sm text-slate-500">Insurance Deductibles</dt><dd className="font-medium text-navy-900">{formatCurrency(client.insurance_deductibles)}</dd></div>
              <div><dt className="text-sm text-slate-500">Last Report</dt><dd className="font-medium text-navy-900">{client.last_report_date ? new Date(client.last_report_date).toLocaleDateString() : 'None'}</dd></div>
            </dl>
          </>
        )}
        {!loading && client && editing && (
          <ClientForm
            initialValues={client}
            onSubmit={handleUpdateClient}
            loading={submitting}
            submitLabel="Save Changes"
          />
        )}
      </Card>

      <Card title="Accounts">
        <div className="space-y-6">
          <AccountForm client={client} onSubmit={handleCreateAccount} loading={submitting} />
          <AccountList clientId={id} client={client} key={refreshKey} onUpdated={() => setRefreshKey((value) => value + 1)} />
        </div>
      </Card>

      <Card title="Generate Quarterly Report">
        <div className="space-y-6">
          <ReportForm onSubmit={handleCreateReport} loading={submitting} />
          <ReportList clientId={id} key={refreshKey} />
        </div>
      </Card>
    </div>
  )
}
