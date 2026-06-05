export function formatSsnInput(value) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 9)

  if (digits.length <= 3) return digits
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
}

export function maskSsn(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (digits.length < 4) return '-'
  return `***-**-${digits.slice(-4)}`
}
