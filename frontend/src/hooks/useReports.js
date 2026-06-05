import { useFetch } from './useFetch'
import { getAllReports, getReports } from '../features/reports/reportApi'

export function useReports(clientId) {
  return useFetch(
    () => (clientId ? getReports(clientId) : getAllReports()),
    [clientId],
  )
}
