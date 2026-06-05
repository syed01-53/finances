import apiClient from '../../api/client'

export async function getAccounts(clientId) {
  const { data } = await apiClient.get(`/clients/${clientId}/accounts`)
  return data
}

export async function createAccount(clientId, payload) {
  const { data } = await apiClient.post(`/clients/${clientId}/accounts`, payload)
  return data
}

export async function updateAccount(clientId, accountId, payload) {
  const { data } = await apiClient.put(`/clients/${clientId}/accounts/${accountId}`, payload)
  return data
}
