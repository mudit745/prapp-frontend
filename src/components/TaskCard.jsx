import { ArrowLeft, CheckSquare, Square, MoreVertical, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'

export default function TaskCard({ task, isSelected, onClick, isChecked, onCheck, viewMode = 'comfortable', isOverdue = false, onQuickAction }) {
  const getTaskTypeColor = (type) => {
    const colors = {
      'PR_APPROVAL': 'bg-indigo-600',
      'AP_INVOICE_REVIEW': 'bg-teal-600',
      'INVOICE_MATCHING': 'bg-teal-600',
      'REQUESTER_CONFIRMATION': 'bg-purple-600',
      'PO_DISPATCH': 'bg-blue-600',
      'PAYMENT_RELEASE': 'bg-green-600'
    }
    return colors[type] || 'bg-slate-600'
  }

  const getTaskTypeLabel = (type) => {
    if (!type) return 'TASK'
    return type.split('_')[0]
  }

  const getStatusLabel = (status) => {
    if (!status) return 'PENDING'
    return status.replace(/_/g, ' ')
  }

  const paddingClass = viewMode === 'compact' ? 'p-3' : 'p-6'
  const roundedClass = viewMode === 'compact' ? 'rounded-xl' : 'rounded-3xl'
  const iconSize = viewMode === 'compact' ? 'w-8 h-8' : 'w-12 h-12'

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 ${paddingClass} ${roundedClass} border ${
        isOverdue ? 'border-red-300 dark:border-red-700 bg-red-50/30 dark:bg-red-900/10' : 'border-slate-100 dark:border-gray-700'
      } flex flex-col md:flex-row items-start md:items-center justify-between group hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 transition-all gap-4 cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500 border-blue-300 dark:border-blue-600' : ''
      }`}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Checkbox for bulk selection */}
        {onCheck && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onCheck()
            }}
            className="flex-shrink-0 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            {isChecked ? (
              <CheckSquare className="w-5 h-5" />
            ) : (
              <Square className="w-5 h-5" />
            )}
          </button>
        )}

        {/* Task Type Icon */}
        <div className={`${iconSize} ${roundedClass} flex items-center justify-center font-semibold text-xs text-white shadow-md transition-transform group-hover:scale-105 flex-shrink-0 ${getTaskTypeColor(task.type)}`}>
          {getTaskTypeLabel(task.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 
              className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate"
            >
              {task.title || task.request_number || task.pr_number || 'Untitled Task'}
            </h4>
            {isOverdue && (
              <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded text-xs font-medium uppercase flex-shrink-0">
                Overdue
              </span>
            )}
            {task.is_exception && (
              <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded text-xs font-medium uppercase flex-shrink-0 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                SAP Exception
              </span>
            )}
            {(task.priority === 'Urgent' || task.priority === 'High') && (
              <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase flex-shrink-0 ${
                task.priority === 'Urgent' 
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
              }`}>
                {task.priority}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-slate-400 dark:text-gray-500 uppercase tracking-widest">
            {(task.id || task.request_number || task.pr_number) && (
              <span className="truncate">{task.id || task.request_number || task.pr_number}</span>
            )}
            {(task.requester_name || task.requester_id) && (
              <>
                <span>•</span>
                <span className="truncate">{(task.requester_name || task.requester_id).toUpperCase()}</span>
              </>
            )}
            {task.vendor_name && (
              <>
                <span>•</span>
                <span className="truncate">{task.vendor_name.toUpperCase()}</span>
              </>
            )}
            <span>•</span>
            <span>{new Date(task.date).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
        <div className="flex flex-col items-end">
          <p className="font-semibold text-slate-900 dark:text-white">
            {task.currency} {task.amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
          </p>
          <p className="text-xs font-medium text-blue-500 dark:text-blue-400 uppercase tracking-widest">
            {getStatusLabel(task.status)}
          </p>
        </div>
        
        {/* Quick Actions */}
        {onQuickAction && task.current_step === 'APPROVAL' && (
          <div className="hidden group-hover:flex items-center gap-1 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onQuickAction('approve')
              }}
              className="p-2 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400 rounded-lg transition-colors"
              title="Quick Approve"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onQuickAction('reject')
              }}
              className="p-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-colors"
              title="Quick Reject"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <div className="hidden group-hover:flex items-center gap-2 text-blue-500 dark:text-blue-400 transition-all duration-200">
            <span className="text-xs font-medium uppercase">Review</span>
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </div>
        </div>
      </div>
    </div>
  )
}

