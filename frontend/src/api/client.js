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

  return error.message || 'Something went wrong'
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(new Error(formatError(error))),
)

export default apiClient
