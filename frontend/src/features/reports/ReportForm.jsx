import { useState } from 'react'
import Button from '../../components/ui/Button'

const currentYear = new Date().getFullYear()

export default function ReportForm({
  onSubmit,
  onCancel,
  loading = false,
  initialValues = null,
  submitLabel = 'Create Report',
}) {
  const [form, setForm] = useState({
    year: initialValues?.year ?? currentYear,
    quarter: initialValues?.quarter ?? 1,
  })

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: name === 'year' || name === 'quarter' ? Number(value) : value,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit?.(form)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
      <div>
        <label htmlFor="year" className="field-label">
          Year
        </label>
        <input
          id="year"
          name="year"
          type="number"
          min="2000"
          max="2100"
          value={form.year}
          onChange={handleChange}
          required
          className="field-input w-32"
        />
      </div>

      <div>
        <label htmlFor="quarter" className="field-label">
          Quarter
        </label>
        <select
          id="quarter"
          name="quarter"
          value={form.quarter}
          onChange={handleChange}
          className="field-input w-32"
        >
          <option value={1}>Q1</option>
          <option value={2}>Q2</option>
          <option value={3}>Q3</option>
          <option value={4}>Q4</option>
        </select>
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
