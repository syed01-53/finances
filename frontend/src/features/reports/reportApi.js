import apiClient from '../../api/client'
import { getClients } from '../clients/clientApi'

export async function getReports(clientId) {
  const { data } = await apiClient.get(`/clients/${clientId}/reports`)
  return data
}

export async function getAllReports() {
  const clients = await getClients()
  const reports = await Promise.all(
    clients.map(async (client) => {
      const clientReports = await getReports(client.id)
      return clientReports.map((report) => ({
        ...report,
        client_name: client.name,
      }))
    }),
  )
  return reports.flat()
}

export async function getReport(id) {
  const { data } = await apiClient.get(`/reports/${id}`)
  return data
}

export async function createReport(clientId, payload) {
  const { data } = await apiClient.post(`/clients/${clientId}/reports`, payload)
  return data
}

export async function updateReport(id, payload) {
  const { data } = await apiClient.put(`/reports/${id}`, payload)
  return data
}

export async function deleteReport(id) {
  await apiClient.delete(`/reports/${id}`)
}

export function getSacsPdfUrl(reportId) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
  return `${base}/reports/${reportId}/pdf/sacs`
}

export function getTccPdfUrl(reportId) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
  return `${base}/reports/${reportId}/pdf/tcc`
}
