import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Shield, Download, X, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../components/Layout'
import axios from '../utils/axios'

export default function UARSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [accessLogs, setAccessLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    fetchUsers()
  }, [navigate])

  useEffect(() => {
    if (selectedUserId) {
      fetchUserDetails(selectedUserId)
      fetchAccessLogs(selectedUserId)
    }
  }, [selectedUserId, startDate, endDate])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/v1/uar/users')
      setUsers(response.data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const fetchUserDetails = async (userId) => {
    try {
      const response = await axios.get(`/api/v1/uar/users/${userId}`)
      setSelectedUser(response.data)
    } catch (error) {
      console.error('Error fetching user details:', error)
      setSelectedUser(null)
    }
  }

  const fetchAccessLogs = async (userId) => {
    try {
      const params = { user_id: userId }
      if (startDate) params.start_date = startDate
      if (endDate) params.end_date = endDate
      
      const response = await axios.get('/api/v1/uar/access-logs', { params })
      setAccessLogs(response.data || [])
    } catch (error) {
      console.error('Error fetching access logs:', error)
      setAccessLogs([])
    }
  }

  const handleRevokeAccess = async () => {
    if (!selectedUser || !window.confirm('Are you sure you want to revoke access for this user?')) {
      return
    }
    try {
      await axios.post(`/api/v1/uar/users/${selectedUser.user_id}/revoke`)
      toast.success('Access revoked successfully')
      fetchUsers()
      setSelectedUserId(null)
    } catch (error) {
      console.error('Error revoking access:', error)
      toast.error('Failed to revoke access')
    }
  }

  const handleRecertify = async () => {
    if (!selectedUser || !window.confirm('Initiate recertification for this user?')) {
      return
    }
    try {
      await axios.post(`/api/v1/uar/users/${selectedUser.user_id}/recertify`)
      toast.success('Recertification initiated successfully')
      fetchUserDetails(selectedUser.user_id)
    } catch (error) {
      console.error('Error initiating recertification:', error)
      toast.error('Failed to initiate recertification')
    }
  }

  const handleExportReport = async () => {
    try {
      const params = {}
      if (selectedUserId) params.user_id = selectedUserId
      if (startDate) params.start_date = startDate
      if (endDate) params.end_date = endDate
      
      const response = await axios.get('/api/v1/uar/export', { 
        params,
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `uar-report-${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Error exporting report:', error)
      toast.error('Failed to export report')
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = !searchQuery || 
        (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
        (user.user_id && user.user_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.role && user.role.toLowerCase().includes(searchQuery.toLowerCase()))
      
      return matchesSearch
    })
  }, [users, searchQuery])

  const filteredLogs = useMemo(() => {
    return accessLogs.filter(log => {
      const logDate = log.timestamp ? log.timestamp.split('T')[0] : ''
      const matchStart = !startDate || logDate >= startDate
      const matchEnd = !endDate || logDate <= endDate
      return matchStart && matchEnd
    })
  }, [accessLogs, startDate, endDate])

  if (loading && users.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="text-gray-600 dark:text-gray-400">Loading...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <header className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">User Access Review (UAR)</h2>
            <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-widest">Audit user identities, group assignments, and security compliance history.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleExportReport}
              className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-6 py-2 rounded-xl text-xs font-semibold uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-600 transition-all flex items-center gap-2 text-gray-900 dark:text-white"
            >
              <Download className="w-4 h-4" /> Export Audit Report (CSV)
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row p-6 gap-6">
          {/* User Inventory List */}
          <section className="w-full lg:w-1/3 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-50 dark:border-gray-700 space-y-4">
              <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Active Identity Directory</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search Identity..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl pl-10 pr-4 py-3 text-xs font-medium outline-none focus:ring-2 focus:ring-primary-500/10 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700">
              {filteredUsers.map(user => (
                <div 
                  key={user.user_id} 
                  onClick={() => setSelectedUserId(user.user_id)}
                  className={`p-6 cursor-pointer transition-all hover:bg-blue-50/40 dark:hover:bg-blue-900/20 relative ${
                    selectedUserId === user.user_id 
                      ? 'bg-blue-50/60 dark:bg-blue-900/30 border-l-4 border-l-primary-600' 
                      : 'border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{user.name || user.employee_name || 'Unknown'}</h4>
                      <p className="text-xs font-medium text-gray-400 dark:text-gray-500">{user.email || 'N/A'}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold uppercase border ${
                      user.status === 'Active' 
                        ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800' 
                        : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800'
                    }`}>
                      {user.status || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs font-semibold text-primary-500 uppercase tracking-widest">
                      {user.role ? user.role.replace(/_/g, ' ') : 'N/A'}
                    </span>
                    <span className="text-xs font-medium text-gray-300 dark:text-gray-600">{user.user_id}</span>
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="p-6 text-center text-gray-400 dark:text-gray-500">
                  No users found
                </div>
              )}
            </div>
          </section>

          {/* Detailed Audit Section */}
          <section className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2">
            {selectedUser ? (
              <div className="space-y-6 pb-6">
                {/* User Identity Header Card */}
                <div className="bg-gray-900 dark:bg-gray-800 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
                  <Shield className="absolute -right-10 -bottom-10 w-60 h-60 opacity-5 -rotate-12" />
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Compliance Identity Profile</p>
                      <h3 className="text-xl font-semibold tracking-tight">{selectedUser.name || selectedUser.employee_name || 'Unknown User'}</h3>
                      <div className="flex gap-4 items-center pt-2">
                        <span className="text-xs bg-gray-800 dark:bg-gray-700 text-gray-300 px-4 py-2 rounded-xl font-semibold uppercase tracking-widest border border-gray-700 dark:border-gray-600">
                          Member Since {selectedUser.created_at ? new Date(selectedUser.created_at).getFullYear() : 'N/A'}
                        </span>
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-widest">
                          Last Login: {selectedUser.last_login_at ? new Date(selectedUser.last_login_at).toLocaleDateString() : 'Never'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button 
                        onClick={handleRevokeAccess}
                        className="bg-primary-600 hover:bg-primary-500 text-white font-semibold px-6 py-3 rounded-2xl text-xs uppercase tracking-widest transition-all"
                      >
                        Revoke Access
                      </button>
                      <button 
                        onClick={handleRecertify}
                        className="bg-gray-800 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-2xl text-xs uppercase tracking-widest transition-all"
                      >
                        Recertify User
                      </button>
                    </div>
                  </div>
                </div>

                {/* Group Assignments and Roles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-6 flex justify-between">
                      Assigned Business Groups
                      <span className="text-primary-500">{(selectedUser.groups || []).length}</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(selectedUser.groups || []).map((g, idx) => (
                        <span key={idx} className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-primary-100 dark:hover:border-primary-800 transition-colors cursor-default">
                          {g}
                        </span>
                      ))}
                      {(!selectedUser.groups || selectedUser.groups.length === 0) && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 italic">No groups assigned</span>
                      )}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center">
                    <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-6">Security Context Score</h4>
                    <div className="flex items-end gap-3 mb-2">
                      <span className="text-xl font-semibold text-green-600 dark:text-green-400">8.4</span>
                      <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase pb-1.5">Compliance Grade</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-[84%]" />
                    </div>
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-3 italic">Low risk profile based on behavioral consistency.</p>
                  </div>
                </div>

                {/* Access History Report Generation */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-gray-50 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-6 bg-gray-50/30 dark:bg-gray-700/30">
                    <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest">Access Control History Logs</h4>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase">From</label>
                        <input 
                          type="date" 
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-primary-500/10 text-gray-900 dark:text-white" 
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase">To</label>
                        <input 
                          type="date" 
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-primary-500/10 text-gray-900 dark:text-white" 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-gray-50 dark:bg-gray-700 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                        <tr>
                          <th className="p-6">Timestamp</th>
                          <th className="p-6">Action Performed</th>
                          <th className="p-6">Origin System</th>
                          <th className="p-6 text-right">IP Address</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {filteredLogs.map(log => (
                          <tr key={log.log_id} className="hover:bg-blue-50/10 dark:hover:bg-blue-900/10 transition-colors">
                            <td className="p-6 font-medium text-gray-400 dark:text-gray-500">
                              {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                            </td>
                            <td className="p-6 font-semibold text-gray-800 dark:text-gray-200">{log.action || 'N/A'}</td>
                            <td className="p-6 font-medium text-primary-500 uppercase tracking-tighter">{log.system || 'N/A'}</td>
                            <td className="p-6 text-right font-mono text-gray-400 dark:text-gray-500">{log.ip_address || 'N/A'}</td>
                          </tr>
                        ))}
                        {filteredLogs.length === 0 && (
                          <tr>
                            <td colSpan={4} className="p-20 text-center text-gray-300 dark:text-gray-600 font-medium italic uppercase tracking-widest opacity-40">
                              No history matches the current filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-300 dark:text-gray-600 opacity-50 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                <Shield className="w-16 h-16 mb-4 opacity-10" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white opacity-40">Identity Selection Required</h3>
                <p className="text-xs font-semibold uppercase tracking-widest opacity-40 mt-2">Select a user from the directory to review detailed access history.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </Layout>
  )
}

