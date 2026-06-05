import { useCallback, useEffect, useState } from 'react'

export function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const result = await fetcher()
        if (!cancelled) {
          setData(result)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load data')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [...deps, refreshKey])

  const refetch = useCallback(() => {
    setRefreshKey((value) => value + 1)
  }, [])

  return { data, loading, error, refetch }
}
