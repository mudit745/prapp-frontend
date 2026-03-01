import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit, Eye, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from '../utils/axios'
import Layout from '../components/Layout'
import Table from '../components/Table'
import { usePermissions } from '../hooks/usePermissions'
import { hasPermission } from '../utils/permissions'
import { PERMISSIONS } from '../utils/permissions'

export default function Requisitions() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const { permissions } = usePermissions(token)
  const [prs, setPRs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch PRs
  const fetchPRs = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.get('/api/v1/requisitions')
      setPRs(response.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch requests')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPRs()
  }, [fetchPRs])

  const handleCreate = () => {
    navigate('/requisitions/create')
  }

  const handleEdit = (pr) => {
    navigate(`/requisitions/edit/${pr.pr_id}`)
  }

  const handleView = (pr) => {
    navigate(`/requisitions/view/${pr.pr_id}`)
  }

  const handleDelete = async (prId) => {
    if (!window.confirm('Are you sure you want to delete this PR?')) {
      return
    }

    try {
      await axios.delete(`/api/v1/requisitions/${prId}`)
      toast.success('Request deleted')
      fetchPRs()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete PR'
      setError(msg)
      toast.error(msg)
    }
  }

  return (
    <Layout>
      <div className="w-full py-4 px-4">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">Purchase Requests</h1>
            <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-widest">
              Create and manage purchase requests
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold text-xs tracking-widest shadow-sm shadow-primary-200 dark:shadow-primary-900 transition-all flex items-center gap-2"
          >
            <Plus size={16} />
            Create New PR
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg font-medium text-xs">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <Table
            columns={[
              { key: 'pr_number', header: 'Request Number', sortable: true, filterable: true },
              { key: 'request_number', header: 'Request Number', sortable: true, filterable: true },
              { key: 'requester_id', header: 'Requester', sortable: true, filterable: true },
              { key: 'cost_center_id', header: 'Department', sortable: true, filterable: true },
              {
                key: 'total_amount',
                header: 'Total Amount',
                sortable: true,
                render: (row) => `${row.currency || ''} ${row.total_amount?.toFixed(2) || '0.00'}`
              },
              {
                key: 'status',
                header: 'Status',
                sortable: true,
                filterable: true,
                render: (row) => (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    row.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                    row.status === 'Draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                    row.status === 'Submitted' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' :
                    row.status === 'Rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                  }`}>
                    {row.status}
                  </span>
                )
              },
              { key: 'priority', header: 'Priority', sortable: true, filterable: true },
              {
                key: 'created_at',
                header: 'Created',
                sortable: true,
                render: (row) => new Date(row.created_at).toLocaleDateString()
              },
              {
                key: 'actions',
                header: 'Actions',
                render: (row) => (
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => handleView(row)}
                      className="text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white flex items-center gap-1"
                    >
                      <Eye size={16} />
                      View
                    </button>
                    {(row.status === 'Draft' && hasPermission(permissions, PERMISSIONS.REQUISITION_UPDATE)) || hasPermission(permissions, PERMISSIONS.REQUISITION_UPDATE_ALL) ? (
                      <button
                        onClick={() => handleEdit(row)}
                        className="text-primary-600 hover:text-primary-900 flex items-center gap-1"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                    ) : null}
                    <button
                      onClick={() => handleDelete(row.pr_id)}
                      className="text-red-600 hover:text-red-900 flex items-center gap-1"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                )
              }
            ]}
            data={prs}
            rowKey={(row) => row.pr_id}
            loading={loading}
            paginationMode="client"
            defaultPageSize={10}
            emptyMessage="No purchase requests found"
          />
        </div>
      </div>
    </Layout>
  )
}


