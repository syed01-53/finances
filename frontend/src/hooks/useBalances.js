import { useFetch } from './useFetch'
import { getBalances } from '../features/balances/balanceApi'

export function useBalances(reportId) {
  return useFetch(
    () => (reportId ? getBalances(reportId) : Promise.resolve([])),
    [reportId],
  )
}
