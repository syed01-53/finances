import { useFetch } from './useFetch'
import { getClients } from '../features/clients/clientApi'

export function useClients() {
  return useFetch(getClients, [])
}
