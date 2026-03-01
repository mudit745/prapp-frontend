import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Eye, FileText, Link2, Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from '../utils/axios'
import Layout from '../components/Layout'
import Table from '../components/Table'

export default function QuotationRequests() {
  const navigate = useNavigate()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchList = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.get('/api/v1/quotation-requests/overview')
      setList(response.data || [])
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 500) {
        try {
          const fallback = await axios.get('/api/v1/quotation-requests')
          setList(fallback.data || [])
        } catch (e2) {
          setError(e2.response?.data?.message || 'Failed to fetch quotation requests')
        }
      } else {
        setError(err.response?.data?.message || 'Failed to fetch quotation requests')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  const statusBadge = (status) => {
    const map = {
      Open: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'Under Review': 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
      Finalized: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      Closed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      Expired: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status] || 'bg-gray-100'}`}>
        {status}
      </span>
    )
  }

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '-')

  const vendorSubmissionLink = (token) => (token ? `${window.location.origin}/submit-quotation/${token}` : '')

  const copySubmissionLink = (e, token) => {
    e.stopPropagation()
    const link = vendorSubmissionLink(token)
    if (!link) return
    navigator.clipboard.writeText(link).then(() => toast.success('Submission link copied')).catch(() => toast.error('Copy failed'))
  }

  return (
    <Layout>
      <div className="w-full py-4 px-4">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">Quotation Requests</h1>
            <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-widest">
              Create requests and track vendor quotations
            </p>
          </div>
          <button
            onClick={() => navigate('/quotation-requests/create')}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold text-xs tracking-widest shadow-sm shadow-primary-200 dark:shadow-primary-900 transition-all flex items-center gap-2"
          >
            <Plus size={16} />
            New Quotation Request
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg font-medium text-xs">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {loading ? (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400 text-sm">Loading...</div>
          ) : list.length === 0 ? (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400 text-sm">
              No quotation requests yet. Create one to get a vendor submission link.
            </div>
          ) : (
            <Table
              columns={[
                { key: 'request_number', header: 'Request ID', sortable: true },
                { key: 'item_service_name', header: 'Item / Service', sortable: true },
                {
                  key: 'created_at',
                  header: 'Date Created',
                  sortable: true,
                  render: (row) => formatDate(row.created_at)
                },
                {
                  key: 'submission_deadline',
                  header: 'Submission Deadline',
                  sortable: true,
                  render: (row) => formatDate(row.submission_deadline)
                },
                {
                  key: 'submission_count',
                  header: 'Responses',
                  sortable: true,
                  render: (row) => row.submission_count ?? 0
                },
                {
                  key: 'best_ai',
                  header: 'Best AI-rated',
                  render: (row) => {
                    if (!row.best_ai_vendor_name && row.best_ai_score == null) return <span className="text-gray-400 text-xs">—</span>
                    return (
                      <div className="text-xs">
                        <span className="font-medium text-gray-900 dark:text-white">{row.best_ai_vendor_name || '—'}</span>
                        {row.best_ai_score != null && (
                          <span className="ml-1 text-primary-600 dark:text-primary-400">({Math.round(row.best_ai_score)})</span>
                        )}
                        {row.best_ai_recommendation && (
                          <span className="block text-gray-500 dark:text-gray-400 truncate max-w-[120px]" title={row.best_ai_recommendation}>{row.best_ai_recommendation}</span>
                        )}
                      </div>
                    )
                  }
                },
                {
                  key: 'submission_link',
                  header: 'Vendor submission link',
                  render: (row) => {
                    const link = vendorSubmissionLink(row.token)
                    if (!link) return <span className="text-gray-400 text-xs">—</span>
                    return (
                      <div className="flex items-center gap-1.5">
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline text-xs truncate max-w-[180px]"
                          title={link}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link2 size={12} />
                          Open link
                        </a>
                        <button
                          type="button"
                          onClick={(e) => copySubmissionLink(e, row.token)}
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400"
                          title="Copy link"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    )
                  }
                },
                {
                  key: 'status',
                  header: 'Status',
                  sortable: true,
                  render: (row) => statusBadge(row.status)
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (row) => (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => navigate(`/quotation-requests/${row.id}/evaluate`)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                      >
                        <Eye size={14} />
                        Evaluate
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/quotation-requests/${row.id}/submissions`) }}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        Submissions
                      </button>
                    </div>
                  )
                }
              ]}
              data={list}
              keyField="id"
            />
          )}
        </div>
      </div>
    </Layout>
  )
}
