import { useState } from 'react'
import ActionMenu from '../../components/ui/ActionMenu'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { updateAccount } from './accountApi'
import AccountForm from './AccountForm'
import { useAccounts } from '../../hooks/useAccounts'
import { ACCOUNT_TYPES, getOwnerLabel } from '../../types'

function accountLabel(type) {
  return ACCOUNT_TYPES.find((item) => item.value === type)?.label || type
}

export default function AccountList({ clientId, client = null, onUpdated }) {
  const { data: accounts, loading, error, refetch } = useAccounts(clientId)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState(null)

  async function handleUpdate(accountId, payload) {
    setSaving(true)
    setActionError(null)
    try {
      await updateAccount(clientId, accountId, payload)
      setEditingId(null)
      refetch()
      onUpdated?.()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!clientId) {
    return <p className="text-sm text-slate-500">Select a client to view accounts.</p>
  }

  if (loading) return <LoadingSpinner label="Loading accounts..." />
  if (error) {
    return (
      <div className="alert-error p-4">
        {error}
      </div>
    )
  }

  if (!accounts?.length) {
    return <p className="text-sm text-slate-500">No accounts added yet.</p>
  }

  return (
    <div className="space-y-4">
      {actionError && (
        <div className="alert-error">
          {actionError}
        </div>
      )}
      <ul className="divide-y panel-list">
        {accounts.map((account) => (
          <li key={account.id} className="px-4 py-3">
            {editingId === account.id ? (
              <AccountForm
                initialValues={account}
                client={client}
                submitLabel="Save Account"
                loading={saving}
                onCancel={() => setEditingId(null)}
                onSubmit={(payload) => handleUpdate(account.id, payload)}
              />
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-navy-900">{account.name}</p>
                  <p className="text-sm text-slate-500">
                    {accountLabel(account.account_type)} · {getOwnerLabel(account.owner, client)}
                    {account.institution ? ` · ${account.institution}` : ''}
                    {account.account_last_four ? ` · ****${account.account_last_four}` : ''}
                    {account.interest_rate ? ` · ${account.interest_rate}%` : ''}
                  </p>
                  {account.property_address && (
                    <p className="text-xs text-slate-400">{account.property_address}</p>
                  )}
                </div>
                <ActionMenu
                  items={[
                    {
                      label: 'Edit',
                      onClick: () => setEditingId(account.id),
                    },
                  ]}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
