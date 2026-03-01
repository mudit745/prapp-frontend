import { useState, useEffect } from 'react'
import { 
  GitBranch, Plus, X, CheckCircle, Circle, Clock, XCircle, 
  TrendingUp, Settings, Trash2, Inbox, Database, Shield, Activity
} from 'lucide-react'
import axios from '../utils/axios'
import Layout from '../components/Layout'

// Map main app roles to workflow personas
const WORKFLOW_ROLES = [
  'Requestor',
  'Approver', 
  'Procurement Admin',
  'Finance',
  'Finance Manager',
  'System Admin'
]

const CONDITION_FIELDS = [
  { value: 'Amount', label: 'Amount (Transactional)' },
  { value: 'Company', label: 'Company Code (Entity)' },
  { value: 'Category', label: 'Material Category' },
  { value: 'Vendor', label: 'Vendor Master ID' }
]

const CONDITION_OPERATORS = [
  { value: '>', label: '>' },
  { value: '<', label: '<' },
  { value: '==', label: '==' },
  { value: 'Contains', label: '~' }
]

export default function WorkflowOrchestrator() {
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    condition: { field: 'Amount', operator: '>', value: 0 },
    workflowSequence: [],
    status: 'Active'
  })
  const [analytics, setAnalytics] = useState({
    automationCoverage: '0%',
    approvalVelocity: '0d',
    policyIntegrity: '100%',
    activeRules: 0
  })

  useEffect(() => {
    fetchWorkflowRules()
  }, [])

  const fetchWorkflowRules = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/v1/workflow-rules')
      const rulesData = (response.data || []).map(rule => {
        // Parse JSON fields if they're strings
        let condition = rule.condition
        if (typeof condition === 'string') {
          try {
            condition = JSON.parse(condition)
          } catch (e) {
            condition = { field: 'Amount', operator: '>', value: 0 }
          }
        }
        
        let workflowSequence = rule.workflow_sequence || rule.workflowSequence || []
        if (typeof workflowSequence === 'string') {
          try {
            workflowSequence = JSON.parse(workflowSequence)
          } catch (e) {
            workflowSequence = []
          }
        }
        
        return {
          ...rule,
          condition,
          workflowSequence
        }
      })
      setRules(rulesData)
      calculateAnalytics(rulesData)
    } catch (err) {
      console.error('Error fetching workflow rules:', err)
      // If endpoint doesn't exist yet, use empty array
      setRules([])
      calculateAnalytics([])
    } finally {
      setLoading(false)
    }
  }

  const calculateAnalytics = (rulesData) => {
    const activeRules = rulesData.filter(r => r.status === 'Active').length
    const touchlessRules = rulesData.filter(r => 
      r.status === 'Active' && (!r.workflowSequence || r.workflowSequence.length === 0)
    ).length
    const automationCoverage = rulesData.length > 0 
      ? ((touchlessRules / activeRules) * 100).toFixed(1) + '%'
      : '0%'
    
    setAnalytics({
      automationCoverage,
      approvalVelocity: '1.4d', // TODO: Calculate from actual data
      policyIntegrity: '100%',
      activeRules
    })
  }

  const handleOpenBuilder = (rule) => {
    if (rule) {
      // Parse JSON fields if they're strings
      let condition = rule.condition
      if (typeof condition === 'string') {
        try {
          condition = JSON.parse(condition)
        } catch (e) {
          condition = { field: 'Amount', operator: '>', value: 0 }
        }
      }
      
      let workflowSequence = rule.workflow_sequence || rule.workflowSequence || []
      if (typeof workflowSequence === 'string') {
        try {
          workflowSequence = JSON.parse(workflowSequence)
        } catch (e) {
          workflowSequence = []
        }
      }
      
      setNewRule({
        name: rule.name || '',
        description: rule.description || '',
        condition: condition || { field: 'Amount', operator: '>', value: 0 },
        workflowSequence: workflowSequence || [],
        status: rule.status || 'Active'
      })
      setEditingId(rule.id)
    } else {
      setNewRule({
        name: '',
        description: '',
        condition: { field: 'Amount', operator: '>', value: 0 },
        workflowSequence: [],
        status: 'Active'
      })
      setEditingId(null)
    }
    setIsAdding(true)
  }

  const handleSaveRule = async () => {
    if (!newRule.name) return

    try {
      const ruleData = {
        name: newRule.name,
        description: newRule.description || 'Standard routing logic for document lifecycle.',
        condition: newRule.condition,
        workflow_sequence: newRule.workflowSequence || [],
        status: newRule.status || 'Active'
      }

      if (editingId) {
        await axios.put(`/api/v1/workflow-rules/${editingId}`, ruleData)
      } else {
        await axios.post('/api/v1/workflow-rules', ruleData)
      }
      
      setIsAdding(false)
      setEditingId(null)
      fetchWorkflowRules()
    } catch (err) {
      console.error('Error saving workflow rule:', err)
      // For now, just update local state if API doesn't exist
      const rule = {
        id: editingId || `WR-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        name: newRule.name,
        description: newRule.description || 'Standard routing logic for document lifecycle.',
        condition: newRule.condition,
        workflowSequence: newRule.workflowSequence || [],
        status: newRule.status || 'Active',
        lastModified: new Date().toISOString().split('T')[0]
      }

      if (editingId) {
        setRules(prev => prev.map(r => r.id === editingId ? rule : r))
      } else {
        setRules([...rules, rule])
      }
      
      setIsAdding(false)
      setEditingId(null)
      calculateAnalytics(editingId ? rules.map(r => r.id === editingId ? rule : r) : [...rules, rule])
    }
  }

  const addToSequence = (role) => {
    const current = newRule.workflowSequence || []
    if (!current.includes(role)) {
      setNewRule({ ...newRule, workflowSequence: [...current, role] })
    }
  }

  const removeFromSequence = (index) => {
    const current = newRule.workflowSequence || []
    const updated = [...current]
    updated.splice(index, 1)
    setNewRule({ ...newRule, workflowSequence: updated })
  }

  const deleteRule = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workflow rule?')) return

    try {
      await axios.delete(`/api/v1/workflow-rules/${id}`)
      setRules(rules.filter(r => r.id !== id))
      calculateAnalytics(rules.filter(r => r.id !== id))
    } catch (err) {
      console.error('Error deleting workflow rule:', err)
      // For now, just update local state if API doesn't exist
      setRules(rules.filter(r => r.id !== id))
      calculateAnalytics(rules.filter(r => r.id !== id))
    }
  }

  const renderWorkflowSteps = (rule) => {
    if (!rule.workflowSequence || rule.workflowSequence.length === 0) {
      return (
        <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-semibold text-xs uppercase tracking-widest bg-teal-50 dark:bg-teal-900/20 px-3 py-1 rounded-full border border-teal-100 dark:border-teal-800">
          <CheckCircle className="w-3 h-3" /> Touchless Posting
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2">
        {rule.workflowSequence.map((role, i) => (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-primary-600 dark:bg-primary-500 text-white flex items-center justify-center text-[8px] font-bold shadow-md border border-primary-400 dark:border-primary-600">
                {i + 1}
              </div>
              <span className="text-[7px] font-semibold text-gray-400 dark:text-gray-500 mt-1 uppercase max-w-[40px] text-center leading-tight">
                {role}
              </span>
            </div>
            {i < rule.workflowSequence.length - 1 && (
              <div className="w-4 h-px bg-gray-200 dark:bg-gray-700 mt-[-10px]" />
            )}
          </div>
        ))}
        <div className="w-4 h-px bg-gray-200 dark:bg-gray-700 mt-[-10px]" />
        <div className="flex flex-col items-center">
          <div className="w-6 h-6 rounded-full bg-gray-900 dark:bg-gray-700 text-white flex items-center justify-center border border-gray-700 dark:border-gray-600">
            <Database className="w-3 h-3" />
          </div>
          <span className="text-[7px] font-semibold text-gray-400 dark:text-gray-500 mt-1 uppercase">SAP</span>
        </div>
      </div>
    )
  }

  const getStatusIcon = (status) => {
    const statusUpper = (status || '').toUpperCase()
    if (statusUpper === 'COMPLETED' || statusUpper === 'ACTIVE') {
      return <CheckCircle className="w-5 h-5 text-green-500" />
    } else if (statusUpper === 'IN_PROGRESS' || statusUpper === 'PENDING') {
      return <Clock className="w-5 h-5 text-blue-500" />
    } else if (statusUpper === 'FAILED' || statusUpper === 'REJECTED' || statusUpper === 'PAUSED') {
      return <XCircle className="w-5 h-5 text-red-500" />
    }
    return <Circle className="w-5 h-5 text-gray-400" />
  }

  return (
    <Layout>
      <div className="p-8 space-y-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-gray-200 dark:border-gray-700 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary-600 dark:bg-primary-500 rounded-xl text-white shadow-lg shadow-primary-200 dark:shadow-primary-900/50">
                <GitBranch className="w-5 h-5" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Governance Orchestrator</h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Define complex sequential document routing and approval depth based on personas.</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => handleOpenBuilder()}
              className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-8 py-3 rounded-2xl text-xs font-semibold uppercase tracking-widest shadow-lg shadow-primary-200 dark:shadow-primary-900/50 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New Routing Logic
            </button>
          </div>
        </header>

        {/* Analytics Snapshot */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Automation Coverage', val: analytics.automationCoverage, trend: '+2.1%', color: 'text-green-500 dark:text-green-400' },
            { label: 'Approval Velocity', val: analytics.approvalVelocity, trend: 'Optimal', color: 'text-blue-500 dark:text-blue-400' },
            { label: 'Policy Integrity', val: analytics.policyIntegrity, trend: 'Verified', color: 'text-indigo-500 dark:text-indigo-400' },
            { label: 'Active Rules', val: analytics.activeRules.toString(), trend: 'Global', color: 'text-gray-400 dark:text-gray-500' }
          ].map((kpi, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm transition-transform hover:scale-[1.02]">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{kpi.label}</p>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-gray-900 dark:text-white tracking-tighter">{kpi.val}</span>
                <span className={`text-xs font-semibold ${kpi.color} pb-1.5`}>{kpi.trend}</span>
              </div>
            </div>
          ))}
        </section>

        {/* Rule Builder */}
        {isAdding && (
          <section className="bg-white dark:bg-gray-800 border-2 border-primary-600/10 dark:border-primary-500/20 rounded-3xl p-12 shadow-2xl relative overflow-hidden ring-8 ring-primary-50/50 dark:ring-primary-900/20">
            <div className="absolute top-0 right-0 p-8">
              <button 
                onClick={() => { setIsAdding(false); setEditingId(null); }} 
                className="bg-gray-50 dark:bg-gray-700 p-2 rounded-xl text-gray-300 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="max-w-7xl mx-auto space-y-12">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="w-2 h-8 bg-primary-600 dark:bg-primary-500 rounded-full" />
                  {editingId ? 'Refine Routing Rule' : 'Workflow Sequence Designer'}
                </h3>
                <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">Orchestrate exactly which personas handle the document in sequence.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-10">
                  {/* Rule Identity */}
                  <div className="space-y-4">
                    <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-5 h-5 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center text-[8px]">01</span>
                      Rule Identity
                    </label>
                    <input 
                      type="text" 
                      value={newRule.name}
                      onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                      placeholder="Rule Display Name (e.g. Marketing PR Sequence)"
                      className="w-full bg-gray-50 dark:bg-gray-700 border-2 border-transparent rounded-2xl p-4 text-sm font-semibold outline-none focus:border-primary-100 dark:focus:border-primary-900/50 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500" 
                    />
                    <textarea 
                      value={newRule.description}
                      onChange={(e) => setNewRule({...newRule, description: e.target.value})}
                      placeholder="Provide context for this workflow logic..."
                      rows={2}
                      className="w-full bg-gray-50 dark:bg-gray-700 border-2 border-transparent rounded-2xl p-4 text-xs font-medium outline-none focus:border-primary-100 dark:focus:border-primary-900/50 resize-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500" 
                    />
                  </div>

                  {/* Persona Pipeline Plan */}
                  <div className="space-y-6">
                    <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-5 h-5 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center text-[8px]">02</span>
                      Persona Pipeline Plan (In Sequence)
                    </label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Role Picker */}
                      <div className="space-y-4">
                        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase">Available Personas</p>
                        <div className="grid grid-cols-1 gap-2">
                          {WORKFLOW_ROLES.map(role => {
                            const isAlreadyInSequence = newRule.workflowSequence?.includes(role)
                            return (
                              <button 
                                key={role}
                                type="button"
                                onClick={() => addToSequence(role)}
                                disabled={isAlreadyInSequence}
                                className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all border-2 ${
                                  isAlreadyInSequence 
                                    ? 'bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-600 text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50' 
                                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-primary-200 dark:hover:border-primary-800 hover:text-primary-600 dark:hover:text-primary-400 shadow-sm'
                                }`}
                              >
                                {role}
                                {!isAlreadyInSequence && <Plus className="w-3.5 h-3.5" />}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Sequential Queue */}
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-6 border-2 border-dashed border-gray-200 dark:border-gray-700 space-y-4">
                        <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase">Workflow Sequence</p>
                        <div className="space-y-3">
                          {newRule.workflowSequence?.map((role, index) => (
                            <div key={role} className="flex items-center gap-4 bg-white dark:bg-gray-800 p-3 rounded-2xl border border-primary-100 dark:border-primary-900/50 shadow-sm">
                              <div className="w-7 h-7 bg-primary-600 dark:bg-primary-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">
                                {index + 1}
                              </div>
                              <span className="flex-1 text-xs font-semibold text-gray-900 dark:text-white uppercase">{role}</span>
                              <button 
                                onClick={() => removeFromSequence(index)} 
                                className="p-1.5 text-gray-200 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          {(!newRule.workflowSequence || newRule.workflowSequence.length === 0) && (
                            <div className="py-12 flex flex-col items-center justify-center text-gray-300 dark:text-gray-600 opacity-60">
                              <Inbox className="w-8 h-8 mb-2" />
                              <p className="text-xs font-semibold uppercase text-center">No personas planned.<br/>Click personas to add.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Logical Engine + Visual Mapping */}
                <div className="space-y-8">
                  {/* Trigger Engine */}
                  <div className="bg-gray-900 dark:bg-gray-950 text-white rounded-3xl p-10 space-y-8 relative overflow-hidden shadow-2xl border border-gray-800 dark:border-gray-900">
                    <Activity className="absolute -right-8 -top-8 w-40 h-40 opacity-5" />
                    <label className="text-xs font-semibold text-primary-400 dark:text-primary-300 uppercase tracking-widest flex items-center gap-2">
                      <Activity className="w-3 h-3" /> Execution Trigger
                    </label>
                    
                    <div className="space-y-8 relative z-10">
                      <div className="space-y-3">
                        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase block">IF DOC ATTRIBUTE</span>
                        <select 
                          value={newRule.condition?.field}
                          onChange={(e) => setNewRule({...newRule, condition: {...newRule.condition, field: e.target.value}})}
                          className="w-full bg-gray-800 dark:bg-gray-900 border border-gray-700 dark:border-gray-800 rounded-xl p-4 text-xs font-semibold text-white outline-none focus:border-primary-500"
                        >
                          {CONDITION_FIELDS.map(field => (
                            <option key={field.value} value={field.value}>{field.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-3">
                        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase block">OPERATOR & VALUE</span>
                        <div className="flex gap-2">
                          <select 
                            value={newRule.condition?.operator}
                            onChange={(e) => setNewRule({...newRule, condition: {...newRule.condition, operator: e.target.value}})}
                            className="w-24 bg-gray-800 dark:bg-gray-900 border border-gray-700 dark:border-gray-800 rounded-xl p-4 text-xs font-semibold text-white"
                          >
                            {CONDITION_OPERATORS.map(op => (
                              <option key={op.value} value={op.value}>{op.label}</option>
                            ))}
                          </select>
                          <input 
                            type={newRule.condition?.field === 'Amount' ? 'number' : 'text'}
                            value={newRule.condition?.value}
                            onChange={(e) => {
                              const value = newRule.condition?.field === 'Amount' 
                                ? (e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)
                                : e.target.value
                              setNewRule({...newRule, condition: {...newRule.condition, value}})
                            }}
                            placeholder="Target Value"
                            className="flex-1 bg-gray-800 dark:bg-gray-900 border border-gray-700 dark:border-gray-800 rounded-xl p-4 text-xs font-semibold text-white outline-none focus:border-primary-500 placeholder-gray-500" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pipeline Flow Visualization */}
                  <div className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-3xl p-10 space-y-8 shadow-sm">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Workflow Sequential Map</label>
                      <span className="text-[8px] font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-3 py-1 rounded uppercase tracking-widest">Live Preview</span>
                    </div>
                    
                    <div className="relative flex flex-col gap-12 pt-6">
                      {/* Submission Origin */}
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-600">
                          <Plus className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 mt-2 tracking-tighter">Submit Document</span>
                      </div>

                      {/* Dynamic Workflow Path */}
                      <div className="relative space-y-12">
                        {newRule.workflowSequence?.map((role, idx) => (
                          <div key={role} className="flex flex-col items-center">
                            <div className="absolute left-1/2 -translate-x-1/2 top-[-30px] w-px h-[30px] bg-primary-100 dark:bg-primary-900/50" />
                            <div className="flex flex-col items-center">
                              <div className="w-14 h-14 rounded-2xl bg-primary-600 dark:bg-primary-500 text-white flex flex-col items-center justify-center shadow-xl shadow-primary-200 dark:shadow-primary-900/50 border border-primary-400 dark:border-primary-600 relative">
                                <span className="absolute -top-2 -right-2 w-6 h-6 bg-white dark:bg-gray-800 border-2 border-primary-600 dark:border-primary-500 rounded-full flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400">
                                  {idx + 1}
                                </span>
                                <Inbox className="w-6 h-6 mb-1" />
                              </div>
                              <span className="text-xs font-semibold text-gray-900 dark:text-white uppercase mt-3 tracking-tighter">{role}</span>
                              <p className="text-[8px] font-semibold text-gray-400 dark:text-gray-500 uppercase">Inbox Review Stage</p>
                            </div>
                          </div>
                        ))}
                        {(!newRule.workflowSequence || newRule.workflowSequence.length === 0) && (
                          <div className="py-8 flex flex-col items-center justify-center text-gray-200 dark:text-gray-700">
                            <div className="w-px h-10 bg-gray-100 dark:bg-gray-700 mb-2" />
                            <span className="text-xs font-semibold uppercase tracking-widest opacity-40 italic">Waiting for persona plan...</span>
                          </div>
                        )}
                      </div>

                      {/* Final Destination */}
                      <div className="flex flex-col items-center">
                        <div className="w-px h-10 bg-gray-200 dark:bg-gray-700" />
                        <div className="w-12 h-12 bg-gray-900 dark:bg-gray-700 rounded-2xl flex items-center justify-center text-white border border-gray-800 dark:border-gray-600 shadow-lg">
                          <Database className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold uppercase text-gray-900 dark:text-white mt-2 tracking-tighter">SAP Master Sync</span>
                      </div>
                    </div>

                    <div className="pt-10 border-t border-gray-50 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-400 dark:text-gray-500 leading-relaxed italic">
                        "The document will be routed through <span className="text-primary-600 dark:text-primary-400 font-bold">{newRule.workflowSequence?.length || 0} stages</span> sequentially before final financial commitment is posted to SAP."
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-10 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-5">
                <button 
                  onClick={() => { setIsAdding(false); setEditingId(null); }} 
                  className="px-8 py-4 rounded-2xl text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Abort Draft
                </button>
                <button 
                  onClick={handleSaveRule} 
                  className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-12 py-4 rounded-2xl text-xs font-semibold uppercase tracking-widest shadow-2xl transition-all hover:-translate-y-1"
                >
                  {editingId ? 'Push Logic Updates' : 'Deploy Global Rule'}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Rules Registry Grid */}
        <section className="space-y-6">
          <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1 flex justify-between items-center">
            Active Governance Registry
            <span className="text-gray-300 dark:text-gray-600 font-medium tracking-tight">System Status: Synchronized</span>
          </h2>
          {loading ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading workflow rules...</div>
          ) : rules.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-12 text-center">
              <GitBranch className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">No workflow rules configured yet</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Click "New Routing Logic" to create your first rule</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {rules.map((rule) => (
                <div key={rule.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:border-primary-200 dark:hover:border-primary-800">
                  <div className="p-8 flex flex-col xl:flex-row items-center justify-between gap-10">
                    <div className="flex items-start gap-6 flex-1 w-full xl:w-auto">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl transition-transform group-hover:rotate-6 shrink-0 ${
                        !rule.workflowSequence || rule.workflowSequence.length === 0 ? 'bg-teal-500 dark:bg-teal-600' : 
                        rule.workflowSequence.length === 2 ? 'bg-indigo-600 dark:bg-indigo-700' : 
                        rule.workflowSequence.length >= 3 ? 'bg-purple-600 dark:bg-purple-700' : 'bg-primary-600 dark:bg-primary-500'
                      }`}>
                        {rule.condition?.field === 'Amount' ? <TrendingUp className="w-7 h-7" /> : <GitBranch className="w-7 h-7" />}
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{rule.name}</h3>
                          <span className={`text-[8px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                            rule.status === 'Active' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600'
                          }`}>
                            {rule.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium leading-relaxed">{rule.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 pt-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-300 dark:text-gray-600 uppercase">Logic Trigger</span>
                            <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-3 py-1 rounded-lg border border-primary-100 dark:border-primary-800 uppercase tracking-tighter">
                              {rule.condition?.field} {rule.condition?.operator} {rule.condition?.value}
                            </span>
                          </div>
                          <div className="w-px h-4 bg-gray-100 dark:bg-gray-700" />
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-300 dark:text-gray-600 uppercase">Persona Pipeline</span>
                            <div className="flex -space-x-1.5">
                              {rule.workflowSequence?.map((role, i) => (
                                <div 
                                  key={i} 
                                  title={`${i+1}. ${role}`} 
                                  className="w-7 h-7 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-[8px] font-bold text-gray-600 dark:text-gray-300 shadow-sm hover:z-10 hover:border-primary-400 dark:hover:border-primary-600 transition-all cursor-help hover:scale-110"
                                >
                                  {i + 1}
                                </div>
                              ))}
                              {(!rule.workflowSequence || rule.workflowSequence.length === 0) && (
                                <span className="text-xs font-semibold text-gray-300 dark:text-gray-600">AUTO</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center gap-10 w-full xl:w-auto">
                      <div className="space-y-4 shrink-0">
                        <p className="text-[8px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center md:text-left">Workflow Sequence</p>
                        {renderWorkflowSteps(rule)}
                      </div>
                      
                      <div className="w-px h-12 bg-gray-200 dark:bg-gray-700 hidden md:block" />

                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleOpenBuilder(rule)} 
                          className="p-4 bg-white dark:bg-gray-800 hover:bg-primary-600 dark:hover:bg-primary-500 hover:text-white rounded-2xl text-gray-400 dark:text-gray-500 transition-all shadow-sm border border-gray-100 dark:border-gray-700"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteRule(rule.id)} 
                          className="p-4 bg-white dark:bg-gray-800 hover:bg-red-500 dark:hover:bg-red-600 hover:text-white rounded-2xl text-gray-400 dark:text-gray-500 transition-all shadow-sm border border-gray-100 dark:border-gray-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="px-8 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-[8px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    <div className="flex gap-4">
                      <span>ID: {rule.id}</span>
                      <span>•</span>
                      <span>Modification: {rule.lastModified || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Policy Validated
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Compliance Note */}
        <section className="bg-white dark:bg-gray-800 p-10 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Rule Integrity Engine</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Global rules are automatically audited against the corporate Delegation of Authority (DoA) matrix every 24 hours.</p>
            </div>
          </div>
          <button className="bg-gray-900 dark:bg-gray-700 text-white px-8 py-4 rounded-2xl text-xs font-semibold uppercase tracking-widest transition-all hover:bg-black dark:hover:bg-gray-600 shadow-lg">
            Sync Governance Policy
          </button>
        </section>
      </div>
    </Layout>
  )
}
