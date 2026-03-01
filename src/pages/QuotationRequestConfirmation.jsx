import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Copy, Check, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from '../utils/axios'
import Layout from '../components/Layout'

export default function QuotationRequestConfirmation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [request, setRequest] = useState(location.state?.request || null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!request && id) {
      axios.get(`/api/v1/quotation-requests/${id}`).then(({ data }) => setRequest(data)).catch(() => toast.error('Request not found'))
    }
  }, [id, request])

  const vendorLink = request?.token
    ? `${window.location.origin}/submit-quotation/${request.token}`
    : ''

  const copyLink = () => {
    if (!vendorLink) return
    navigator.clipboard.writeText(vendorLink).then(() => {
      setCopied(true)
      toast.success('Link copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (!request) {
    return (
      <Layout>
        <div className="w-full max-w-2xl mx-auto py-12 px-4 text-center text-gray-500 dark:text-gray-400">Loading...</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="w-full max-w-2xl mx-auto py-4 px-4">
        <button
          onClick={() => navigate('/quotation-requests')}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-4"
        >
          <ArrowLeft size={16} />
          Back to Quotation Requests
        </button>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 mb-6">
          <h1 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-1">Quotation request created</h1>
          <p className="text-sm text-green-700 dark:text-green-300">Share the link below with vendors to collect quotations.</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Vendor submission link</h2>
          <div className="flex gap-2">
            <input
              readOnly
              value={vendorLink}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
            <button
              type="button"
              onClick={copyLink}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium text-sm flex items-center gap-2"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Request summary</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Request ID</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{request.request_number}</dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Item / Service</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{request.item_service_name}</dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Submission deadline</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{request.submission_deadline ? new Date(request.submission_deadline).toLocaleString() : '-'}</dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Currency</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{request.currency}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => navigate(`/quotation-requests/${request.id}/submissions`)}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold text-sm"
          >
            View submissions
          </button>
          <button
            onClick={() => navigate('/quotation-requests')}
            className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl font-semibold text-sm"
          >
            Back to list
          </button>
        </div>
      </div>
    </Layout>
  )
}
