import { useState, useEffect } from 'react'
import { CheckCircle, Circle, Clock, XCircle } from 'lucide-react'
import axios from '../utils/axios'

const WORKFLOW_STEPS = [
  { step: 1, name: 'REQUEST', label: 'Request' },
  { step: 2, name: 'APPROVAL', label: 'Approval' },
  { step: 3, name: 'PO_TO_SAP', label: 'PO to SAP' },
  { step: 4, name: 'EMAIL_TRIGGER', label: 'Email Trigger' },
  { step: 5, name: 'VENDOR_INVOICE', label: 'Vendor Invoice' },
  { step: 6, name: 'AP_REVIEW', label: 'AP Review' },
  { step: 7, name: 'REQUESTER_APPROVAL', label: 'Requester Approval' },
  { step: 8, name: 'POST_TO_SAP', label: 'Post to SAP' },
  { step: 9, name: 'PAYMENT', label: 'Payment' }
]

export default function ProcessTracker({ prId }) {
  const [processSteps, setProcessSteps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (prId) {
      fetchProcessSteps()
    }
  }, [prId])

  const fetchProcessSteps = async () => {
    if (!prId) return
    
    setLoading(true)
    try {
      // Fetch process tracking records for this PR
      const trackingResponse = await axios.get('/api/v1/process-tracking', {
        params: { ref_id: prId, limit: 200 }
      })
      
      const trackingData = Array.isArray(trackingResponse.data) ? trackingResponse.data : []
      
      // Create a map of process steps with their statuses
      const stepMap = new Map()
      
      // Process tracking data to determine step statuses
      trackingData.forEach((track) => {
        const stepName = track.process_step || track.step_name
        if (stepName) {
          // Use process_status field from the API response
          const processStatus = track.process_status || track.status
          let status = 'pending'
          if (processStatus === 'COMPLETED') {
            status = 'completed'
          } else if (processStatus === 'IN_PROGRESS' || processStatus === 'PENDING') {
            status = 'in_progress'
          } else if (processStatus === 'FAILED' || processStatus === 'REJECTED') {
            status = 'failed'
          }
          
          // Keep the most recent status for each step
          const existing = stepMap.get(stepName)
          if (!existing || (track.end_date && (!existing.end_date || new Date(track.end_date) > new Date(existing.end_date)))) {
            stepMap.set(stepName, { status, end_date: track.end_date })
          }
        }
      })
      
      // Map workflow steps with their statuses
      const steps = WORKFLOW_STEPS.map((step) => {
        const tracked = stepMap.get(step.name)
        return {
          ...step,
          status: tracked?.status || 'pending'
        }
      })
      
      setProcessSteps(steps)
    } catch (err) {
      console.error('Error fetching process steps:', err)
      // Fallback: try to infer from PR status
      try {
        const prResponse = await axios.get(`/api/v1/requisitions/${prId}`)
        const pr = prResponse.data.header || prResponse.data
        
        const steps = WORKFLOW_STEPS.map((step) => {
          let status = 'pending'
          
          if (pr.status === 'Draft') {
            status = step.step === 1 ? 'in_progress' : 'pending'
          } else if (pr.status === 'Submitted') {
            if (step.step <= 2) status = step.step === 2 ? 'in_progress' : 'completed'
          } else if (pr.status === 'Approved') {
            if (step.step <= 6) status = step.step === 6 ? 'in_progress' : 'completed'
          } else if (pr.status === 'Rejected') {
            if (step.step <= 2) status = step.step === 2 ? 'failed' : 'completed'
          }
          
          return { ...step, status }
        })
        
        setProcessSteps(steps)
      } catch (fallbackErr) {
        console.error('Error in fallback:', fallbackErr)
        setProcessSteps(WORKFLOW_STEPS.map(step => ({ ...step, status: 'pending' })))
      }
    } finally {
      setLoading(false)
    }
  }

  const getStepIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'in_progress':
        return <Clock className="w-6 h-6 text-blue-500" />
      case 'failed':
        return <XCircle className="w-6 h-6 text-red-500" />
      default:
        return <Circle className="w-6 h-6 text-gray-400" />
    }
  }

  const getStepColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400'
      case 'in_progress':
        return 'text-blue-600 dark:text-blue-400 font-semibold'
      case 'failed':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-400 dark:text-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        Loading workflow...
      </div>
    )
  }

  const getConnectorColor = (currentStep, nextStep) => {
    if (currentStep.status === 'completed') {
      return 'bg-green-500'
    } else if (currentStep.status === 'in_progress') {
      return 'bg-blue-500'
    } else if (currentStep.status === 'failed') {
      return 'bg-red-500'
    }
    return 'bg-gray-300 dark:bg-gray-600'
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-3xl p-8 border border-gray-200 dark:border-gray-700">
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-2">Workflow Progress</h3>
        <div className="h-0.5 w-16 bg-primary-600 rounded-full"></div>
      </div>
      <div className="flex items-center justify-between overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {processSteps.map((step, index) => (
          <div key={step.step} className="flex items-center flex-shrink-0">
            <div className="flex flex-col items-center min-w-[100px]">
              <div className={`flex items-center justify-center w-14 h-14 rounded-2xl border-2 transition-all ${
                step.status === 'completed' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                step.status === 'in_progress' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 animate-pulse' :
                step.status === 'failed' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
              }`}>
                {getStepIcon(step.status)}
              </div>
              <div className={`mt-3 text-xs font-semibold uppercase tracking-widest text-center max-w-[100px] px-1 ${getStepColor(step.status)}`}>
                {step.label}
              </div>
            </div>
            {index < processSteps.length - 1 && (
              <div className={`flex-1 h-1 mx-3 min-w-[50px] transition-colors ${getConnectorColor(step, processSteps[index + 1])}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

