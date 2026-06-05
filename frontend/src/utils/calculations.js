const RETIREMENT_TYPES = new Set(['ira', 'roth_ira', '401k', 'pension'])
const LIABILITY_TYPES = new Set(['mortgage', 'auto_loan'])

export function calculateSacs(client) {
  if (!client) {
    return null
  }
  const inflow = Number(client.salary) || 0
  const outflow = Number(client.expense_budget) || 0
  const excess = inflow - outflow
  const deductibles = Number(client.insurance_deductibles) || 0
  const privateReserveTarget = 6 * outflow + deductibles
  return { inflow, outflow, excess, privateReserveTarget, floorAmount: 1000 }
}

export function calculateTccFromEntries(accounts, entries) {
  let client1Retirement = 0
  let client2Retirement = 0
  let nonRetirement = 0
  let trust = 0
  let liabilities = 0

  accounts.forEach((account) => {
    const raw = entries[account.id]
    if (raw === '' || raw == null) return
    const amount = Number(raw)
    if (Number.isNaN(amount)) return

    const type = account.account_type
    const owner = account.owner

    if (RETIREMENT_TYPES.has(type)) {
      if (owner === 'client_2') {
        client2Retirement += amount
      } else {
        client1Retirement += amount
      }
    } else if (type === 'brokerage') {
      nonRetirement += amount
    } else if (type === 'trust') {
      trust += amount
    } else if (LIABILITY_TYPES.has(type)) {
      liabilities += amount
    }
  })

  const grandTotal = client1Retirement + client2Retirement + nonRetirement + trust
  return {
    client1Retirement,
    client2Retirement,
    nonRetirement,
    trust,
    grandTotal,
    liabilities,
  }
}

export const ACCOUNT_SECTIONS = [
  {
    id: 'retirement',
    title: 'TCC — Retirement Accounts',
    types: ['ira', 'roth_ira', '401k', 'pension'],
  },
  {
    id: 'brokerage',
    title: 'TCC — Non-Retirement Accounts',
    types: ['brokerage'],
  },
  {
    id: 'trust',
    title: 'TCC — Trust / Property',
    types: ['trust'],
  },
  {
    id: 'liabilities',
    title: 'TCC — Liabilities (separate, not subtracted)',
    types: ['mortgage', 'auto_loan'],
  },
]

export const INVESTMENT_TYPES = new Set(['ira', 'roth_ira', '401k', 'brokerage'])

export const SACS_ROLES = [
  { value: 'none', label: 'None (TCC only)' },
  { value: 'private_reserve', label: 'Private Reserve (SACS page 2)' },
  { value: 'investment', label: 'Investment / Schwab (SACS page 2)' },
]
