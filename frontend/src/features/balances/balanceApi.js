import apiClient from '../../api/client'

export async function getBalances(reportId) {
  const { data } = await apiClient.get(`/reports/${reportId}/balances`)
  return data
}

export async function getPreviousBalances(reportId) {
  const { data } = await apiClient.get(`/reports/${reportId}/balances/previous`)
  return data
}

export async function upsertBalances(reportId, balances) {
  const { data } = await apiClient.post(`/reports/${reportId}/balances`, {
    balances,
  })
  return data
}
