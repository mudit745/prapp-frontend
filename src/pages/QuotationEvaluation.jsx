import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Star,
  ExternalLink,
  FileText,
  Copy,
  Link2,
  CheckCircle,
  MessageSquare,
  X,
  Sparkles,
  Award,
  AlertTriangle,
  FilePlus
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from '../utils/axios'
import Layout from '../components/Layout'
import Table from '../components/Table'

export default function QuotationEvaluation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [request, setRequest] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [shortlistOnly, setShortlistOnly] = useState(false)
  const [reviewRow, setReviewRow] = useState(null)
  const [reviewAnalysis, setReviewAnalysis] = useState(null)
  const [reviewScores, setReviewScores] = useState(null)
  const [selection, setSelection] = useState(null)
  const [scoringIds, setScoringIds] = useState(new Set())

  const fetchRequest = useCallback(async () => {
    if (!id) return
    try {
      const res = await axios.get(`/api/v1/quotation-requests/${id}`)
      setRequest(res.data)
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load request')
    }
  }, [id])

  const fetchSubmissions = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const [subRes, selRes] = await Promise.all([
        axios.get(`/api/v1/quotation-requests/${id}/submissions/with-evaluation`),
        axios.get(`/api/v1/quotation-requests/${id}/selection`).catch(() => ({ data: null }))
      ])
      setSubmissions(subRes.data || [])
      setSelection(selRes.data?.quotation_vendor_submission_id || null)
    } catch (e) {
      const fallback = await axios.get(`/api/v1/quotation-requests/${id}/submissions`).catch(() => ({ data: [] }))
      setSubmissions((fallback.data || []).map(s => ({ ...s, shortlisted: false })))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchRequest()
  }, [fetchRequest])
  useEffect(() => {
    fetchSubmissions()
  }, [fetchSubmissions])

  const triggerScore = async (submissionId) => {
    setScoringIds(prev => new Set(prev).add(submissionId))
    try {
      await axios.post(`/api/v1/quotation-requests/${id}/submissions/${submissionId}/score`)
      await fetchSubmissions()
      toast.success('Scored')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Score failed')
    } finally {
      setScoringIds(prev => { const s = new Set(prev); s.delete(submissionId); return s })
    }
  }

  const toggleShortlist = async (submissionId, currentlyShortlisted) => {
    try {
      if (currentlyShortlisted) {
        await axios.delete(`/api/v1/quotation-requests/${id}/shortlist/${submissionId}`)
        toast.success('Removed from shortlist')
      } else {
        await axios.post(`/api/v1/quotation-requests/${id}/shortlist`, { submission_id: submissionId })
        toast.success('Added to shortlist')
      }
      await fetchSubmissions()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Shortlist update failed')
    }
  }

  const openReview = async (row) => {
    setReviewRow(row)
    setReviewAnalysis(null)
    setReviewScores(null)
    try {
      const [analysisRes, scoresRes] = await Promise.all([
        axios.get(`/api/v1/quotation-requests/${id}/submissions/${row.id}/analysis`).catch(() => null),
        axios.get(`/api/v1/quotation-requests/${id}/submissions/${row.id}/scores`).catch(() => null)
      ])
      if (analysisRes?.data) setReviewAnalysis(analysisRes.data)
      if (scoresRes?.data) setReviewScores(scoresRes.data)
    } catch (_) {}
  }

  const selectForPurchase = async (submissionId, notes) => {
    try {
      await axios.post(`/api/v1/quotation-requests/${id}/selection`, { submission_id: submissionId, notes: notes || null })
      setSelection(submissionId)
      toast.success('Selected for purchase request')
      fetchSubmissions()
      fetchRequest()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Selection failed')
    }
  }

  const vendorLink = request?.token ? `${window.location.origin}/submit-quotation/${request.token}` : ''
  const copyLink = () => {
    if (!vendorLink) return
    navigator.clipboard.writeText(vendorLink).then(() => toast.success('Link copied')).catch(() => toast.error('Copy failed'))
  }

  const filteredSubmissions = shortlistOnly ? submissions.filter(s => s.shortlisted) : submissions
  const bestSubmission = submissions.length ? submissions.reduce((best, s) => {
    const score = s.overall_score ?? 0
    return (best == null || score > (best.overall_score ?? 0)) ? s : best
  }, null) : null
  const avgPrice = submissions.length
    ? submissions.reduce((sum, s) => sum + (s.price_quote ?? 0), 0) / submissions.length
    : null

  const formatDate = (d) => (d ? new Date(d).toLocaleString() : '-')
  const scoreColor = (score) => {
    if (score == null) return 'text-gray-400'
    if (score >= 80) return 'text-green-600 dark:text-green-400 font-semibold'
    if (score >= 60) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }
  const scoreBadge = (score) => {
    if (score == null) return null
    if (score >= 80) return <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Top Pick</span>
    if (score >= 60) return <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">Good Option</span>
    return <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Risky</span>
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

        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {request && (
          <div className="mb-6 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{request.request_number}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{request.item_service_name}</p>
              <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  {selection && (() => {
                    const sel = submissions.find(s => s.id === selection)
                    if (!sel) return null
                    return (
                      <button
                        type="button"
                        onClick={() => navigate('/requisitions/create', { state: { fromQuotation: { submission: sel, request } } })}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                      >
                        <FilePlus size={14} />
                        Create purchase request from selected quotation
                      </button>
                    )
                  })()}
                  {request.token && (
                    <>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Vendor submission link:</span>
                  <a href={vendorLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline">
                    <Link2 size={12} /> Open link
                  </a>
                  <button type="button" onClick={copyLink} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg">
                    <Copy size={12} /> Copy
                  </button>
                    </>
                  )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/10 rounded-xl border border-primary-200 dark:border-primary-800 p-4">
                <div className="flex items-center gap-2 text-primary-700 dark:text-primary-300 text-xs font-semibold uppercase tracking-wider mb-2">
                  <Sparkles size={14} /> AI Summary
                </div>
                {bestSubmission ? (
                  <>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Best suggested: {bestSubmission.vendor_name}</p>
                    {bestSubmission.overall_score != null && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Score: <span className={scoreColor(bestSubmission.overall_score)}>{Math.round(bestSubmission.overall_score)}</span></p>
                    )}
                    {bestSubmission.recommendation_label && (
                      <p className="text-xs text-primary-600 dark:text-primary-400 mt-0.5">{bestSubmission.recommendation_label}</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No quotations yet or trigger score for submissions.</p>
                )}
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Average price</div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {avgPrice != null && submissions.length ? `${request.currency || 'SGD'} ${avgPrice.toFixed(2)}` : '—'}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Status</div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{request.status}</p>
                {selection && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                    <CheckCircle size={12} /> Selection made
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            <input type="checkbox" checked={shortlistOnly} onChange={(e) => setShortlistOnly(e.target.checked)} className="rounded border-gray-300" />
            Shortlisted only
          </label>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Quotation comparison</h2>
          {loading ? (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400 text-sm">Loading...</div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400 text-sm">
              {shortlistOnly ? 'No shortlisted quotations.' : 'No vendor submissions yet.'}
            </div>
          ) : (
            <Table
              columns={[
                { key: 'vendor_name', header: 'Vendor', sortable: true },
                {
                  key: 'price_quote',
                  header: 'Price',
                  render: (row) => `${row.currency || ''} ${(row.price_quote ?? 0).toFixed(2)}`
                },
                {
                  key: 'overall_score',
                  header: 'AI Score',
                  render: (row) => {
                    if (row.overall_score != null) {
                      return (
                        <div className="flex items-center gap-2">
                          <span className={scoreColor(row.overall_score)}>{Math.round(row.overall_score)}</span>
                          {scoreBadge(row.overall_score)}
                        </div>
                      )
                    }
                    return (
                      <button
                        type="button"
                        onClick={() => triggerScore(row.id)}
                        disabled={scoringIds.has(row.id)}
                        className="text-xs text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-50"
                      >
                        {scoringIds.has(row.id) ? 'Scoring...' : 'Get score'}
                      </button>
                    )
                  }
                },
                {
                  key: 'recommendation_label',
                  header: 'AI Tag',
                  render: (row) => (row.recommendation_label ? <span className="px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700">{row.recommendation_label}</span> : '—')
                },
                {
                  key: 'business_efficiency_score',
                  header: 'Business',
                  render: (row) => (row.business_efficiency_score != null ? Math.round(row.business_efficiency_score) : '—')
                },
                {
                  key: 'shortlisted',
                  header: 'Shortlist',
                  render: (row) => (
                    <button
                      type="button"
                      onClick={() => toggleShortlist(row.id, row.shortlisted)}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      title={row.shortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
                    >
                      <Star size={16} className={row.shortlisted ? 'fill-amber-400 text-amber-500' : 'text-gray-400'} />
                    </button>
                  )
                },
                {
                  key: 'created_at',
                  header: 'Date',
                  render: (row) => formatDate(row.created_at)
                },
                {
                  key: 'attachment',
                  header: 'Attachment',
                  render: (row) => {
                    const url = row.document_storage_url ?? row.documentStorageUrl
                    const name = row.document_file_name || row.documentFileName
                    if (url) return <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 text-xs flex items-center gap-1"><ExternalLink size={12} /> View</a>
                    if (name) return <span className="text-gray-400 text-xs">{name}</span>
                    return '—'
                  }
                },
                {
                  key: 'actions',
                  header: '',
                  render: (row) => (
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => openReview(row)} className="px-2 py-1 text-xs font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg">
                        Review
                      </button>
                      {selection !== row.id && (
                        <button type="button" onClick={() => selectForPurchase(row.id)} className="px-2 py-1 text-xs font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg flex items-center gap-1">
                          <CheckCircle size={12} /> Select
                        </button>
                      )}
                      {selection === row.id && <span className="text-xs text-green-600 dark:text-green-400">Selected</span>}
                    </div>
                  )
                }
              ]}
              data={filteredSubmissions}
              keyField="id"
            />
          )}
        </div>

        {reviewRow && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setReviewRow(null)}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">Review: {reviewRow.vendor_name}</h3>
                <button type="button" onClick={() => setReviewRow(null)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"><X size={20} /></button>
              </div>
              <div className="p-4 overflow-y-auto space-y-4">
                {reviewScores && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">AI Scores</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Overall: <span className={scoreColor(reviewScores.overall_score)}>{Math.round(reviewScores.overall_score)}</span></div>
                      {reviewScores.cost_efficiency_score != null && <div>Cost: {Math.round(reviewScores.cost_efficiency_score)}</div>}
                      {reviewScores.delivery_reliability_score != null && <div>Delivery: {Math.round(reviewScores.delivery_reliability_score)}</div>}
                      {reviewScores.business_efficiency_score != null && <div>Business: {Math.round(reviewScores.business_efficiency_score)}</div>}
                      {reviewScores.recommendation_label && <div className="col-span-2">Tag: {reviewScores.recommendation_label}</div>}
                    </div>
                    {reviewScores.explanation_text && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{reviewScores.explanation_text}</p>}
                  </div>
                )}
                {reviewScores?.pros_cons && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Pros & Cons</h4>
                    <div className="text-sm">
                      {(() => {
                        try {
                          const pc = typeof reviewScores.pros_cons === 'string' ? JSON.parse(reviewScores.pros_cons) : reviewScores.pros_cons
                          return (
                            <ul className="list-disc list-inside space-y-1">
                              {(pc.pros || []).map((p, i) => <li key={i} className="text-green-700 dark:text-green-400">{p}</li>)}
                              {(pc.cons || []).map((c, i) => <li key={i} className="text-amber-700 dark:text-amber-400">{c}</li>)}
                            </ul>
                          )
                        } catch (_) { return null }
                      })()}
                    </div>
                  </div>
                )}
                {reviewAnalysis?.parsed_data && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Parsed data</h4>
                    <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded overflow-auto max-h-40">{JSON.stringify(JSON.parse(reviewAnalysis.parsed_data), null, 2)}</pre>
                  </div>
                )}
                {reviewRow.document_storage_url && (
                  <div>
                    <a href={reviewRow.document_storage_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 dark:text-primary-400 flex items-center gap-1">
                      <FileText size={14} /> Open attachment
                    </a>
                  </div>
                )}
                {!reviewScores && !reviewAnalysis && (
                  <p className="text-sm text-gray-500">Trigger &quot;Get score&quot; and &quot;Review&quot; again for AI details, or open attachment.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
