import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import toast from 'react-hot-toast'
import { storage } from '../utils/firebase'
import { ref, uploadBytesResumable, getDownloadURL } from '../utils/storage-placeholder'

const API_BASE = '/api/v1'

export default function VendorQuotationSubmit() {
  const { token } = useParams()
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    vendor_name: '',
    contact_person: '',
    email: '',
    phone: '',
    price_quote: '',
    currency: 'SGD',
    delivery_timeline: '',
    payment_terms: '',
    comments: '',
    document_file_name: '',
    document_storage_url: '',
    document_storage_path: ''
  })
  const [file, setFile] = useState(null)

  useEffect(() => {
    if (!token) {
      setError('Invalid link')
      setLoading(false)
      return
    }
    fetch(`${window.location.origin}${API_BASE}/public/quotation-request/${token}`)
      .then((res) => {
        if (!res.ok) throw new Error('Request not found or closed')
        return res.json()
      })
      .then((data) => {
        setRequest(data)
        setForm((f) => ({ ...f, currency: data.currency || 'SGD' }))
      })
      .catch((err) => {
        setError(err.message || 'Failed to load request')
      })
      .finally(() => setLoading(false))
  }, [token])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const f = e.target.files?.[0]
    setFile(f || null)
    if (f) setForm((prev) => ({ ...prev, document_file_name: f.name }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.vendor_name.trim() || !form.email.trim()) {
      toast.error('Vendor name and email are required')
      return
    }
    const price = parseFloat(form.price_quote)
    if (isNaN(price) || price < 0) {
      toast.error('Please enter a valid price')
      return
    }
    setSubmitLoading(true)
    let documentStorageUrl = form.document_storage_url || null
    let documentFileName = form.document_file_name || null
    let documentStoragePath = form.document_storage_path || null

    if (file) {
      try {
        // Store under request id so files are linked to the quotation request
        const requestId = request?.id || token
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const path = `quotation-submissions/request-${requestId}/${Date.now()}-${safeName}`
        const storageRef = ref(storage, path)
        await new Promise((resolve, reject) => {
          const task = uploadBytesResumable(storageRef, file)
          task.on('state_changed', null, reject, () => getDownloadURL(task.snapshot.ref).then(resolve).catch(reject))
        }).then((url) => {
          documentStorageUrl = url
          documentFileName = documentFileName || file.name
          documentStoragePath = path
        })
      } catch (err) {
        console.error('Upload error:', err)
        toast.error('File upload failed. Attachment will not be saved. Submit without it or paste a link below.')
        // Don't save filename when upload failed – avoids "filename (link not saved)" on requestor side
        documentFileName = null
        documentStoragePath = null
        documentStorageUrl = null
      }
    }

    const payload = {
      vendor_name: form.vendor_name.trim(),
      contact_person: form.contact_person.trim() || null,
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      price_quote: price,
      currency: form.currency,
      delivery_timeline: form.delivery_timeline.trim() || null,
      payment_terms: form.payment_terms.trim() || null,
      comments: form.comments.trim() || null,
      document_file_name: documentFileName,
      document_storage_path: documentStoragePath,
      document_storage_url: documentStorageUrl
    }

    try {
      const res = await fetch(`${window.location.origin}${API_BASE}/public/quotation-submit/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Submission failed')
      toast.success('Quotation submitted successfully')
      setForm({ vendor_name: '', contact_person: '', email: '', phone: '', price_quote: '', currency: 'SGD', delivery_timeline: '', payment_terms: '', comments: '', document_file_name: '', document_storage_url: '', document_storage_path: '' })
      setFile(null)
    } catch (err) {
      toast.error(err.message || 'Failed to submit quotation')
    } finally {
      setSubmitLoading(false)
    }
  }

  const inputClass = 'w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500'
  const labelClass = 'block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1'

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 max-w-md text-center">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Invalid or expired link</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{error || 'This quotation request was not found or is no longer accepting submissions.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <ShoppingBag className="text-primary-600 dark:text-primary-400" size={28} />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Submit your quotation</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Request summary</h2>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{request.item_service_name}</p>
          {request.specifications && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 whitespace-pre-wrap">{request.specifications}</p>}
          <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Request ID</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{request.request_number}</dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Deadline</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{request.submission_deadline ? new Date(request.submission_deadline).toLocaleString() : '-'}</dd>
            </div>
          </dl>
          {request.additional_instructions && (
            <p className="mt-3 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3">{request.additional_instructions}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Your quotation</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Vendor / Company Name *</label>
              <input name="vendor_name" value={form.vendor_name} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Contact Person</label>
              <input name="contact_person" value={form.contact_person} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Price Quote *</label>
              <input type="number" name="price_quote" value={form.price_quote} onChange={handleChange} step="0.01" min="0" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Currency</label>
              <select name="currency" value={form.currency} onChange={handleChange} className={inputClass}>
                <option value="SGD">SGD</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Delivery Timeline</label>
              <input name="delivery_timeline" value={form.delivery_timeline} onChange={handleChange} className={inputClass} placeholder="e.g. 2 weeks" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Payment Terms</label>
              <input name="payment_terms" value={form.payment_terms} onChange={handleChange} className={inputClass} placeholder="e.g. Net 30" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Comments</label>
              <textarea name="comments" value={form.comments} onChange={handleChange} rows={2} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Quotation document (optional)</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 dark:file:bg-primary-900/30 dark:file:text-primary-300"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">PDF, Word, Excel or image. Or paste a link below. If upload fails, check Firebase Storage rules allow writes to <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">quotation-submissions/</code>.</p>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Document URL (optional)</label>
              <input type="url" name="document_storage_url" value={form.document_storage_url} onChange={handleChange} className={inputClass} placeholder="https://..." />
            </div>
          </div>
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitLoading}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-all"
            >
              {submitLoading ? 'Submitting...' : 'Submit quotation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
