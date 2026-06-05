import apiClient from '../../api/client'

export async function getClients() {
  const { data } = await apiClient.get('/clients')
  return data
}

export async function getClient(id) {
  const { data } = await apiClient.get(`/clients/${id}`)
  return data
}

export async function createClient(payload) {
  const { data } = await apiClient.post('/clients', payload)
  return data
}

export async function updateClient(id, payload) {
  const { data } = await apiClient.put(`/clients/${id}`, payload)
  return data
}

export async function deleteClient(id) {
  await apiClient.delete(`/clients/${id}`)
}
