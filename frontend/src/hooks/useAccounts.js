import { useFetch } from './useFetch'
import { getAccounts } from '../features/accounts/accountApi'

export function useAccounts(clientId) {
  return useFetch(
    () => (clientId ? getAccounts(clientId) : Promise.resolve([])),
    [clientId],
  )
}
