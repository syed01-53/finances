import { useState } from 'react'
import Button from '../../components/ui/Button'
import { formatSsnInput } from '../../utils/ssn'

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  date_of_birth: '',
  ssn: '',
  is_married: false,
  spouse_name: '',
  spouse_date_of_birth: '',
  spouse_ssn: '',
  salary: '',
  expense_budget: '',
  insurance_deductibles: '',
}

function resolveIsMarried(initialValues) {
  if (!initialValues) return false
  if (initialValues.is_married) return true
  return Boolean(
    initialValues.spouse_name
    || initialValues.spouse_date_of_birth
    || initialValues.spouse_ssn,
  )
}

export default function ClientForm({ onSubmit, loading = false, initialValues = null, submitLabel = 'Create Client' }) {
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    ...(initialValues
      ? {
          name: initialValues.name || '',
          email: initialValues.email || '',
          phone: initialValues.phone || '',
          date_of_birth: initialValues.date_of_birth || '',
          ssn: formatSsnInput(initialValues.ssn || ''),
          is_married: resolveIsMarried(initialValues),
          spouse_name: initialValues.spouse_name || '',
          spouse_date_of_birth: initialValues.spouse_date_of_birth || '',
          spouse_ssn: formatSsnInput(initialValues.spouse_ssn || ''),
          salary: initialValues.salary || '',
          expense_budget: initialValues.expense_budget || '',
          insurance_deductibles: initialValues.insurance_deductibles || '',
        }
      : {}),
  }))

  function handleChange(event) {
    const { name, value } = event.target
    const nextValue = name === 'ssn' || name === 'spouse_ssn'
      ? formatSsnInput(value)
      : value
    setForm((prev) => ({ ...prev, [name]: nextValue }))
  }

  function handleMaritalStatusChange(event) {
    const isMarried = event.target.value === 'married'
    setForm((prev) => ({
      ...prev,
      is_married: isMarried,
      ...(isMarried
        ? {}
        : {
            spouse_name: '',
            spouse_date_of_birth: '',
            spouse_ssn: '',
          }),
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit?.({
      ...form,
      phone: form.phone || null,
      date_of_birth: form.date_of_birth || null,
      ssn: form.ssn || null,
      is_married: form.is_married,
      spouse_name: form.is_married ? (form.spouse_name || null) : null,
      spouse_date_of_birth: form.is_married ? (form.spouse_date_of_birth || null) : null,
      spouse_ssn: form.is_married ? (form.spouse_ssn || null) : null,
      salary: Number(form.salary),
      expense_budget: Number(form.expense_budget),
      insurance_deductibles: Number(form.insurance_deductibles || 0),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label htmlFor="name" className="field-label">Name</label>
          <input id="name" name="name" value={form.name} onChange={handleChange} required className="field-input" />
        </div>
        <div>
          <label htmlFor="email" className="field-label">Email</label>
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required className="field-input" />
        </div>
        <div>
          <label htmlFor="phone" className="field-label">Phone</label>
          <input id="phone" name="phone" value={form.phone} onChange={handleChange} className="field-input" />
        </div>
        <div>
          <label htmlFor="date_of_birth" className="field-label">Date of Birth</label>
          <input id="date_of_birth" name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} className="field-input" />
        </div>
        <div>
          <label htmlFor="ssn" className="field-label">SSN</label>
          <input
            id="ssn"
            name="ssn"
            inputMode="numeric"
            autoComplete="off"
            placeholder="000-00-0000"
            maxLength={11}
            value={form.ssn}
            onChange={handleChange}
            className="field-input"
          />
        </div>
        <div>
          <label htmlFor="marital_status" className="field-label">Marital Status</label>
          <select
            id="marital_status"
            name="marital_status"
            value={form.is_married ? 'married' : 'single'}
            onChange={handleMaritalStatusChange}
            className="field-input"
          >
            <option value="single">Single</option>
            <option value="married">Married</option>
          </select>
        </div>
        <div>
          <label htmlFor="salary" className="field-label">Monthly Salary (Inflow)</label>
          <input id="salary" name="salary" type="number" min="0" step="0.01" value={form.salary} onChange={handleChange} required className="field-input" />
        </div>
        <div>
          <label htmlFor="expense_budget" className="field-label">Expense Budget (Outflow)</label>
          <input id="expense_budget" name="expense_budget" type="number" min="0" step="0.01" value={form.expense_budget} onChange={handleChange} required className="field-input" />
        </div>
        <div>
          <label htmlFor="insurance_deductibles" className="field-label">Insurance Deductibles</label>
          <input id="insurance_deductibles" name="insurance_deductibles" type="number" min="0" step="0.01" value={form.insurance_deductibles} onChange={handleChange} className="field-input" />
        </div>
      </div>

      {form.is_married && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Spouse Information</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="spouse_name" className="field-label">Spouse Name</label>
              <input id="spouse_name" name="spouse_name" value={form.spouse_name} onChange={handleChange} className="field-input" />
            </div>
            <div>
              <label htmlFor="spouse_date_of_birth" className="field-label">Spouse DOB</label>
              <input id="spouse_date_of_birth" name="spouse_date_of_birth" type="date" value={form.spouse_date_of_birth} onChange={handleChange} className="field-input" />
            </div>
            <div>
              <label htmlFor="spouse_ssn" className="field-label">Spouse SSN</label>
              <input
                id="spouse_ssn"
                name="spouse_ssn"
                inputMode="numeric"
                autoComplete="off"
                placeholder="000-00-0000"
                maxLength={11}
                value={form.spouse_ssn}
                onChange={handleChange}
                className="field-input"
              />
            </div>
          </div>
        </div>
      )}

      <Button type="submit" disabled={loading}>{loading ? 'Saving...' : submitLabel}</Button>
    </form>
  )
}
