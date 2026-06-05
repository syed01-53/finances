import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import ActionMenu from '../components/ui/ActionMenu'
import Card from '../components/ui/Card'
import BalanceForm from '../features/balances/BalanceForm'
import BalanceList from '../features/balances/BalanceList'
import { upsertBalances } from '../features/balances/balanceApi'
import { getAccounts } from '../features/accounts/accountApi'
import ReportList from '../features/reports/ReportList'
import ReportViewer from '../features/reports/ReportViewer'
import ReportForm from '../features/reports/ReportForm'
import { deleteReport, getReport, updateReport } from '../features/reports/reportApi'

export default function ReportPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [report, setReport] = useState(null)
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (!id) return

    let cancelled = false

    async function loadReport() {
      setLoading(true)
      setError(null)
      try {
        const data = await getReport(id)
        if (!cancelled) {
          setReport(data)
          const clientAccounts = await getAccounts(data.client_id)
          if (!cancelled) setAccounts(clientAccounts)
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadReport()

    return () => {
      cancelled = true
    }
  }, [id, refreshKey])

  useEffect(() => {
    if (location.state?.edit) {
      setEditing(true)
    }
  }, [id, location.state])

  async function handleUpdateReport(payload) {
    setSubmitting(true)
    setError(null)
    try {
      await updateReport(id, payload)
      const updated = await getReport(id)
      setReport(updated)
      setEditing(false)
      setRefreshKey((value) => value + 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteReport() {
    if (!report) return

    const confirmed = window.confirm(
      `Delete ${report.title}? This will permanently remove the report and its balances.`,
    )
    if (!confirmed) return

    setDeleting(true)
    setError(null)
    try {
      await deleteReport(id)
      navigate('/reports')
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  async function handleSaveBalances(balances) {
    setSubmitting(true)
    setError(null)
    try {
      await upsertBalances(id, balances)
      const updated = await getReport(id)
      setReport(updated)
      setRefreshKey((value) => value + 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!id) {
    return (
      <div className="space-y-6">
        <Card title="All Reports">
          <p className="mb-4 text-sm text-slate-600">Select a report below or create one from a client page.</p>
          <ReportList />
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="alert-error p-4">{error}</div>
      )}

      <Card>
        {loading && <p className="text-sm text-slate-500">Loading report...</p>}
        {!loading && report && (
          <div className="space-y-4">
            <div className="flex justify-end">
              {!editing && (
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
                      onClick: handleDeleteReport,
                    },
                  ]}
                />
              )}
            </div>
            <ReportViewer report={report} />
            {editing && (
              <div className="border-t border-slate-100 pt-4">
                <p className="mb-3 text-sm font-medium text-slate-700">Edit report period</p>
                <ReportForm
                  initialValues={{ year: report.year, quarter: report.quarter }}
                  submitLabel="Save Report"
                  loading={submitting}
                  onCancel={() => setEditing(false)}
                  onSubmit={handleUpdateReport}
                />
              </div>
            )}
          </div>
        )}
      </Card>

      <Card title="Enter Balances (SACS + TCC)">
        <p className="mb-4 text-sm text-slate-600">
          Enter current balances for each account. Incomplete fields are highlighted. Use last quarter values when unchanged.
        </p>
        <BalanceForm
          reportId={id}
          accounts={accounts}
          onSubmit={handleSaveBalances}
          loading={submitting}
        />
      </Card>

      <Card title="Saved Balances">
        <BalanceList reportId={id} key={refreshKey} />
      </Card>
    </div>
  )
}
