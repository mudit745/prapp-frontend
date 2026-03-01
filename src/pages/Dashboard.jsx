import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { 
  LayoutGrid, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  FileText,
  TrendingUp,
  Clock,
  DollarSign
} from 'lucide-react'
import Layout from '../components/Layout'
import axios from '../utils/axios'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts'

const COLORS = {
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  purple: '#8b5cf6'
}

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timePeriod, setTimePeriod] = useState('year')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      navigate('/login')
      return
    }

    setUser(JSON.parse(userData))
    fetchAnalytics()
  }, [navigate, timePeriod])

  // Welcome toast after login
  useEffect(() => {
    if (!user || !location.state?.fromLogin) return
    const name = user.employee_name || user.name || user.email || 'there'
    toast.success(`Welcome back, ${name}!`)
    navigate(location.pathname, { replace: true, state: {} })
  }, [user, location.state?.fromLogin, location.pathname, navigate])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/v1/analytics')
      setAnalytics(response.data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="text-gray-600 dark:text-gray-400">Loading...</div>
        </div>
      </Layout>
    )
  }

  if (loading || !analytics) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="text-gray-600 dark:text-gray-400">Loading analytics...</div>
        </div>
      </Layout>
    )
  }

  // Prepare chart data
  const statusBreakdownData = [
    { name: 'Completed', value: analytics.completed || 0, color: COLORS.success },
    { name: 'Pending', value: analytics.pending || 0, color: COLORS.warning },
    { name: 'Draft', value: analytics.draft || 0, color: COLORS.info },
    { name: 'Rejected', value: analytics.rejected || 0, color: COLORS.error }
  ]

  const monthlyTrendData = (analytics.monthly_trend || []).map(item => ({
    month: item.month ? item.month.substring(5) : '',
    total: item.total || 0,
    completed: item.completed || 0
  }))

  const statusTrendData = (analytics.monthly_trend || []).map(item => ({
    month: item.month ? item.month.substring(5) : '',
    completed: item.completed || 0,
    pending: item.pending || 0
  }))

  const totalPRs = analytics.total_prs || 0
  const completedPRs = analytics.completed || 0
  const pendingForAction = analytics.pending_for_action || 0
  const rejectedPRs = analytics.rejected || 0
  const totalAmount = analytics.total_amount || 0
  const avgProcessingTime = analytics.avg_processing_time_days || 0

  const completionRate = totalPRs > 0 ? ((completedPRs / totalPRs) * 100).toFixed(1) : 0

  return (
    <Layout>
      <div className="w-full py-3 px-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">Intelligent Procurement Management</h1>
            <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-widest">Dashboard</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-[10px] text-gray-600 dark:text-gray-400">
              {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} AT {new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              }).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Time Period Filter */}
        <div className="mb-4 flex items-center gap-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-0.5 rounded-lg shadow-sm">
          {['day', 'week', 'month', 'year'].map((period) => (
            <button
              key={period}
              onClick={() => setTimePeriod(period)}
              className={`px-3 py-1 rounded-lg text-[10px] font-medium transition-all ${
                timePeriod === period
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 dark:shadow-primary-900'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 tracking-widest mb-1">PRs Completed</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{completedPRs}</p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 tracking-widest mb-1">Pending For Action</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{pendingForAction}</p>
              </div>
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 tracking-widest mb-1">Rejected PRs</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{rejectedPRs}</p>
              </div>
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 tracking-widest mb-1">Total Amount</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  ${(totalAmount / 1000).toFixed(1)}K
                </p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
          {/* Status Breakdown Donut Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-[10px] font-semibold text-gray-900 dark:text-white tracking-widest mb-3">PR Status Breakdown</h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={statusBreakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: '11px', padding: '6px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex flex-wrap justify-center gap-3">
              {statusBreakdownData.map((item, index) => (
                <div key={index} className="flex items-center space-x-1.5">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {item.name}: {item.value} ({totalPRs > 0 ? ((item.value / totalPRs) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 text-center">
              <p className="text-lg font-medium text-gray-900 dark:text-white">{completionRate}%</p>
              <p className="text-[10px] text-gray-600 dark:text-gray-400">Completion Rate</p>
            </div>
          </div>

          {/* Total vs Completed Orders Bar Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-[10px] font-semibold text-gray-900 dark:text-white tracking-widest mb-3">Total vs Completed PRs</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: '11px', padding: '6px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="total" fill={COLORS.info} name="Total" />
                <Bar dataKey="completed" fill={COLORS.success} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
          {/* Status Trend Stacked Bar Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-[10px] font-semibold text-gray-900 dark:text-white tracking-widest mb-3">Status Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusTrendData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: '11px', padding: '6px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="completed" stackId="a" fill={COLORS.success} name="Completed" />
                <Bar dataKey="pending" stackId="a" fill={COLORS.warning} name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Processing Cycle Time Area Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-[10px] font-semibold text-gray-900 dark:text-white tracking-widest mb-3">Average Processing Time</h3>
            <div className="mb-3">
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {avgProcessingTime.toFixed(1)} <span className="text-xs text-gray-600 dark:text-gray-400">days</span>
              </p>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: '11px', padding: '6px' }} />
                <Area 
                  type="monotone" 
                  dataKey="completed" 
                  stroke={COLORS.info} 
                  fill={COLORS.info}
                  fillOpacity={0.3}
                  name="Completed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Monthly Amount Trend */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-[10px] font-semibold text-gray-900 dark:text-white tracking-widest mb-3">Monthly Amount Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={(analytics.monthly_trend || []).map(item => ({
                month: item.month ? item.month.substring(5) : '',
                amount: (item.total_amount || 0) / 1000
              }))}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => `$${value.toFixed(1)}K`} contentStyle={{ fontSize: '11px', padding: '6px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke={COLORS.info} 
                  strokeWidth={2}
                  name="Amount (K)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top Vendors */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-[10px] font-semibold text-gray-900 dark:text-white tracking-widest mb-3">Top Vendors by PR Count</h3>
            <div className="space-y-2.5">
              {(analytics.top_vendors || []).map((vendor, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                        {index + 1}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-gray-900 dark:text-white">
                      {vendor.vendor_id || 'Unknown'}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                    {vendor.count} PRs
                  </span>
                </div>
              ))}
              {(!analytics.top_vendors || analytics.top_vendors.length === 0) && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-3">
                  No vendor data available
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
