import axios from 'axios'
import toast from 'react-hot-toast'

// Configure axios to automatically include auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle 401 errors (unauthorized) - redirect to login
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      toast.error('Session expired. Please sign in again.')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axios

