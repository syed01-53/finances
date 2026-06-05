import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useBalances } from '../../hooks/useBalances'
import { formatCurrency } from '../../utils/format'
import { ACCOUNT_TYPES } from '../../types'

function accountLabel(type) {
  return ACCOUNT_TYPES.find((item) => item.value === type)?.label || type
}

export default function BalanceList({ reportId }) {
  const { data: balances, loading, error } = useBalances(reportId)

  if (!reportId) {
    return <p className="text-sm text-slate-500">Select a report to view balances.</p>
  }

  if (loading) return <LoadingSpinner label="Loading balances..." />
  if (error) {
    return (
      <div className="alert-error p-4">
        {error}
      </div>
    )
  }

  if (!balances?.length) {
    return <p className="text-sm text-slate-500">No balances entered yet.</p>
  }

  return (
    <ul className="divide-y panel-list">
      {balances.map((balance) => (
        <li key={balance.id} className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="font-medium text-navy-900">{balance.account?.name}</p>
            <p className="text-sm text-slate-500">
              {accountLabel(balance.account?.account_type)}
            </p>
          </div>
          <span className="text-sm font-medium text-navy-900">
            {formatCurrency(balance.amount)}
          </span>
        </li>
      ))}
    </ul>
  )
}
