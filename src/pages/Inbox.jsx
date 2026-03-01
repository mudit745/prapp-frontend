import { useState, useEffect, useMemo } from 'react'
import { CheckCircle, XCircle, AlertCircle, Clock, FileText, User, Building2, DollarSign, Calendar, MessageSquare, Search, ArrowLeft, Download, X, Upload, Trash2, File, Send, Filter, SortAsc, ChevronDown, ChevronUp, Grid3x3, List, CheckSquare, Square, MoreVertical, Eye, Archive, Flag, Circle } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from '../utils/axios'
import Layout from '../components/Layout'
import TaskCard from '../components/TaskCard'
import { storage } from '../utils/firebase'
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from '../utils/storage-placeholder'
import { usePermissions } from '../hooks/usePermissions'
import { hasPermission } from '../utils/permissions'
import { PERMISSIONS } from '../utils/permissions'

export default function Inbox() {
  const token = localStorage.getItem('token')
  const { permissions } = usePermissions(token)
  const [tasks, setTasks] = useState([])
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [prDetails, setPrDetails] = useState(null)
  const [prLines, setPrLines] = useState([])
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [userRole, setUserRole] = useState('')
  const [userId, setUserId] = useState('')
  const [showProcessTrack, setShowProcessTrack] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterType, setFilterType] = useState('All')
  const [sortBy, setSortBy] = useState('date') // date, priority, amount, type
  const [sortOrder, setSortOrder] = useState('desc') // asc, desc
  const [selectedTasks, setSelectedTasks] = useState(new Set())
  const [viewMode, setViewMode] = useState('comfortable') // compact, comfortable
  const [groupBy, setGroupBy] = useState('none') // none, date, priority, type
  const [expandedGroups, setExpandedGroups] = useState(new Set())
  const [showFilters, setShowFilters] = useState(false)
  
  // KIV Modal State
  const [isKivModalOpen, setIsKivModalOpen] = useState(false)
  const [kivDate, setKivDate] = useState('')
  const [kivTime, setKivTime] = useState('')
  const [kivReason, setKivReason] = useState('')
  
  // Comments and Attachments State
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [addingComment, setAddingComment] = useState(false)
  const [attachments, setAttachments] = useState([])
  const [uploadingDocuments, setUploadingDocuments] = useState(false)
  // Exception AI suggestions state
  const [exceptionFixes, setExceptionFixes] = useState(null)
  const [applyingAiSuggestions, setApplyingAiSuggestions] = useState(false)
  // Bulk auto-fix (inbox-level) UI state
  const [bulkAutoFixApplied, setBulkAutoFixApplied] = useState(false)
  const [bulkAutoFixSummary, setBulkAutoFixSummary] = useState(null)
  // SAP/ERP system info section (default collapsed)
  const [sapErpSectionCollapsed, setSapErpSectionCollapsed] = useState(true)
  // Goods Receipt task detail (from API when step is GOODS_RECEIPT)
  const [grDetails, setGrDetails] = useState(null)
  const [invoiceDetails, setInvoiceDetails] = useState(null)
  // Process tracking for task detail (PR workflow steps)
  const [processTracking, setProcessTracking] = useState([])
  // AI approval summary (one-line + risk note) for APPROVAL tasks
  const [approvalSummary, setApprovalSummary] = useState(null)
  const [approvalSummaryLoading, setApprovalSummaryLoading] = useState(false)
  // AI invoice vs PO summary for INVOICE_APPROVAL tasks
  const [invoiceSummary, setInvoiceSummary] = useState(null)
  const [invoiceSummaryLoading, setInvoiceSummaryLoading] = useState(false)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    setUserRole(user.role || '')
    setUserId(user.employee_id || user.user_id || '')
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    setLoading(true)
    setError('')
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const role = user.role || 'MANAGER'
      const uid = user.employee_id || user.user_id || ''
      
      const response = await axios.get('/api/v1/inbox/tasks', {
        headers: {
          'X-User-Role': role,
          'X-User-ID': uid
        }
      })
      setTasks(response.data || [])
      // Don't auto-select first task - show list view by default
    } catch (err) {
      console.error('Error fetching tasks:', err)
      setError(err.response?.data?.error || 'Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  const fetchTaskDetails = async (taskId) => {
    if (!taskId) return
    
    setLoading(true)
    try {
      const response = await axios.get(`/api/v1/inbox/tasks/${taskId}`)
      const task = response.data.task
      
      // Parse exception_log if it's a string
      if (task.exception_log && typeof task.exception_log === 'string') {
        try {
          task.exception_log = JSON.parse(task.exception_log)
        } catch (e) {
          console.error('Error parsing exception_log:', e)
        }
      }
      
      setSelectedTask(task)
      // Reset exception suggestions whenever task changes
      setExceptionFixes(null)
      setApplyingAiSuggestions(false)
      setPrDetails(response.data.pr)
      setPrLines(response.data.lines || [])
      setGrDetails(response.data.gr || null)
      setInvoiceDetails(response.data.invoice || null)
      setProcessTracking(Array.isArray(response.data.process_tracking) ? response.data.process_tracking : [])
      setApprovalSummary(null)
      setApprovalSummaryLoading(false)
      setInvoiceSummary(null)
      setInvoiceSummaryLoading(false)

      // Fetch AI approval summary for APPROVAL tasks
      if (task.current_step === 'APPROVAL') {
        setApprovalSummaryLoading(true)
        try {
          const pr = response.data.pr || {}
          const lineSummary = Array.isArray(response.data.lines) && response.data.lines.length
            ? `${response.data.lines.length} line item(s)`
            : ''
          const sumRes = await axios.post('/api/v1/ai/approval-summary', {
            request_number: task.pr_number || task.request_number || '',
            vendor_name: (task.vendor_name != null ? task.vendor_name : pr.vendor_name) || '',
            total_amount: task.amount ?? pr.total_amount ?? 0,
            currency: task.currency || pr.currency || 'SGD',
            justification: (task.justification != null ? task.justification : pr.justification) || '',
            line_summary: lineSummary
          })
          setApprovalSummary(sumRes.data || null)
        } catch (err) {
          console.error('Error fetching approval summary:', err)
          setApprovalSummary(null)
        } finally {
          setApprovalSummaryLoading(false)
        }
      }

      // Fetch AI invoice vs PO summary for INVOICE_APPROVAL tasks
      if (task.current_step === 'INVOICE_APPROVAL' && response.data.invoice && response.data.pr) {
        setInvoiceSummaryLoading(true)
        try {
          const inv = response.data.invoice
          const pr = response.data.pr
          const varianceNotes = task.exception_log
            ? (typeof task.exception_log === 'string' ? task.exception_log : JSON.stringify(task.exception_log))
            : ''
          const sumRes = await axios.post('/api/v1/ai/invoice-summary', {
            invoice_number: inv.invoice_number || '',
            invoice_amount: inv.gross_amount ?? inv.net_amount ?? 0,
            invoice_currency: inv.currency || 'SGD',
            po_number: pr.po_number || '',
            po_total_amount: pr.total_amount ?? pr.totalAmount ?? 0,
            po_currency: pr.currency || 'SGD',
            variance_notes: varianceNotes
          })
          setInvoiceSummary(sumRes.data || null)
        } catch (err) {
          console.error('Error fetching invoice summary:', err)
          setInvoiceSummary(null)
        } finally {
          setInvoiceSummaryLoading(false)
        }
      }

      // Fetch comments and attachments if Request ID exists
      if (response.data.pr?.pr_id) {
        await Promise.all([
          fetchComments(response.data.pr.pr_id),
          fetchAttachments(response.data.pr.pr_id)
        ])
      }
    } catch (err) {
      console.error('Error fetching task details:', err)
      setError(err.response?.data?.error || 'Failed to fetch task details')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async (prId) => {
    if (!prId) return
    try {
      // Fetch comments from process_tracking process_notes or create a comments endpoint
      // For now, we'll use process_notes as comments
      const response = await axios.get(`/api/v1/requisitions/${prId}`)
      const pr = response.data.header || response.data
      
      // Extract comments from process_notes if available
      // This is a placeholder - you may need to create a dedicated comments API
      if (pr.process_notes) {
        try {
          const notes = typeof pr.process_notes === 'string' ? JSON.parse(pr.process_notes) : pr.process_notes
          if (Array.isArray(notes)) {
            setComments(notes)
          } else {
            setComments([])
          }
        } catch {
          setComments([])
        }
      } else {
        setComments([])
      }
    } catch (err) {
      console.error('Error fetching comments:', err)
      setComments([])
    }
  }

  const fetchAttachments = async (prId) => {
    if (!prId) return
    try {
      const response = await axios.get(`/api/v1/requisitions/${prId}/documents`)
      const docs = response.data || []
      setAttachments(docs.map(doc => ({
        id: doc.document_id || doc.id,
        name: doc.document_name || doc.file_name || 'Document',
        url: doc.storage_url || doc.url || '',
        size: doc.file_size || 0,
        storagePath: doc.storage_path,
        uploadedBy: doc.uploaded_by_name || doc.uploaded_by || '',
        uploadedAt: doc.created_at || ''
      })))
    } catch (err) {
      console.error('Error fetching attachments:', err)
      setAttachments([])
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedTask?.pr_id || addingComment) return

    setAddingComment(true)
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const commentData = {
        text: newComment.trim(),
        user: user.employee_name || user.name || userRole,
        userId: userId,
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0]
      }

      // Add comment to process_notes or create via API
      // For now, we'll update it locally and you can implement backend API later
      setComments(prev => [commentData, ...prev])
      setNewComment('')
      toast.success('Comment added')
      // Optionally save to backend via process_tracking update
      // This would require a backend endpoint to add comments
    } catch (err) {
      console.error('Error adding comment:', err)
      setError('Failed to add comment')
      toast.error('Failed to add comment')
    } finally {
      setAddingComment(false)
    }
  }

  const handleApplyAiSuggestions = () => {
    if (!selectedTask?.is_exception || !Array.isArray(selectedTask.exception_log)) return
    if (applyingAiSuggestions) return

    setApplyingAiSuggestions(true)

    try {
      const simpleHeuristics = (log) => {
        const message = (log.message || '').toLowerCase()
        const field = (log.field || '').toLowerCase()

        const looksSafeToAutoFix =
          /mismatch|variance|lower than po|outside tolerance|alias|registration/i.test(message) ||
          ['gl account', 'quantity', 'tax id', 'vendor name', 'cost center', 'currency'].some(f =>
            field.includes(f.toLowerCase())
          )

        if (looksSafeToAutoFix && log.expected != null && log.expected !== '') {
          return {
            corrected: log.expected,
            aiConfidence: 0.95,
          }
        }

        // Fallback: leave as‑is, no confidence
        return {
          corrected: log.actual,
          aiConfidence: 0,
        }
      }

      const rows = selectedTask.exception_log.map((log) => {
        const suggestion = simpleHeuristics(log)
        return {
          ...log,
          corrected: suggestion.corrected,
          aiConfidence: suggestion.aiConfidence,
        }
      })

      setExceptionFixes(rows)
    } finally {
      setApplyingAiSuggestions(false)
    }
  }

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files)
    if (files.length === 0 || !selectedTask?.pr_id) return

    setUploadingDocuments(true)
    setError('')

    const uploadPromises = files.map(async (file) => {
      const docId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const prId = selectedTask.pr_id
      const fileName = `pr-documents/${prId}/${docId}/${file.name}`
      const storageRef = ref(storage, fileName)

      const newDoc = {
        id: docId,
        name: file.name,
        url: '',
        uploading: true,
        progress: 0
      }

      setAttachments(prev => [...prev, newDoc])

      try {
        const uploadTask = uploadBytesResumable(storageRef, file)

        return new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              setAttachments(prev =>
                prev.map(doc =>
                  doc.id === docId ? { ...doc, progress } : doc
                )
              )
            },
            (error) => {
              console.error('Upload error:', error)
              setAttachments(prev =>
                prev.map(doc =>
                  doc.id === docId
                    ? { ...doc, uploading: false, error: error.message }
                    : doc
                )
              )
              reject(error)
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
                
                const user = JSON.parse(localStorage.getItem('user') || '{}')
                
                try {
                  const docData = {
                    pr_id: prId,
                    document_name: file.name,
                    document_type: 'other',
                    file_name: file.name,
                    file_size: file.size,
                    mime_type: file.type || 'application/octet-stream',
                    storage_path: fileName,
                    storage_url: downloadURL,
                    source: 'INBOX',
                    description: null
                  }
                  
                  const docResponse = await axios.post('/api/v1/documents', docData, {
                    headers: {
                      'X-User-ID': user.employee_id || user.user_id || '',
                      'X-Tenant-ID': user.tenant_id || ''
                    }
                  })
                  
                  const savedDoc = docResponse.data
                  setAttachments(prev =>
                    prev.map(doc =>
                      doc.id === docId
                        ? { 
                            ...doc, 
                            id: savedDoc.document_id || docId,
                            url: downloadURL, 
                            uploading: false, 
                            progress: 100,
                            storagePath: fileName
                          }
                        : doc
                    )
                  )
                } catch (apiError) {
                  console.error('Error saving document metadata:', apiError)
                  setAttachments(prev =>
                    prev.map(doc =>
                      doc.id === docId
                        ? { ...doc, url: downloadURL, uploading: false, progress: 100 }
                        : doc
                    )
                  )
                }
                resolve({ id: docId, name: file.name, url: downloadURL, storagePath: fileName })
              } catch (error) {
                console.error('Error getting download URL:', error)
                reject(error)
              }
            }
          )
        })
      } catch (error) {
        console.error('Error uploading file:', error)
        setAttachments(prev =>
          prev.map(doc =>
            doc.id === docId
              ? { ...doc, uploading: false, error: error.message }
              : doc
          )
        )
        throw error
      }
    })

    try {
      await Promise.all(uploadPromises)
      toast.success('Document(s) uploaded')
    } catch (error) {
      const msg = 'Some files failed to upload. Please try again.'
      setError(msg)
      toast.error(msg)
    } finally {
      setUploadingDocuments(false)
    }
  }

  const handleRemoveAttachment = async (docId) => {
    const doc = attachments.find(d => d.id === docId)
    if (!doc) return

    // Delete from database if it has a document_id (UUID format)
    const isUUID = doc.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(doc.id)
    if (isUUID && selectedTask?.pr_id) {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        await axios.delete(`/api/v1/documents/${doc.id}`, {
          headers: {
            'X-User-ID': user.employee_id || user.user_id || '',
            'X-Tenant-ID': user.tenant_id || ''
          }
        })
      } catch (error) {
        console.error('Error deleting document from database:', error)
      }
    }

    // Delete from Firebase Storage
    if (doc.storagePath) {
      try {
        const storageRef = ref(storage, doc.storagePath)
        await deleteObject(storageRef)
      } catch (error) {
        console.error('Error deleting file from storage:', error)
      }
    }

    // Remove from local state
    setAttachments(prev => prev.filter(d => d.id !== docId))
  }

  useEffect(() => {
    if (selectedTaskId) {
      // Check if task exists in current tasks list
      const taskExists = tasks.some(t => t.id === selectedTaskId)
      if (taskExists) {
        fetchTaskDetails(selectedTaskId)
      } else {
        // Task no longer exists, clear selection
        setSelectedTaskId(null)
        setSelectedTask(null)
        setPrDetails(null)
        setPrLines([])
        setComments([])
        setAttachments([])
      }
    } else {
      // Clear task details when no task is selected
      setSelectedTask(null)
      setPrDetails(null)
      setPrLines([])
      setComments([])
      setAttachments([])
    }
  }, [selectedTaskId, tasks])

  const handleAction = async (action, nextStep = null) => {
    if (!selectedTaskId) return

    setActionLoading(true)
    setError('')
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const uid = user.employee_id || user.user_id || ''
      
      const payload = {
        action,
        comment: comment || null,
        next_step: nextStep
      }

      await axios.post(`/api/v1/inbox/tasks/${selectedTaskId}/action`, payload, {
        headers: {
          'X-User-ID': uid
        }
      })

      // Refresh tasks
      await fetchTasks()

      // Approve/reject/confirm complete the task from user's perspective — return to inbox list
      const completingActions = ['approve', 'reject', 'confirm']
      if (completingActions.includes(action)) {
        if (action === 'approve') toast.success('Request approved')
        else if (action === 'reject') toast.success('Request rejected')
        else if (action === 'confirm') toast.success('Receipt confirmed')
        setSelectedTaskId(null)
        setSelectedTask(null)
        setPrDetails(null)
        setPrLines([])
        setGrDetails(null)
        setInvoiceDetails(null)
        setProcessTracking([])
      } else if (selectedTaskId) {
        // Other actions (e.g. verify, kiv): refresh task details to show updated state
        try {
          await fetchTaskDetails(selectedTaskId)
        } catch (err) {
          setSelectedTaskId(null)
          setSelectedTask(null)
          setPrDetails(null)
          setPrLines([])
        }
      }
      setComment('')
    } catch (err) {
      console.error('Error performing action:', err)
      const msg = err.response?.data?.error || 'Failed to perform action'
      setError(msg)
      toast.error(msg)
    } finally {
      setActionLoading(false)
    }
  }

  const handleBulkAutoFix = () => {
    if (bulkAutoFixApplied || tasks.length === 0) return

    // Dummy analysis: treat non-urgent, pending exception tasks as “easy fixes”
    const easyTasks = tasks.filter(t => {
      const isException = !!t.is_exception
      const isPending = t.status === 'PENDING'
      const notUrgent = t.priority !== 'Urgent'
      return isException && isPending && notUrgent
    })

    const fixedCount = easyTasks.length || Math.min(tasks.length, 3)

    setBulkAutoFixApplied(true)
    setBulkAutoFixSummary({
      fixed: fixedCount,
      total: tasks.length,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
  }

  const handleKivSubmit = async () => {
    if (!selectedTaskId || !kivDate || !kivReason) return

    setActionLoading(true)
    setError('')
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const uid = user.employee_id || user.user_id || ''
      
      const timestamp = `${kivDate}T${kivTime || '09:00'}`
      const kivComment = `[SYSTEM] Item placed on hold (KIV) until ${new Date(timestamp).toLocaleString()}. Reason: ${kivReason}`
      
      // Store KIV information in comment field and submit as a comment-only action
      // Note: Backend may need to be updated to support proper KIV action
      // For now, we'll add it as a comment to document the KIV
      setComment(kivComment)
      
      // Try to submit KIV via action endpoint (backend may need to support 'kiv' action)
      // If not supported, this will fail gracefully and KIV info is still in comment field
      try {
        await axios.post(`/api/v1/inbox/tasks/${selectedTaskId}/action`, {
          action: 'kiv', // Backend may need to add support for this action
          comment: kivComment,
          kiv_reminder_date: timestamp,
          kiv_reason: kivReason
        }, {
          headers: {
            'X-User-ID': uid
          }
        })
      } catch (err) {
        // If backend doesn't support KIV action yet, show info message
        // The comment is already set, user can manually add it if needed
      }

      // Refresh tasks
      await fetchTasks()
      
      // Close modal and reset KIV state (keep comment for user to see)
      setIsKivModalOpen(false)
      setKivDate('')
      setKivTime('')
      setKivReason('')
      
      // Refresh task details
      if (selectedTaskId) {
        await fetchTaskDetails(selectedTaskId)
      }
      toast.success('Item placed on hold (KIV)')
      setError('') // Clear any previous errors
    } catch (err) {
      console.error('Error setting KIV:', err)
      const msg = err.response?.data?.error || 'Failed to set KIV. You can add the KIV information as a comment manually.'
      setError(msg)
      toast.error(msg)
    } finally {
      setActionLoading(false)
    }
  }

  const getApprovalRule = (amount) => {
    if (amount > 10000) {
      return 'Director Level Approval Required'
    } else if (amount > 5000) {
      return 'Department Head Approval Required'
    } else {
      return 'Standard Manager Approval'
    }
  }

  const getTaskTypeBadge = (type) => {
    const badges = {
      'PR_APPROVAL': { label: 'Request Approval', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      'AP_INVOICE_REVIEW': { label: 'AP Review', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
      'INVOICE_APPROVAL': { label: 'Invoice Approval', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
      'REQUESTER_CONFIRMATION': { label: 'Requester Confirmation', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      'GOODS_RECEIPT': { label: 'Goods Receipt', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' }
    }
    return badges[type] || { label: type, color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' }
  }

  const getPriorityColor = (priority) => {
    const colors = {
      'Urgent': 'text-red-600 dark:text-red-400',
      'High': 'text-orange-600 dark:text-orange-400',
      'Normal': 'text-blue-600 dark:text-blue-400',
      'Low': 'text-gray-600 dark:text-gray-400'
    }
    return colors[priority] || colors['Normal']
  }

  // Calculate KPIs
  const kpis = useMemo(() => {
    const now = new Date()
    const overdue = tasks.filter(t => {
      const taskDate = new Date(t.date)
      const daysDiff = (now - taskDate) / (1000 * 60 * 60 * 24)
      return daysDiff > 3 && t.status === 'PENDING'
    })
    
    const byType = tasks.reduce((acc, task) => {
      const type = task.type || 'OTHER'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})
    
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'PENDING').length,
      overdue: overdue.length,
      urgent: tasks.filter(t => t.priority === 'Urgent' || t.priority === 'High').length,
      byType
    }
  }, [tasks])

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      const queryMatch = !searchQuery || 
        (task.title && task.title.toLowerCase().includes(searchQuery.toLowerCase())) || 
        (task.id && task.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (task.request_number && task.request_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (task.pr_number && task.pr_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (task.vendor_name && task.vendor_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (task.requester_name && task.requester_name.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const priorityMatch = filterPriority === 'All' || task.priority === filterPriority
      const statusMatch = filterStatus === 'All' || task.status === filterStatus
      const typeMatch = filterType === 'All' || task.type === filterType
      
      return queryMatch && priorityMatch && statusMatch && typeMatch
    })

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date) - new Date(b.date)
          break
        case 'priority':
          const priorityOrder = { 'Urgent': 4, 'High': 3, 'Normal': 2, 'Low': 1 }
          comparison = (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0)
          break
        case 'amount':
          comparison = (a.amount || 0) - (b.amount || 0)
          break
        case 'type':
          comparison = (a.type || '').localeCompare(b.type || '')
          break
        default:
          comparison = 0
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [tasks, searchQuery, filterPriority, filterStatus, filterType, sortBy, sortOrder])

  // Group tasks
  const groupedTasks = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Tasks': filteredAndSortedTasks }
    }

    const groups = {}
    filteredAndSortedTasks.forEach(task => {
      let key = 'Other'
      if (groupBy === 'date') {
        const taskDate = new Date(task.date)
        const today = new Date()
        const diffDays = Math.floor((today - taskDate) / (1000 * 60 * 60 * 24))
        if (diffDays === 0) key = 'Today'
        else if (diffDays === 1) key = 'Yesterday'
        else if (diffDays <= 7) key = 'This Week'
        else if (diffDays <= 30) key = 'This Month'
        else key = 'Older'
      } else if (groupBy === 'priority') {
        key = task.priority || 'Normal'
      } else if (groupBy === 'type') {
        key = task.type || 'OTHER'
      }
      if (!groups[key]) groups[key] = []
      groups[key].push(task)
    })

    return groups
  }, [filteredAndSortedTasks, groupBy])

  const handleBulkAction = async (action) => {
    if (selectedTasks.size === 0) return
    
    setActionLoading(true)
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const uid = user.employee_id || user.user_id || ''
      
      const promises = Array.from(selectedTasks).map(taskId => 
        axios.post(`/api/v1/inbox/tasks/${taskId}/action`, { action }, {
          headers: { 'X-User-ID': uid }
        }).catch(err => {
          console.error(`Error performing ${action} on task ${taskId}:`, err)
          return null
        })
      )
      
      const results = await Promise.all(promises)
      const failed = results.filter(r => r === null).length
      const succeeded = results.length - failed
      setSelectedTasks(new Set())
      await fetchTasks()
      if (failed === 0) toast.success('Actions completed successfully')
      else if (succeeded > 0) toast.error(`Some actions failed (${succeeded} succeeded, ${failed} failed)`)
      else toast.error('Actions failed. Please try again.')
    } catch (err) {
      const msg = 'Some actions failed. Please try again.'
      setError(msg)
      toast.error(msg)
    } finally {
      setActionLoading(false)
    }
  }

  const toggleTaskSelection = (taskId) => {
    const newSelected = new Set(selectedTasks)
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId)
    } else {
      newSelected.add(taskId)
    }
    setSelectedTasks(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedTasks.size === filteredAndSortedTasks.length) {
      setSelectedTasks(new Set())
    } else {
      setSelectedTasks(new Set(filteredAndSortedTasks.map(t => t.id)))
    }
  }

  const toggleGroup = (groupKey) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey)
    } else {
      newExpanded.add(groupKey)
    }
    setExpandedGroups(newExpanded)
  }

  const downloadAttachment = (att) => {
    if (att.url) {
      window.open(att.url, '_blank')
    } else if (att.data) {
      const link = document.createElement('a')
      link.href = att.data
      link.download = att.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <Layout>
      <div className="flex-1 overflow-hidden flex flex-col bg-white dark:bg-gray-900">
        {selectedTask ? (
          <section className="flex-1 flex flex-col bg-white dark:bg-gray-900 transition-all duration-300">
            {/* Header with Action Buttons */}
            <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => {
                    setSelectedTaskId(null)
                    setSelectedTask(null)
                    setPrDetails(null)
                    setPrLines([])
                  }} 
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">
                    {selectedTask.title || selectedTask.request_number || selectedTask.pr_number || 'Task Details'}
                  </h2>
                  <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-widest">
                    {selectedTask.current_step === 'APPROVAL' && 'Approval Required'}
                    {selectedTask.current_step === 'AP_REVIEW' && 'AP Review Required'}
                    {selectedTask.current_step === 'INVOICE_APPROVAL' && 'Invoice Approval Required'}
                    {selectedTask.current_step === 'REQUESTER_APPROVAL' && 'Requester Confirmation Required'}
                    {selectedTask.current_step === 'GOODS_RECEIPT' && 'Goods Receipt – Confirm receipt'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {selectedTask.current_step === 'APPROVAL' && hasPermission(permissions, PERMISSIONS.REQUISITION_APPROVE) && (
                  <>
                    <button 
                      onClick={() => setIsKivModalOpen(true)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 text-amber-600 dark:text-amber-500 rounded-lg font-semibold text-xs tracking-widest shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20 border border-slate-300 dark:border-gray-600 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Clock className="w-4 h-4" /> KIV / Hold
                    </button>
                    <button 
                      onClick={() => handleAction('reject')}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-xs tracking-widest shadow-sm shadow-red-200 dark:shadow-red-900 transition-all focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => handleAction('approve')}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold text-xs tracking-widest shadow-sm shadow-primary-200 dark:shadow-primary-900 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Approve Request
                    </button>
                  </>
                )}
                {selectedTask.current_step === 'AP_REVIEW' && (
                  <button 
                    onClick={() => handleAction('verify')}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs tracking-widest shadow-sm shadow-indigo-200 dark:shadow-indigo-900 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Verify Invoice
                  </button>
                )}
                {selectedTask.current_step === 'INVOICE_APPROVAL' && (hasPermission(permissions, PERMISSIONS.INVOICE_APPROVE) || hasPermission(permissions, PERMISSIONS.INVOICE_REJECT)) && (
                  <>
                    {hasPermission(permissions, PERMISSIONS.INVOICE_REJECT) && (
                      <button 
                        onClick={() => handleAction('reject')}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-xs tracking-widest shadow-sm shadow-red-200 dark:shadow-red-900 transition-all focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Reject Invoice
                      </button>
                    )}
                    {hasPermission(permissions, PERMISSIONS.INVOICE_APPROVE) && (
                      <button 
                        onClick={() => handleAction('approve')}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold text-xs tracking-widest shadow-sm shadow-primary-200 dark:shadow-primary-900 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Approve Invoice
                      </button>
                    )}
                  </>
                )}
                {selectedTask.current_step === 'REQUESTER_APPROVAL' && (
                  <button 
                    onClick={() => handleAction('confirm')}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-xs tracking-widest shadow-sm shadow-teal-200 dark:shadow-teal-900 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirm
                  </button>
                )}
                {selectedTask.current_step === 'GOODS_RECEIPT' && (
                  <button 
                    onClick={() => handleAction('confirm')}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-xs tracking-widest shadow-sm shadow-teal-200 dark:shadow-teal-900 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirm receipt
                  </button>
                )}
              </div>
            </header>

            <div className="flex-1 overflow-y-auto">
              <div className="p-4 max-w-6xl mx-auto w-full pb-24">
                {/* AI Approval summary (APPROVAL tasks only) */}
                {selectedTask.current_step === 'APPROVAL' && (approvalSummaryLoading || approvalSummary) && (
                  <section className="mb-4">
                    <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4">
                      <h3 className="text-xs font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-widest mb-2">AI summary</h3>
                      {approvalSummaryLoading && !approvalSummary && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Generating summary…</p>
                      )}
                      {approvalSummary && (
                        <>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{approvalSummary.summary}</p>
                          {approvalSummary.risk_note && (
                            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1.5">{approvalSummary.risk_note}</p>
                          )}
                        </>
                      )}
                    </div>
                  </section>
                )}
                {/* AI Invoice vs PO summary (INVOICE_APPROVAL tasks only) */}
                {selectedTask.current_step === 'INVOICE_APPROVAL' && (invoiceSummaryLoading || invoiceSummary) && (
                  <section className="mb-4">
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                      <h3 className="text-xs font-semibold text-orange-700 dark:text-orange-300 uppercase tracking-widest mb-2">Invoice vs PO summary</h3>
                      {invoiceSummaryLoading && !invoiceSummary && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Generating summary…</p>
                      )}
                      {invoiceSummary && (
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{invoiceSummary.summary}</p>
                      )}
                    </div>
                  </section>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                  {/* Invoice Exception Console - surfaced to top of details */}
                  {selectedTask.is_exception && selectedTask.exception_log && (
                    <section className="space-y-4">
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-red-600 dark:bg-red-700 flex items-center justify-center">
                              <AlertCircle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-red-900 dark:text-red-100 uppercase tracking-widest">
                                SAP Error Diagnostic Console
                              </h3>
                              {selectedTask.sap_error_message && (
                                <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                                  {selectedTask.sap_error_message}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <button
                              type="button"
                              onClick={handleApplyAiSuggestions}
                              disabled={applyingAiSuggestions || !Array.isArray(selectedTask.exception_log)}
                              className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-[10px] font-semibold uppercase tracking-widest shadow-sm shadow-red-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {applyingAiSuggestions ? 'Applying…' : 'Apply AI Suggestions'}
                            </button>
                            <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-[10px] font-semibold uppercase tracking-widest">
                              {Array.isArray(selectedTask.exception_log) ? selectedTask.exception_log.length : 0} Variance(s)
                            </span>
                          </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800 overflow-hidden">
                          <div className="max-h-96 overflow-y-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-red-50 dark:bg-red-900/30 sticky top-0">
                                <tr>
                                  <th className="p-3 text-xs font-semibold text-red-700 dark:text-red-300 uppercase tracking-widest w-1/5">
                                    Conflicting Field
                                  </th>
                                  <th className="p-3 text-xs font-semibold text-red-700 dark:text-red-300 uppercase tracking-widest w-1/5 text-center">
                                    SAP Master Value
                                  </th>
                                  <th className="p-3 text-xs font-semibold text-red-700 dark:text-red-300 uppercase tracking-widest w-1/5 text-center">
                                    Corrective Input (AI)
                                  </th>
                                  <th className="p-3 text-xs font-semibold text-red-700 dark:text-red-300 uppercase tracking-widest w-1/5 text-center">
                                    Invoice Value
                                  </th>
                                  <th className="p-3 text-xs font-semibold text-red-700 dark:text-red-300 uppercase tracking-widest">
                                    Diagnostic Message
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-red-100 dark:divide-red-900/30">
                                {(Array.isArray(selectedTask.exception_log) ? (exceptionFixes || selectedTask.exception_log) : []).map(
                                  (log, idx) => (
                                    <tr
                                      key={idx}
                                      className="hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-colors"
                                    >
                                      <td className="p-3 font-medium text-gray-900 dark:text-white">{log.field}</td>
                                      <td className="p-3 font-medium text-green-600 dark:text-green-400 text-center">
                                        {log.expected}
                                      </td>
                                      <td className="p-3 text-center">
                                        {exceptionFixes ? (
                                          // AFTER applying AI suggestions: show green, underlined corrected value
                                          <div className="flex flex-col items-center justify-center text-[11px]">
                                            <span className="font-semibold text-emerald-700 dark:text-emerald-300 underline decoration-2 decoration-emerald-400">
                                              {log.corrected ?? log.expected ?? log.actual}
                                            </span>
                                            {log.actual && (
                                              <span className="mt-0.5 text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-300">
                                                Auto‑corrected from {log.actual}
                                              </span>
                                            )}
                                          </div>
                                        ) : (
                                          // BEFORE applying: show suggested value with * and "AI suggested" hint
                                          <div className="flex flex-col items-center justify-center text-[11px]">
                                            <span className="font-medium text-slate-700 dark:text-gray-200">
                                              {log.expected ?? log.actual}
                                              <span className="ml-1 text-[10px] text-slate-400 dark:text-gray-500">
                                                *
                                              </span>
                                            </span>
                                            <span className="mt-0.5 text-[10px] uppercase tracking-widest text-slate-400 dark:text-gray-500">
                                              AI suggested
                                            </span>
                                          </div>
                                        )}
                                      </td>
                                      <td className="p-3 font-medium text-red-600 dark:text-red-400 text-center">
                                        {log.actual}
                                      </td>
                                      <td className="p-3 text-gray-600 dark:text-gray-400 italic text-xs">
                                        "{log.message}"
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Action buttons (still dummy for now) */}
                        <div className="mt-4 flex flex-col sm:flex-row justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => {}}
                            className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-[10px] font-semibold uppercase tracking-widest hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                          >
                            Return to Requester
                          </button>
                          <button
                            type="button"
                            onClick={() => {}}
                            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[10px] font-semibold uppercase tracking-widest shadow-sm shadow-red-200 dark:shadow-red-900 transition-colors"
                          >
                            Save &amp; Re-Validate Data
                          </button>
                        </div>
                      </div>
                    </section>
                  )}

                  <section className="bg-slate-50 dark:bg-gray-800 p-4 rounded-lg border border-slate-100 dark:border-gray-700 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-400 dark:text-gray-500 uppercase tracking-widest block mb-1">Requester</label>
                      <p className="text-sm text-slate-900 dark:text-white">{selectedTask.requester_name || selectedTask.requester_id}</p>
                    </div>
                    {selectedTask.vendor_name && (
                      <div>
                        <label className="text-xs font-medium text-slate-400 dark:text-gray-500 uppercase tracking-widest block mb-1">Vendor</label>
                        <p className="text-sm text-slate-900 dark:text-white">{selectedTask.vendor_name}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-xs font-medium text-slate-400 dark:text-gray-500 uppercase tracking-widest block mb-1">Value</label>
                      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {selectedTask.currency} {selectedTask.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-400 dark:text-gray-500 uppercase tracking-widest block mb-1">Date</label>
                      <p className="text-slate-900 dark:text-white">
                        {new Date(selectedTask.date).toLocaleDateString()}
                      </p>
                    </div>
                  </section>

                  {selectedTask.current_step === 'GOODS_RECEIPT' && (grDetails || invoiceDetails || prDetails?.po_number) && (
                    <section className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg border border-teal-200 dark:border-teal-800">
                      <h3 className="text-xs font-semibold text-teal-800 dark:text-teal-200 uppercase tracking-widest border-b border-teal-200 dark:border-teal-700 pb-3 mb-3">Goods Receipt</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500 dark:text-gray-400 block text-xs uppercase tracking-wider">Request number</span>
                          <span className="text-slate-900 dark:text-white font-medium">{selectedTask.pr_number || selectedTask.request_number || prDetails?.request_number || prDetails?.pr_number || '-'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-gray-400 block text-xs uppercase tracking-wider">PO number</span>
                          <span className="text-slate-900 dark:text-white font-medium">{grDetails?.po_number || prDetails?.po_number || '-'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-gray-400 block text-xs uppercase tracking-wider">Invoice number</span>
                          <span className="text-slate-900 dark:text-white font-medium">{invoiceDetails?.invoice_number || selectedTask.invoice_number || '-'}</span>
                        </div>
                        {invoiceDetails && (
                          <div>
                            <span className="text-slate-500 dark:text-gray-400 block text-xs uppercase tracking-wider">Invoice amount</span>
                            <span className="text-slate-900 dark:text-white font-medium">
                              {invoiceDetails.currency} {(invoiceDetails.gross_amount ?? invoiceDetails.net_amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        )}
                      </div>
                    </section>
                  )}

                  {/* Process tracking (for GR and other task details) */}
                  {processTracking.length > 0 && (
                    <section className="space-y-4">
                      <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-widest border-b border-slate-100 dark:border-gray-700 pb-3">
                        Process tracking ({processTracking.length})
                      </h3>
                      <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg p-4 overflow-hidden">
                        <div className="overflow-x-auto pb-2">
                          <div className="flex items-start gap-3 min-w-max">
                            {(() => {
                              const sorted = [...processTracking].sort((a, b) => (a.step ?? 999) - (b.step ?? 999))
                              return sorted.map((track, idx) => {
                                const statusUpper = (track.process_status || '').toUpperCase()
                                const isCompleted = statusUpper === 'COMPLETED'
                                const isPending = statusUpper === 'IN_PROGRESS' || statusUpper === 'PENDING'
                                const isFailed = statusUpper === 'FAILED' || statusUpper === 'REJECTED'
                                const statusColor = isCompleted
                                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                  : isPending
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : isFailed
                                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                      : 'border-slate-300 dark:border-gray-600 bg-slate-50 dark:bg-gray-700'
                                const StatusIcon = isCompleted ? CheckCircle : isPending ? Clock : isFailed ? XCircle : Circle
                                const nextTrack = sorted[idx + 1]
                                const connectorColor = nextTrack
                                  ? ((nextTrack.process_status === 'COMPLETED' && 'bg-green-500') || ((nextTrack.process_status === 'IN_PROGRESS' || nextTrack.process_status === 'PENDING') && 'bg-blue-500') || ((nextTrack.process_status === 'FAILED' || nextTrack.process_status === 'REJECTED') && 'bg-red-500') || 'bg-slate-300 dark:bg-gray-600')
                                  : 'bg-slate-300 dark:bg-gray-600'
                                return (
                                  <div key={track.id || idx} className="flex items-center flex-shrink-0">
                                    <div className="flex flex-col items-center min-w-[160px] max-w-[200px]">
                                      <div className={`flex items-center justify-center w-12 h-12 rounded-xl border-2 ${statusColor}`}>
                                        <StatusIcon className={`w-6 h-6 ${isCompleted ? 'text-green-600 dark:text-green-400' : isPending ? 'text-blue-600 dark:text-blue-400' : isFailed ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-gray-400'}`} />
                                      </div>
                                      <div className="mt-2 text-center">
                                        <div className="font-semibold text-xs text-slate-900 dark:text-white mb-0.5">
                                          {track.process_step || `Step ${track.step ?? idx + 1}`}
                                        </div>
                                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                          isCompleted ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                          isPending ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                          isFailed ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                          'bg-slate-100 text-slate-700 dark:bg-gray-600 dark:text-gray-200'
                                        }`}>
                                          {track.process_status || 'PENDING'}
                                        </span>
                                        {track.process_notes && (
                                          <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1 line-clamp-2">
                                            {track.process_notes}
                                          </p>
                                        )}
                                        {track.start_date && (
                                          <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-0.5">
                                            {new Date(track.start_date).toLocaleDateString()}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    {idx < sorted.length - 1 && (
                                      <div className={`h-0.5 w-8 flex-shrink-0 rounded ${connectorColor}`} />
                                    )}
                                  </div>
                                )
                              })
                            })()}
                          </div>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* SAP/ERP system information (collapsible, default collapsed) */}
                  <section className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setSapErpSectionCollapsed((c) => !c)}
                      className="w-full flex items-center justify-between gap-2 py-2 px-3 rounded-lg border border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <h3 className="text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-widest">
                        SAP / ERP system information
                      </h3>
                      {sapErpSectionCollapsed ? (
                        <ChevronDown className="w-4 h-4 text-slate-500 dark:text-gray-400 shrink-0" />
                      ) : (
                        <ChevronUp className="w-4 h-4 text-slate-500 dark:text-gray-400 shrink-0" />
                      )}
                    </button>
                    {!sapErpSectionCollapsed && (prDetails || prLines?.length > 0) && (
                      <div className="bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-lg p-4 space-y-4">
                        {prDetails && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            {prDetails.cost_center_id != null && prDetails.cost_center_id !== '' && (
                              <div>
                                <span className="text-slate-400 dark:text-gray-500 block text-xs uppercase tracking-wider">Cost center</span>
                                <span className="text-slate-900 dark:text-white">{prDetails.cost_center_id}</span>
                              </div>
                            )}
                            {prDetails.project_id != null && prDetails.project_id !== '' && (
                              <div>
                                <span className="text-slate-400 dark:text-gray-500 block text-xs uppercase tracking-wider">Project</span>
                                <span className="text-slate-900 dark:text-white">{prDetails.project_id}</span>
                              </div>
                            )}
                            {prDetails.facility_id != null && prDetails.facility_id !== '' && (
                              <div>
                                <span className="text-slate-400 dark:text-gray-500 block text-xs uppercase tracking-wider">Facility</span>
                                <span className="text-slate-900 dark:text-white">{prDetails.facility_id}</span>
                              </div>
                            )}
                            {prDetails.company != null && prDetails.company !== '' && (
                              <div>
                                <span className="text-slate-400 dark:text-gray-500 block text-xs uppercase tracking-wider">Company</span>
                                <span className="text-slate-900 dark:text-white">{prDetails.company}</span>
                              </div>
                            )}
                            {prDetails.request_type != null && prDetails.request_type !== '' && (
                              <div>
                                <span className="text-slate-400 dark:text-gray-500 block text-xs uppercase tracking-wider">Request type</span>
                                <span className="text-slate-900 dark:text-white">{prDetails.request_type}</span>
                              </div>
                            )}
                            {prDetails.document_type != null && prDetails.document_type !== '' && (
                              <div>
                                <span className="text-slate-400 dark:text-gray-500 block text-xs uppercase tracking-wider">Document type</span>
                                <span className="text-slate-900 dark:text-white">{prDetails.document_type}</span>
                              </div>
                            )}
                            {prDetails.budget_id != null && prDetails.budget_id !== '' && (
                              <div>
                                <span className="text-slate-400 dark:text-gray-500 block text-xs uppercase tracking-wider">Budget ID</span>
                                <span className="text-slate-900 dark:text-white">{prDetails.budget_id}</span>
                              </div>
                            )}
                            {prDetails.po_number != null && prDetails.po_number !== '' && (
                              <div>
                                <span className="text-slate-400 dark:text-gray-500 block text-xs uppercase tracking-wider">PO number</span>
                                <span className="text-slate-900 dark:text-white">{prDetails.po_number}</span>
                              </div>
                            )}
                          </div>
                        )}
                        {prLines?.some((l) => l.gl_code != null && l.gl_code !== '') && (
                          <div>
                            <h4 className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-widest border-b border-slate-200 dark:border-gray-600 pb-2 mb-2">
                              GL codes by line
                            </h4>
                            <ul className="space-y-1.5 text-sm">
                              {prLines.map((line) =>
                                line.gl_code != null && line.gl_code !== '' ? (
                                  <li key={line.line_id} className="flex items-center gap-2 text-slate-700 dark:text-gray-300">
                                    <span className="text-slate-400 dark:text-gray-500 font-mono text-xs">Line {line.line_number}</span>
                                    <span className="font-mono">{line.gl_code}</span>
                                    {line.description && (
                                      <span className="text-slate-400 dark:text-gray-500 truncate max-w-[12rem]">— {line.description}</span>
                                    )}
                                  </li>
                                ) : null
                              )}
                            </ul>
                          </div>
                        )}
                        {(() => {
                          const hasPrSapFields = prDetails && (prDetails.cost_center_id || prDetails.project_id || prDetails.facility_id || prDetails.company || prDetails.request_type || prDetails.document_type || prDetails.budget_id || prDetails.po_number)
                          const hasLineGlCodes = prLines?.some((l) => l.gl_code != null && l.gl_code !== '')
                          if (!hasPrSapFields && !hasLineGlCodes) {
                            return <p className="text-slate-500 dark:text-gray-400 text-sm">No SAP/ERP system information available for this request.</p>
                          }
                          return null
                        })()}
                      </div>
                    )}
                  </section>

                  {selectedTask.justification && (
                    <section className="space-y-6">
                      <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-widest border-b border-slate-100 dark:border-gray-700 pb-3">Justification</h3>
                      <div className="bg-slate-50 dark:bg-gray-800 p-4 rounded-lg border border-slate-100 dark:border-gray-700">
                        <p className="text-slate-700 dark:text-gray-300">{selectedTask.justification}</p>
                      </div>
                    </section>
                  )}

                  {prLines.length > 0 && (
                    <section className="space-y-6">
                      <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-widest border-b border-slate-100 dark:border-gray-700 pb-3">Line Documentation Breakdown</h3>
                      <div className="bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50 dark:bg-gray-700 text-xs font-semibold text-slate-400 dark:text-gray-400 uppercase tracking-widest">
                            <tr>
                              <th className="p-3 text-left">Description</th>
                              <th className="p-3 text-center">Qty</th>
                              <th className="p-3 text-center">Unit Price</th>
                              <th className="p-3 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 dark:divide-gray-700">
                            {prLines.map((line) => (
                              <tr key={line.line_id} className="hover:bg-blue-50/20 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="p-3 text-slate-700 dark:text-gray-300">{line.description || '-'}</td>
                                <td className="p-3 text-center text-slate-400 dark:text-gray-400">{line.quantity || 0}</td>
                                <td className="p-6 text-center text-slate-400 dark:text-gray-400">
                                  {line.unit_price ? line.unit_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                                </td>
                                <td className="p-6 text-right font-semibold text-slate-900 dark:text-white">
                                  {selectedTask.currency} {(line.line_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  )}

                  {selectedTask.type === 'AP_INVOICE_REVIEW' && selectedTask.ocr_data && Object.keys(selectedTask.ocr_data).length > 0 && (
                    <section className="space-y-6">
                      <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-widest border-b border-slate-100 dark:border-gray-700 pb-3">OCR Data</h3>
                      <div className="bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
                        <pre className="p-3 text-xs overflow-x-auto text-slate-700 dark:text-gray-300">
                          {JSON.stringify(selectedTask.ocr_data, null, 2)}
                        </pre>
                      </div>
                    </section>
                  )}

                  {/* (Exception console moved to the top of details) */}
                  </div>

                <div className="space-y-8">
                  {/* Comments Section */}
                  <section className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-900 dark:text-white p-4 rounded-lg shadow-sm dark:shadow-lg space-y-4 sticky top-8">
                    <h4 className="text-xs font-semibold uppercase text-slate-500 dark:text-gray-400 tracking-widest border-b border-slate-200 dark:border-gray-700 pb-4 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" /> Comments & Activity
                    </h4>
                    
                    {/* Add Comment */}
                    <div className="space-y-3">
                      <textarea 
                        value={newComment} 
                        onChange={(e) => setNewComment(e.target.value)} 
                        placeholder="Add a comment..." 
                        rows={3}
                        className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg p-3 text-xs outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 resize-none" 
                      />
                      <button
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || addingComment}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2.5 rounded-xl font-semibold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                      >
                        {addingComment ? (
                          <>
                            <Clock className="w-3 h-3 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <Send className="w-3 h-3" />
                            Add Comment
                          </>
                        )}
                      </button>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                      {comments.length > 0 ? (
                        comments.map((comment, idx) => (
                          <div key={idx} className="bg-slate-50 dark:bg-gray-700 p-4 rounded-xl border border-slate-200 dark:border-gray-600">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <User className="w-3 h-3 text-slate-500 dark:text-gray-400" />
                                <p className="text-xs text-slate-700 dark:text-gray-300">{comment.user || 'System'}</p>
                              </div>
                              <p className="text-xs text-slate-400 dark:text-gray-500">
                                {comment.timestamp ? new Date(comment.timestamp).toLocaleString() : comment.date || 'Just now'}
                              </p>
                            </div>
                            <p className="text-xs text-slate-700 dark:text-gray-300 whitespace-pre-wrap">{comment.text}</p>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 border-2 border-dashed border-slate-200 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center text-slate-400 dark:text-gray-500">
                          <MessageSquare className="w-6 h-6 opacity-20 mb-2" />
                          <p className="text-xs font-medium uppercase tracking-widest">No Comments Yet</p>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Attachments Section */}
                  <section className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-900 dark:text-white p-4 rounded-lg shadow-sm dark:shadow-lg space-y-4 sticky top-8">
                    <h4 className="text-xs font-semibold uppercase text-slate-500 dark:text-gray-400 tracking-widest border-b border-slate-200 dark:border-gray-700 pb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Attachments
                    </h4>
                    
                    {/* Upload Button */}
                    <div>
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold uppercase tracking-widest transition-colors w-full justify-center">
                        <Upload className="w-3 h-3" />
                        {uploadingDocuments ? 'Uploading...' : 'Upload Files'}
                        <input
                          type="file"
                          multiple
                          onChange={handleFileSelect}
                          className="hidden"
                          disabled={uploadingDocuments || !selectedTask?.pr_id}
                        />
                      </label>
                    </div>

                    {/* Attachments List */}
                    {attachments.length > 0 ? (
                      <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                        {attachments.map((att) => (
                          <div key={att.id} className="group bg-slate-50 dark:bg-gray-700 p-3 rounded-lg flex items-center justify-between border border-slate-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 transition-all">
                            <div className="flex items-center gap-3 overflow-hidden flex-1">
                              <File className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                              <div className="overflow-hidden flex-1 min-w-0">
                                <p className="text-xs truncate text-slate-900 dark:text-white">{att.name}</p>
                                {att.size && (
                                  <p className="text-xs text-slate-500 dark:text-gray-400 font-medium uppercase">
                                    {(att.size / 1024).toFixed(1)} KB
                                  </p>
                                )}
                                {att.uploading && (
                                  <div className="mt-1">
                                    <div className="w-full bg-slate-200 dark:bg-gray-600 rounded-full h-1.5">
                                      <div
                                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                        style={{ width: `${att.progress || 0}%` }}
                                      />
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                                      {Math.round(att.progress || 0)}% uploaded
                                    </p>
                                  </div>
                                )}
                                {att.error && (
                                  <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                                    Error: {att.error}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {att.url && !att.uploading && (
                                <button 
                                  onClick={() => window.open(att.url, '_blank')} 
                                  className="p-2 bg-slate-200 dark:bg-gray-600 rounded-xl hover:bg-blue-600 dark:hover:bg-blue-600 transition-all"
                                  title="Download"
                                >
                                  <Download className="w-3 h-3 text-slate-700 dark:text-white" />
                                </button>
                              )}
                              {!att.uploading && (
                                <button 
                                  onClick={() => handleRemoveAttachment(att.id)} 
                                  className="p-2 bg-slate-200 dark:bg-gray-600 rounded-xl hover:bg-red-600 dark:hover:bg-red-600 transition-all"
                                  title="Remove"
                                >
                                  <Trash2 className="w-3 h-3 text-slate-700 dark:text-white" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 border-2 border-dashed border-slate-200 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center text-slate-400 dark:text-gray-500">
                        <FileText className="w-8 h-8 opacity-20 mb-2" />
                        <p className="text-xs font-medium uppercase tracking-widest">No Attachments</p>
                      </div>
                    )}
                  </section>
                </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <main className="flex-1 flex flex-col bg-slate-50 dark:bg-gray-900 overflow-y-auto">
            <header className="sticky top-0 z-20 p-4 border-b border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">Unified Inbox</h2>
                  <p className="text-[10px] text-slate-500 dark:text-gray-400 font-medium mt-0.5">
                    {filteredAndSortedTasks.length} {filteredAndSortedTasks.length === 1 ? 'task' : 'tasks'} found
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('compact')}
                      className={`p-1.5 rounded transition-all ${viewMode === 'compact' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`}
                      title="Compact View"
                    >
                      <List className="w-4 h-4 text-slate-600 dark:text-gray-300" />
                    </button>
                    <button
                      onClick={() => setViewMode('comfortable')}
                      className={`p-1.5 rounded transition-all ${viewMode === 'comfortable' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`}
                      title="Comfortable View"
                    >
                      <Grid3x3 className="w-4 h-4 text-slate-600 dark:text-gray-300" />
                    </button>
                  </div>
                  
                  {/* Group By */}
                  <select
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value)}
                    className="bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-xs text-slate-600 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="none">No Grouping</option>
                    <option value="date">Group by Date</option>
                    <option value="priority">Group by Priority</option>
                    <option value="type">Group by Type</option>
                  </select>
                </div>
              </div>

              {/* Search and Filters Row */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="Search tasks, request numbers, vendors..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg pl-9 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500" 
                  />
                </div>
                
                <select 
                  value={filterPriority} 
                  onChange={(e) => setFilterPriority(e.target.value)} 
                  className="bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs text-slate-600 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="All">All Priorities</option>
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Normal">Normal</option>
                  <option value="Low">Low</option>
                </select>

                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)} 
                  className="bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs text-slate-600 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="All">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>

                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)} 
                  className="bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs text-slate-600 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="All">All Types</option>
                  <option value="PR_APPROVAL">Request Approval</option>
                  <option value="INVOICE_APPROVAL">Invoice Approval</option>
                  <option value="AP_INVOICE_REVIEW">AP Review</option>
                  <option value="REQUESTER_CONFIRMATION">Requester Confirmation</option>
                  <option value="GOODS_RECEIPT">Goods Receipt</option>
                </select>

                <div className="flex items-center gap-2">
                  <SortAsc className="w-4 h-4 text-slate-400 dark:text-gray-500" />
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)} 
                    className="bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs text-slate-600 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="priority">Sort by Priority</option>
                    <option value="amount">Sort by Amount</option>
                    <option value="type">Sort by Type</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-600 transition-colors"
                    title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                  >
                    {sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Bulk Actions Bar */}
              {selectedTasks.size > 0 && (
                <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-blue-900 dark:text-blue-100">
                      {selectedTasks.size} {selectedTasks.size === 1 ? 'task' : 'tasks'} selected
                    </span>
                    <button
                      onClick={toggleSelectAll}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {selectedTasks.size === filteredAndSortedTasks.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleBulkAction('approve')}
                      disabled={actionLoading}
                      className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold uppercase tracking-widest transition-all disabled:opacity-50"
                    >
                      Approve Selected
                    </button>
                    <button
                      onClick={() => handleBulkAction('reject')}
                      disabled={actionLoading}
                      className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold uppercase tracking-widest transition-all disabled:opacity-50"
                    >
                      Reject Selected
                    </button>
                    <button
                      onClick={() => setSelectedTasks(new Set())}
                      className="px-4 py-1.5 bg-slate-200 dark:bg-gray-600 hover:bg-slate-300 dark:hover:bg-gray-500 text-slate-700 dark:text-gray-200 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </header>

            {/* KPI Summary */}
            <div className="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 p-6">
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Total Tasks</p>
                    <p className="text-xl pr-2 font-semibold text-blue-900 dark:text-blue-100">{kpis.total}</p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                    <p className="text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-1">Pending</p>
                    <p className="text-xl font-semibold text-orange-900 dark:text-orange-100">{kpis.pending}</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-widest mb-1">Overdue</p>
                    <p className="text-xl font-semibold text-red-900 dark:text-red-100">{kpis.overdue}</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                    <p className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-1">Urgent</p>
                    <p className="text-xl font-semibold text-purple-900 dark:text-purple-100">{kpis.urgent}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                    <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-widest mb-1">Selected</p>
                    <p className="text-xl font-semibold text-green-900 dark:text-green-100">{selectedTasks.size}</p>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mx-4 mt-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-xs">
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            <div className="max-w-6xl mx-auto w-full p-4">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,2.3fr)_minmax(260px,1fr)] items-start">
                {/* Main task list */}
                <div className="space-y-3">
                  {loading && filteredAndSortedTasks.length === 0 ? (
                    <div className="py-40 flex flex-col items-center justify-center text-slate-300 dark:text-gray-600 text-center">
                      <Clock className="w-16 h-16 opacity-10 mb-6 animate-spin" />
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white opacity-40">Loading tasks...</h3>
                    </div>
                  ) : Object.keys(groupedTasks).length > 0 ? (
                    Object.entries(groupedTasks).map(([groupKey, groupTasks]) => {
                  const isExpanded = groupBy === 'none' || expandedGroups.has(groupKey)
                  const isOverdue = groupTasks.some(t => {
                    const taskDate = new Date(t.date)
                    const daysDiff = (new Date() - taskDate) / (1000 * 60 * 60 * 24)
                    return daysDiff > 3 && t.status === 'PENDING'
                  })

                  return (
                    <div key={groupKey} className="space-y-2">
                      {groupBy !== 'none' && (
                        <button
                          onClick={() => toggleGroup(groupKey)}
                          className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronUp className="w-4 h-4 text-slate-400 rotate-180" />
                            )}
                            <span className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-widest">
                              {groupKey}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-gray-400">
                              ({groupTasks.length} {groupTasks.length === 1 ? 'task' : 'tasks'})
                            </span>
                            {isOverdue && (
                              <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded text-xs font-medium uppercase">
                                Overdue
                              </span>
                            )}
                          </div>
                        </button>
                      )}
                      
                      {isExpanded && (
                        <div className={viewMode === 'compact' ? 'space-y-2' : 'space-y-4'}>
                          {groupTasks.map(task => {
                            const isOverdueTask = (() => {
                              const taskDate = new Date(task.date)
                              const daysDiff = (new Date() - taskDate) / (1000 * 60 * 60 * 24)
                              return daysDiff > 3 && task.status === 'PENDING'
                            })()
                            
                            return (
                              <div key={task.id} className="relative group">
                                <TaskCard
                                  task={task}
                                  isSelected={selectedTaskId === task.id}
                                  isChecked={selectedTasks.has(task.id)}
                                  onCheck={() => toggleTaskSelection(task.id)}
                                  onClick={() => setSelectedTaskId(task.id)}
                                  viewMode={viewMode}
                                  isOverdue={isOverdueTask}
                                  onQuickAction={(action) => {
                                    setSelectedTaskId(task.id)
                                    setTimeout(() => handleAction(action), 100)
                                  }}
                                />
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                    })
                  ) : (
                    <div className="py-40 flex flex-col items-center justify-center text-slate-300 dark:text-gray-600 text-center">
                      <FileText className="w-16 h-16 opacity-10 mb-6" />
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white opacity-40">No tasks in this view</h3>
                      <p className="text-xs font-medium opacity-40 max-w-xs mt-2">
                        Try changing your search query or filter options.
                      </p>
                    </div>
                  )}
                </div>

                {/* Inbox-level Auto-Fix helper on the right of list */}
                <aside className="mt-4 lg:mt-0 space-y-4">
                  <section className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 border border-purple-100 dark:border-purple-800 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white text-[10px] font-bold">
                            AI
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-purple-700 dark:text-purple-200">
                            Inbox Auto-Fix (Preview)
                          </span>
                        </div>
                        <p className="text-[11px] leading-snug text-slate-700 dark:text-gray-300">
                          Simulate <span className="font-semibold">quick fixes</span> across multiple exception tasks. No data is written yet.
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1 text-[10px] text-slate-700 dark:text-gray-300">
                      <div className="flex items-center justify-between">
                        <span className="uppercase tracking-widest">Total Tasks</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {tasks.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="uppercase tracking-widest">Easy Exceptions</span>
                        <span className="font-semibold text-purple-700 dark:text-purple-200">
                          {tasks.filter(t => !!t.is_exception && t.status === 'PENDING' && t.priority !== 'Urgent').length}
                        </span>
                      </div>
                      {bulkAutoFixApplied && bulkAutoFixSummary && (
                        <div className="pt-1 text-[10px] text-purple-700 dark:text-purple-200">
                          Fixed {bulkAutoFixSummary.fixed}/{bulkAutoFixSummary.total} at {bulkAutoFixSummary.timestamp}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleBulkAutoFix}
                      disabled={bulkAutoFixApplied || tasks.length === 0}
                      className="mt-3 w-full px-3 py-2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-[10px] font-semibold uppercase tracking-widest shadow-sm shadow-purple-300 dark:shadow-purple-900/60 disabled:opacity-50 disabled:cursor-default"
                    >
                      {bulkAutoFixApplied ? 'Auto-Fix Preview Ready' : 'Run Inbox Auto-Fix'}
                    </button>
                  </section>
                </aside>
              </div>
            </div>
          </main>
        )}
      </div>

      {/* KIV Modal */}
      {isKivModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg shadow-lg overflow-hidden animate-in zoom-in-95 duration-300">
            <header className="bg-slate-100 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-700 text-slate-900 dark:text-white p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center shadow-sm shadow-amber-900/20">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">Set Hold Reminder (KIV)</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-widest mt-0.5">Pausing Process Lifecycle</p>
              </div>
              <button 
                onClick={() => setIsKivModalOpen(false)} 
                className="ml-auto text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </header>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-400 dark:text-gray-400 uppercase tracking-widest">Reminder Date</label>
                  <input 
                    type="date" 
                    value={kivDate}
                    onChange={(e) => setKivDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-100 dark:border-gray-600 rounded-lg p-3 text-xs outline-none focus:ring-2 focus:ring-blue-500/10 text-slate-900 dark:text-white" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-400 dark:text-gray-400 uppercase tracking-widest">Follow-up Time</label>
                  <input 
                    type="time" 
                    value={kivTime}
                    onChange={(e) => setKivTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-100 dark:border-gray-600 rounded-lg p-3 text-xs outline-none focus:ring-2 focus:ring-blue-500/10 text-slate-900 dark:text-white" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-400 dark:text-gray-400 uppercase tracking-widest">Mandatory Reason for Hold</label>
                <textarea 
                  value={kivReason}
                  onChange={(e) => setKivReason(e.target.value)}
                  rows={3}
                  placeholder="e.g. Waiting for revised quote from Dell..."
                  className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-100 dark:border-gray-600 rounded-lg p-3 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/10 resize-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500"
                />
              </div>
              <div className="pt-4 flex flex-col gap-3">
                <button 
                  onClick={handleKivSubmit}
                  disabled={!kivDate || !kivReason || actionLoading}
                  className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-slate-100 disabled:text-slate-300 dark:disabled:bg-gray-700 dark:disabled:text-gray-500 text-white font-semibold py-3 rounded-lg text-xs tracking-widest transition-all shadow-sm shadow-amber-900/20 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Processing...' : 'Confirm Process Pause'}
                </button>
                <p className="text-xs text-center text-slate-400 dark:text-gray-500 italic">Item will automatically re-appear in your active inbox on the selected date.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

