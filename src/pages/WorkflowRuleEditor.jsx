import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { GitBranch, Inbox, Database, Activity } from 'lucide-react'
import axios from '../utils/axios'
import Layout from '../components/Layout'

const WORKFLOW_ROLES = [
  'Requestor',
  'Approver',
  'Procurement Admin',
  'Finance',
  'Finance Manager',
  'System Admin',
]

const CONDITION_FIELDS = [
  { value: 'Amount', label: 'Amount (Transactional)' },
  { value: 'Company', label: 'Company Code (Entity)' },
  { value: 'Category', label: 'Material Category' },
  { value: 'Vendor', label: 'Vendor Master ID' },
]

const CONDITION_OPERATORS = [
  { value: '>', label: '>' },
  { value: '<', label: '<' },
  { value: '==', label: '==' },
  { value: 'Contains', label: '~' },
]

export default function WorkflowRuleEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [rule, setRule] = useState({
    name: '',
    description: '',
    condition: { field: 'Amount', operator: '>', value: 0 },
    workflowSequence: [],
    status: 'Active',
  })

  useEffect(() => {
    if (isEdit) {
      loadRule()
    } else {
      setLoading(false)
    }
  }, [isEdit])

  const loadRule = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`/api/v1/workflow-rules/${id}`)
      const r = res.data
      let condition = r.condition
      if (typeof condition === 'string') {
        try {
          condition = JSON.parse(condition)
        } catch {
          condition = { field: 'Amount', operator: '>', value: 0 }
        }
      }
      let workflowSequence = r.workflow_sequence || r.workflowSequence || []
      if (typeof workflowSequence === 'string') {
        try {
          workflowSequence = JSON.parse(workflowSequence)
        } catch {
          workflowSequence = []
        }
      }
      setRule({
        name: r.name || '',
        description: r.description || '',
        condition,
        workflowSequence,
        status: r.status || 'Active',
      })
    } catch (e) {
      console.error('Failed to load workflow rule', e)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!rule.name) return
    setSaving(true)
    try {
      const payload = {
        name: rule.name,
        description: rule.description || 'Standard routing logic for document lifecycle.',
        condition: JSON.stringify(rule.condition),
        workflow_sequence: JSON.stringify(rule.workflowSequence || []),
        status: rule.status || 'Active',
      }
      if (isEdit) {
        await axios.put(`/api/v1/workflow-rules/${id}`, payload)
      } else {
        await axios.post('/api/v1/workflow-rules', payload)
      }
      navigate('/business-rules')
    } catch (e) {
      console.error('Failed to save workflow rule', e)
      setSaving(false)
    }
  }

  const addToSequence = (role) => {
    if (!rule.workflowSequence.includes(role)) {
      setRule((prev) => ({ ...prev, workflowSequence: [...prev.workflowSequence, role] }))
    }
  }

  const removeFromSequence = (index) => {
    setRule((prev) => {
      const updated = [...prev.workflowSequence]
      updated.splice(index, 1)
      return { ...prev, workflowSequence: updated }
    })
  }

  if (loading) {
    return (
      <Layout>
        <div className="p-8 text-gray-500 dark:text-gray-400">Loading workflow rule...</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-600 dark:bg-primary-500 rounded-xl text-white shadow-lg shadow-primary-200 dark:shadow-primary-900/50">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                {isEdit ? 'Refine Routing Rule' : 'New Workflow Sequence'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Orchestrate exactly which personas handle the document in sequence.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/business-rules')}
            className="px-4 py-2 rounded-2xl text-xs font-semibold uppercase text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600"
          >
            Back to Governance Orchestrator
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 border-2 border-primary-600/10 dark:border-primary-500/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-600/10 rounded-full" />

          <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-primary-600 dark:bg-primary-500 rounded-full" />
                  <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    Rule Identity
                  </span>
                </div>
                <input
                  type="text"
                  value={rule.name}
                  onChange={(e) => setRule({ ...rule, name: e.target.value })}
                  placeholder="Rule Display Name (e.g. Marketing PR Sequence)"
                  className="w-full bg-gray-50 dark:bg-gray-700 border-2 border-transparent rounded-2xl p-4 text-sm font-semibold outline-none focus:border-primary-100 dark:focus:border-primary-900/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
                <textarea
                  value={rule.description}
                  onChange={(e) => setRule({ ...rule, description: e.target.value })}
                  placeholder="Provide context for this workflow logic..."
                  rows={3}
                  className="w-full bg-gray-50 dark:bg-gray-700 border-2 border-transparent rounded-2xl p-4 text-sm outline-none focus:border-primary-100 dark:focus:border-primary-900/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-primary-600 dark:bg-primary-500 rounded-full" />
                  <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    Persona Pipeline Plan
                  </span>
                </div>

                <div className groom>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase">
                        Available Personas
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {WORKFLOW_ROLES.map((role) => {
                          const selected = rule.workflowSequence.includes(role)
                          return (
                            <button
                              key={role}
                              type="button"
                              onClick={() => addToSequence(role)}
                              disabled={selected}
                              className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-widest border-2 transition-all ${
                                selected
                                  ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                  : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-primary-300 dark:hover:border-primary-600'
                              }`}
                            >
                              {role}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-6 border-2 border-dashed border-gray-200 dark:border-gray-700 space-y-3">
                      <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase">
                        Workflow Sequence
                      </p>
                      <div className="space-y-3">
                        {rule.workflowSequence.map((role, index) => (
                          <div
                            key={`${role}-${index}`}
                            className="flex items-center gap-4 bg-white dark:bg-gray-800 p-3 rounded-2xl border border-primary-100 dark:border-primary-900/50 shadow-sm"
                          >
                            <div className="w-7 h-7 bg-primary-600 dark:bg-primary-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            <span className="flex-1 text-xs font-semibold text-gray-900 dark:text-white uppercase">
                              {role}
                            </span>
                            <button
                              onClick={() => removeFromSequence(index)}
                              className="px-2 py-1 text-xs text-gray-400 hover:text-red-500"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        {rule.workflowSequence.length === 0 && (
                          <div className="py-8 text-center text-xs text-gray-400 dark:text-gray-600">
                            No personas planned. Tap a persona to add them to the sequence.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-900 dark:bg-gray-950 text-white rounded-3xl p-6 space-y-6 relative overflow-hidden">
                <Activity className="absolute -right-8 -top-8 w-40 h-40 opacity-5" />
                <span className="text-xs font-semibold text-primary-400 uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Execution Trigger
                </span>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase block">IF DOC ATTRIBUTE</span>
                    <select
                      value={rule.condition?.field}
                      onChange={(e) =>
                        setRule((prev) => ({
                          ...prev,
                          condition: { ...prev.condition, field: e.target.value },
                        }))
                      }
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-xs font-semibold"
                    >
                      {CONDITION_FIELDS.map((field) => (
                        <option key={field.value} value={field.value}>
                          {field.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase block">
                      OPERATOR & VALUE
                    </span>
                    <div className="flex gap-2">
                      <select
                        value={rule.condition?.operator}
                        onChange={(e) =>
                          setRule((prev) => ({
                            ...prev,
                            condition: { ...prev.condition, operator: e.target.value },
                          }))
                        }
                        className="w-24 bg-gray-800 border border-gray-700 rounded-xl p-3 text-xs font-semibold"
                      >
                        {CONDITION_OPERATORS.map((op) => (
                          <option key={op.value} value={op.value}>
                            {op.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type={rule.condition?.field === 'Amount' ? 'number' : 'text'}
                        value={rule.condition?.value}
                        onChange={(e) =>
                          setRule((prev) => ({
                            ...prev,
                            condition: {
                              ...prev.condition,
                              value:
                                prev.condition?.field === 'Amount'
                                  ? e.target.value === ''
                                    ? 0
                                    : Number(e.target.value)
                                  : e.target.value,
                            },
                          }))
                        }
                        placeholder="Target Value"
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-xl p-3 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-3xl p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    Workflow Preview
                  </span>
                </div>

                <div className="relative space-y-8 pt-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                      <span className="text-xs font-semibold">Start</span>
                    </div>
                    <span className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 mt-2">
                      Submit Document
                    </span>
                  </div>

                  <div className="relative space-y-8">
                    {rule.workflowSequence.map((role, idx) => (
                      <div key={`${role}-${idx}`} className="flex flex-col items-center">
                        <div className="w-px h-6 bg-primary-100 dark:bg-primary-900/40 mb-1" />
                        <div className="w-12 h-12 rounded-2xl bg-primary-600 dark:bg-primary-500 text-white flex flex-col items-center justify-center shadow-lg border border-primary-400 dark:border-primary-600">
                          <span className="text-xs font-semibold">{idx + 1}</span>
                        </div>
                        <span className="text-xs font-semibold text-gray-900 dark:text-white mt-2 uppercase">
                          {role}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase">
                          Review & Approve
                        </span>
                      </div>
                    ))}
                    {rule.workflowSequence.length === 0 && (
                      <div className="py-6 text-center text-xs text-gray-400 dark:text-gray-600">
                        No personas configured yet. Add personas to see the route.
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mb-1" />
                    <div className="w-10 h-10 bg-gray-900 dark:bg-gray-700 rounded-xl flex items-center justify-center text-white border border-gray-800 dark:border-gray-600">
                      <Database className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold uppercase text-gray-900 dark:text-white mt-2">
                      SAP Posting
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/business-rules')}
              className="px-6 py-3 rounded-2xl text-xs font-semibold uppercase text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-10 py-3 rounded-2xl text-xs font-semibold uppercase tracking-widest shadow-lg disabled:opacity-60"
            >
              {isEdit ? 'Save Changes' : 'Deploy Rule'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}

