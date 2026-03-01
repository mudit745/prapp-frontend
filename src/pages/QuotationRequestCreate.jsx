import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from '../utils/axios'
import Layout from '../components/Layout'

const defaultPayload = {
  item_service_name: '',
  specifications: '',
  quantity: null,
  preferred_brand_model: '',
  delivery_location: '',
  expected_delivery_date: '',
  logistics_notes: '',
  currency: 'SGD',
  payment_terms: '',
  budget_min: null,
  budget_max: null,
  certifications_required: '',
  warranty_expectations: '',
  compliance_notes: '',
  submission_deadline: '',
  requestor_contact_details: '',
  additional_instructions: ''
}

export default function QuotationRequestCreate() {
  const navigate = useNavigate()
  const [form, setForm] = useState(defaultPayload)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    let v = value
    if (name === 'quantity' || name === 'budget_min' || name === 'budget_max') {
      v = value === '' ? null : parseFloat(value)
    }
    setForm((prev) => ({ ...prev, [name]: v }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.item_service_name.trim()) {
      toast.error('Item / Service name is required')
      return
    }
    const deadline = form.submission_deadline
      ? new Date(form.submission_deadline).toISOString()
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    setLoading(true)
    try {
      const payload = {
        ...form,
        item_service_name: form.item_service_name.trim(),
        specifications: form.specifications || null,
        quantity: form.quantity ?? null,
        preferred_brand_model: form.preferred_brand_model || null,
        delivery_location: form.delivery_location || null,
        expected_delivery_date: form.expected_delivery_date || null,
        logistics_notes: form.logistics_notes || null,
        payment_terms: form.payment_terms || null,
        budget_min: form.budget_min ?? null,
        budget_max: form.budget_max ?? null,
        certifications_required: form.certifications_required || null,
        warranty_expectations: form.warranty_expectations || null,
        compliance_notes: form.compliance_notes || null,
        submission_deadline: deadline,
        requestor_contact_details: form.requestor_contact_details || null,
        additional_instructions: form.additional_instructions || null
      }
      const { data } = await axios.post('/api/v1/quotation-requests', payload)
      toast.success('Quotation request created')
      navigate(`/quotation-requests/confirmation/${data.id}`, { state: { request: data } })
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.Message || err.message || 'Failed to create quotation request'
      toast.error(msg)
      console.error('Create quotation request failed:', err.response?.data || err)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent'
  const labelClass = 'block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1'

  return (
    <Layout>
      <div className="w-full max-w-4xl mx-auto py-4 px-4">
        <button
          onClick={() => navigate('/quotation-requests')}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-4"
        >
          <ArrowLeft size={16} />
          Back to Quotation Requests
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight mb-1">New Quotation Request</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Vendors will use the generated link to submit their quotations.</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Requirement Details */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Requirement Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={labelClass}>Item / Service Name *</label>
                <input name="item_service_name" value={form.item_service_name} onChange={handleChange} className={inputClass} required />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Specifications / Description</label>
                <textarea name="specifications" value={form.specifications} onChange={handleChange} rows={3} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Quantity</label>
                <input type="number" name="quantity" value={form.quantity ?? ''} onChange={handleChange} min="0" step="any" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Preferred Brand/Model (optional)</label>
                <input name="preferred_brand_model" value={form.preferred_brand_model} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </section>

          {/* Delivery Details */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Delivery Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={labelClass}>Delivery Location</label>
                <input name="delivery_location" value={form.delivery_location} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Expected Delivery Date</label>
                <input type="date" name="expected_delivery_date" value={form.expected_delivery_date} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Logistics Notes</label>
                <input name="logistics_notes" value={form.logistics_notes} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </section>

          {/* Commercial Details */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Commercial Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Currency</label>
                <select name="currency" value={form.currency} onChange={handleChange} className={inputClass}>
                  <option value="SGD">SGD</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Payment Terms</label>
                <input name="payment_terms" value={form.payment_terms} onChange={handleChange} className={inputClass} placeholder="e.g. Net 30" />
              </div>
              <div>
                <label className={labelClass}>Budget Min (optional)</label>
                <input type="number" name="budget_min" value={form.budget_min ?? ''} onChange={handleChange} min="0" step="0.01" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Budget Max (optional)</label>
                <input type="number" name="budget_max" value={form.budget_max ?? ''} onChange={handleChange} min="0" step="0.01" className={inputClass} />
              </div>
            </div>
          </section>

          {/* Compliance */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Compliance Details</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Certifications Required</label>
                <textarea name="certifications_required" value={form.certifications_required} onChange={handleChange} rows={2} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Warranty Expectations</label>
                <input name="warranty_expectations" value={form.warranty_expectations} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Special Compliance Notes</label>
                <textarea name="compliance_notes" value={form.compliance_notes} onChange={handleChange} rows={2} className={inputClass} />
              </div>
            </div>
          </section>

          {/* Admin */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Admin & Instructions</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Submission Deadline *</label>
                <input
                  type="datetime-local"
                  name="submission_deadline"
                  value={form.submission_deadline}
                  onChange={handleChange}
                  className={inputClass}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              <div>
                <label className={labelClass}>Requestor Contact Details</label>
                <input name="requestor_contact_details" value={form.requestor_contact_details} onChange={handleChange} className={inputClass} placeholder="Email, phone" />
              </div>
              <div>
                <label className={labelClass}>Additional Instructions</label>
                <textarea name="additional_instructions" value={form.additional_instructions} onChange={handleChange} rows={3} className={inputClass} />
              </div>
            </div>
          </section>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl font-semibold text-sm shadow-lg shadow-primary-200 dark:shadow-primary-900 transition-all"
            >
              {loading ? 'Creating...' : 'Create & Get Vendor Link'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/quotation-requests')}
              className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl font-semibold text-sm transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
