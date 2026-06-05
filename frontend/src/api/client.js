import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

function formatError(error) {
  const detail = error.response?.data?.detail

  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg || JSON.stringify(item)).join(', ')
  }

  if (typeof detail === 'string') {
    return detail
  }

  if (!error.response) {
    const baseURL = error.config?.baseURL || import.meta.env.VITE_API_URL || 'unknown'
    return `Cannot reach API at ${baseURL}. If deployed, set VITE_API_URL on Vercel to your Railway URL + /api and redeploy.`
  }

  return error.message || 'Something went wrong'
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(new Error(formatError(error))),
)

export default apiClient
