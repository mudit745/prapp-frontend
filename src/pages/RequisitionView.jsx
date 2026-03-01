import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from '../utils/axios'
import Layout from '../components/Layout'
import DocumentList from '../components/DocumentList'

function parseMaybeJSON(v) {
  if (!v) return {}
  if (typeof v === 'string') {
    try {
      return JSON.parse(v)
    } catch {
      return {}
    }
  }
  if (typeof v === 'object') return v
  return {}
}

export default function RequisitionView() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pr, setPR] = useState(null) // { header, lines }
  const [tracking, setTracking] = useState([])
  const [headerFields, setHeaderFields] = useState([])
  const [lineItemFields, setLineItemFields] = useState([])

  const fetchAll = async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const [prRes, trackingRes, headerFieldsRes, lineItemFieldsRes] = await Promise.all([
        axios.get(`/api/v1/requisitions/${id}`),
        axios.get(`/api/v1/process-tracking`, { params: { ref_id: id, limit: 200 } }),
        axios.get('/api/v1/pr-header-fields'),
        axios.get('/api/v1/pr-line-item-fields')
      ])
      setPR(prRes.data)
      setTracking(Array.isArray(trackingRes.data) ? trackingRes.data : [])
      const fields = (headerFieldsRes.data || []).filter(f => f.status === 'Active')
      fields.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
      setHeaderFields(fields)
      const lineFields = (lineItemFieldsRes.data || []).filter(f => f.status === 'Active')
      lineFields.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
      setLineItemFields(lineFields)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load PR details'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const headerObj = pr?.header || pr
  const headerData = parseMaybeJSON(headerObj?.header_data)

  const mergedHeader = useMemo(() => {
    if (!headerObj) return {}
    return {
      ...headerData,
      requesterId: headerObj.requester_id || '',
      costCenterId: headerObj.cost_center_id || '',
      projectId: headerObj.project_id || '',
      vendorId: headerObj.vendor_id || '',
      facilityId: headerObj.facility_id || '',
      priority: headerObj.priority || '',
      currencyCode: headerObj.currency || '',
      status: headerObj.status || '',
      justification: headerObj.justification || '',
      expectedDeliveryDate: headerObj.expected_delivery_date || '',
      documentNumber: headerObj.pr_number || '',
      documentDate: headerObj.created_at ? new Date(headerObj.created_at).toISOString().split('T')[0] : '',
      // New fields
      company: headerObj.company || '',
      requestType: headerObj.request_type || headerObj.pr_type || '',
      prType: headerObj.request_type || headerObj.pr_type || '', // Keep for backward compatibility
      documentType: headerObj.document_type || '',
      requestDate: headerObj.request_date || headerObj.pr_date || (headerObj.created_at ? new Date(headerObj.created_at).toISOString().split('T')[0] : ''),
      prDate: headerObj.request_date || headerObj.pr_date || (headerObj.created_at ? new Date(headerObj.created_at).toISOString().split('T')[0] : ''), // Keep for backward compatibility
      approvalGroupRole: headerObj.approval_group_role || '',
      requiredDate: headerObj.required_date || '',
      quotationRef: headerObj.quotation_ref || '',
      vendorPhone: headerObj.vendor_phone || '',
      vendorEmail: headerObj.vendor_email || '',
      vendorContactName: headerObj.vendor_contact_name || '',
      billingCurrency: headerObj.billing_currency || headerObj.currency || '',
      localCurrency: headerObj.local_currency || '',
      budgetId: headerObj.budget_id || '',
      messageToVendor: headerObj.message_to_vendor || '',
      remarks: headerObj.remarks || ''
    }
  }, [headerObj, headerData])

  const trackingSteps = useMemo(() => {
    const rows = Array.isArray(tracking) ? tracking : []
    // Sort oldest->newest so later rows override earlier rows for the same process_step
    const sorted = [...rows].sort((a, b) => {
      const sa = a.start_date ? new Date(a.start_date).getTime() : 0
      const sb = b.start_date ? new Date(b.start_date).getTime() : 0
      if (sa !== sb) return sa - sb
      const ea = a.end_date ? new Date(a.end_date).getTime() : 0
      const eb = b.end_date ? new Date(b.end_date).getTime() : 0
      return ea - eb
    })

    const byKey = new Map()
    for (const row of sorted) {
      const key = row.process_step || `step-${row.step ?? 'x'}`
      byKey.set(key, row)
    }

    const unique = Array.from(byKey.values())
    unique.sort((a, b) => {
      const as = a.step ?? 9999
      const bs = b.step ?? 9999
      if (as !== bs) return as - bs
      return String(a.process_step || '').localeCompare(String(b.process_step || ''))
    })

    return unique
  }, [tracking])

  const statusMeta = (status) => {
    const s = String(status || '').toUpperCase()
    if (['COMPLETED', 'APPROVED'].includes(s)) {
      return {
        ring: 'border-green-500 dark:border-green-400',
        fill: 'bg-green-500 dark:bg-green-400',
        text: 'text-green-700 dark:text-green-300',
      }
    }
    if (['FAILED', 'REJECT', 'REJECTED'].includes(s)) {
      return {
        ring: 'border-red-500 dark:border-red-400',
        fill: 'bg-red-500 dark:bg-red-400',
        text: 'text-red-700 dark:text-red-300',
      }
    }
    if (['IN_PROGRESS'].includes(s)) {
      return {
        ring: 'border-blue-500 dark:border-blue-400',
        fill: 'bg-blue-500 dark:bg-blue-400',
        text: 'text-blue-700 dark:text-blue-300',
      }
    }
    return {
      ring: 'border-gray-300 dark:border-gray-600',
      fill: 'bg-gray-300 dark:bg-gray-600',
      text: 'text-gray-700 dark:text-gray-300',
    }
  }

  // Calculate total amount from item entries
  const totalAmount = useMemo(() => {
    if (!pr?.lines || !Array.isArray(pr.lines)) return 0
    return pr.lines.reduce((acc, line) => {
      if (line.foc) return acc
      const qty = parseFloat(line.quantity) || 0
      const price = parseFloat(line.unit_price) || 0
      return acc + (qty * price)
    }, 0)
  }, [pr?.lines])

  // Render organized header sections similar to RequisitionCreate
  const renderHeaderSections = () => {
    const categories = [...new Set(headerFields.map(f => f.category_name).filter(Boolean))]
    
    // Get fields from database categories that match organized sections
    const basicInfoFields = headerFields.filter(f => f.category_name === 'Basic Information')
    const vendorInfoFields = headerFields.filter(f => f.category_name === 'Supplier Information' || f.category_name === 'Vendor Information')
    const financialInfoFields = headerFields.filter(f => f.category_name === 'Financial Information')
    const additionalInfoFields = headerFields.filter(f => f.category_name === 'Additional Information')
    
    // Track which fields are already rendered in organized sections
    const renderedFields = new Set([
      'company', 'costCenterId', 'projectId', 'prType', 'documentType', 'prDate', 
      'approvalGroupRole', 'requiredDate', 'quotationRef',
      'vendorId', 'facilityId', 'vendorPhone', 'vendorEmail', 'vendorContactName',
      'billingCurrency', 'localCurrency', 'budgetId',
      'messageToVendor', 'justification', 'remarks'
    ])

    return (
      <div className="space-y-6">
        {/* Basic Information Section */}
        <div className="bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700 rounded-3xl p-8">
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-1">Basic Information</h3>
            <div className="h-0.5 w-16 bg-primary-600 rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mergedHeader.company && (
              <div>
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Organization</div>
                <div className="text-sm text-gray-900 dark:text-white">{mergedHeader.company}</div>
              </div>
            )}
            {mergedHeader.costCenterId && (
              <div>
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Department</div>
                <div className="text-sm text-gray-900 dark:text-white">{mergedHeader.costCenterId}</div>
              </div>
            )}
            {mergedHeader.projectId && (
              <div>
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Initiative</div>
                <div className="text-sm text-gray-900 dark:text-white">{mergedHeader.projectId}</div>
              </div>
            )}
            {(mergedHeader.requestType || mergedHeader.prType) && (
              <div>
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Request Type</div>
                <div className="text-sm text-gray-900 dark:text-white">{mergedHeader.requestType || mergedHeader.prType}</div>
              </div>
            )}
            {mergedHeader.documentType && (
              <div>
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Document Type</div>
                <div className="text-sm text-gray-900 dark:text-white">{mergedHeader.documentType}</div>
              </div>
            )}
            {(mergedHeader.requestDate || mergedHeader.prDate) && (
              <div>
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Request Date</div>
                <div className="text-sm text-gray-900 dark:text-white">{mergedHeader.requestDate || mergedHeader.prDate}</div>
              </div>
            )}
            {mergedHeader.approvalGroupRole && (
              <div>
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Approval Group/Role</div>
                <div className="text-sm text-gray-900 dark:text-white">{mergedHeader.approvalGroupRole}</div>
              </div>
            )}
            {mergedHeader.requiredDate && (
              <div>
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Required Date</div>
                <div className="text-sm text-gray-900 dark:text-white">{mergedHeader.requiredDate}</div>
              </div>
            )}
            {mergedHeader.quotationRef && (
              <div>
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Quotation Ref</div>
                <div className="text-sm text-gray-900 dark:text-white">{mergedHeader.quotationRef}</div>
              </div>
            )}
            {/* Additional fields from database "Basic Information" category */}
            {basicInfoFields
              .filter(f => !renderedFields.has(f.field_name))
              .map(field => {
                renderedFields.add(field.field_name)
                const value = mergedHeader[field.field_name]
                if (!value) return null
                return (
                  <div key={field.field_id}>
                    <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">{field.field_label}</div>
                    <div className="text-sm text-gray-900 dark:text-white">{String(value)}</div>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Supplier Information Section */}
        <div className="bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700 rounded-3xl p-8">
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-1">Supplier Information</h3>
            <div className="h-0.5 w-16 bg-primary-600 rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mergedHeader.vendorId && (
              <div>
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Supplier</div>
                <div className="text-sm text-gray-900 dark:text-white">{mergedHeader.vendorId}</div>
              </div>
            )}
            {mergedHeader.facilityId && (
              <div>
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Shipment Address/Facility</div>
                <div className="text-sm text-gray-900 dark:text-white">{mergedHeader.facilityId}</div>
              </div>
            )}
            {mergedHeader.vendorPhone && (
              <div>
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Phone</div>
                <div className="text-sm text-gray-900 dark:text-white">{mergedHeader.vendorPhone}</div>
              </div>
            )}
            {mergedHeader.vendorEmail && (
              <div>
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Email</div>
                <div className="text-sm text-gray-900 dark:text-white">{mergedHeader.vendorEmail}</div>
              </div>
            )}
            {mergedHeader.vendorContactName && (
              <div>
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Contact Name</div>
                <div className="text-sm text-gray-900 dark:text-white">{mergedHeader.vendorContactName}</div>
              </div>
            )}
            {/* Additional fields from database "Supplier Information" category */}
            {vendorInfoFields
              .filter(f => !renderedFields.has(f.field_name))
              .map(field => {
                renderedFields.add(field.field_name)
                const value = mergedHeader[field.field_name]
                if (!value) return null
                return (
                  <div key={field.field_id}>
                    <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">{field.field_label}</div>
                    <div className="text-sm text-gray-900 dark:text-white">{String(value)}</div>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Financial Information Section */}
        <div className="bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700 rounded-3xl p-8">
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-1">Financial Information</h3>
            <div className="h-0.5 w-16 bg-primary-600 rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mergedHeader.billingCurrency && (
              <div>
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Billing Currency</div>
                <div className="text-sm text-gray-900 dark:text-white">{mergedHeader.billingCurrency}</div>
              </div>
            )}
            {mergedHeader.localCurrency && (
              <div>
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Local Currency</div>
                <div className="text-sm text-gray-900 dark:text-white">{mergedHeader.localCurrency}</div>
              </div>
            )}
            {mergedHeader.budgetId && (
              <div>
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Budget</div>
                <div className="text-sm text-gray-900 dark:text-white">{mergedHeader.budgetId}</div>
              </div>
            )}
            {/* Additional fields from database "Financial Information" category */}
            {financialInfoFields
              .filter(f => !renderedFields.has(f.field_name))
              .map(field => {
                renderedFields.add(field.field_name)
                const value = mergedHeader[field.field_name]
                if (!value) return null
                return (
                  <div key={field.field_id}>
                    <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">{field.field_label}</div>
                    <div className="text-sm text-gray-900 dark:text-white">{String(value)}</div>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700 rounded-3xl p-8">
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-1">Additional Information</h3>
            <div className="h-0.5 w-16 bg-primary-600 rounded-full"></div>
          </div>
          <div className="space-y-4">
            {mergedHeader.messageToVendor && (
              <div>
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Message to Supplier</div>
                <div className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{mergedHeader.messageToVendor}</div>
              </div>
            )}
            {mergedHeader.justification && (
              <div>
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Justification</div>
                <div className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{mergedHeader.justification}</div>
              </div>
            )}
            {mergedHeader.remarks && (
              <div>
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Remarks</div>
                <div className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{mergedHeader.remarks}</div>
              </div>
            )}
            {/* Additional fields from database "Additional Information" category */}
            {additionalInfoFields
              .filter(f => !renderedFields.has(f.field_name))
              .map(field => {
                renderedFields.add(field.field_name)
                const value = mergedHeader[field.field_name]
                if (!value) return null
                return (
                  <div key={field.field_id}>
                    <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">{field.field_label}</div>
                    <div className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{String(value)}</div>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Other Categories from Database */}
        {categories
          .filter(cat => !['Basic Information', 'Supplier Information', 'Financial Information', 'Additional Information'].includes(cat))
          .map(category => {
            const categoryFields = headerFields
              .filter(f => f.category_name === category)
              .filter(f => !renderedFields.has(f.field_name))

            if (categoryFields.length === 0) return null

            return (
              <div key={category} className="bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700 rounded-3xl p-8">
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-1">{category}</h3>
                  <div className="h-0.5 w-16 bg-primary-600 rounded-full"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryFields.map(field => {
                    renderedFields.add(field.field_name)
                    const value = mergedHeader[field.field_name]
                    if (!value) return null
                    return (
                      <div key={field.field_id}>
                        <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">{field.field_label}</div>
                        <div className="text-sm text-gray-900 dark:text-white">{String(value)}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
      </div>
    )
  }

  return (
    <Layout>
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 h-[calc(100vh-64px)]">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/requisitions')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">Purchase Request</h2>
              <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-widest">
                {headerObj?.pr_number || headerObj?.request_number ? `Request Number: ${headerObj.request_number || headerObj.pr_number}` : 'Viewing request details'} • {(pr?.lines || []).length} item entries
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 tracking-widest">Grand Total</p>
              <p className="text-xl font-semibold text-primary-600 dark:text-primary-400 leading-none mt-1">
                <span className="text-sm font-medium mr-1">{mergedHeader.currencyCode || mergedHeader.localCurrency || 'USD'}</span>
                {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          <button
            onClick={fetchAll}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
        </header>

        {error && (
          <div className="mx-8 mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded shrink-0">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="w-full max-w-[1600px] mx-auto p-6 space-y-6 pb-32">
        {/* Process Tracking Stepper */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-1">Process Tracking</h2>
              <div className="h-0.5 w-16 bg-primary-600 rounded-full"></div>
            </div>
            {loading && <span className="text-sm text-gray-500 dark:text-gray-400">Loading…</span>}
          </div>

          <div className="mt-4 overflow-x-auto">
            <div className="min-w-max flex items-start gap-6">
              {trackingSteps.length === 0 ? (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  No tracking records found for this PR yet.
                </div>
              ) : (
                trackingSteps.map((step, idx) => {
                  const meta = statusMeta(step.process_status)
                  const stepLabel = step.process_step || `Step ${step.step ?? idx + 1}`
                  const statusLabel = step.process_status || ''
                  const start = step.start_date ? new Date(step.start_date).toLocaleString() : ''
                  const end = step.end_date ? new Date(step.end_date).toLocaleString() : ''
                  return (
                    <div key={step.id || `${stepLabel}-${idx}`} className="flex items-start">
                      <div className="flex flex-col items-center">
                        <div className={`w-9 h-9 rounded-full border-2 ${meta.ring} flex items-center justify-center`}>
                          <div className={`w-3 h-3 rounded-full ${meta.fill}`} />
                        </div>
                        {idx < trackingSteps.length - 1 && (
                          <div className="hidden sm:block w-20 h-0.5 bg-gray-200 dark:bg-gray-700 mt-4" />
                        )}
                      </div>
                      <div className="ml-3 mr-4">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                          {stepLabel}
                        </div>
                        <div className={`text-xs font-medium ${meta.text} whitespace-nowrap`}>
                          {statusLabel}
                        </div>
                        {(start || end) && (
                          <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {start ? `Start: ${start}` : ''}{start && end ? ' • ' : ''}{end ? `End: ${end}` : ''}
                          </div>
                        )}
                        {step.process_notes && (
                          <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 max-w-xs">
                            {step.process_notes}
                          </div>
                        )}
                        {step.error_message && (
                          <div className="mt-1 text-xs text-red-700 dark:text-red-300 max-w-xs">
                            {step.error_message}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

            {/* Header Details Section */}
            <section className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary-600"></div>
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">I. Header Details</h3>
              </div>
              {renderHeaderSections()}
            </section>

            {/* Item Entries Section */}
            <section className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 pt-6 pb-4">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">II. Item Entry Details</h3>
          </div>

          {(pr?.lines || []).length === 0 ? (
            <div className="px-6 pb-6 text-center text-sm text-gray-600 dark:text-gray-400">
              No item entries found.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-center w-12 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky left-0 bg-gray-50 dark:bg-gray-800 z-10 border-r border-gray-200 dark:border-gray-700">#</th>
                      <th className="px-4 py-2 text-left min-w-[300px] text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky left-9 bg-gray-50 dark:bg-gray-800 z-10 border-r border-gray-200 dark:border-gray-700">Item ID / Description</th>
                      <th className="px-4 py-2 text-left min-w-[180px] text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Account Code</th>
                      <th className="px-4 py-2 text-left min-w-[160px] text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                      <th className="px-4 py-2 text-left min-w-[150px] text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ref Detail</th>
                      <th className="px-4 py-2 text-center w-24 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Qty</th>
                      <th className="px-4 py-2 text-left w-24 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unit</th>
                      <th className="px-4 py-2 text-right min-w-[120px] text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unit Cost</th>
                      <th className="px-4 py-2 text-center w-20 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Free</th>
                      <th className="px-4 py-2 text-right min-w-[140px] text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Cost</th>
                      <th className="px-4 py-2 text-left min-w-[200px] text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Item Remark</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {(pr?.lines || []).map((line, index) => {
                const lineData = parseMaybeJSON(line?.line_data)
                const viewLine = {
                  ...lineData,
                        lineNumber: line?.line_number ?? index + 1,
                        itemId: line?.item_id || line?.product_id || '',
                        productId: line?.product_id || '',
                        quantity: line?.quantity ?? 0,
                        unitPrice: line?.unit_price ?? 0,
                        glCode: line?.gl_code || '',
                        description: line?.description || '',
                        unitOfMeasure: line?.unit_of_measure || '',
                        category: line?.category || '',
                        refDetail: line?.ref_detail || '',
                        foc: line?.foc || false,
                        itemRemark: line?.item_remark || '',
                        lineAmount: line?.line_amount || (parseFloat(line?.quantity || 0) * parseFloat(line?.unit_price || 0))
                      }
                      const lineTotal = viewLine.foc ? 0 : (parseFloat(viewLine.quantity) || 0) * (parseFloat(viewLine.unitPrice) || 0)

                return (
                        <tr key={line?.line_id ?? `${line?.pr_id}-${line?.line_number ?? index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
                          <td className="px-4 py-2 text-center text-gray-500 dark:text-gray-400 font-medium text-sm sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700 z-10 border-r border-gray-200 dark:border-gray-700">
                            {viewLine.lineNumber}
                          </td>
                          <td className="px-4 py-2 sticky left-9 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700 z-10 border-r border-gray-200 dark:border-gray-700">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {viewLine.itemId || viewLine.productId ? `${viewLine.itemId || viewLine.productId}${viewLine.description ? ` - ${viewLine.description}` : ''}` : '—'}
                            </div>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                            {viewLine.glCode || '—'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                            {viewLine.category || '—'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                            {viewLine.refDetail || '—'}
                          </td>
                          <td className="px-4 py-2 text-center text-sm text-gray-900 dark:text-white">
                            {viewLine.quantity || '—'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                            {viewLine.unitOfMeasure || '—'}
                          </td>
                          <td className="px-4 py-2 text-right text-sm text-gray-900 dark:text-white">
                            {viewLine.foc ? (
                              <span className="text-xs text-green-600 dark:text-green-400 uppercase font-medium">Free</span>
                            ) : (
                              parseFloat(viewLine.unitPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })
                            )}
                          </td>
                          <td className="px-4 py-2 text-center text-sm text-gray-900 dark:text-white">
                            {viewLine.foc ? (
                              <span className="text-xs text-green-600 dark:text-green-400 uppercase font-medium">Yes</span>
                            ) : (
                              <span className="text-xs text-gray-500 dark:text-gray-400">No</span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-right text-sm font-semibold text-gray-900 dark:text-white">
                            {viewLine.foc ? (
                              <span className="text-xs text-green-600 dark:text-green-400 uppercase font-medium">Free</span>
                            ) : (
                              lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })
                            )}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white italic">
                            {viewLine.itemRemark || '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                      </div>

              {/* Footer Bar with Totals */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <div className="flex gap-6 text-xs font-medium text-gray-600 dark:text-gray-400">
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wider">Total Items</span>
                      <span className="text-base font-semibold text-gray-900 dark:text-white mt-1">{(pr?.lines || []).length}</span>
                    </div>
                    <div className="flex flex-col border-l border-gray-300 dark:border-gray-600 pl-6">
                      <span className="text-xs uppercase tracking-wider">Subtotal</span>
                      <span className="text-base font-semibold text-gray-900 dark:text-white mt-1">{mergedHeader.currencyCode || mergedHeader.localCurrency || 'USD'} {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium text-primary-600 dark:text-primary-400 uppercase tracking-wider block mb-1">Total Request Value</span>
                    <span className="text-xl font-semibold text-gray-900 dark:text-white">{mergedHeader.currencyCode || mergedHeader.localCurrency || 'USD'} {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
            </div>
            </>
          )}
            </section>

            {/* Documents Section */}
            {headerObj?.pr_id && (
              <DocumentList prId={headerObj.pr_id} readOnly={headerObj.status === 'Approved' || headerObj.status === 'Rejected'} />
            )}
          </div>
        </div>

        {/* Footer - Sticky at bottom */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end space-x-3 shadow-lg shrink-0">
          <button
            onClick={() => navigate('/requisitions')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2 text-sm"
          >
            <ArrowLeft size={18} />
            Back to Requests
          </button>
        </div>
      </div>
    </Layout>
  )
}
