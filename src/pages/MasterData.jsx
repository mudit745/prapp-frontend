import { useState, useEffect, useCallback } from 'react'
import { X, Plus, Edit, Trash2, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from '../utils/axios'
import Layout from '../components/Layout'
import { usePermissionsContext } from '../context/PermissionsContext'
import { RequirePermission } from '../components/PermissionGuard'
import { PERMISSIONS } from '../utils/permissions'
import ExcelImportExport from '../components/ExcelImportExport'
import Table from '../components/Table'

// Helper functions (defined outside component to avoid hoisting issues)
function getViewPermission(tab) {
  const permissions = {
    projects: PERMISSIONS.MASTER_DATA_VIEW,
    'cost-centers': PERMISSIONS.MASTER_DATA_VIEW,
    vendors: PERMISSIONS.VENDOR_VIEW,
    products: PERMISSIONS.PRODUCT_VIEW,
    'gl-codes': PERMISSIONS.MASTER_DATA_VIEW,
    employees: PERMISSIONS.MASTER_DATA_VIEW,
    budgets: PERMISSIONS.MASTER_DATA_VIEW
  }
  return permissions[tab] || PERMISSIONS.MASTER_DATA_VIEW
}

function getManagePermission(tab) {
  const permissions = {
    projects: PERMISSIONS.MASTER_DATA_MANAGE,
    'cost-centers': PERMISSIONS.MASTER_DATA_MANAGE,
    vendors: PERMISSIONS.VENDOR_MANAGE,
    products: PERMISSIONS.PRODUCT_MANAGE,
    'gl-codes': PERMISSIONS.MASTER_DATA_MANAGE,
    employees: PERMISSIONS.MASTER_DATA_MANAGE,
    budgets: PERMISSIONS.MASTER_DATA_MANAGE
  }
  return permissions[tab] || PERMISSIONS.MASTER_DATA_MANAGE
}

function getIdField(tab) {
  const fields = {
    projects: 'project_id',
    'cost-centers': 'cost_center_id',
    vendors: 'vendor_id',
    products: 'product_id',
    'gl-codes': 'gl_code',
    employees: 'employee_id',
    budgets: 'budget_id'
  }
  return fields[tab] || 'id'
}

function getDefaultFormData(tab) {
  const defaults = {
    projects: {
      project_id: '',
      project_name: '',
      start_date: '',
      end_date: '',
      project_owner: '',
      status: 'Active',
      total_budget: 0,
      description: '',
      currency: 'SGD'
    },
    'cost-centers': {
      cost_center_id: '',
      cost_center_name: '',
      project_id: '',
      facility: '',
      budget_limit: 0,
      gl_code_default: '',
      status: 'Active',
      description: ''
    },
    vendors: {
      vendor_id: '',
      vendor_name: '',
      tax_registration_number: '',
      address: '',
      city: '',
      country: 'SG',
      contact_person: '',
      contact_email: '',
      contact_phone: '',
      currency: 'SGD',
      payment_terms: '30 Days',
      status: 'Active'
    },
    products: {
      product_id: '',
      product_name: '',
      description: '',
      product_type: 'Consumable',
      uom: 'Unit',
      vendor_id: '',
      unit_cost: 0,
      gl_code: '',
      moh_compliance_flag: false,
      status: 'Active'
    },
    'gl-codes': {
      gl_code: '',
      description: '',
      account_type: '',
      reporting_group: '',
      tax_code: '',
      status: 'Active'
    },
    employees: {
      employee_id: '',
      employee_name: '',
      designation: '',
      department: '',
      cost_center_id: '',
      role: '',
      approval_limit: 0,
      email: '',
      status: 'Active'
    },
    budgets: {
      budget_id: '',
      project_id: '',
      cost_center_id: '',
      gl_code: '',
      fiscal_year: new Date().getFullYear(),
      allocated_budget: 0,
      consumed_budget: 0,
      status: 'Active'
    }
  }
  return defaults[tab] || {}
}

function getFormFields(tab) {
  const fields = {
    projects: [
      { name: 'project_id', label: 'Initiative ID', type: 'text', required: true },
      { name: 'project_name', label: 'Initiative Name', type: 'text', required: true },
      { name: 'start_date', label: 'Start Date', type: 'date', required: true },
      { name: 'end_date', label: 'End Date', type: 'date' },
      { name: 'project_owner', label: 'Project Owner', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive', 'Closed'] },
      { name: 'total_budget', label: 'Total Budget', type: 'number', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'currency', label: 'Currency', type: 'text', defaultValue: 'SGD' }
    ],
    'cost-centers': [
      { name: 'cost_center_id', label: 'Department ID', type: 'text', required: true },
      { name: 'cost_center_name', label: 'Department Name', type: 'text', required: true },
      { name: 'project_id', label: 'Initiative ID', type: 'text' },
      { name: 'facility', label: 'Facility', type: 'text' },
      { name: 'budget_limit', label: 'Budget Limit', type: 'number' },
      { name: 'gl_code_default', label: 'Default Account Code', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
      { name: 'description', label: 'Description', type: 'textarea' }
    ],
    vendors: [
      { name: 'vendor_id', label: 'Supplier ID', type: 'text', required: true },
      { name: 'vendor_name', label: 'Supplier Name', type: 'text', required: true },
      { name: 'tax_registration_number', label: 'Tax Registration Number', type: 'text' },
      { name: 'address', label: 'Address', type: 'text' },
      { name: 'city', label: 'City', type: 'text' },
      { name: 'country', label: 'Country', type: 'text', defaultValue: 'SG' },
      { name: 'contact_person', label: 'Contact Person', type: 'text' },
      { name: 'contact_email', label: 'Contact Email', type: 'email' },
      { name: 'contact_phone', label: 'Contact Phone', type: 'text' },
      { name: 'currency', label: 'Currency', type: 'text', defaultValue: 'SGD' },
      { name: 'payment_terms', label: 'Payment Terms', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] }
    ],
    products: [
      { name: 'product_id', label: 'Product ID', type: 'text', required: true },
      { name: 'product_name', label: 'Product Name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'product_type', label: 'Product Type', type: 'select', options: ['Consumable', 'Non-consumable'] },
      { name: 'uom', label: 'Unit', type: 'text' },
      { name: 'vendor_id', label: 'Supplier ID', type: 'text' },
      { name: 'unit_cost', label: 'Unit Cost', type: 'number', required: true },
      { name: 'gl_code', label: 'Account Code', type: 'text' },
      { name: 'moh_compliance_flag', label: 'MOH Compliance', type: 'checkbox' },
      { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] }
    ],
    'gl-codes': [
      { name: 'gl_code', label: 'Account Code', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'text', required: true },
      { name: 'account_type', label: 'Account Type', type: 'text' },
      { name: 'reporting_group', label: 'Reporting Group', type: 'text' },
      { name: 'tax_code', label: 'Tax Code', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] }
    ],
    employees: [
      { name: 'employee_id', label: 'Employee ID', type: 'text', required: true },
      { name: 'employee_name', label: 'Employee Name', type: 'text', required: true },
      { name: 'designation', label: 'Designation', type: 'text' },
      { name: 'department', label: 'Department', type: 'text' },
      { name: 'cost_center_id', label: 'Department ID', type: 'text' },
      { name: 'role', label: 'Role', type: 'text' },
      { name: 'approval_limit', label: 'Approval Limit', type: 'number' },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive', 'Terminated'] }
    ],
    budgets: [
      { name: 'budget_id', label: 'Budget ID', type: 'text', required: true },
      { name: 'project_id', label: 'Initiative ID', type: 'text' },
      { name: 'cost_center_id', label: 'Department ID', type: 'text' },
      { name: 'gl_code', label: 'Account Code', type: 'text', required: true },
      { name: 'fiscal_year', label: 'Fiscal Year', type: 'number', required: true },
      { name: 'allocated_budget', label: 'Allocated Budget', type: 'number', required: true },
      { name: 'consumed_budget', label: 'Consumed Budget', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive', 'Archived', 'Closed'] }
    ]
  }
  return fields[tab] || []
}

function hasPermission(permissions, permission) {
  if (!permissions || !Array.isArray(permissions)) {
    return false
  }
  return permissions.includes(permission)
}

export default function MasterData() {
  const { permissions } = usePermissionsContext()
  const [activeTab, setActiveTab] = useState('projects')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({})
  const [error, setError] = useState('')

  const canView = hasPermission(permissions, getViewPermission(activeTab))
  const canManage = hasPermission(permissions, getManagePermission(activeTab))

  const fetchData = useCallback(async () => {
    if (!canView) return
    
    setLoading(true)
    setError('')
    try {
      const endpoints = {
        projects: '/api/v1/projects',
        'cost-centers': '/api/v1/cost-centers',
        vendors: '/api/v1/vendors',
        products: '/api/v1/products',
        'gl-codes': '/api/v1/gl-codes',
        employees: '/api/v1/employees',
        budgets: '/api/v1/budgets'
      }
      
      const response = await axios.get(endpoints[activeTab])
      setData(response.data)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err.response?.data?.message || 'Failed to fetch data')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [activeTab, canView])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCreate = () => {
    setEditingItem(null)
    setFormData(getDefaultFormData(activeTab))
    setShowModal(true)
    setError('')
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData(item)
    setShowModal(true)
    setError('')
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return
    }

    try {
      const endpoints = {
        projects: `/api/v1/projects/${id}`,
        'cost-centers': `/api/v1/cost-centers/${id}`,
        vendors: `/api/v1/vendors/${id}`,
        products: `/api/v1/products/${id}`,
        'gl-codes': `/api/v1/gl-codes/${id}`,
        employees: `/api/v1/employees/${id}`,
        budgets: `/api/v1/budgets/${id}`
      }

      await axios.delete(endpoints[activeTab])
      toast.success('Item deleted')
      fetchData()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete item'
      setError(msg)
      toast.error(msg)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const endpoints = {
        projects: '/api/v1/projects',
        'cost-centers': '/api/v1/cost-centers',
        vendors: '/api/v1/vendors',
        products: '/api/v1/products',
        'gl-codes': '/api/v1/gl-codes',
        employees: '/api/v1/employees',
        budgets: '/api/v1/budgets'
      }

      const url = editingItem 
        ? `${endpoints[activeTab]}/${editingItem[getIdField(activeTab)]}`
        : endpoints[activeTab]
      
      const method = editingItem ? 'put' : 'post'

      await axios[method](url, formData)
      toast.success('Item saved')
      setShowModal(false)
      fetchData()
    } catch (err) {
      const msg = err.response?.data?.message || `Failed to ${editingItem ? 'update' : 'create'} item`
      setError(msg)
      toast.error(msg)
    }
  }

  // Excel import handler
  const handleImport = async (importedData) => {
    setLoading(true)
    setError('')
    let successCount = 0
    let errorCount = 0
    const errors = []

    const endpoints = {
      projects: '/api/v1/projects',
      'cost-centers': '/api/v1/cost-centers',
      vendors: '/api/v1/vendors',
      products: '/api/v1/products',
      'gl-codes': '/api/v1/gl-codes',
      employees: '/api/v1/employees',
      budgets: '/api/v1/budgets'
    }

    const idField = getIdField(activeTab)
    const endpoint = endpoints[activeTab]

    for (const item of importedData) {
      try {
        // Check if item exists (update) or create new
        if (item[idField]) {
          try {
            await axios.put(`${endpoint}/${item[idField]}`, item)
            successCount++
          } catch (err) {
            // If update fails, try create
            await axios.post(endpoint, item)
            successCount++
          }
        } else {
          await axios.post(endpoint, item)
          successCount++
        }
      } catch (err) {
        errorCount++
        const identifier = item[idField] || item[Object.keys(item)[0]] || 'Unknown'
        errors.push(`${identifier}: ${err.response?.data?.message || err.message}`)
      }
    }

    setLoading(false)
    if (errorCount > 0) {
      setError(`Imported ${successCount} items. ${errorCount} failed:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n... and ${errors.length - 5} more` : ''}`)
    } else {
      setError('')
      toast.success(`Successfully imported ${successCount} items`)
    }
    fetchData()
  }

  // Get Excel configuration for current tab
  const getExcelConfig = () => {
    const idField = getIdField(activeTab)
    const fields = getFormFields(activeTab)
    
    // Build field mappings and template headers from form fields
    const fieldMappings = {}
    const templateHeaders = []
    const requiredFields = []

    fields.forEach(field => {
      const label = field.label
      fieldMappings[field.name] = label
      templateHeaders.push({ key: field.name, label })
      if (field.required) {
        requiredFields.push(field.name)
      }
    })

    return {
      requiredFields: requiredFields.length > 0 ? requiredFields : [idField],
      fieldMappings,
      templateHeaders
    }
  }

  const tabs = [
    { id: 'projects', label: 'Initiatives' },
    { id: 'cost-centers', label: 'Departments' },
    { id: 'vendors', label: 'Suppliers' },
    { id: 'products', label: 'Products' },
    { id: 'gl-codes', label: 'Account Codes' },
    { id: 'employees', label: 'Employees' },
    { id: 'budgets', label: 'Budgets' }
  ]

  const renderTable = () => {
    if (!canView) {
      return (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          You do not have permission to view this data
        </div>
      )
    }

    if (error && !loading) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )
    }

    if (!data || data.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No data found
        </div>
      )
    }

    const keys = Object.keys(data[0]).filter(k => !k.includes('_at') && k !== 'tenant_id')

    // Map field names to display labels
    const getFieldLabel = (key) => {
      const labelMap = {
        'project_id': 'Initiative ID',
        'project_name': 'Initiative Name',
        'project_owner': 'Initiative Owner',
        'cost_center_id': 'Department ID',
        'cost_center_name': 'Department Name',
        'vendor_id': 'Supplier ID',
        'vendor_name': 'Supplier Name',
        'gl_code': 'Account Code',
        'gl_code_default': 'Default Account Code',
        'uom': 'Unit',
        'vendor_phone': 'Supplier Phone',
        'vendor_email': 'Supplier Email',
        'vendor_contact_name': 'Supplier Contact',
        'message_to_vendor': 'Message to Supplier',
        'facility_id': 'Shipment Address ID',
        'facility_name': 'Shipment Address Name',
        'budget_id': 'Budget ID',
        'fiscal_year': 'Fiscal Year',
        'allocated_budget': 'Allocated Budget',
        'consumed_budget': 'Consumed Budget',
        'remaining_budget': 'Remaining Budget'
      }
      
      if (labelMap[key]) {
        return labelMap[key]
      }
      
      // Default: convert snake_case to Title Case
      return key.replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
    }

    const columns = [
      ...keys.map((key) => ({
        key,
        header: getFieldLabel(key),
        sortable: true,
        filterable: true,
        render: (row) => {
          const val = row[key]
          if (typeof val === 'boolean') return val ? 'Yes' : 'No'
          return String(val ?? '-')
        }
      })),
      ...(canManage
        ? [{
            key: 'actions',
            header: 'Actions',
            render: (row) => (
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => handleEdit(row)}
                  className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 flex items-center gap-1"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(row[getIdField(activeTab)])}
                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            )
          }]
        : [])
    ]

    return (
      <Table
        columns={columns}
        data={data}
        rowKey={(row, idx) => row[getIdField(activeTab)] || idx}
        loading={loading}
        paginationMode="client"
        defaultPageSize={10}
      />
    )
  }

  const renderModal = () => {
    if (!showModal) return null

    const fields = getFormFields(activeTab)

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-8 border w-11/12 md:w-3/4 lg:w-1/2 shadow-xl rounded-3xl bg-white dark:bg-gray-800">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-1">
                {editingItem ? 'Edit' : 'Create'} {tabs.find(t => t.id === activeTab)?.label}
              </h3>
              <div className="h-0.5 w-16 bg-primary-600 rounded-full"></div>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-2xl font-medium text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {fields.map(field => (
              <div key={field.name}>
                <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-4 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    required={field.required}
                    rows={3}
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-4 pr-10 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    required={field.required}
                  >
                    <option value="">Select...</option>
                    {field.options?.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : field.type === 'checkbox' ? (
                  <input
                    type="checkbox"
                    checked={formData[field.name] || false}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.checked })}
                    className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded-xl"
                  />
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.name] || field.defaultValue || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-4 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    required={field.required}
                  />
                )}
              </div>
            ))}

            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-6 py-3 border border-gray-200 dark:border-gray-600 rounded-2xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2 font-semibold text-xs uppercase tracking-widest transition-all"
              >
                <X size={18} />
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center gap-2 font-semibold text-xs uppercase tracking-widest shadow-lg shadow-primary-200 dark:shadow-primary-900 transition-all"
              >
                <Save size={18} />
                {editingItem ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <div className="w-full py-4 px-4">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">Master Data</h1>
            <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-widest">
              View and manage all reference data
            </p>
          </div>
          <RequirePermission
            permissions={permissions}
            permission={getManagePermission(activeTab)}
          >
            <div className="flex gap-2">
              <ExcelImportExport
                data={data}
                filename={`${activeTab}_${new Date().toISOString().split('T')[0]}`}
                sheetName={tabs.find(t => t.id === activeTab)?.label || 'Data'}
                onImport={handleImport}
                requiredFields={getExcelConfig().requiredFields}
                fieldMappings={getExcelConfig().fieldMappings}
                templateHeaders={getExcelConfig().templateHeaders}
                disabled={!canManage}
              />
              <button
                onClick={handleCreate}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-semibold text-xs uppercase tracking-widest shadow-lg shadow-primary-200 dark:shadow-primary-900 transition-all flex items-center gap-2"
              >
                <Plus size={18} />
                Create New
              </button>
            </div>
          </RequirePermission>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
            <div className="overflow-x-auto">
              <nav className="flex -mb-px px-8">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-4 text-xs font-semibold uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${
                      activeTab === tab.id
                        ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
          <div className="p-8">
            {renderTable()}
          </div>
        </div>
      </div>

      {renderModal()}
    </Layout>
  )
}
