import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, X, Eye, FileText, Calendar, Building2, User, DollarSign, ChevronLeft, ChevronDown, ChevronUp, Clock, FileSpreadsheet, Download, CheckCircle, Circle, XCircle, AlertCircle, Info, ExternalLink, File, Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from '../utils/axios'
import Layout from '../components/Layout'

export default function Reports() {
  const navigate = useNavigate()
  const [records, setRecords] = useState([])
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [recordDetails, setRecordDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [error, setError] = useState('')

  // Filter states
  const [filters, setFilters] = useState({
    vendor_id: '',
    vendor_name: '',
    pr_number: '',
    po_number: '',
    invoice_number: '',
    request_date_from: '',
    // Removed request_type filter - now only shows PRs
  })

  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null })
  // SAP/ERP section collapsed (report detail)
  const [sapErpSectionCollapsed, setSapErpSectionCollapsed] = useState(true)
  // Audit History filter: all | request | invoices | goods_receipt | workflow
  const [auditFilter, setAuditFilter] = useState('all')

  useEffect(() => {
    fetchReports()
  }, [filters])

  useEffect(() => {
    setAuditFilter('all')
  }, [selectedRecord])

  const fetchReports = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'All') {
          params.append(key, value)
        }
      })

      const response = await axios.get(`/api/v1/reports?${params.toString()}`)
      setRecords(response.data || [])
    } catch (err) {
      console.error('Error fetching reports:', err)
      const msg = err.response?.data?.error || 'Failed to fetch reports'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecordDetails = async (record) => {
    if (!record) return

    setDetailsLoading(true)
    try {
      // Use new breakdown endpoint that includes invoices
      const response = await axios.get(`/api/v1/reports/${record.id}/breakdown`)
      setRecordDetails(response.data)
    } catch (err) {
      console.error('Error fetching record details:', err)
      const msg = err.response?.data?.error || 'Failed to fetch record details'
      setError(msg)
      toast.error(msg)
    } finally {
      setDetailsLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setSelectedRecord(null)
    setRecordDetails(null)
  }

  const clearFilters = () => {
    setFilters({
      vendor_id: '',
      vendor_name: '',
      pr_number: '',
      po_number: '',
      invoice_number: '',
      request_date_from: '',
      request_type: 'All',
    })
    setSelectedRecord(null)
    setRecordDetails(null)
  }

  const handleSort = (key) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        if (prev.direction === 'asc') {
          return { key, direction: 'desc' }
        } else if (prev.direction === 'desc') {
          return { key: null, direction: null }
        }
      }
      return { key, direction: 'asc' }
    })
  }

  const sortedRecords = useMemo(() => {
    if (!sortConfig.key) return records

    return [...records].sort((a, b) => {
      let aVal = a[sortConfig.key]
      let bVal = b[sortConfig.key]

      // Handle null/undefined values
      if (aVal == null) return 1
      if (bVal == null) return -1

      // Handle different types
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal
      }

      // String comparison
      const aStr = String(aVal).toLowerCase()
      const bStr = String(bVal).toLowerCase()
      if (sortConfig.direction === 'asc') {
        return aStr.localeCompare(bStr)
      }
      return bStr.localeCompare(aStr)
    })
  }, [records, sortConfig])

  const handleRecordClick = (record) => {
    setSelectedRecord(record)
    setRecordDetails(null)
    fetchRecordDetails(record)
  }

  const totalAmount = useMemo(() => {
    return sortedRecords.reduce((sum, record) => sum + (record.amount || 0), 0)
  }, [sortedRecords])

  // Get unique values for filter dropdowns
  const uniqueVendors = useMemo(() => {
    const vendors = new Set()
    records.forEach(r => {
      if (r.vendor_name) vendors.add(r.vendor_name)
    })
    return Array.from(vendors).sort()
  }, [records])

  const getStatusBadge = (status) => {
    const statusLower = (status || '').toLowerCase()
    if (statusLower.includes('approved') || statusLower.includes('paid')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    }
    if (statusLower.includes('pending') || statusLower.includes('submitted') || statusLower.includes('under review')) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    }
    if (statusLower.includes('rejected') || statusLower.includes('cancelled')) {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <span className="text-gray-400">↕</span>
    }
    return sortConfig.direction === 'asc' ? <span>↑</span> : <span>↓</span>
  }

  if (selectedRecord && recordDetails) {
    const pr = recordDetails.pr || {}
    const prLines = recordDetails.pr_lines || []
    const invoices = recordDetails.invoices || []
    const summary = recordDetails.summary || {}
    
    return (
      <Layout>
        <div className="p-8 space-y-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                setSelectedRecord(null)
                setRecordDetails(null)
              }}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-semibold text-xs uppercase tracking-widest"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Reports
            </button>
            <button
              onClick={() => {
                // Navigate to create page with reference data
                navigate('/requisitions/create', {
                  state: {
                    referenceData: {
                      pr: pr,
                      prLines: prLines,
                      selectedRecord: selectedRecord
                    }
                  }
                })
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/50"
            >
              <Copy className="w-4 h-4" />
              Clone Request
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Request
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(pr.status || selectedRecord.status)}`}>
                      {pr.status || selectedRecord.status}
                    </span>
                    {summary.total_invoices > 0 && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        {summary.total_invoices} Invoice{summary.total_invoices !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">
                    {pr.request_number || pr.pr_number || selectedRecord.request_number || selectedRecord.pr_number}
                  </h2>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">
                    {pr.justification || selectedRecord.title || 'No description'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Request Total Amount</p>
                  <p className="text-xl font-medium text-gray-900 dark:text-white">
                    {pr.currency || selectedRecord.currency} {(pr.total_amount || selectedRecord.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  {summary.total_invoice_amount > 0 && (
                    <>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 mt-2">Total Invoiced</p>
                      <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                        {pr.currency || selectedRecord.currency} {summary.total_invoice_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Exception Overview surfaced near top */}
                {recordDetails?.invoices && recordDetails.invoices.some(inv => inv.is_exception) && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-3xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-red-600 dark:bg-red-700 flex items-center justify-center">
                          <AlertCircle className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xs font-semibold text-red-900 dark:text-red-100 uppercase tracking-widest">
                            Invoice Exception Overview
                          </h3>
                          <p className="text-xs text-red-700 dark:text-red-300">
                            {recordDetails.invoices.filter(inv => inv.is_exception).length} invoice
                            {recordDetails.invoices.filter(inv => inv.is_exception).length !== 1 ? 's' : ''} with master data variances
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Financial Dimensions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  {(pr.cost_center_name || selectedRecord.cost_center_name) && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Department</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{pr.cost_center_name || selectedRecord.cost_center_name}</p>
                    </div>
                  )}
                  {(pr.company || selectedRecord.company) && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Organization</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{pr.company || selectedRecord.company}</p>
                    </div>
                  )}
                  {(pr.vendor_name || selectedRecord.vendor_name) && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Supplier</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{pr.vendor_name || selectedRecord.vendor_name}</p>
                    </div>
                  )}
                  {(pr.po_number || selectedRecord.po_number) && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">PO Number</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{pr.po_number || selectedRecord.po_number}</p>
                    </div>
                  )}
                </div>

                {/* Process Tracking - Horizontal Scrolling */}
                {(recordDetails?.process_tracking && recordDetails.process_tracking.length > 0) ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        Process Tracking History ({recordDetails.process_tracking.length})
                      </h3>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 overflow-hidden">
                      <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                        <div className="flex items-start gap-4 min-w-max">
                          {recordDetails.process_tracking
                            .sort((a, b) => (a.step || 0) - (b.step || 0))
                            .map((track, idx) => {
                              const getStatusIcon = (status) => {
                                const statusUpper = (status || '').toUpperCase()
                                if (statusUpper === 'COMPLETED') {
                                  return <CheckCircle className="w-6 h-6 text-green-500" />
                                } else if (statusUpper === 'IN_PROGRESS' || statusUpper === 'PENDING') {
                                  return <Clock className="w-6 h-6 text-blue-500" />
                                } else if (statusUpper === 'FAILED' || statusUpper === 'REJECTED') {
                                  return <XCircle className="w-6 h-6 text-red-500" />
                                }
                                return <Circle className="w-6 h-6 text-gray-400" />
                              }
                              
                              const getStatusColor = (status) => {
                                const statusUpper = (status || '').toUpperCase()
                                if (statusUpper === 'COMPLETED') {
                                  return 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                } else if (statusUpper === 'IN_PROGRESS' || statusUpper === 'PENDING') {
                                  return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                } else if (statusUpper === 'FAILED' || statusUpper === 'REJECTED') {
                                  return 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                }
                                return 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                              }

                              const getConnectorColor = (status) => {
                                const statusUpper = (status || '').toUpperCase()
                                if (statusUpper === 'COMPLETED') {
                                  return 'bg-green-500'
                                } else if (statusUpper === 'IN_PROGRESS' || statusUpper === 'PENDING') {
                                  return 'bg-blue-500'
                                } else if (statusUpper === 'FAILED' || statusUpper === 'REJECTED') {
                                  return 'bg-red-500'
                                }
                                return 'bg-gray-300 dark:bg-gray-600'
                              }

                              const nextTrack = recordDetails.process_tracking
                                .sort((a, b) => (a.step || 0) - (b.step || 0))[idx + 1]
                              const connectorColor = nextTrack 
                                ? getConnectorColor(track.process_status)
                                : 'bg-gray-300 dark:bg-gray-600'

                              return (
                                <div key={track.id || idx} className="flex items-center flex-shrink-0">
                                  <div className="flex flex-col items-center min-w-[180px] max-w-[220px]">
                                    <div className={`flex items-center justify-center w-16 h-16 rounded-2xl border-2 transition-all ${getStatusColor(track.process_status)}`}>
                                      {getStatusIcon(track.process_status)}
                                    </div>
                                    <div className="mt-3 text-center">
                                      <div className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                                        {track.process_step || `Step ${track.step || idx + 1}`}
                                      </div>
                                      <div className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                        track.process_status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                        track.process_status === 'IN_PROGRESS' || track.process_status === 'PENDING' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                        track.process_status === 'FAILED' || track.process_status === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                      }`}>
                                        {track.process_status || 'PENDING'}
                                      </div>
                                      {track.process_notes && (
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                                          {track.process_notes}
                                        </p>
                                      )}
                                      {track.start_date && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                          {new Date(track.start_date).toLocaleDateString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  {idx < recordDetails.process_tracking.length - 1 && (
                                    <div className={`h-1 w-12 mx-2 transition-colors ${connectorColor}`} />
                                  )}
                                </div>
                              )
                            })}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                      Process Tracking History
                    </h3>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
                      <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">No process tracking records found</p>
                    </div>
                  </div>
                )}

                {/* SAP/ERP system information (collapsible, default collapsed) */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setSapErpSectionCollapsed((c) => !c)}
                    className="w-full flex items-center justify-between gap-2 py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                  >
                    <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-widest">
                      SAP / ERP system information
                    </h3>
                    {sapErpSectionCollapsed ? (
                      <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
                    ) : (
                      <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
                    )}
                  </button>
                  {!sapErpSectionCollapsed && (
                    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-4">
                      {(recordDetails?.pr || (recordDetails?.pr_lines && recordDetails.pr_lines.length > 0)) ? (
                        <>
                      {recordDetails?.pr && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                          {recordDetails.pr.cost_center_id != null && recordDetails.pr.cost_center_id !== '' && (
                            <div>
                              <span className="text-gray-400 dark:text-gray-500 block text-xs uppercase tracking-wider">Cost center</span>
                              <span className="text-gray-900 dark:text-white">{recordDetails.pr.cost_center_id}</span>
                            </div>
                          )}
                          {recordDetails.pr.project_id != null && recordDetails.pr.project_id !== '' && (
                            <div>
                              <span className="text-gray-400 dark:text-gray-500 block text-xs uppercase tracking-wider">Project</span>
                              <span className="text-gray-900 dark:text-white">{recordDetails.pr.project_id}</span>
                            </div>
                          )}
                          {recordDetails.pr.facility_id != null && recordDetails.pr.facility_id !== '' && (
                            <div>
                              <span className="text-gray-400 dark:text-gray-500 block text-xs uppercase tracking-wider">Facility</span>
                              <span className="text-gray-900 dark:text-white">{recordDetails.pr.facility_id}</span>
                            </div>
                          )}
                          {recordDetails.pr.company != null && recordDetails.pr.company !== '' && (
                            <div>
                              <span className="text-gray-400 dark:text-gray-500 block text-xs uppercase tracking-wider">Company</span>
                              <span className="text-gray-900 dark:text-white">{recordDetails.pr.company}</span>
                            </div>
                          )}
                          {recordDetails.pr.request_type != null && recordDetails.pr.request_type !== '' && (
                            <div>
                              <span className="text-gray-400 dark:text-gray-500 block text-xs uppercase tracking-wider">Request type</span>
                              <span className="text-gray-900 dark:text-white">{recordDetails.pr.request_type}</span>
                            </div>
                          )}
                          {recordDetails.pr.document_type != null && recordDetails.pr.document_type !== '' && (
                            <div>
                              <span className="text-gray-400 dark:text-gray-500 block text-xs uppercase tracking-wider">Document type</span>
                              <span className="text-gray-900 dark:text-white">{recordDetails.pr.document_type}</span>
                            </div>
                          )}
                          {recordDetails.pr.budget_id != null && recordDetails.pr.budget_id !== '' && (
                            <div>
                              <span className="text-gray-400 dark:text-gray-500 block text-xs uppercase tracking-wider">Budget ID</span>
                              <span className="text-gray-900 dark:text-white">{recordDetails.pr.budget_id}</span>
                            </div>
                          )}
                          {recordDetails.pr.po_number != null && recordDetails.pr.po_number !== '' && (
                            <div>
                              <span className="text-gray-400 dark:text-gray-500 block text-xs uppercase tracking-wider">PO number</span>
                              <span className="text-gray-900 dark:text-white">{recordDetails.pr.po_number}</span>
                            </div>
                          )}
                        </div>
                      )}
                      {recordDetails.pr_lines?.some((l) => l.gl_code != null && l.gl_code !== '') && (
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-200 dark:border-gray-600 pb-2 mb-2">
                            GL codes by line
                          </h4>
                          <ul className="space-y-1.5 text-sm">
                            {recordDetails.pr_lines.map((line) =>
                              line.gl_code != null && line.gl_code !== '' ? (
                                <li key={line.line_id} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                  <span className="text-gray-400 dark:text-gray-500 font-mono text-xs">Line {line.line_number}</span>
                                  <span className="font-mono">{line.gl_code}</span>
                                  {line.description && (
                                    <span className="text-gray-400 dark:text-gray-500 truncate max-w-[12rem]">— {line.description}</span>
                                  )}
                                </li>
                              ) : null
                            )}
                          </ul>
                        </div>
                      )}
                      {recordDetails?.pr && !recordDetails.pr.cost_center_id && !recordDetails.pr.project_id && !recordDetails.pr.facility_id && !recordDetails.pr.company && !recordDetails.pr.request_type && !recordDetails.pr.document_type && !recordDetails.pr.budget_id && !recordDetails.pr.po_number && !recordDetails.pr_lines?.some((l) => l.gl_code) && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">No SAP/ERP system information available for this request.</p>
                      )}
                        </>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">No SAP/ERP system information available for this request.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Documents - Main Section */}
                {(recordDetails?.documents && recordDetails.documents.length > 0) ? (
                  <div id="documents-section" className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                      Related Documents ({recordDetails.documents.length})
                    </h3>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden">
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {recordDetails.documents.map((doc) => {
                          const formatFileSize = (bytes) => {
                            if (!bytes) return 'Unknown size'
                            if (bytes < 1024) return `${bytes} B`
                            if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
                            return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
                          }

                          const getFileIcon = (mimeType, fileName) => {
                            if (mimeType?.includes('pdf')) {
                              return <FileText className="w-5 h-5 text-red-500" />
                            } else if (mimeType?.includes('image')) {
                              return <FileText className="w-5 h-5 text-blue-500" />
                            } else if (mimeType?.includes('word') || fileName?.match(/\.(doc|docx)$/i)) {
                              return <FileText className="w-5 h-5 text-blue-600" />
                            } else if (mimeType?.includes('excel') || fileName?.match(/\.(xls|xlsx)$/i)) {
                              return <FileSpreadsheet className="w-5 h-5 text-green-600" />
                            }
                            return <File className="w-5 h-5 text-gray-500" />
                          }

                          const getSourceBadge = (source) => {
                            const src = (source || '').toUpperCase()
                            if (src === 'PR_SCREEN') {
                              return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            } else if (src === 'VENDOR_EMAIL') {
                              return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            } else if (src === 'SYSTEM') {
                              return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }
                            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }

                          return (
                            <div key={doc.document_id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                  <div className="mt-0.5 flex-shrink-0">
                                    {getFileIcon(doc.mime_type, doc.file_name)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="font-medium text-gray-900 dark:text-white truncate">
                                        {doc.document_name || doc.file_name || 'Untitled Document'}
                                      </p>
                                      {doc.document_type && (
                                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                          {doc.document_type}
                                        </span>
                                      )}
                                      {doc.source && (
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSourceBadge(doc.source)}`}>
                                          {doc.source.replace('_', ' ')}
                                        </span>
                                      )}
                                    </div>
                                    {doc.description && (
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        {doc.description}
                                      </p>
                                    )}
                                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                      {doc.file_size && (
                                        <span className="flex items-center gap-1">
                                          <File className="w-3 h-3" />
                                          {formatFileSize(doc.file_size)}
                                        </span>
                                      )}
                                      {doc.mime_type && (
                                        <span>{doc.mime_type}</span>
                                      )}
                                      {doc.uploaded_by_name && (
                                        <span className="flex items-center gap-1">
                                          <User className="w-3 h-3" />
                                          {doc.uploaded_by_name}
                                        </span>
                                      )}
                                      {doc.created_at && (
                                        <span className="flex items-center gap-1">
                                          <Calendar className="w-3 h-3" />
                                          {new Date(doc.created_at).toLocaleString()}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {doc.download_url && (
                                    <a
                                      href={doc.download_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                      View
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                      Related Documents
                    </h3>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
                      <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">No documents found</p>
                    </div>
                  </div>
                )}

                {/* Summary Statistics */}
                {summary && Object.keys(summary).length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                      Invoice Summary
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-gray-50 dark:bg-gray-900 p-6 rounded-3xl">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Invoices</p>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">{summary.total_invoices || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Invoiced</p>
                        <p className="text-lg font-medium text-purple-600 dark:text-purple-400">
                          {pr.currency || selectedRecord.currency} {(summary.total_invoice_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Approved Amount</p>
                        <p className="text-lg font-medium text-green-600 dark:text-green-400">
                          {pr.currency || selectedRecord.currency} {(summary.approved_invoice_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pending Amount</p>
                        <p className="text-lg font-medium text-yellow-600 dark:text-yellow-400">
                          {pr.currency || selectedRecord.currency} {(summary.pending_invoice_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-900 p-6 rounded-3xl">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Lines with Invoices</p>
                        <p className="text-lg font-medium text-green-600 dark:text-green-400">{summary.lines_with_invoices || 0} / {summary.total_pr_lines || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Lines without Invoices</p>
                        <p className="text-lg font-medium text-red-600 dark:text-red-400">{summary.lines_without_invoices || 0}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Request Line Items with Invoice Mapping */}
                {prLines && prLines.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                      Request Line Items & Invoice Status
                    </h3>
                    <div className="space-y-4">
                      {prLines.map((line, idx) => (
                        <div key={line.line_id || idx} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Line {line.line_number}</span>
                                {line.has_invoice ? (
                                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                    {line.invoice_count} Invoice{line.invoice_count !== 1 ? 's' : ''}
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                    No Invoice
                                  </span>
                                )}
                              </div>
                              <p className="font-medium text-gray-900 dark:text-white mb-1">
                                {line.description || 'N/A'}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                                <span>Qty: {line.quantity || 0} {line.unit_of_measure || ''}</span>
                                <span>Unit Price: {pr.currency || selectedRecord.currency} {(line.unit_price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                <span className="font-semibold">Line Amount: {pr.currency || selectedRecord.currency} {(line.line_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              {line.has_invoice && (
                                <>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Invoiced</p>
                                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                    {pr.currency || selectedRecord.currency} {(line.invoice_total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                          {line.invoices && line.invoices.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Invoices for this line:</p>
                              <div className="space-y-2">
                                {line.invoices.map((inv, invIdx) => (
                                  <div key={invIdx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-2 rounded text-xs">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-gray-900 dark:text-white">{inv.invoice_number}</span>
                                      <span className={`px-2 py-0.5 rounded ${getStatusBadge(inv.invoice_status)}`}>
                                        {inv.invoice_status}
                                      </span>
                                    </div>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                      {pr.currency || selectedRecord.currency} {(inv.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Invoices Section */}
                {invoices && invoices.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                      All Invoices ({invoices.length})
                    </h3>
                    <div className="space-y-4">
                      {invoices.map((invoice, idx) => {
                        // Parse exception_log if it's a string
                        let exceptionLog = invoice.exception_log
                        if (exceptionLog && typeof exceptionLog === 'string') {
                          try {
                            exceptionLog = JSON.parse(exceptionLog)
                          } catch (e) {
                            console.error('Error parsing exception_log:', e)
                            exceptionLog = null
                          }
                        }
                        
                        return (
                        <div key={invoice.invoice_id || idx} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-gray-900 dark:text-white">{invoice.invoice_number}</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(invoice.status)}`}>
                                  {invoice.status}
                                </span>
                                {invoice.is_exception && (
                                  <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded text-xs font-medium uppercase flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Exception Flagged
                                  </span>
                                )}
                                {invoice.invoice_date && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(invoice.invoice_date).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              {invoice.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{invoice.description}</p>
                              )}
                              {invoice.line_items && invoice.line_items.length > 0 && (
                                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                  {invoice.line_items.length} line item{invoice.line_items.length !== 1 ? 's' : ''}
                                  {invoice.line_items.some(li => li.pr_line_number) && (
                                    <span className="ml-2">
                                      (Mapped to Request lines: {invoice.line_items.filter(li => li.pr_line_number).map(li => li.pr_line_number).join(', ')})
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total</p>
                              <p className="text-lg font-medium text-gray-900 dark:text-white">
                                {invoice.currency || pr.currency || selectedRecord.currency} {(invoice.gross_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </p>
                              {invoice.net_amount && invoice.tax_amount && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Net: {(invoice.net_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} + Tax: {(invoice.tax_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </p>
                              )}
                            </div>
                          </div>
                          {invoice.line_items && invoice.line_items.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Invoice Line Items:</p>
                              <div className="space-y-1">
                                {invoice.line_items.map((invLine, lineIdx) => (
                                  <div key={lineIdx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-2 rounded text-xs">
                                    <div>
                                      <span className="font-medium text-gray-900 dark:text-white">{invLine.description || 'N/A'}</span>
                                      {invLine.pr_line_number && (
                                        <span className="ml-2 text-gray-500 dark:text-gray-400">
                                          (Request Line {invLine.pr_line_number})
                                        </span>
                                      )}
                                    </div>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                      {invoice.currency || pr.currency || selectedRecord.currency} {(invLine.net_line_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Master Data Variance Audit */}
                          {invoice.is_exception && exceptionLog && Array.isArray(exceptionLog) && exceptionLog.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-800">
                              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                    <h4 className="text-xs font-semibold text-red-900 dark:text-red-100 uppercase tracking-widest">
                                      Master Data Variance Audit
                                    </h4>
                                  </div>
                                  <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-xs font-semibold">
                                    {exceptionLog.length} Exception{exceptionLog.length !== 1 ? 's' : ''} Flagged
                                  </span>
                                </div>
                                {invoice.sap_error_message && (
                                  <p className="text-xs text-red-700 dark:text-red-300 mb-3">
                                    {invoice.sap_error_message}
                                  </p>
                                )}
                                <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800 overflow-hidden">
                                  <div className="max-h-64 overflow-y-auto">
                                    <table className="w-full text-left text-xs">
                                      <thead className="bg-red-50 dark:bg-red-900/30 sticky top-0">
                                        <tr>
                                          <th className="p-2 text-xs font-semibold text-red-700 dark:text-red-300 uppercase tracking-widest w-1/4">Dimension</th>
                                          <th className="p-2 text-xs font-semibold text-red-700 dark:text-red-300 uppercase tracking-widest w-1/4 text-center">SAP Record</th>
                                          <th className="p-2 text-xs font-semibold text-red-700 dark:text-red-300 uppercase tracking-widest w-1/4 text-center">Invoice Value</th>
                                          <th className="p-2 text-xs font-semibold text-red-700 dark:text-red-300 uppercase tracking-widest">Resolution Guidance</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-red-100 dark:divide-red-900/30">
                                        {exceptionLog.map((log, logIdx) => (
                                          <tr key={logIdx} className="hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-colors">
                                            <td className="p-2 font-medium text-gray-900 dark:text-white">{log.field}</td>
                                            <td className="p-2 font-medium text-green-600 dark:text-green-400 text-center">{log.expected}</td>
                                            <td className="p-2 font-medium text-red-600 dark:text-red-400 text-center">{log.actual}</td>
                                            <td className="p-2 text-gray-600 dark:text-gray-400 italic text-xs">"{log.message}"</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )})}
                    </div>
                  </div>
                )}

              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Document Summary */}
                {recordDetails?.documents && recordDetails.documents.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 space-y-4">
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Document Summary</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Total Documents</span>
                        <span className="font-medium text-gray-900 dark:text-white">{recordDetails.documents.length}</span>
                      </div>
                      {recordDetails.documents.reduce((total, doc) => total + (doc.file_size || 0), 0) > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Total Size</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {(() => {
                              const totalBytes = recordDetails.documents.reduce((total, doc) => total + (doc.file_size || 0), 0)
                              if (totalBytes < 1024) return `${totalBytes} B`
                              if (totalBytes < 1024 * 1024) return `${(totalBytes / 1024).toFixed(1)} KB`
                              return `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`
                            })()}
                          </span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <a
                          href="#documents"
                          onClick={(e) => {
                            e.preventDefault()
                            document.getElementById('documents-section')?.scrollIntoView({ behavior: 'smooth' })
                          }}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          View all documents
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Audit Logs */}
                {(recordDetails?.audit_logs && recordDetails.audit_logs.length > 0) ? (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 space-y-4">
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Audit History</h4>
                    {/* Filter chips: All | Request | Invoices | Goods receipt | Workflow */}
                    {(() => {
                      const getAuditCategory = (tableName) => {
                        if (!tableName) return null
                        const t = (tableName || '').toLowerCase()
                        if (t === 'purchase_requisition') return 'request'
                        if (t === 'invoice_header') return 'invoices'
                        if (t === 'goods_receipt') return 'goods_receipt'
                        if (t === 'process_tracking') return 'workflow'
                        return null
                      }
                      const filters = [
                        { id: 'all', label: 'All' },
                        { id: 'request', label: 'Request' },
                        { id: 'invoices', label: 'Invoices' },
                        { id: 'goods_receipt', label: 'Goods receipt' },
                        { id: 'workflow', label: 'Workflow' },
                      ]
                      const filteredLogs = auditFilter === 'all'
                        ? recordDetails.audit_logs
                        : recordDetails.audit_logs.filter((log) => getAuditCategory(log.table_name) === auditFilter)
                      return (
                        <>
                          <div className="flex flex-wrap gap-2">
                            {filters.map((f) => (
                              <button
                                key={f.id}
                                type="button"
                                onClick={() => setAuditFilter(f.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                  auditFilter === f.id
                                    ? 'bg-blue-600 text-white dark:bg-blue-500'
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                              >
                                {f.label}
                              </button>
                            ))}
                          </div>
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {filteredLogs.length === 0 ? (
                              <div className="text-center py-6">
                                <FileText className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                <p className="text-xs text-gray-500 dark:text-gray-400">No audit logs match this filter</p>
                              </div>
                            ) : (
                              filteredLogs.map((log) => {
                        const getOperationIcon = (operation) => {
                          const op = (operation || '').toUpperCase()
                          if (op === 'INSERT' || op === 'CREATE') {
                            return <Circle className="w-4 h-4 text-green-500" />
                          } else if (op === 'UPDATE' || op === 'MODIFY') {
                            return <Info className="w-4 h-4 text-blue-500" />
                          } else if (op === 'DELETE' || op === 'REMOVE') {
                            return <XCircle className="w-4 h-4 text-red-500" />
                          }
                          return <FileText className="w-4 h-4 text-gray-400" />
                        }

                        const getOperationBadge = (operation) => {
                          const op = (operation || '').toUpperCase()
                          if (op === 'INSERT' || op === 'CREATE') {
                            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          } else if (op === 'UPDATE' || op === 'MODIFY') {
                            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          } else if (op === 'DELETE' || op === 'REMOVE') {
                            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }
                          return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }

                        const category = getAuditCategory(log.table_name)
                        const categoryLabel = { request: 'Request', invoices: 'Invoices', goods_receipt: 'Goods receipt', workflow: 'Workflow' }[category] || log.table_name
                        return (
                                  <div key={log.audit_logs_id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        {getOperationIcon(log.operation_type)}
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getOperationBadge(log.operation_type)}`}>
                                          {log.operation_type || 'UNKNOWN'}
                                        </span>
                                        {category && (
                                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200">
                                            {categoryLabel}
                                          </span>
                                        )}
                                        {log.table_name && !category && (
                                          <span className="text-xs text-gray-500 dark:text-gray-400">
                                            on {log.table_name}
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(log.created_at).toLocaleString()}
                                      </span>
                                    </div>
                                    {log.created_by && (
                                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        By: {log.created_by}
                                      </p>
                                    )}
                                    {log.field_name && (
                                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Field: {log.field_name}
                                      </p>
                                    )}
                                    {(log.old_value || log.new_value) && (
                                      <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-start gap-2 text-xs">
                                          {log.old_value && (
                                            <div className="flex-1">
                                              <span className="text-gray-500 dark:text-gray-400">Old:</span>
                                              <p className="text-gray-700 dark:text-gray-300 font-mono break-all">
                                                {log.old_value}
                                              </p>
                                            </div>
                                          )}
                                          {log.old_value && log.new_value && (
                                            <span className="text-gray-400 dark:text-gray-500">→</span>
                                          )}
                                          {log.new_value && (
                                            <div className="flex-1">
                                              <span className="text-gray-500 dark:text-gray-400">New:</span>
                                              <p className="text-gray-700 dark:text-gray-300 font-mono break-all">
                                                {log.new_value}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                    {log.error && (
                                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                                        <p className="text-xs text-red-700 dark:text-red-300">
                                          <AlertCircle className="w-3 h-3 inline mr-1" />
                                          Error: {log.error}
                                        </p>
                                      </div>
                                    )}
                                    {log.status && (
                                      <div className="mt-2">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Status: </span>
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                          {log.status}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )
                              })
                            )}
                          </div>
                        </>
                      )
                    })()}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 space-y-4">
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Audit History</h4>
                    <div className="text-center py-6">
                      <FileText className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">No audit logs found</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">Reports</h1>
            <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-widest">
              View approved requests with PO numbers and invoices
            </p>
          </div>
          <div className="flex gap-6 items-center">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-6 py-4 rounded-3xl">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Filtered Total</p>
              <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                {records[0]?.currency || 'SGD'} {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <button className="bg-gray-900 dark:bg-gray-700 text-white px-6 py-3 rounded-2xl font-semibold text-xs uppercase tracking-widest hover:bg-primary-600 dark:hover:bg-primary-500 transition-all shadow-lg shadow-gray-200 dark:shadow-gray-900 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-1 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </h3>
              <div className="h-0.5 w-16 bg-primary-600 rounded-full mt-2"></div>
            </div>
            <button
              onClick={clearFilters}
              className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                Request Type
              </label>
              <select
                value={filters.request_type}
                onChange={(e) => handleFilterChange('request_type', e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-4 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              >
                <option value="All">All</option>
                <option value="PR">Request</option>
                <option value="Invoice">Invoice</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                Supplier Name
              </label>
              <input
                type="text"
                value={filters.vendor_name}
                onChange={(e) => handleFilterChange('vendor_name', e.target.value)}
                placeholder="Search supplier..."
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-4 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                Request Number
              </label>
              <input
                type="text"
                value={filters.pr_number}
                onChange={(e) => handleFilterChange('pr_number', e.target.value)}
                placeholder="Search request number..."
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-4 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                PO Number
              </label>
              <input
                type="text"
                value={filters.po_number}
                onChange={(e) => handleFilterChange('po_number', e.target.value)}
                placeholder="Search PO number..."
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-4 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                Invoice Number
              </label>
              <input
                type="text"
                value={filters.invoice_number}
                onChange={(e) => handleFilterChange('invoice_number', e.target.value)}
                placeholder="Search invoice number..."
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-4 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                Request Date From
              </label>
              <input
                type="date"
                value={filters.request_date_from}
                onChange={(e) => handleFilterChange('request_date_from', e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-4 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading reports...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : sortedRecords.length === 0 ? (
            <div className="p-6 text-center">
              <FileSpreadsheet className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">No records found</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleSort('record_type')}
                    >
                      <div className="flex items-center gap-1">
                        Type
                        <SortIcon columnKey="record_type" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleSort('request_number')}
                    >
                      <div className="flex items-center gap-1">
                        Request/Invoice #
                        <SortIcon columnKey="request_number" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      PO Number
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleSort('vendor_name')}
                    >
                      <div className="flex items-center gap-1">
                        Supplier
                        <SortIcon columnKey="vendor_name" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Department
                    </th>
                    <th
                      className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Amount
                        <SortIcon columnKey="amount" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleSort('request_date')}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Date
                        <SortIcon columnKey="request_date" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedRecords.map((record) => (
                    <tr
                      key={record.id}
                      onClick={() => handleRecordClick(record)}
                      className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          record.record_type === 'PR'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        }`}>
                          {record.record_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {record.request_number || record.pr_number || record.invoice_number || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {record.po_number || '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {record.vendor_name || '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {record.cost_center_name || '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                        {record.currency} {record.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                        {record.request_date || record.invoice_date || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Eye className="w-4 h-4 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

