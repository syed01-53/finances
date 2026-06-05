import { useEffect, useMemo, useState } from 'react'
import Button from '../../components/ui/Button'
import { getBalances, getPreviousBalances } from './balanceApi'
import { ACCOUNT_TYPES } from '../../types'
import { formatCurrency } from '../../utils/format'
import {
  ACCOUNT_SECTIONS,
  INVESTMENT_TYPES,
  calculateSacs,
  calculateTccFromEntries,
} from '../../utils/calculations'

function accountLabel(type) {
  return ACCOUNT_TYPES.find((item) => item.value === type)?.label || type
}

function MetricRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      <span className="text-sm font-medium text-navy-900">{formatCurrency(value)}</span>
    </div>
  )
}

export default function BalanceForm({
  reportId,
  accounts = [],
  client = null,
  onSubmit,
  loading = false,
}) {
  const [entries, setEntries] = useState({})
  const [cashEntries, setCashEntries] = useState({})
  const [previous, setPrevious] = useState({})

  const sacs = useMemo(() => calculateSacs(client), [client])
  const liveTcc = useMemo(
    () => calculateTccFromEntries(accounts, entries),
    [accounts, entries],
  )

  const incompleteCount = useMemo(
    () => accounts.filter((account) => !entries[account.id]).length,
    [accounts, entries],
  )

  useEffect(() => {
    const initial = {}
    const cashInitial = {}
    accounts.forEach((account) => {
      initial[account.id] = ''
      cashInitial[account.id] = ''
    })
    setEntries(initial)
    setCashEntries(cashInitial)
  }, [accounts])

  useEffect(() => {
    if (!reportId) return

    let cancelled = false

    async function loadBalances() {
      try {
        const [current, prior] = await Promise.all([
          getBalances(reportId),
          getPreviousBalances(reportId),
        ])
        if (cancelled) return

        const currentMap = {}
        const cashMap = {}
        current.forEach((balance) => {
          currentMap[balance.account_id] = String(balance.amount)
          if (balance.cash_amount != null) {
            cashMap[balance.account_id] = String(balance.cash_amount)
          }
        })
        setEntries((prev) => ({ ...prev, ...currentMap }))

        const priorMap = {}
        prior.forEach((balance) => {
          priorMap[balance.account_id] = balance.amount
        })
        setPrevious(priorMap)
        setCashEntries((prev) => ({ ...prev, ...cashMap }))
      } catch {
        if (!cancelled) setPrevious({})
      }
    }

    loadBalances()
    return () => {
      cancelled = true
    }
  }, [reportId, accounts])

  function handleChange(accountId, value) {
    setEntries((prev) => ({ ...prev, [accountId]: value }))
  }

  function handleCashChange(accountId, value) {
    setCashEntries((prev) => ({ ...prev, [accountId]: value }))
  }

  function useLastValue(accountId) {
    if (previous[accountId] != null) {
      setEntries((prev) => ({ ...prev, [accountId]: String(previous[accountId]) }))
    }
  }

  function useLastForAll() {
    const next = { ...entries }
    accounts.forEach((account) => {
      if (!next[account.id] && previous[account.id] != null) {
        next[account.id] = String(previous[account.id])
      }
    })
    setEntries(next)
  }

  function handleSubmit(event) {
    event.preventDefault()
    const balances = accounts.map((account) => ({
      account_id: account.id,
      amount: Number(entries[account.id]),
      cash_amount: cashEntries[account.id] !== '' && cashEntries[account.id] != null
        ? Number(cashEntries[account.id])
        : null,
    }))

    if (balances.some((entry) => Number.isNaN(entry.amount))) return
    onSubmit?.(balances)
  }

  function renderAccountRow(account) {
    const isEmpty = !entries[account.id]
    const prev = previous[account.id]
    const showCash = INVESTMENT_TYPES.has(account.account_type)

    return (
      <li
        key={account.id}
        className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 ${isEmpty ? 'bg-amber-50' : ''}`}
      >
        <div>
          <p className="font-medium text-navy-900">{account.name}</p>
          <p className="text-sm text-slate-500">
            {accountLabel(account.account_type)}
            {account.account_last_four ? ` · ...${account.account_last_four}` : ''}
            {prev != null ? ` · Last quarter: ${formatCurrency(prev)}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {prev != null && (
            <button
              type="button"
              onClick={() => useLastValue(account.id)}
              className="text-xs font-medium"
              style={{ color: '#0f766e' }}
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
            className="field-input w-36"
            required
          />
          {showCash && (
            <input
              type="number"
              step="0.01"
              placeholder="Cash bal."
              title="Cash balance (investment accounts)"
              value={cashEntries[account.id] ?? ''}
              onChange={(event) => handleCashChange(account.id, event.target.value)}
              className="field-input w-28"
            />
          )}
        </div>
      </li>
    )
  }

  if (!accounts.length) {
    return (
      <p className="text-sm text-slate-500">
        Add accounts to the client before entering balances.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {client && sacs && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-navy-900">SACS — Cash Flow (pre-filled from client)</h3>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <MetricRow label="Monthly Inflow (Salary)" value={sacs.inflow} />
            <MetricRow label="Monthly Outflow (Expense Budget)" value={sacs.outflow} />
            <MetricRow label="Monthly Excess" value={sacs.excess} />
            <MetricRow label="Private Reserve Target" value={sacs.privateReserveTarget} />
            <MetricRow label="Account Floor (buffer)" value={sacs.floorAmount} />
          </div>
        </div>
      )}

      {Object.keys(previous).length > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={useLastForAll}
            className="text-sm font-medium"
            style={{ color: '#0f766e' }}
          >
            Use last quarter for all empty fields
          </button>
        </div>
      )}

      {ACCOUNT_SECTIONS.map((section) => {
        const sectionAccounts = accounts.filter((account) =>
          section.types.includes(account.account_type),
        )
        if (!sectionAccounts.length) return null

        return (
          <div key={section.id}>
            <h3 className="mb-2 text-sm font-semibold text-navy-900">{section.title}</h3>
            <ul className="divide-y panel-list">
              {sectionAccounts.map(renderAccountRow)}
            </ul>
          </div>
        )
      })}

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="mb-2 text-sm font-semibold text-navy-900">Live TCC Totals</h3>
        <MetricRow label="Client 1 Retirement" value={liveTcc.client1Retirement} />
        <MetricRow label="Client 2 Retirement" value={liveTcc.client2Retirement} />
        <MetricRow label="Non-Retirement" value={liveTcc.nonRetirement} />
        <MetricRow label="Trust" value={liveTcc.trust} />
        <MetricRow label="Grand Total Net Worth" value={liveTcc.grandTotal} />
        <MetricRow label="Liabilities (separate)" value={liveTcc.liabilities} />
      </div>

      {incompleteCount > 0 && (
        <p className="text-sm font-medium text-amber-600">
          {incompleteCount} account balance(s) still missing. All accounts are required before downloading PDFs.
        </p>
      )}

      <Button type="submit" disabled={loading || incompleteCount > 0}>
        {loading ? 'Saving...' : 'Save All Balances'}
      </Button>
    </form>
  )
}
