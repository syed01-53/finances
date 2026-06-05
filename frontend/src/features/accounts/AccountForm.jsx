import { useState } from 'react'
import Button from '../../components/ui/Button'
import { ACCOUNT_TYPES, getAccountOwnerOptions } from '../../types'

const emptyForm = {
  name: '',
  account_type: 'ira',
  owner: 'client_1',
  institution: '',
  account_last_four: '',
  interest_rate: '',
  property_address: '',
}

export default function AccountForm({
  onSubmit,
  onCancel,
  loading = false,
  initialValues = null,
  client = null,
  submitLabel = 'Add Account',
}) {
  const ownerOptions = getAccountOwnerOptions(client)
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    ...(initialValues
      ? {
          name: initialValues.name || '',
          account_type: initialValues.account_type || 'ira',
          owner: initialValues.owner || 'client_1',
          institution: initialValues.institution || '',
          account_last_four: initialValues.account_last_four || '',
          interest_rate: initialValues.interest_rate ?? '',
          property_address: initialValues.property_address || '',
        }
      : {}),
  }))

  function handleChange(event) {
    const { name, value } = event.target
    const nextValue = name === 'account_last_four'
      ? value.replace(/\D/g, '').slice(0, 4)
      : value
    setForm((prev) => ({ ...prev, [name]: nextValue }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit?.({
      name: form.name,
      account_type: form.account_type,
      owner: form.owner,
      institution: form.institution || null,
      account_last_four: form.account_last_four || null,
      interest_rate: form.interest_rate ? Number(form.interest_rate) : null,
      property_address: form.property_address || null,
    })
    if (!initialValues) {
      setForm(emptyForm)
    }
  }

  const isLiability = form.account_type === 'mortgage' || form.account_type === 'auto_loan'
  const isTrust = form.account_type === 'trust'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label htmlFor="account_name" className="field-label">Account Name</label>
          <input id="account_name" name="name" value={form.name} onChange={handleChange} required className="field-input" />
        </div>
        <div>
          <label htmlFor="account_type" className="field-label">Account Type</label>
          <select id="account_type" name="account_type" value={form.account_type} onChange={handleChange} className="field-input">
            {ACCOUNT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="owner" className="field-label">Owner</label>
          <select id="owner" name="owner" value={form.owner} onChange={handleChange} className="field-input">
            {ownerOptions.map((owner) => (
              <option key={owner.value} value={owner.value}>{owner.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="institution" className="field-label">Institution</label>
          <input id="institution" name="institution" value={form.institution} onChange={handleChange} className="field-input" />
        </div>
        <div>
          <label htmlFor="account_last_four" className="field-label">Account Last 4</label>
          <input
            id="account_last_four"
            name="account_last_four"
            inputMode="numeric"
            pattern="[0-9]{4}"
            maxLength={4}
            placeholder="0000"
            value={form.account_last_four}
            onChange={handleChange}
            className="field-input"
          />
        </div>
        {isLiability && (
          <div>
            <label htmlFor="interest_rate" className="field-label">Interest Rate (%)</label>
            <input id="interest_rate" name="interest_rate" type="number" step="0.01" value={form.interest_rate} onChange={handleChange} className="field-input" />
          </div>
        )}
        {isTrust && (
          <div className="sm:col-span-2">
            <label htmlFor="property_address" className="field-label">Property Address</label>
            <input id="property_address" name="property_address" value={form.property_address} onChange={handleChange} className="field-input" />
          </div>
        )}
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" disabled={loading} onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
