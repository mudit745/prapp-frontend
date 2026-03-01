import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Link2, Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from '../utils/axios'
import Layout from '../components/Layout'
import Table from '../components/Table'

export default function QuotationSubmissions() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [request, setRequest] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const [reqRes, subRes] = await Promise.all([
        axios.get(`/api/v1/quotation-requests/${id}`),
        axios.get(`/api/v1/quotation-requests/${id}/submissions`)
      ])
      setRequest(reqRes.data)
      setSubmissions(subRes.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const formatDate = (d) => (d ? new Date(d).toLocaleString() : '-')

  const vendorLink = request?.token ? `${window.location.origin}/submit-quotation/${request.token}` : ''
  const copyLink = () => {
    if (!vendorLink) return
    navigator.clipboard.writeText(vendorLink).then(() => toast.success('Submission link copied')).catch(() => toast.error('Copy failed'))
  }

  return (
    <Layout>
      <div className="w-full py-4 px-4">
        <button
          onClick={() => navigate('/quotation-requests')}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-4"
        >
          <ArrowLeft size={16} />
          Back to Quotation Requests
        </button>

        {request && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{request.request_number}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{request.item_service_name}</p>
            </div>
            {request.token && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Vendor submission link (for testing):</span>
                <a
                  href={vendorLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline"
                >
                  <Link2 size={12} />
                  Open link
                </a>
                <button
                  type="button"
                  onClick={copyLink}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <Copy size={12} />
                  Copy link
                </button>
                <span className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-md" title={vendorLink}>{vendorLink}</span>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Vendor quotations</h2>
          {loading ? (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400 text-sm">Loading...</div>
          ) : submissions.length === 0 ? (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400 text-sm">No vendor submissions yet.</div>
          ) : (
            <Table
              columns={[
                { key: 'vendor_name', header: 'Vendor Name', sortable: true },
                {
                  key: 'price_quote',
                  header: 'Price',
                  sortable: true,
                  render: (row) => `${row.currency || ''} ${(row.price_quote ?? 0).toFixed(2)}`
                },
                {
                  key: 'created_at',
                  header: 'Submission Date',
                  sortable: true,
                  render: (row) => formatDate(row.created_at)
                },
                { key: 'delivery_timeline', header: 'Delivery Timeline', sortable: true },
                { key: 'payment_terms', header: 'Payment Terms' },
                {
                  key: 'attachment',
                  header: 'Attachment',
                  render: (row) => {
                    const name = row.document_file_name || row.documentFileName || null
                    const urlRaw = row.document_storage_url ?? row.documentStorageUrl ?? null
                    const url = (typeof urlRaw === 'string' && urlRaw.trim()) ? urlRaw.trim() : null
                    if (url && name) {
                      return (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline text-xs font-medium"
                          title={`Open ${name}`}
                        >
                          <ExternalLink size={14} />
                          View / open ({name.length > 22 ? name.slice(0, 19) + '…' : name})
                        </a>
                      )
                    }
                    if (url) {
                      return (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline text-xs font-medium"
                          title="Open attachment"
                        >
                          <ExternalLink size={14} />
                          View / open
                        </a>
                      )
                    }
                    if (name) {
                      return (
                        <span className="text-amber-600 dark:text-amber-400 text-xs" title="File was attached but the download link was not saved (upload may have failed). New submissions with Firebase configured will show a clickable link.">
                          {name} (link not saved)
                        </span>
                      )
                    }
                    return <span className="text-gray-400 text-xs">—</span>
                  }
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (row) => (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                      {row.status}
                    </span>
                  )
                }
              ]}
              data={submissions}
              keyField="id"
            />
          )}
        </div>
      </div>
    </Layout>
  )
}
