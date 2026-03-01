import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Server, Mail, Database, Activity, Cpu, Download, Shield, Inbox, TrendingUp, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../components/Layout'
import axios from '../utils/axios'

export default function SystemIntegration() {
  const [integrations, setIntegrations] = useState([])
  const [testResults, setTestResults] = useState({})
  const [env, setEnv] = useState('PROD')
  const [loading, setLoading] = useState(true)
  const [syncLogs, setSyncLogs] = useState([])
  const [validationRules, setValidationRules] = useState([])
  const [masterData, setMasterData] = useState([
    { id: 'md-1', name: 'User Identity Master', type: 'USER', count: 1240, lastSync: '2023-11-21 08:30', isSyncing: false },
    { id: 'md-2', name: 'Material & Service Master', type: 'MATERIAL', count: 45210, lastSync: '2023-11-21 04:00', isSyncing: false },
    { id: 'md-3', name: 'Budget & Cost Center Registry', type: 'BUDGET', count: 85, lastSync: '2023-11-20 22:00', isSyncing: false },
  ])
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    fetchIntegrations()
    fetchSyncLogs()
    fetchValidationRules()
  }, [navigate, env])

  const fetchIntegrations = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/v1/integrations', {
        params: { environment: env }
      })
      setIntegrations(response.data || [])
    } catch (error) {
      console.error('Error fetching integrations:', error)
      setIntegrations([])
    } finally {
      setLoading(false)
    }
  }

  const fetchSyncLogs = async () => {
    try {
      const response = await axios.get('/api/v1/integrations/logs', {
        params: { limit: 10 }
      })
      setSyncLogs(response.data || [])
    } catch (error) {
      console.error('Error fetching sync logs:', error)
      setSyncLogs([])
    }
  }

  const fetchValidationRules = async () => {
    try {
      const response = await axios.get('/api/v1/integrations/validation-rules')
      setValidationRules(response.data || [])
    } catch (error) {
      console.error('Error fetching validation rules:', error)
      setValidationRules([])
    }
  }

  const runTest = async (integrationId) => {
    try {
      setIntegrations(prev => prev.map(item => 
        item.integration_id === integrationId 
          ? { ...item, status: 'TESTING' } 
          : item
      ))
      
      const response = await axios.post(`/api/v1/integrations/${integrationId}/test`)
      const result = response.data
      
      setIntegrations(prev => prev.map(item => 
        item.integration_id === integrationId 
          ? { 
              ...item, 
              status: result.status === 'SUCCESS' ? 'CONNECTED' : 'ERROR',
              response_time_ms: result.response_time_ms,
              last_sync_at: result.tested_at
            } 
          : item
      ))

      setTestResults(prev => ({
        ...prev,
        [integrationId]: {
          status: result.status,
          time: result.response_time_ms,
          code: result.response_code
        }
      }))
    } catch (error) {
      console.error('Error running test:', error)
      setIntegrations(prev => prev.map(item => 
        item.integration_id === integrationId 
          ? { ...item, status: 'ERROR' } 
          : item
      ))
      setTestResults(prev => ({
        ...prev,
        [integrationId]: {
          status: 'FAILED',
          time: 0,
          code: error.response?.status || 500
        }
      }))
    }
  }

  const handleDownloadAudit = async () => {
    try {
      const response = await axios.get('/api/v1/integrations/logs/export', {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `integration-audit-${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Error downloading audit:', error)
      toast.error('Failed to download audit log')
    }
  }

  const getSystemIcon = (type) => {
    switch (type) {
      case 'SAP': return <Server className="w-6 h-6" />
      case 'EMAIL': return <Mail className="w-6 h-6" />
      case 'MDM': return <Database className="w-6 h-6" />
      default: return <Cpu className="w-6 h-6" />
    }
  }

  const getMasterIcon = (type) => {
    switch (type) {
      case 'USER': return <Shield className="w-5 h-5" />
      case 'MATERIAL': return <Inbox className="w-5 h-5" />
      case 'BUDGET': return <TrendingUp className="w-5 h-5" />
      default: return <Cpu className="w-5 h-5" />
    }
  }

  const handleMasterSync = (id) => {
    setMasterData(prev => prev.map(item => item.id === id ? { ...item, isSyncing: true } : item))

    setTimeout(() => {
      const addedCount = Math.floor(Math.random() * 50) + 5
      const now = new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
      
      setMasterData(prev => prev.map(item => 
        item.id === id ? { ...item, isSyncing: false, count: item.count + addedCount, lastSync: now } : item
      ))
    }, 3000)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONNECTED': return 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800'
      case 'ERROR': return 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800'
      case 'TESTING': return 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border-yellow-100 dark:border-yellow-800'
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
    }
  }

  const calculateUptime = () => {
    // Calculate uptime based on successful syncs in last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentLogs = syncLogs.filter(log => 
      new Date(log.event_time) >= thirtyDaysAgo && log.status === 'SUCCESS'
    )
    const totalLogs = syncLogs.filter(log => new Date(log.event_time) >= thirtyDaysAgo)
    
    if (totalLogs.length === 0) return 100
    return Math.round((recentLogs.length / totalLogs.length) * 100)
  }

  if (loading && integrations.length === 0) {
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
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 space-y-6">
        <header className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">System Integrations</h1>
            <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-widest">Monitor connectivity, API health, and master data synchronization.</p>
          </div>
          <div className="flex items-center gap-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1.5 rounded-2xl shadow-sm">
            {['PROD', 'STAGING', 'DEV'].map(v => (
              <button 
                key={v}
                onClick={() => setEnv(v)}
                className={`px-6 py-2 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all ${
                  env === v 
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 dark:shadow-primary-900' 
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </header>

        {/* Connectivity Diagnostic Grid */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {integrations.map(sys => (
            <div key={sys.integration_id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-sm flex flex-col group hover:shadow-xl transition-all duration-500">
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div className={`p-4 rounded-2xl ${
                    sys.status === 'CONNECTED' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 
                    sys.status === 'ERROR' ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 
                    'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                  } group-hover:scale-110 transition-transform duration-300`}>
                    {getSystemIcon(sys.type)}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full border ${
                      getStatusColor(sys.status)
                    }`}>
                      {sys.status}
                    </span>
                    {sys.response_time_ms && sys.status === 'CONNECTED' && (
                      <span className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-2">{sys.response_time_ms}ms Latency</span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{sys.name}</h3>
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">{sys.details || sys.api_version || 'N/A'}</p>
                </div>

                <div className="pt-6 border-t border-gray-50 dark:border-gray-700 flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-300 dark:text-gray-600 uppercase">Last Synchronization</p>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {sys.last_sync_at ? new Date(sys.last_sync_at).toLocaleString() : 'Never'}
                    </p>
                  </div>
                  <button 
                    onClick={() => runTest(sys.integration_id)}
                    disabled={sys.status === 'TESTING'}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all ${
                      sys.status === 'TESTING' 
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-wait' 
                        : 'bg-gray-900 dark:bg-gray-700 text-white hover:bg-primary-600 dark:hover:bg-primary-500'
                    }`}
                  >
                    {sys.status === 'TESTING' ? (
                      <Activity className="w-3 h-3 animate-pulse" />
                    ) : (
                      <Activity className="w-3 h-3" />
                    )}
                    {sys.status === 'TESTING' ? 'Diagnosing...' : 'Test Ping'}
                  </button>
                </div>

                {testResults[sys.integration_id] && sys.status !== 'TESTING' && (
                  <div className={`mt-4 p-4 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-2 duration-300 ${
                    testResults[sys.integration_id].status === 'SUCCESS' 
                      ? 'bg-green-50/50 dark:bg-green-900/20' 
                      : 'bg-red-50/50 dark:bg-red-900/20'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        testResults[sys.integration_id].status === 'SUCCESS' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                        Code {testResults[sys.integration_id].code}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase">
                      {testResults[sys.integration_id].time}ms
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {integrations.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400 dark:text-gray-500">
              No integrations found for {env} environment
            </div>
          )}
        </section>

        {/* Master Data Orchestration */}
        <section className="space-y-6">
          <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Master Data Orchestration</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {masterData.map(md => (
              <div key={md.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-sm flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10 pointer-events-none group-hover:scale-125 transition-transform duration-700">
                  {getMasterIcon(md.type)}
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gray-900 dark:bg-gray-700 text-white flex items-center justify-center shadow-lg shadow-gray-200 dark:shadow-gray-900">
                    {getMasterIcon(md.type)}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-tight">{md.name}</h3>
                </div>

                <div className="flex-1 space-y-6">
                  <div className="flex justify-between items-end border-b border-gray-50 dark:border-gray-700 pb-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Cached Records</p>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white">{md.count.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Health</p>
                      <span className="text-xs font-semibold text-green-500 dark:text-green-400 uppercase">Synchronized</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Last Remote Pull</p>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{md.lastSync}</p>
                  </div>
                </div>

                <button 
                  onClick={() => handleMasterSync(md.id)}
                  disabled={md.isSyncing}
                  className={`mt-8 w-full py-4 rounded-2xl font-semibold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                    md.isSyncing 
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 cursor-wait' 
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-primary-600 dark:hover:bg-primary-500 hover:text-white border border-gray-100 dark:border-gray-600 hover:border-primary-500'
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${md.isSyncing ? 'animate-spin' : ''}`} />
                  {md.isSyncing ? 'Synchronizing Source...' : 'Trigger Manual Sync'}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Master Data Validation Mapping */}
        <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-sm overflow-hidden flex flex-col xl:flex-row">
          <div className="p-6 xl:w-1/3 border-b xl:border-b-0 xl:border-r border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-700/30">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">MDM Validation Logic</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4 font-medium">
              Configure rules for real-time field validation when creating PRs or processing invoices.
            </p>
            
            <div className="space-y-4">
              {validationRules.map(rule => (
                <div key={rule.rule_id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{rule.rule_name}</span>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${
                    rule.is_enabled 
                      ? 'bg-green-500' 
                      : 'bg-gray-200 dark:bg-gray-600'
                  }`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${
                      rule.is_enabled ? 'right-1' : 'left-1'
                    }`} />
                  </div>
                </div>
              ))}
              {validationRules.length === 0 && (
                <div className="text-xs text-gray-400 dark:text-gray-500 italic">No validation rules configured</div>
              )}
            </div>
          </div>

          <div className="flex-1 p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Active Sync Logs</h4>
              <button 
                onClick={handleDownloadAudit}
                className="text-primary-600 dark:text-primary-400 text-xs font-semibold uppercase tracking-widest hover:underline flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download full audit
              </button>
            </div>
            
            <div className="space-y-6">
              {syncLogs.map((log, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-700 last:border-0 group">
                  <div className="flex items-center gap-6">
                    <span className="text-xs font-medium text-gray-300 dark:text-gray-600 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors w-20">
                      {log.event_time ? new Date(log.event_time).toLocaleTimeString() : 'N/A'}
                    </span>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                      {log.system || 'N/A'}
                    </span>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{log.event_description || 'N/A'}</p>
                  </div>
                  <span className={`text-xs font-semibold uppercase ${
                    log.status === 'SUCCESS' 
                      ? 'text-green-500 dark:text-green-400' 
                      : 'text-red-500 dark:text-red-400'
                  }`}>
                    {log.status}
                  </span>
                </div>
              ))}
              {syncLogs.length === 0 && (
                <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                  No sync logs available
                </div>
              )}
            </div>

            <div className="mt-12 bg-gray-900 dark:bg-gray-800 rounded-3xl p-8 text-white relative overflow-hidden">
              <Cpu className="absolute -right-8 -top-8 w-40 h-40 opacity-5 rotate-12" />
              <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-2">Integration Readiness</h4>
              <div className="flex items-end gap-3 mb-6">
                <span className="text-5xl font-semibold">{calculateUptime()}%</span>
                <span className="text-xs font-medium text-blue-300/60 dark:text-blue-400/60 pb-1">Uptime SLA last 30 days</span>
              </div>
              <div className="h-2 w-full bg-gray-800 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 w-[94%]" style={{ width: `${calculateUptime()}%` }} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}

