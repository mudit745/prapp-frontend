import { useState, useEffect } from 'react'
import { Save, Plus, Edit, Trash2, X, Settings, Mail, Zap, Database, UserCheck, Brain } from 'lucide-react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import DOMPurify from 'dompurify'
import toast from 'react-hot-toast'
import axios from '../utils/axios'
import Layout from '../components/Layout'
import Table from '../components/Table'
import GovernanceOrchestrator from '../components/GovernanceOrchestrator'

const BusinessRuleManagement = () => {
  // Section 1: General Settings
  const [generalSettings, setGeneralSettings] = useState({
    companyName: 'Acme Corporation',
    dateFormat: 'DD/MM/YYYY',
    timeZone: 'Asia/Singapore',
    defaultCurrency: 'SGD'
  })

  // Request Settings (under General Settings)
  const [requestSettings, setRequestSettings] = useState({
    requestDateDays: 15
  })

  // Section 2: Notifications
  const [emailPreferences, setEmailPreferences] = useState({
    orderReceived: true,
    exceptions: true,
    approvalReminders: true,
    pendingCorrectionReminder: false
  })

  const [emailTemplates, setEmailTemplates] = useState([])
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [templateForm, setTemplateForm] = useState({
    template_name: '',
    template_type: '',
    subject_line: '',
    email_body: '',
    is_active: true
  })

  // Section 3: Automation Settings
  const [automationSettings, setAutomationSettings] = useState({
    defaultPostingDate: '',
    autoApprovalLimit: 1000,
    approvalTimeoutDays: 7,
    ocrConfidenceThreshold: 85
  })

  // Section 4: Data Mapping
  const [prFieldsMapping, setPrFieldsMapping] = useState([])
  const [loadingFields, setLoadingFields] = useState(false)

  // Section 6: AI Settings
  const [prHeaderFields, setPrHeaderFields] = useState([])
  const [prLineItemFields, setPrLineItemFields] = useState([])
  const [loadingAIFields, setLoadingAIFields] = useState(false)

  // Section 5: Delegation of Authority
  const [delegations, setDelegations] = useState([])
  const [showDelegationDialog, setShowDelegationDialog] = useState(false)
  const [delegationForm, setDelegationForm] = useState({
    delegateFor: '',
    delegateTo: '',
    effectiveDate: '',
    expiryDate: ''
  })
  const [employees, setEmployees] = useState([])

  // Business Rules
  const [businessRules, setBusinessRules] = useState([])
  const [showRuleDialog, setShowRuleDialog] = useState(false)
  const [editingRule, setEditingRule] = useState(null)
  const [ruleForm, setRuleForm] = useState({
    rule_name: '',
    category: '',
    action: '',
    duplicate_check: false,
    message: '',
    conditions: [],
    notifications: []
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedTab, setSelectedTab] = useState('general')

  const tabs = [
    { key: 'general', label: 'General Settings', icon: <Settings size={18} /> },
    { key: 'notifications', label: 'Notifications', icon: <Mail size={18} /> },
    { key: 'automation', label: 'Automation Settings', icon: <Zap size={18} /> },
    { key: 'dataMapping', label: 'Data Mapping', icon: <Database size={18} /> },
    { key: 'delegation', label: 'Delegation of Authority', icon: <UserCheck size={18} /> },
    { key: 'aiSettings', label: 'AI Settings', icon: <Brain size={18} /> },
  ]

  // Fetch request settings
  useEffect(() => {
    fetchRequestSettings()
  }, [])

  // Fetch email templates
  useEffect(() => {
    fetchEmailTemplates()
    fetchPRFieldsMapping()
    fetchBusinessRules()
    fetchEmployees()
    fetchAIFields()
  }, [])

  const fetchEmailTemplates = async () => {
    try {
      const response = await axios.get('/api/v1/email-templates')
      setEmailTemplates(response.data)
    } catch (err) {
      console.error('Error fetching email templates:', err)
      setError('Failed to fetch email templates')
    }
  }

  const fetchPRFieldsMapping = async () => {
    setLoadingFields(true)
    try {
      const response = await axios.get('/api/v1/business-rules/pr-fields-mapping')
      setPrFieldsMapping(response.data)
    } catch (err) {
      console.error('Error fetching PR fields mapping:', err)
      setError('Failed to fetch PR fields mapping')
    } finally {
      setLoadingFields(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/v1/employees')
      setEmployees(response.data || [])
    } catch (err) {
      console.error('Error fetching employees:', err)
      setError('Failed to fetch employees')
    }
  }

  const fetchAIFields = async () => {
    setLoadingAIFields(true)
    try {
      const [headerRes, lineRes] = await Promise.all([
        axios.get('/api/v1/pr-header-fields'),
        axios.get('/api/v1/pr-line-item-fields')
      ])
      setPrHeaderFields(headerRes.data || [])
      setPrLineItemFields(lineRes.data || [])
    } catch (err) {
      console.error('Error fetching AI fields:', err)
      setError('Failed to fetch PR fields')
    } finally {
      setLoadingAIFields(false)
    }
  }

  const handleToggleSmartSuggest = async (fieldId, fieldType, currentMetadata) => {
    try {
      // Parse current metadata or default to empty object
      let metadata = {}
      if (currentMetadata) {
        try {
          metadata = typeof currentMetadata === 'string' ? JSON.parse(currentMetadata) : currentMetadata
        } catch (e) {
          metadata = {}
        }
      }
      
      // Toggle use_in_smart_suggest
      metadata.use_in_smart_suggest = !metadata.use_in_smart_suggest

      const endpoint = fieldType === 'header' 
        ? `/api/v1/pr-header-fields/${fieldId}/ai-metadata`
        : `/api/v1/pr-line-item-fields/${fieldId}/ai-metadata`

      await axios.put(endpoint, { ai_metadata: metadata })
      
      // Update local state
      if (fieldType === 'header') {
        setPrHeaderFields(prev => prev.map(f => 
          f.field_id === fieldId ? { ...f, ai_metadata: JSON.stringify(metadata) } : f
        ))
      } else {
        setPrLineItemFields(prev => prev.map(f => 
          f.field_id === fieldId ? { ...f, ai_metadata: JSON.stringify(metadata) } : f
        ))
      }
      
      setSuccess('AI settings updated successfully')
      toast.success('AI settings updated successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Error updating AI metadata:', err)
      setError('Failed to update AI settings')
      toast.error('Failed to update AI settings')
      setTimeout(() => setError(''), 3000)
    }
  }

  const fetchRequestSettings = async () => {
    try {
      const response = await axios.get('/api/v1/pr-settings/request_date_days')
      const setting = response.data
      if (setting && setting.setting_value) {
        const days = parseInt(setting.setting_value, 10)
        if (!isNaN(days) && days > 0) {
          setRequestSettings({ requestDateDays: days })
          return
        }
      }
      // Fallback to default if parsing fails
      setRequestSettings({ requestDateDays: 15 })
    } catch (err) {
      // If setting doesn't exist, use default
      if (err.response?.status === 404) {
        setRequestSettings({ requestDateDays: 15 })
      } else {
        console.error('Error fetching request date setting:', err)
        setRequestSettings({ requestDateDays: 15 })
      }
    }
  }

  const handleSaveGeneralSettings = async () => {
    try {
      // Save request settings
      await axios.post('/api/v1/pr-settings', {
        setting_key: 'request_date_days',
        setting_value: requestSettings.requestDateDays.toString(),
        setting_type: 'number',
        description: 'Number of days from current date to set Request Date for new requests',
        category: 'Request Settings'
      })
      
      setSuccess('General settings saved successfully')
      toast.success('General settings saved successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Error saving general settings:', err)
      setError('Failed to save general settings')
      toast.error('Failed to save general settings')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleSaveEmailPreferences = () => {
    // For now, just show success message (hardcoded in frontend)
    setSuccess('Email preferences saved successfully')
    toast.success('Email preferences saved successfully')
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleSaveAutomationSettings = () => {
    // For now, just show success message (hardcoded in frontend)
    setSuccess('Automation settings saved successfully')
    toast.success('Automation settings saved successfully')
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleCreateTemplate = () => {
    setEditingTemplate(null)
    setTemplateForm({
      template_name: '',
      template_type: '',
      subject_line: '',
      email_body: '',
      is_active: true
    })
    setShowTemplateDialog(true)
  }

  const handleEditTemplate = (template) => {
    setEditingTemplate(template)
    setTemplateForm({
      template_name: template.template_name,
      template_type: template.template_type,
      subject_line: template.subject_line,
      email_body: template.email_body,
      is_active: template.is_active
    })
    setShowTemplateDialog(true)
  }

  const handleSaveTemplate = async () => {
    try {
      setLoading(true)
      if (editingTemplate) {
        await axios.put(`/api/v1/email-templates/${editingTemplate.id}`, templateForm)
        setSuccess('Email template updated successfully')
        toast.success('Email template updated successfully')
      } else {
        await axios.post('/api/v1/email-templates', templateForm)
        setSuccess('Email template created successfully')
        toast.success('Email template created successfully')
      }
      setShowTemplateDialog(false)
      fetchEmailTemplates()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save email template')
      toast.error(err.response?.data?.error || 'Failed to save email template')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return
    }
    try {
      await axios.delete(`/api/v1/email-templates/${id}`)
      setSuccess('Email template deleted successfully')
      toast.success('Email template deleted successfully')
      fetchEmailTemplates()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete email template')
      toast.error(err.response?.data?.error || 'Failed to delete email template')
    }
  }

  const handleCreateDelegation = () => {
    setDelegationForm({
      delegateFor: '',
      delegateTo: '',
      effectiveDate: '',
      expiryDate: ''
    })
    setShowDelegationDialog(true)
  }

  const handleSaveDelegation = () => {
    // For now, just add to local state (hardcoded in frontend)
    const newDelegation = {
      id: Date.now().toString(),
      ...delegationForm,
      status: 'Active'
    }
    setDelegations([...delegations, newDelegation])
    setShowDelegationDialog(false)
    setSuccess('Delegation created successfully')
    toast.success('Delegation created successfully')
    setTimeout(() => setSuccess(''), 3000)
  }

  const templateColumns = [
    { key: 'template_name', header: 'Template Name', sortable: true },
    { key: 'template_type', header: 'Template Type', sortable: true },
    { key: 'subject_line', header: 'Subject Line', sortable: true },
    {
      key: 'is_active',
      header: 'Active',
      sortable: true,
      render: (row) => (row.is_active ? 'Yes' : 'No')
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditTemplate(row)}
            className="text-blue-600 hover:text-blue-800"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDeleteTemplate(row.id)}
            className="text-red-600 hover:text-red-800"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ]

  const prFieldsColumns = [
    { key: 'field_name', header: 'Field Name', sortable: true, filterable: true },
    { key: 'field_label', header: 'Field Label', sortable: true, filterable: true },
    { key: 'field_type', header: 'Type', sortable: true, filterable: true },
    { key: 'category_name', header: 'Category', sortable: true, filterable: true },
    {
      key: 'is_active',
      header: 'Active',
      sortable: true,
      render: (row) => (
        <input
          type="checkbox"
          checked={row.is_active}
          onChange={() => {
            // Toggle active status (for now, just update local state)
            const updated = prFieldsMapping.map(f =>
              f.field_id === row.field_id ? { ...f, is_active: !f.is_active } : f
            )
            setPrFieldsMapping(updated)
          }}
          className="rounded"
        />
      )
    }
  ]

  const delegationColumns = [
    {
      key: 'delegateFor',
      header: 'Setting up delegation for',
      sortable: true,
      render: (row) => {
        const emp = employees.find(e => e.employee_id === row.delegateFor)
        return emp ? `${emp.employee_name} (${emp.employee_id})` : row.delegateFor
      }
    },
    {
      key: 'delegateTo',
      header: 'Delegate To (Buddy)',
      sortable: true,
      render: (row) => {
        const emp = employees.find(e => e.employee_id === row.delegateTo)
        return emp ? `${emp.employee_name} (${emp.employee_id})` : row.delegateTo
      }
    },
    { key: 'effectiveDate', header: 'Effective Date', sortable: true },
    { key: 'expiryDate', header: 'Expiry Date', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <button
          onClick={() => {
            setDelegations(delegations.filter(d => d.id !== row.id))
            setSuccess('Delegation deleted successfully')
            toast.success('Delegation deleted successfully')
            setTimeout(() => setSuccess(''), 3000)
          }}
          className="text-red-600 hover:text-red-800"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      )
    }
  ]

  // Business Rules functions
  const fetchBusinessRules = async () => {
    try {
      const response = await axios.get('/api/v1/business-rules')
      setBusinessRules(response.data)
    } catch (err) {
      console.error('Error fetching business rules:', err)
      setError('Failed to fetch business rules')
    }
  }

  const handleEditRule = (rule) => {
    setEditingRule(rule)
    try {
      const conditions = typeof rule.conditions === 'string' ? JSON.parse(rule.conditions) : rule.conditions
      const notifications = typeof rule.notifications === 'string' ? JSON.parse(rule.notifications) : rule.notifications
      setRuleForm({
        rule_name: rule.rule_name,
        category: rule.category || '',
        action: rule.action || '',
        duplicate_check: rule.duplicate_check,
        message: rule.message || '',
        conditions: conditions || [],
        notifications: notifications || []
      })
    } catch (err) {
      console.error('Error parsing rule data:', err)
      setRuleForm({
        rule_name: rule.rule_name,
        category: rule.category || '',
        action: rule.action || '',
        duplicate_check: rule.duplicate_check,
        message: rule.message || '',
        conditions: [],
        notifications: []
      })
    }
    setShowRuleDialog(true)
  }

  const handleSaveRule = async () => {
    try {
      setLoading(true)
      const payload = {
        rule_name: ruleForm.rule_name,
        category: ruleForm.category || null,
        action: ruleForm.action || null,
        duplicate_check: ruleForm.duplicate_check,
        message: ruleForm.message || null,
        conditions: ruleForm.conditions,
        notifications: ruleForm.notifications
      }

      if (editingRule) {
        await axios.put(`/api/v1/business-rules/${editingRule.id}`, payload)
        setSuccess('Business rule updated successfully')
        toast.success('Business rule updated successfully')
      } else {
        await axios.post('/api/v1/business-rules', payload)
        setSuccess('Business rule created successfully')
        toast.success('Business rule created successfully')
      }
      setShowRuleDialog(false)
      fetchBusinessRules()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save business rule')
      toast.error(err.response?.data?.error || 'Failed to save business rule')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRule = async (id) => {
    if (!window.confirm('Are you sure you want to delete this rule?')) {
      return
    }
    try {
      await axios.delete(`/api/v1/business-rules/${id}`)
      setSuccess('Business rule deleted successfully')
      fetchBusinessRules()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete business rule')
      toast.error(err.response?.data?.error || 'Failed to delete business rule')
    }
  }

  const formatConditionExpression = (conditions) => {
    if (!conditions || conditions.length === 0) return 'No conditions'
    try {
      const conds = typeof conditions === 'string' ? JSON.parse(conditions) : conditions
      return conds.map((c, i) => {
        let expr = ''
        if (i > 0 && c.logical_op) {
          expr += `${c.logical_op} `
        }
        expr += `${c.table}.${c.field} ${c.operator} `
        if (c.value_type === 'static' && c.static_value) {
          expr += c.static_value
        } else if (c.value_type === 'field' && c.field_table && c.field_name) {
          expr += `${c.field_table}.${c.field_name}`
        }
        return expr
      }).join(' ')
    } catch {
      return 'Invalid conditions'
    }
  }

  const formatNotifications = (notifications) => {
    if (!notifications) return 'None'
    try {
      const notifs = typeof notifications === 'string' ? JSON.parse(notifications) : notifications
      return Array.isArray(notifs) ? notifs.join(', ') : 'None'
    } catch {
      return 'None'
    }
  }

  const businessRuleColumns = [
    { key: 'rule_name', header: 'Rule Name', sortable: true, filterable: true },
    { key: 'category', header: 'Category', sortable: true, filterable: true },
    {
      key: 'conditions',
      header: 'Condition Expression',
      sortable: false,
      render: (row) => (
        <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
          {formatConditionExpression(row.conditions)}
        </span>
      )
    },
    {
      key: 'duplicate_check',
      header: 'Duplicate Check',
      sortable: true,
      render: (row) => (row.duplicate_check ? 'Yes' : 'No')
    },
    { key: 'action', header: 'Action', sortable: true, filterable: true },
    {
      key: 'notifications',
      header: 'Notifications',
      sortable: false,
      render: (row) => formatNotifications(row.notifications)
    },
    {
      key: 'is_active',
      header: 'Status',
      sortable: true,
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs ${row.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditRule(row)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDeleteRule(row.id)}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ]

  return (
    <Layout>
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <Settings size={24} />
            Business Rule Management
          </h1>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-2xl font-medium text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-6 py-4 rounded-2xl font-medium text-sm">
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1.5 rounded-2xl shadow-sm">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key)}
              className={`px-6 py-3 rounded-xl text-xs font-semibold uppercase tracking-widest flex items-center gap-2 transition-all ${
                selectedTab === tab.key
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 dark:shadow-primary-900'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {selectedTab === 'general' && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-1 flex items-center gap-2">
                <Settings size={20} />
                General Settings
              </h2>
              <div className="h-0.5 w-16 bg-primary-600 rounded-full mt-2"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={generalSettings.companyName}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, companyName: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-4 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                  Date Format
                </label>
                <select
                  value={generalSettings.dateFormat}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, dateFormat: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-4 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                  Time Zone
                </label>
                <select
                  value={generalSettings.timeZone}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, timeZone: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-4 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                >
                  <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                  Default Currency
                </label>
                <select
                  value={generalSettings.defaultCurrency}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, defaultCurrency: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-4 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                >
                  <option value="SGD">SGD - Singapore Dollar</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>
            </div>

            {/* Request Settings Section */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-1">
                  Request Settings
                </h3>
                <div className="h-0.5 w-16 bg-primary-600 rounded-full mt-2"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                    Request Date (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={requestSettings.requestDateDays}
                    onChange={(e) => setRequestSettings({ requestDateDays: parseInt(e.target.value) || 15 })}
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-4 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="15"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Number of days from current date to set Request Date for new requests
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={handleSaveGeneralSettings}
                  className="px-6 py-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 flex items-center gap-2 font-semibold text-xs uppercase tracking-widest shadow-lg shadow-primary-200 dark:shadow-primary-900 transition-all"
              >
                <Save size={16} />
                Save Settings
              </button>
            </div>
          </div>
        )}

        {selectedTab === 'notifications' && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-1 flex items-center gap-2">
                <Mail size={20} />
                Notifications
              </h2>
              <div className="h-0.5 w-16 bg-primary-600 rounded-full mt-2"></div>
            </div>

            <div className="mb-6">
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-1">Email Preferences</h3>
                <div className="h-0.5 w-16 bg-primary-600 rounded-full mt-2"></div>
              </div>
              <div className="space-y-2">
                {[
                  { key: 'orderReceived', label: 'Order Received' },
                  { key: 'exceptions', label: 'Exceptions' },
                  { key: 'approvalReminders', label: 'Approval Reminders' },
                  { key: 'pendingCorrectionReminder', label: 'Pending Correction Reminder' }
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={emailPreferences[key]}
                      onChange={(e) => setEmailPreferences({ ...emailPreferences, [key]: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-gray-700 dark:text-gray-300">{label}</span>
                  </label>
                ))}
              </div>
              <div className="mt-4">
                <button
                  onClick={handleSaveEmailPreferences}
                  className="px-6 py-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 flex items-center gap-2 font-semibold text-xs uppercase tracking-widest shadow-lg shadow-primary-200 dark:shadow-primary-900 transition-all"
                >
                  <Save size={16} />
                  Save Preferences
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-1">Email Template Maintenance</h3>
                  <div className="h-0.5 w-16 bg-primary-600 rounded-full mt-2"></div>
                </div>
                <button
                  onClick={handleCreateTemplate}
                  className="px-6 py-3 bg-green-600 text-white rounded-2xl hover:bg-green-700 flex items-center gap-2 font-semibold text-xs uppercase tracking-widest shadow-lg shadow-green-200 dark:shadow-green-900 transition-all"
                >
                  <Plus size={16} />
                  Add New Template
                </button>
              </div>
              <Table
                data={emailTemplates}
                columns={templateColumns}
                emptyMessage="No email templates found"
              />
            </div>
          </div>
        )}

        {selectedTab === 'automation' && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-1 flex items-center gap-2">
                <Zap size={20} />
                Automation Settings
              </h2>
              <div className="h-0.5 w-16 bg-primary-600 rounded-full mt-2"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                  Default Posting Date (if not in document)
                </label>
                <input
                  type="date"
                  value={automationSettings.defaultPostingDate}
                  onChange={(e) => setAutomationSettings({ ...automationSettings, defaultPostingDate: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-4 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                  Auto-Approval Limit (Amount)
                </label>
                <input
                  type="number"
                  value={automationSettings.autoApprovalLimit}
                  onChange={(e) => setAutomationSettings({ ...automationSettings, autoApprovalLimit: parseFloat(e.target.value) })}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-4 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                  Approval Timeout for Auto-Escalate (Days)
                </label>
                <input
                  type="number"
                  value={automationSettings.approvalTimeoutDays}
                  onChange={(e) => setAutomationSettings({ ...automationSettings, approvalTimeoutDays: parseInt(e.target.value) })}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-4 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                  OCR Confidence Threshold (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={automationSettings.ocrConfidenceThreshold}
                  onChange={(e) => setAutomationSettings({ ...automationSettings, ocrConfidenceThreshold: parseInt(e.target.value) })}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-4 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={handleSaveAutomationSettings}
                  className="px-6 py-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 flex items-center gap-2 font-semibold text-xs uppercase tracking-widest shadow-lg shadow-primary-200 dark:shadow-primary-900 transition-all"
              >
                <Save size={16} />
                Save Settings
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              {/* <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Business Rule Management</h3>
                <button
                  onClick={() => {
                    setEditingRule(null)
                    setRuleForm({
                      rule_name: '',
                      category: '',
                      action: '',
                      duplicate_check: false,
                      message: '',
                      conditions: [],
                      notifications: []
                    })
                    setShowRuleDialog(true)
                  }}
                  className="px-6 py-3 bg-green-600 text-white rounded-2xl hover:bg-green-700 flex items-center gap-2 font-semibold text-xs uppercase tracking-widest shadow-lg shadow-green-200 dark:shadow-green-900 transition-all"
                >
                  <Plus size={16} />
                  Add New Rule
                </button>
              </div>
              <Table
                data={businessRules}
                columns={businessRuleColumns}
                emptyMessage="No business rules found"
              /> */}
              <GovernanceOrchestrator />
            </div>
          </div>
        )}

        {selectedTab === 'dataMapping' && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-1 flex items-center gap-2">
                <Database size={20} />
                Data Mapping
              </h2>
              <div className="h-0.5 w-16 bg-primary-600 rounded-full mt-2"></div>
            </div>
            {loadingFields ? (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading PR fields...</div>
            ) : (
              <Table
                data={prFieldsMapping}
                columns={prFieldsColumns}
                emptyMessage="No PR fields found"
              />
            )}
          </div>
        )}

        {selectedTab === 'delegation' && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-1 flex items-center gap-2">
                <UserCheck size={20} />
                Delegation of Authority
              </h2>
              <div className="h-0.5 w-16 bg-primary-600 rounded-full mt-2"></div>
            </div>
            <div className="mb-6">
              <button
                onClick={handleCreateDelegation}
                className="px-6 py-3 bg-green-600 text-white rounded-2xl hover:bg-green-700 flex items-center gap-2 font-semibold text-xs uppercase tracking-widest shadow-lg shadow-green-200 dark:shadow-green-900 transition-all"
              >
                <Plus size={16} />
                Add Delegation
              </button>
            </div>
            <Table
              data={delegations}
              columns={delegationColumns}
              emptyMessage="No delegations found"
            />
          </div>
        )}

        {selectedTab === 'aiSettings' && (
          <div className="space-y-6">
            {/* PR Header Fields */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <div className="mb-6">
                <h2 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Brain size={20} />
                  Smart Suggest Settings - PR Header Fields
                </h2>
                <div className="h-0.5 w-16 bg-primary-600 rounded-full mt-2"></div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Toggle which fields should be sent to AI for predicting values when creating a PR.
              </p>
              {loadingAIFields ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading fields...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Field Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Field Label
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Use in Smart Suggest
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {prHeaderFields.map((field) => {
                        const metadata = field.ai_metadata 
                          ? (typeof field.ai_metadata === 'string' ? JSON.parse(field.ai_metadata) : field.ai_metadata)
                          : {}
                        const useInSmartSuggest = metadata.use_in_smart_suggest === true
                        return (
                          <tr key={field.field_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                              {field.field_name}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {field.field_label}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {field.category_name || '-'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center">
                              <input
                                type="checkbox"
                                checked={useInSmartSuggest}
                                onChange={() => handleToggleSmartSuggest(field.field_id, 'header', field.ai_metadata)}
                                className="rounded"
                              />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {prHeaderFields.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">No header fields found</div>
                  )}
                </div>
              )}
            </div>

            {/* PR Item Entry Fields */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <div className="mb-6">
                <h2 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Brain size={20} />
                  Smart Suggest Settings - PR Item Entry Fields
                </h2>
                <div className="h-0.5 w-16 bg-primary-600 rounded-full mt-2"></div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Toggle which fields should be sent to AI for predicting values when creating item entries.
              </p>
              {loadingAIFields ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading fields...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Field Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Field Label
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Use in Smart Suggest
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {prLineItemFields.map((field) => {
                        const metadata = field.ai_metadata 
                          ? (typeof field.ai_metadata === 'string' ? JSON.parse(field.ai_metadata) : field.ai_metadata)
                          : {}
                        const useInSmartSuggest = metadata.use_in_smart_suggest === true
                        return (
                          <tr key={field.field_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                              {field.field_name}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {field.field_label}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {field.category_name || '-'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center">
                              <input
                                type="checkbox"
                                checked={useInSmartSuggest}
                                onChange={() => handleToggleSmartSuggest(field.field_id, 'line', field.ai_metadata)}
                                className="rounded"
                              />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {prLineItemFields.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">No item entry fields found</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Email Template Dialog */}
        {showTemplateDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingTemplate ? 'Edit Email Template' : 'Create Email Template'}
                </h3>
                <button
                  onClick={() => setShowTemplateDialog(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={templateForm.template_name}
                    onChange={(e) => setTemplateForm({ ...templateForm, template_name: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-4 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                    Template Type *
                  </label>
                  <select
                    value={templateForm.template_type}
                    onChange={(e) => setTemplateForm({ ...templateForm, template_type: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-4 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  >
                    <option value="">Select Type</option>
                    <option value="ORDER_CONFIRMATION">Order Confirmation</option>
                    <option value="EXCEPTION_NOTIFICATION">Exception Notification</option>
                    <option value="SHIPMENT_NOTIFICATION">Shipment Notification</option>
                    <option value="APPROVAL_REMINDER">Approval Reminder</option>
                    <option value="PENDING_CORRECTION">Pending Correction Reminder</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                    Subject Line *
                  </label>
                  <input
                    type="text"
                    value={templateForm.subject_line}
                    onChange={(e) => setTemplateForm({ ...templateForm, subject_line: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-4 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="e.g., Order Confirmation - {PO_ID}"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Use variables like {'{PO_ID}'}, {'{SO_ID}'}, {'{PR_ID}'} in the subject
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                    Email Body (HTML) *
                  </label>
                  <ReactQuill
                    theme="snow"
                    value={templateForm.email_body}
                    onChange={(value) => {
                      const clean = DOMPurify.sanitize(value)
                      setTemplateForm({ ...templateForm, email_body: clean })
                    }}
                    className="bg-white dark:bg-gray-800 rounded-md"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    HTML supported. Use variables like {'{PO_ID}'}, {'{SO_ID}'}, {'{PR_ID}'} in the body
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={templateForm.is_active}
                    onChange={(e) => setTemplateForm({ ...templateForm, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Active
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowTemplateDialog(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <X size={16} />
                  Cancel
                </button>
                <button
                  onClick={handleSaveTemplate}
                  disabled={loading || !templateForm.template_name || !templateForm.template_type || !templateForm.subject_line || !templateForm.email_body}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Save size={16} />
                  {editingTemplate ? 'Update' : 'Create'} Template
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delegation Dialog */}
        {showDelegationDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Create Delegation</h3>
                <button
                  onClick={() => setShowDelegationDialog(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                    Setting up delegation for: *
                  </label>
                  <select
                    value={delegationForm.delegateFor}
                    onChange={(e) => setDelegationForm({ ...delegationForm, delegateFor: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-4 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    required
                  >
                    <option value="">Select employee...</option>
                    {employees.map(emp => (
                      <option key={emp.employee_id} value={emp.employee_id}>
                        {emp.employee_name} ({emp.employee_id})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                    Delegate To (Buddy) *
                  </label>
                  <select
                    value={delegationForm.delegateTo}
                    onChange={(e) => setDelegationForm({ ...delegationForm, delegateTo: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-4 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    required
                  >
                    <option value="">Select employee...</option>
                    {employees.map(emp => (
                      <option key={emp.employee_id} value={emp.employee_id}>
                        {emp.employee_name} ({emp.employee_id})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                    Effective Date (Leave Start) *
                  </label>
                  <input
                    type="date"
                    value={delegationForm.effectiveDate}
                    onChange={(e) => setDelegationForm({ ...delegationForm, effectiveDate: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-4 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                    Expiry Date (Leave End) *
                  </label>
                  <input
                    type="date"
                    value={delegationForm.expiryDate}
                    onChange={(e) => setDelegationForm({ ...delegationForm, expiryDate: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-4 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowDelegationDialog(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <X size={16} />
                  Cancel
                </button>
                <button
                  onClick={handleSaveDelegation}
                  disabled={!delegationForm.delegateFor || !delegationForm.delegateTo || !delegationForm.effectiveDate || !delegationForm.expiryDate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Save size={16} />
                  Create Delegation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Business Rule Dialog */}
        {showRuleDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingRule ? 'Edit Business Rule' : 'Create Business Rule'}
                </h3>
                <button
                  onClick={() => setShowRuleDialog(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                    Rule Name *
                  </label>
                  <input
                    type="text"
                    value={ruleForm.rule_name}
                    onChange={(e) => setRuleForm({ ...ruleForm, rule_name: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-4 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                      Category
                    </label>
                    <select
                      value={ruleForm.category}
                      onChange={(e) => setRuleForm({ ...ruleForm, category: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-4 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    >
                      <option value="">Select Category</option>
                      <option value="Billing">Billing</option>
                      <option value="Pricing">Pricing</option>
                      <option value="Shipping">Shipping</option>
                      <option value="Customer">Customer</option>
                      <option value="Product">Product</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                      Action
                    </label>
                    <select
                      value={ruleForm.action}
                      onChange={(e) => setRuleForm({ ...ruleForm, action: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-4 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    >
                      <option value="">Select Action</option>
                      <option value="Block Y4(non std Terms)">Block Y4(non std Terms)</option>
                      <option value="Block 07(Order Process Review)">Block 07(Order Process Review)</option>
                      <option value="Block 09(OP Discount Review)">Block 09(OP Discount Review)</option>
                      <option value="Dont Create SO">Don't Create SO</option>
                      <option value="Allow Create SO">Allow Create SO</option>
                      <option value="Auto Cancel">Auto Cancel</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={ruleForm.duplicate_check}
                      onChange={(e) => setRuleForm({ ...ruleForm, duplicate_check: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable duplicate check</span>
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                    Message
                  </label>
                  <textarea
                    value={ruleForm.message}
                    onChange={(e) => setRuleForm({ ...ruleForm, message: e.target.value })}
                    rows={3}
                    placeholder="Enter a descriptive message for this rule..."
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-4 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Condition Expression
                    </label>
                    <button
                      onClick={() => {
                        setRuleForm({
                          ...ruleForm,
                          conditions: [...ruleForm.conditions, {
                            table: '',
                            field: '',
                            operator: '',
                            value_type: 'static',
                            static_value: '',
                            field_table: null,
                            field_name: null
                          }]
                        })
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center gap-1"
                    >
                      <Plus size={14} />
                      Add Condition
                    </button>
                  </div>
                  <div className="space-y-2">
                    {ruleForm.conditions.map((condition, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900">
                        {index > 0 && (
                          <select
                            value={condition.logical_op || 'AND'}
                            onChange={(e) => {
                              const updated = [...ruleForm.conditions]
                              updated[index].logical_op = e.target.value
                              setRuleForm({ ...ruleForm, conditions: updated })
                            }}
                            className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          >
                            <option value="AND">AND</option>
                            <option value="OR">OR</option>
                          </select>
                        )}
                        <select
                          value={condition.table}
                          onChange={(e) => {
                            const updated = [...ruleForm.conditions]
                            updated[index].table = e.target.value
                            setRuleForm({ ...ruleForm, conditions: updated })
                          }}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="">Select Table</option>
                          <option value="PO_HEADER">PO Header</option>
                          <option value="PO_ITEM">PO Item</option>
                          <option value="SO_HEADER">SO Header</option>
                          <option value="SO_ITEM">SO Item</option>
                          <option value="CUSTOMER_MASTER">Customer Master</option>
                          <option value="CUSTOMER_FUNCTION">Customer Function</option>
                          <option value="PRODUCT_MASTER">Product Master</option>
                          <option value="PRODUCT_EAN">Product EAN</option>
                          <option value="PRODUCT_PRICE_MASTER">Product Price Master</option>
                        </select>
                        <select
                          value={condition.field}
                          onChange={(e) => {
                            const updated = [...ruleForm.conditions]
                            updated[index].field = e.target.value
                            setRuleForm({ ...ruleForm, conditions: updated })
                          }}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="">Select Field</option>
                          <option value="documentNumber">Po number</option>
                          <option value="currencyCode">Currency</option>
                          <option value="documentDate">Po Date</option>
                          <option value="grossAmount">Gross Amount</option>
                          <option value="netAmount">Net Amount</option>
                          <option value="paymentTerms">Payment Term</option>
                          <option value="receiverId">Ship to Customer Id</option>
                          <option value="senderAddress">Customer Address</option>
                          <option value="senderCity">Customer City</option>
                          <option value="senderEmail">Customer Email Id</option>
                          <option value="senderFax">Customer Fax</option>
                          <option value="senderHouseNumber">Customer House Number</option>
                          <option value="senderPhone">Customer Contact Number</option>
                          <option value="senderPostalCode">Customer Postal Code</option>
                          <option value="senderState">Customer State</option>
                          <option value="senderStreet">Customer Street</option>
                          <option value="shipToAddress">Ship to Address</option>
                          <option value="shipToCity">Ship to City</option>
                          <option value="shipToHouseNumber">Ship to House Number</option>
                          <option value="shipToName">Ship to Name</option>
                          <option value="shipToPostalCode">Ship to Postal Code</option>
                          <option value="shipToState">Ship to State</option>
                          <option value="shipToStreet">Ship to Street</option>
                          <option value="taxId">Taxid</option>
                          <option value="deliveryDate">Delivery Date</option>
                          <option value="senderName">Customer Name</option>
                          <option value="taxIdNumber">Tax Id</option>
                          <option value="shippingTerms">Shipping Mode</option>
                          <option value="senderId">Customer ID</option>
                          <option value="senderCountryCode">Customer Country Code</option>
                          <option value="senderDistrict">Customer District</option>
                          <option value="shipToCountryCode">Ship to Country Code</option>
                          <option value="shipToPhone">Ship to Phone</option>
                          <option value="shipToFax">Ship to Fax</option>
                          <option value="shipToEmail">Ship to Email</option>
                          <option value="shipToDistrict">Ship to District</option>
                          <option value="frightType">Freight Type</option>
                          <option value="incoterm">IncoTerm</option>
                          <option value="remarks">Remarks</option>
                          <option value="discountPercentage">Discount Percentage</option>
                          <option value="discountId">Discount ID</option>
                        </select>
                        <select
                          value={condition.operator}
                          onChange={(e) => {
                            const updated = [...ruleForm.conditions]
                            updated[index].operator = e.target.value
                            setRuleForm({ ...ruleForm, conditions: updated })
                          }}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="">Select Operator</option>
                          <option value="=">Equals (=)</option>
                          <option value="!=">Not Equals (!=)</option>
                          <option value=">">Greater Than (&gt;)</option>
                          <option value=">=">Greater Than or Equal (&gt;=)</option>
                          <option value="<">Less Than (&lt;)</option>
                          <option value="<=">Less Than or Equal (&lt;=)</option>
                          <option value="CONTAINS">Contains</option>
                          <option value="NOT_CONTAINS">Does Not Contain</option>
                          <option value="IN">In List</option>
                          <option value="NOT_IN">Not In List</option>
                          <option value="IS_NULL">Is Empty</option>
                          <option value="IS_NOT_NULL">Is Not Empty</option>
                          <option value="IS_EVEN">Is Even</option>
                          <option value="IS_ODD">Is Odd</option>
                          <option value="VALIDATE_SALES_FORCE">Validate Sales force</option>
                        </select>
                        <select
                          value={condition.value_type}
                          onChange={(e) => {
                            const updated = [...ruleForm.conditions]
                            updated[index].value_type = e.target.value
                            if (e.target.value === 'static') {
                              updated[index].field_table = null
                              updated[index].field_name = null
                            } else {
                              updated[index].static_value = null
                            }
                            setRuleForm({ ...ruleForm, conditions: updated })
                          }}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="static">Static Value</option>
                          <option value="field">Field Reference</option>
                        </select>
                        {condition.value_type === 'static' ? (
                          <input
                            type="text"
                            value={condition.static_value || ''}
                            onChange={(e) => {
                              const updated = [...ruleForm.conditions]
                              updated[index].static_value = e.target.value
                              setRuleForm({ ...ruleForm, conditions: updated })
                            }}
                            placeholder="Enter value"
                            className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 flex-1"
                          />
                        ) : (
                          <div className="flex items-center space-x-1 flex-1">
                            <select
                              value={condition.field_table || ''}
                              onChange={(e) => {
                                const updated = [...ruleForm.conditions]
                                updated[index].field_table = e.target.value
                                setRuleForm({ ...ruleForm, conditions: updated })
                              }}
                              className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                              <option value="">Select Table</option>
                              <option value="PO_HEADER">PO Header</option>
                              <option value="PO_ITEM">PO Item</option>
                              <option value="SO_HEADER">SO Header</option>
                              <option value="SO_ITEM">SO Item</option>
                              <option value="CUSTOMER_MASTER">Customer Master</option>
                              <option value="CUSTOMER_FUNCTION">Customer Profile</option>
                              <option value="PRODUCT_MASTER">Product Master</option>
                              <option value="PRODUCT_EAN">Product Barcode</option>
                              <option value="PRODUCT_PRICE_MASTER">Price Master</option>
                            </select>
                            <span className="text-gray-500 dark:text-gray-400">.</span>
                            <select
                              value={condition.field_name || ''}
                              onChange={(e) => {
                                const updated = [...ruleForm.conditions]
                                updated[index].field_name = e.target.value
                                setRuleForm({ ...ruleForm, conditions: updated })
                              }}
                              className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                              <option value="">Select Field</option>
                              <option value="documentNumber">Po number</option>
                              <option value="currencyCode">Currency</option>
                              <option value="documentDate">Po Date</option>
                              <option value="grossAmount">Gross Amount</option>
                              <option value="netAmount">Net Amount</option>
                              <option value="paymentTerms">Payment Term</option>
                              <option value="receiverId">Ship to Customer Id</option>
                              <option value="senderAddress">Customer Address</option>
                              <option value="senderCity">Customer City</option>
                              <option value="senderEmail">Customer Email Id</option>
                              <option value="senderFax">Customer Fax</option>
                              <option value="senderHouseNumber">Customer House Number</option>
                              <option value="senderPhone">Customer Contact Number</option>
                              <option value="senderPostalCode">Customer Postal Code</option>
                              <option value="senderState">Customer State</option>
                              <option value="senderStreet">Customer Street</option>
                              <option value="shipToAddress">Ship to Address</option>
                              <option value="shipToCity">Ship to City</option>
                              <option value="shipToHouseNumber">Ship to House Number</option>
                              <option value="shipToName">Ship to Name</option>
                              <option value="shipToPostalCode">Ship to Postal Code</option>
                              <option value="shipToState">Ship to State</option>
                              <option value="shipToStreet">Ship to Street</option>
                              <option value="taxId">Taxid</option>
                              <option value="deliveryDate">Delivery Date</option>
                              <option value="senderName">Customer Name</option>
                              <option value="taxIdNumber">Tax Id</option>
                              <option value="shippingTerms">Shipping Mode</option>
                              <option value="senderId">Customer ID</option>
                              <option value="senderCountryCode">Customer Country Code</option>
                              <option value="senderDistrict">Customer District</option>
                              <option value="shipToCountryCode">Ship to Country Code</option>
                              <option value="shipToPhone">Ship to Phone</option>
                              <option value="shipToFax">Ship to Fax</option>
                              <option value="shipToEmail">Ship to Email</option>
                              <option value="shipToDistrict">Ship to District</option>
                              <option value="frightType">Freight Type</option>
                              <option value="incoterm">IncoTerm</option>
                              <option value="remarks">Remarks</option>
                              <option value="discountPercentage">Discount Percentage</option>
                              <option value="discountId">Discount ID</option>
                            </select>
                          </div>
                        )}
                        <button
                          onClick={() => {
                            const updated = ruleForm.conditions.filter((_, i) => i !== index)
                            setRuleForm({ ...ruleForm, conditions: updated })
                          }}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="Remove Condition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    {ruleForm.conditions.length === 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        No conditions added. Click "Add Condition" to get started.
                      </p>
                    )}
                  </div>
                  {ruleForm.conditions.length > 0 && (
                    <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-900 rounded-md">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Preview:</p>
                      <p className="text-xs font-mono text-gray-600 dark:text-gray-400">
                        {ruleForm.conditions.map((c, i) => {
                          let expr = ''
                          if (i > 0 && c.logical_op) {
                            expr += `${c.logical_op} `
                          }
                          expr += `${c.table || '?'}.${c.field || '?'} ${c.operator || '?'} `
                          if (c.value_type === 'static' && c.static_value) {
                            expr += c.static_value
                          } else if (c.value_type === 'field' && c.field_table && c.field_name) {
                            expr += `${c.field_table}.${c.field_name}`
                          } else {
                            expr += '?'
                          }
                          return expr
                        }).join(' ')}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notifications
                  </label>
                  <div className="space-y-2">
                    {['OP team', 'Customer', 'Sales Team', 'Finance Team'].map((notif) => (
                      <label key={notif} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={ruleForm.notifications.includes(notif)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRuleForm({
                                ...ruleForm,
                                notifications: [...ruleForm.notifications, notif]
                              })
                            } else {
                              setRuleForm({
                                ...ruleForm,
                                notifications: ruleForm.notifications.filter(n => n !== notif)
                              })
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{notif}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowRuleDialog(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <X size={16} />
                  Cancel
                </button>
                <button
                  onClick={handleSaveRule}
                  disabled={loading || !ruleForm.rule_name}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Save size={16} />
                  {editingRule ? 'Update' : 'Create'} Rule
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default BusinessRuleManagement


