import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, ShoppingBag, Moon, Circle, Sun } from 'lucide-react'
import axios from '../utils/axios'

export default function Login() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [theme, setTheme] = useState('light') // light | dark | amoled
  const navigate = useNavigate()

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const legacyDark = localStorage.getItem('darkMode') === 'true'
    const initial = stored || (legacyDark ? 'dark' : 'light')
    setTheme(initial)

    document.documentElement.classList.remove('dark', 'amoled')
    if (initial === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (initial === 'amoled') {
      document.documentElement.classList.add('dark', 'amoled')
    }
  }, [])

  const cycleTheme = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'amoled' : 'light'
    setTheme(next)
    localStorage.setItem('theme', next)
    localStorage.setItem('darkMode', (next !== 'light').toString())

    document.documentElement.classList.remove('dark', 'amoled')
    if (next === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (next === 'amoled') {
      document.documentElement.classList.add('dark', 'amoled')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await axios.post('/api/v1/auth/login', { email })
      localStorage.setItem('token', response.data.token)
      // Include role in user object if provided
      const userData = { ...response.data.user }
      if (response.data.role) {
        userData.role = response.data.role
      }
      localStorage.setItem('user', JSON.stringify(userData))
      // Trigger custom event to notify PermissionsContext
      // Use a small delay to ensure localStorage is updated
      setTimeout(() => {
        window.dispatchEvent(new Event('tokenChanged'))
      }, 100)
      navigate('/dashboard', { state: { fromLogin: true } })
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Theme toggle */}
      <button
        onClick={cycleTheme}
        className="fixed top-6 right-6 p-3 rounded-2xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shadow-lg"
        aria-label="Toggle theme"
        title={theme === 'light' ? 'Theme: Light' : theme === 'dark' ? 'Theme: Dark' : 'Theme: AMOLED'}
      >
        {theme === 'light' ? <Moon size={20} /> : theme === 'dark' ? <Circle size={20} /> : <Sun size={20} />}
      </button>

      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700">
        <div>
          <div className="flex items-center justify-center space-x-3 mb-4">
            <ShoppingBag size={36} className="text-primary-600 dark:text-primary-400" />
            <h2 className="text-3xl font-semibold text-center text-gray-900 dark:text-white tracking-tight">
              Procurement App
            </h2>
          </div>
          <p className="mt-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            Sign in to your account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-2xl font-medium text-sm">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-4 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-6 border border-transparent rounded-2xl shadow-lg shadow-primary-200 dark:shadow-primary-900 text-xs font-semibold uppercase tracking-widest text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all"
            >
              <LogIn size={18} />
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

