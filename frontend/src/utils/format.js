export function formatCurrency(value) {
  const amount = Number(value)
  if (Number.isNaN(amount)) return value
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}
