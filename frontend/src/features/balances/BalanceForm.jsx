import { useEffect, useState } from 'react'
import Button from '../../components/ui/Button'
import { getPreviousBalances } from './balanceApi'
import { ACCOUNT_TYPES } from '../../types'
import { formatCurrency } from '../../utils/format'

function accountLabel(type) {
  return ACCOUNT_TYPES.find((item) => item.value === type)?.label || type
}

export default function BalanceForm({ reportId, accounts = [], onSubmit, loading = false }) {
  const [entries, setEntries] = useState({})
  const [previous, setPrevious] = useState({})

  useEffect(() => {
    const initial = {}
    accounts.forEach((account) => {
      initial[account.id] = ''
    })
    setEntries(initial)
  }, [accounts])

  useEffect(() => {
    if (!reportId) return
    getPreviousBalances(reportId)
      .then((balances) => {
        const map = {}
        balances.forEach((b) => {
          map[b.account_id] = b.amount
        })
        setPrevious(map)
      })
      .catch(() => setPrevious({}))
  }, [reportId, accounts])

  function handleChange(accountId, value) {
    setEntries((prev) => ({ ...prev, [accountId]: value }))
  }

  function useLastValue(accountId) {
    if (previous[accountId] != null) {
      setEntries((prev) => ({ ...prev, [accountId]: String(previous[accountId]) }))
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    const balances = Object.entries(entries)
      .filter(([, amount]) => amount !== '' && amount !== null)
      .map(([account_id, amount]) => ({
        account_id,
        amount: Number(amount),
      }))

    if (!balances.length) return
    onSubmit?.(balances)
  }

  if (!accounts.length) {
    return (
      <p className="text-sm text-slate-500">
        Add accounts to the client before entering balances.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ul className="divide-y panel-list">
        {accounts.map((account) => {
          const isEmpty = !entries[account.id]
          const prev = previous[account.id]
          return (
            <li
              key={account.id}
              className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 ${isEmpty ? 'bg-amber-50/80' : 'hover:bg-brand-50/40'}`}
            >
              <div>
                <p className="font-medium text-navy-900">{account.name}</p>
                <p className="text-sm text-slate-500">
                  {accountLabel(account.account_type)}
                  {prev != null ? ` · Last quarter: ${formatCurrency(prev)}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {prev != null && (
                  <button
                    type="button"
                    onClick={() => useLastValue(account.id)}
                    className="text-xs text-brand-600 hover:underline"
                  >
                    Use last value
                  </button>
                )}
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={entries[account.id] ?? ''}
                  onChange={(event) => handleChange(account.id, event.target.value)}
                  className="field-input w-40"
                />
              </div>
            </li>
          )
        })}
      </ul>

      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save Balances'}
      </Button>
    </form>
  )
}
