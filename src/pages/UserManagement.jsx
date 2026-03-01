import { useState, useEffect, useCallback } from 'react'
import { X, Plus, Edit, Trash2, Save, UserPlus, Shield, Key, Minus } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from '../utils/axios'
import Layout from '../components/Layout'
import Table from '../components/Table'
import { usePermissionsContext } from '../context/PermissionsContext'
import { RequirePermission } from '../components/PermissionGuard'
import { PERMISSIONS } from '../utils/permissions'
import ExcelImportExport from '../components/ExcelImportExport'

export default function UserManagement() {
  const { permissions } = usePermissionsContext()
  const [activeTab, setActiveTab] = useState('users')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Data states
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [permissionsList, setPermissionsList] = useState([])
  const [costCenters, setCostCenters] = useState([])
  
  // Assignment states
  const [rolePermissions, setRolePermissions] = useState({}) // roleId -> permissions[]
  const [userRoles, setUserRoles] = useState({}) // userId -> assignments[]
  
  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('create') // 'create' | 'edit' | 'assign-permission' | 'assign-role'
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({})
  const [assigningTo, setAssigningTo] = useState(null) // For assignment modals

  const canManageUsers = permissions?.includes(PERMISSIONS.ADMIN_USERS) || permissions?.includes(PERMISSIONS.ADMIN_SYSTEM)
  const canManageRoles = permissions?.includes(PERMISSIONS.ADMIN_ROLES) || permissions?.includes(PERMISSIONS.ADMIN_SYSTEM)

  // Fetch users
  const fetchUsers = useCallback(async () => {
    if (!canManageUsers) return
    setLoading(true)
    try {
      const response = await axios.get('/api/v1/users')
      const usersData = response.data
      setUsers(usersData)
      
      // Fetch roles for all users
      const rolesPromises = usersData.map(async (user) => {
        try {
          const rolesResponse = await axios.get(`/api/v1/admin/users/${user.user_id}/roles`)
          return { userId: user.user_id, roles: rolesResponse.data }
        } catch (err) {
          console.error(`Failed to fetch roles for user ${user.user_id}:`, err)
          return { userId: user.user_id, roles: [] }
        }
      })
      
      const rolesResults = await Promise.all(rolesPromises)
      const newUserRoles = {}
      rolesResults.forEach(({ userId, roles }) => {
        newUserRoles[userId] = roles
      })
      setUserRoles(newUserRoles)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }, [canManageUsers])

  // Fetch roles
  const fetchRoles = useCallback(async () => {
    if (!canManageRoles) return
    setLoading(true)
    try {
      const response = await axios.get('/api/v1/admin/roles')
      setRoles(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch roles')
    } finally {
      setLoading(false)
    }
  }, [canManageRoles])

  // Fetch permissions
  const fetchPermissions = useCallback(async () => {
    if (!canManageRoles) return
    setLoading(true)
    try {
      const response = await axios.get('/api/v1/admin/permissions')
      setPermissionsList(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch permissions')
    } finally {
      setLoading(false)
    }
  }, [canManageRoles])

  // Fetch cost centers
  const fetchCostCenters = useCallback(async () => {
    try {
      const response = await axios.get('/api/v1/cost-centers')
      setCostCenters(response.data || [])
    } catch (err) {
      console.error('Failed to fetch cost centers:', err)
    }
  }, [])

  // Fetch role permissions
  const fetchRolePermissions = useCallback(async (roleId) => {
    try {
      const response = await axios.get(`/api/v1/admin/roles/${roleId}/permissions`)
      setRolePermissions(prev => ({ ...prev, [roleId]: response.data }))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch role permissions')
    }
  }, [])

  // Fetch user role assignments
  const fetchUserRoles = useCallback(async (userId) => {
    try {
      const response = await axios.get(`/api/v1/admin/users/${userId}/roles`)
      setUserRoles(prev => ({ ...prev, [userId]: response.data }))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch user roles')
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers()
      fetchCostCenters()
      // Also fetch roles to display role names
      if (canManageRoles && roles.length === 0) {
        fetchRoles()
      }
    } else if (activeTab === 'roles') {
      fetchRoles()
      fetchPermissions()
    } else if (activeTab === 'permissions') {
      fetchPermissions()
    }
  }, [activeTab, fetchUsers, fetchRoles, fetchPermissions, fetchCostCenters, canManageRoles, roles.length])

  const handleCreate = (type) => {
    setModalType('create')
    setEditingItem(null)
    if (type === 'user') {
      setFormData({ email: '', employee_id: '', status: 'Active' })
    } else if (type === 'role') {
      setFormData({ role_id: '', role_name: '', description: '', status: 'Active' })
    } else if (type === 'permission') {
      setFormData({ permission_id: '', permission_name: '', resource: '', action: '', description: '' })
    }
    setShowModal(true)
    setError('')
  }

  const handleEdit = (item, type) => {
    setModalType('edit')
    setEditingItem(item)
    setFormData(item)
    setShowModal(true)
    setError('')
  }

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return

    try {
      if (type === 'user') {
        await axios.delete(`/api/v1/admin/users/${id}`)
        fetchUsers()
      } else if (type === 'role') {
        await axios.delete(`/api/v1/admin/roles/${id}`)
        fetchRoles()
      } else if (type === 'permission') {
        await axios.delete(`/api/v1/admin/permissions/${id}`)
        fetchPermissions()
      }
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted`)
    } catch (err) {
      const msg = err.response?.data?.message || `Failed to delete ${type}`
      setError(msg)
      toast.error(msg)
    }
  }

  const handleManageRolePermissions = async (role) => {
    setAssigningTo(role)
    setModalType('assign-permission')
    setFormData({ permission_id: '' })
    setShowModal(true)
    // Fetch permissions if not already loaded (without setting loading state)
    if (permissionsList.length === 0) {
      try {
        const response = await axios.get('/api/v1/admin/permissions')
        setPermissionsList(response.data)
      } catch (err) {
        console.error('Failed to fetch permissions:', err)
        setError(err.response?.data?.message || 'Failed to fetch permissions')
      }
    }
    fetchRolePermissions(role.role_id)
    setError('')
  }

  const handleManageUserRoles = async (user) => {
    setAssigningTo(user)
    setModalType('assign-role')
    setFormData({ role_id: '', cost_center_id: '' })
    setShowModal(true)
    // Fetch roles if not already loaded (without setting loading state)
    if (roles.length === 0) {
      try {
        const response = await axios.get('/api/v1/admin/roles')
        setRoles(response.data)
      } catch (err) {
        console.error('Failed to fetch roles:', err)
        setError(err.response?.data?.message || 'Failed to fetch roles')
      }
    }
    fetchUserRoles(user.user_id)
    setError('')
  }

  const handleAssignPermissionToRole = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await axios.post(`/api/v1/admin/roles/${assigningTo.role_id}/permissions`, {
        permission_id: formData.permission_id
      })
      fetchRolePermissions(assigningTo.role_id)
      setFormData({ permission_id: '' })
      toast.success('Permission assigned')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to assign permission'
      setError(msg)
      toast.error(msg)
    }
  }

  const handleRemovePermissionFromRole = async (roleId, permissionId) => {
    if (!window.confirm('Remove this permission from the role?')) return
    try {
      await axios.delete(`/api/v1/admin/roles/${roleId}/permissions`, {
        data: { permission_id: permissionId }
      })
      fetchRolePermissions(roleId)
      toast.success('Permission removed')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove permission'
      setError(msg)
      toast.error(msg)
    }
  }

  const handleAssignRoleToUser = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await axios.post(`/api/v1/admin/users/${assigningTo.user_id}/roles`, {
        role_id: formData.role_id,
        cost_center_id: formData.cost_center_id || null
      })
      await fetchUserRoles(assigningTo.user_id)
      // Update userRoles state to reflect the change in the table
      const updatedRoles = await axios.get(`/api/v1/admin/users/${assigningTo.user_id}/roles`)
      setUserRoles(prev => ({ ...prev, [assigningTo.user_id]: updatedRoles.data }))
      setFormData({ role_id: '', cost_center_id: '' })
      toast.success('Role assigned')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to assign role'
      setError(msg)
      toast.error(msg)
    }
  }

  const handleRemoveRoleFromUser = async (userId, roleId, costCenterId) => {
    if (!window.confirm('Remove this role assignment from the user?')) return
    try {
      await axios.delete(`/api/v1/admin/users/${userId}/roles`, {
        data: { role_id: roleId, cost_center_id: costCenterId || null }
      })
      // Update userRoles state to reflect the change in the table
      const updatedRoles = await axios.get(`/api/v1/admin/users/${userId}/roles`)
      setUserRoles(prev => ({ ...prev, [userId]: updatedRoles.data }))
      toast.success('Role assignment removed')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove role assignment'
      setError(msg)
      toast.error(msg)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      if (activeTab === 'users') {
        if (modalType === 'create') {
          await axios.post('/api/v1/admin/users', formData)
        } else {
          await axios.put(`/api/v1/admin/users/${editingItem.user_id}`, formData)
        }
        fetchUsers()
      } else if (activeTab === 'roles') {
        if (modalType === 'create') {
          await axios.post('/api/v1/admin/roles', formData)
        } else {
          await axios.put(`/api/v1/admin/roles/${editingItem.role_id}`, formData)
        }
        fetchRoles()
      } else if (activeTab === 'permissions') {
        if (modalType === 'create') {
          await axios.post('/api/v1/admin/permissions', formData)
        } else {
          await axios.put(`/api/v1/admin/permissions/${editingItem.permission_id}`, formData)
        }
        fetchPermissions()
      }
      toast.success(editingItem ? `${activeTab.slice(0, -1).replace(/^./, c => c.toUpperCase())} updated` : `${activeTab.slice(0, -1).replace(/^./, c => c.toUpperCase())} created`)
      setShowModal(false)
    } catch (err) {
      const msg = err.response?.data?.message || `Failed to ${modalType} ${activeTab.slice(0, -1)}`
      setError(msg)
      toast.error(msg)
    }
  }

  // Excel import handlers
  const handleImportUsers = async (importedData) => {
    setLoading(true)
    setError('')
    let successCount = 0
    let errorCount = 0
    const errors = []

    for (const item of importedData) {
      try {
        // Check if user exists (update) or create new
        if (item.user_id) {
          try {
            await axios.put(`/api/v1/admin/users/${item.user_id}`, item)
            successCount++
          } catch (err) {
            // If update fails, try create
            await axios.post('/api/v1/admin/users', item)
            successCount++
          }
        } else {
          await axios.post('/api/v1/admin/users', item)
          successCount++
        }
      } catch (err) {
        errorCount++
        errors.push(`${item.email || item.user_id || 'Unknown'}: ${err.response?.data?.message || err.message}`)
      }
    }

    setLoading(false)
    if (errorCount > 0) {
      setError(`Imported ${successCount} users. ${errorCount} failed:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n... and ${errors.length - 5} more` : ''}`)
    } else {
      setError('')
      toast.success(`Successfully imported ${successCount} users`)
    }
    fetchUsers()
  }

  const handleImportRoles = async (importedData) => {
    setLoading(true)
    setError('')
    let successCount = 0
    let errorCount = 0
    const errors = []

    for (const item of importedData) {
      try {
        if (item.role_id) {
          try {
            await axios.put(`/api/v1/admin/roles/${item.role_id}`, item)
            successCount++
          } catch (err) {
            await axios.post('/api/v1/admin/roles', item)
            successCount++
          }
        } else {
          await axios.post('/api/v1/admin/roles', item)
          successCount++
        }
      } catch (err) {
        errorCount++
        errors.push(`${item.role_name || item.role_id || 'Unknown'}: ${err.response?.data?.message || err.message}`)
      }
    }

    setLoading(false)
    if (errorCount > 0) {
      setError(`Imported ${successCount} roles. ${errorCount} failed:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n... and ${errors.length - 5} more` : ''}`)
    } else {
      setError('')
      toast.success(`Successfully imported ${successCount} roles`)
    }
    fetchRoles()
  }

  const handleImportPermissions = async (importedData) => {
    setLoading(true)
    setError('')
    let successCount = 0
    let errorCount = 0
    const errors = []

    for (const item of importedData) {
      try {
        if (item.permission_id) {
          try {
            await axios.put(`/api/v1/admin/permissions/${item.permission_id}`, item)
            successCount++
          } catch (err) {
            await axios.post('/api/v1/admin/permissions', item)
            successCount++
          }
        } else {
          await axios.post('/api/v1/admin/permissions', item)
          successCount++
        }
      } catch (err) {
        errorCount++
        errors.push(`${item.permission_name || item.permission_id || 'Unknown'}: ${err.response?.data?.message || err.message}`)
      }
    }

    setLoading(false)
    if (errorCount > 0) {
      setError(`Imported ${successCount} permissions. ${errorCount} failed:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n... and ${errors.length - 5} more` : ''}`)
    } else {
      setError('')
      toast.success(`Successfully imported ${successCount} permissions`)
    }
    fetchPermissions()
  }

  const tabs = [
    { id: 'users', label: 'Users', permission: PERMISSIONS.ADMIN_USERS },
    { id: 'roles', label: 'Roles', permission: PERMISSIONS.ADMIN_ROLES },
    { id: 'permissions', label: 'Permissions', permission: PERMISSIONS.ADMIN_ROLES },
  ]

  const renderUsersTab = () => {
    if (!canManageUsers) {
      return <div className="text-center py-12 text-red-500">You do not have permission to manage users.</div>
    }

    if (loading) {
      return <div className="text-center py-12">Loading...</div>
    }

    return (
      <Table
        columns={[
          { key: 'user_id', header: 'User ID', sortable: true, filterable: true },
          { key: 'email', header: 'Email', sortable: true, filterable: true },
          { key: 'employee_id', header: 'Employee ID', sortable: true },
          { key: 'status', header: 'Status', sortable: true, filterable: true },
          {
            key: 'roles',
            header: 'Roles',
            render: (row) => {
              const userAssignments = userRoles[row.user_id] || []
              if (userAssignments.length === 0) {
                return <span className="text-gray-400 dark:text-gray-500 text-sm">No roles</span>
              }
              
              // Get unique role names
              const roleNames = userAssignments
                .map(assignment => {
                  const role = roles.find(r => r.role_id === assignment.role_id)
                  return role?.role_name || assignment.role_id
                })
                .filter((name, index, self) => self.indexOf(name) === index) // Remove duplicates
              
              return (
                <div className="flex flex-wrap gap-1.5">
                  {roleNames.map((roleName, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                    >
                      {roleName}
                    </span>
                  ))}
                </div>
              )
            }
          },
          {
            key: 'actions',
            header: 'Actions',
            render: (row) => (
              <div className="flex space-x-3">
                <button onClick={() => handleEdit(row, 'user')} className="text-primary-600 hover:text-primary-900 flex items-center gap-1">
                  <Edit size={16} />
                  Edit
                </button>
                <button onClick={() => handleManageUserRoles(row)} className="text-blue-600 hover:text-blue-900 flex items-center gap-1">
                  <Shield size={16} />
                  Manage Roles
                </button>
                <button onClick={() => handleDelete(row.user_id, 'user')} className="text-red-600 hover:text-red-900 flex items-center gap-1">
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            )
          }
        ]}
        data={users}
        rowKey={(row) => row.user_id}
        loading={loading}
        paginationMode="client"
        defaultPageSize={10}
        emptyMessage="No users found"
      />
    )
  }

  const renderRolesTab = () => {
    if (!canManageRoles) {
      return <div className="text-center py-12 text-red-500">You do not have permission to manage roles.</div>
    }

    if (loading) {
      return <div className="text-center py-12">Loading...</div>
    }

    return (
      <Table
        columns={[
          { key: 'role_id', header: 'Role ID', sortable: true, filterable: true },
          { key: 'role_name', header: 'Role Name', sortable: true, filterable: true },
          { key: 'description', header: 'Description', sortable: true },
          { key: 'status', header: 'Status', sortable: true, filterable: true },
          {
            key: 'actions',
            header: 'Actions',
            render: (row) => (
              <div className="flex space-x-3">
                <button onClick={() => handleEdit(row, 'role')} className="text-primary-600 hover:text-primary-900 flex items-center gap-1">
                  <Edit size={16} />
                  Edit
                </button>
                <button onClick={() => handleManageRolePermissions(row)} className="text-blue-600 hover:text-blue-900 flex items-center gap-1">
                  <Key size={16} />
                  Manage Permissions
                </button>
                <button onClick={() => handleDelete(row.role_id, 'role')} className="text-red-600 hover:text-red-900 flex items-center gap-1">
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            )
          }
        ]}
        data={roles}
        rowKey={(row) => row.role_id}
        loading={loading}
        paginationMode="client"
        defaultPageSize={10}
        emptyMessage="No roles found"
      />
    )
  }

  const renderPermissionsTab = () => {
    if (!canManageRoles) {
      return <div className="text-center py-12 text-red-500">You do not have permission to manage permissions.</div>
    }

    if (loading) {
      return <div className="text-center py-12">Loading...</div>
    }

    return (
      <Table
        columns={[
          { key: 'permission_id', header: 'Permission ID', sortable: true, filterable: true },
          { key: 'permission_name', header: 'Permission Name', sortable: true, filterable: true },
          { key: 'resource', header: 'Resource', sortable: true, filterable: true },
          { key: 'action', header: 'Action', sortable: true, filterable: true },
          { key: 'description', header: 'Description', sortable: true },
          {
            key: 'actions',
            header: 'Actions',
            render: (row) => (
              <div className="flex space-x-3">
                <button onClick={() => handleEdit(row, 'permission')} className="text-primary-600 hover:text-primary-900 flex items-center gap-1">
                  <Edit size={16} />
                  Edit
                </button>
                <button onClick={() => handleDelete(row.permission_id, 'permission')} className="text-red-600 hover:text-red-900 flex items-center gap-1">
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            )
          }
        ]}
        data={permissionsList}
        rowKey={(row) => row.permission_id}
        loading={loading}
        paginationMode="client"
        defaultPageSize={10}
        emptyMessage="No permissions found"
      />
    )
  }

  const renderModal = () => {
    if (!showModal) return null

    // Assignment modals
    if (modalType === 'assign-permission' && assigningTo) {
      const currentPermissions = rolePermissions[assigningTo.role_id] || []
      const availablePermissions = permissionsList.filter(
        p => !currentPermissions.some(cp => cp.permission_id === p.permission_id)
      )

      return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-8 border w-11/12 md:w-3/4 lg:w-2/3 shadow-xl rounded-3xl bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-1">
                    Manage Permissions: {assigningTo.role_name}
                  </h3>
                </div>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500">
                  <X size={20} />
                </button>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-2xl font-medium text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Current Permissions */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-4">Current Permissions</h4>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-4 max-h-96 overflow-y-auto">
                    {currentPermissions.length === 0 ? (
                      <p className="text-gray-500 text-sm">No permissions assigned</p>
                    ) : (
                      <div className="space-y-2">
                        {currentPermissions.map(perm => (
                          <div key={perm.permission_id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            <div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">{perm.permission_name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{perm.resource}:{perm.action}</div>
                            </div>
                            <button
                              onClick={() => handleRemovePermissionFromRole(assigningTo.role_id, perm.permission_id)}
                              className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                            >
                              <Minus size={16} />
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Add Permission */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-4">Add Permission</h4>
                  <form onSubmit={handleAssignPermissionToRole} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                        Permission <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.permission_id || ''}
                        onChange={(e) => setFormData({ ...formData, permission_id: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-4 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        required
                      >
                        <option value="">Select permission...</option>
                        {availablePermissions.map(perm => (
                          <option key={perm.permission_id} value={perm.permission_id}>
                            {perm.permission_name} ({perm.resource}:{perm.action})
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center justify-center gap-2"
                      disabled={!formData.permission_id}
                    >
                      <Plus size={18} />
                      Add Permission
                    </button>
                  </form>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 border border-gray-200 dark:border-gray-600 rounded-2xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2 font-semibold text-xs uppercase tracking-widest transition-all"
                >
                  <X size={18} />
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (modalType === 'assign-role' && assigningTo) {
      const currentAssignments = userRoles[assigningTo.user_id] || []
      const availableRoles = roles.filter(
        r => !currentAssignments.some(ca => ca.role_id === r.role_id && (!ca.cost_center_id || ca.cost_center_id === formData.cost_center_id))
      )

      return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-8 border w-11/12 md:w-3/4 lg:w-2/3 shadow-xl rounded-3xl bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-1">
                    Manage Roles: {assigningTo.email}
                  </h3>
                </div>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500">
                  <X size={20} />
                </button>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-2xl font-medium text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Current Role Assignments */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-4">Current Role Assignments</h4>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-4 max-h-96 overflow-y-auto">
                    {currentAssignments.length === 0 ? (
                      <p className="text-gray-500 text-sm">No roles assigned</p>
                    ) : (
                      <div className="space-y-2">
                        {currentAssignments.map(assignment => {
                          const role = roles.find(r => r.role_id === assignment.role_id)
                          return (
                            <div key={assignment.assignment_id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                              <div>
                                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {role?.role_name || assignment.role_id}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {assignment.cost_center_id ? `Cost Center: ${assignment.cost_center_id}` : 'Global'}
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveRoleFromUser(assigningTo.user_id, assignment.role_id, assignment.cost_center_id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Add Role */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest mb-4">Add Role</h4>
                  <form onSubmit={handleAssignRoleToUser} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                        Role <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.role_id || ''}
                        onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-4 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        required
                      >
                        <option value="">Select role...</option>
                        {availableRoles.map(role => (
                          <option key={role.role_id} value={role.role_id}>
                            {role.role_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                        Cost Center (Optional)
                      </label>
                      <select
                        value={formData.cost_center_id || ''}
                        onChange={(e) => setFormData({ ...formData, cost_center_id: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-4 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      >
                        <option value="">Global (No Cost Center)</option>
                        {costCenters.map(cc => (
                          <option key={cc.cost_center_id} value={cc.cost_center_id}>
                            {cc.cost_center_name} ({cc.cost_center_id})
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full px-6 py-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 font-semibold text-xs uppercase tracking-widest shadow-lg shadow-primary-200 dark:shadow-primary-900 transition-all"
                      disabled={!formData.role_id}
                    >
                      <Plus size={18} />
                      Add Role
                    </button>
                  </form>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 border border-gray-200 dark:border-gray-600 rounded-2xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2 font-semibold text-xs uppercase tracking-widest transition-all"
                >
                  <X size={18} />
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Regular CRUD modals
    const getFormFields = () => {
      if (activeTab === 'users') {
        return [
          { name: 'user_id', label: 'User ID', type: 'text', required: true, disabled: modalType === 'edit' },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'employee_id', label: 'Employee ID', type: 'text' },
          { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
        ]
      } else if (activeTab === 'roles') {
        return [
          { name: 'role_id', label: 'Role ID', type: 'text', required: true, disabled: modalType === 'edit' },
          { name: 'role_name', label: 'Role Name', type: 'text', required: true },
          { name: 'description', label: 'Description', type: 'textarea' },
          { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
        ]
      } else if (activeTab === 'permissions') {
        return [
          { name: 'permission_id', label: 'Permission ID', type: 'text', required: true, disabled: modalType === 'edit' },
          { name: 'permission_name', label: 'Permission Name', type: 'text', required: true },
          { name: 'resource', label: 'Resource', type: 'text', required: true },
          { name: 'action', label: 'Action', type: 'text', required: true },
          { name: 'description', label: 'Description', type: 'textarea' },
        ]
      }
      return []
    }

    const fields = getFormFields()

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-8 border w-11/12 md:w-3/4 lg:w-1/2 shadow-xl rounded-3xl bg-white dark:bg-gray-800">
          <div className="mt-3">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {modalType === 'create' ? 'Create' : 'Edit'} {tabs.find(t => t.id === activeTab)?.label.slice(0, -1)}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500">✕</button>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map(field => (
                <div key={field.name}>
                  <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-4 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      required={field.required}
                      disabled={field.disabled}
                      rows={3}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-4 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      required={field.required}
                      disabled={field.disabled}
                    >
                      <option value="">Select...</option>
                      {field.options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-4 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      required={field.required}
                      disabled={field.disabled}
                    />
                  )}
                </div>
              ))}

              <div className="flex justify-end space-x-3 pt-4">
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
                  className="px-6 py-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 flex items-center gap-2 font-semibold text-xs uppercase tracking-widest shadow-lg shadow-primary-200 dark:shadow-primary-900 transition-all"
                >
                  <Save size={18} />
                  {modalType === 'create' ? 'Create' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // Get current data for export
  const getCurrentData = () => {
    if (activeTab === 'users') return users
    if (activeTab === 'roles') return roles
    if (activeTab === 'permissions') return permissionsList
    return []
  }

  // Get import handler for current tab
  const getImportHandler = () => {
    if (activeTab === 'users') return handleImportUsers
    if (activeTab === 'roles') return handleImportRoles
    if (activeTab === 'permissions') return handleImportPermissions
    return null
  }

  // Get required fields and template headers for current tab
  const getExcelConfig = () => {
    if (activeTab === 'users') {
      return {
        requiredFields: ['email'],
        fieldMappings: {
          user_id: 'User ID',
          email: 'Email',
          employee_id: 'Employee ID',
          status: 'Status'
        },
        templateHeaders: [
          { key: 'user_id', label: 'User ID' },
          { key: 'email', label: 'Email' },
          { key: 'employee_id', label: 'Employee ID' },
          { key: 'status', label: 'Status' }
        ]
      }
    }
    if (activeTab === 'roles') {
      return {
        requiredFields: ['role_id', 'role_name'],
        fieldMappings: {
          role_id: 'Role ID',
          role_name: 'Role Name',
          description: 'Description',
          status: 'Status'
        },
        templateHeaders: [
          { key: 'role_id', label: 'Role ID' },
          { key: 'role_name', label: 'Role Name' },
          { key: 'description', label: 'Description' },
          { key: 'status', label: 'Status' }
        ]
      }
    }
    if (activeTab === 'permissions') {
      return {
        requiredFields: ['permission_id', 'permission_name', 'resource', 'action'],
        fieldMappings: {
          permission_id: 'Permission ID',
          permission_name: 'Permission Name',
          resource: 'Resource',
          action: 'Action',
          description: 'Description'
        },
        templateHeaders: [
          { key: 'permission_id', label: 'Permission ID' },
          { key: 'permission_name', label: 'Permission Name' },
          { key: 'resource', label: 'Resource' },
          { key: 'action', label: 'Action' },
          { key: 'description', label: 'Description' }
        ]
      }
    }
    return { requiredFields: [], fieldMappings: {}, templateHeaders: [] }
  }

  const getCreateButtonPermission = () => {
    if (activeTab === 'users') return PERMISSIONS.ADMIN_USERS
    if (activeTab === 'roles' || activeTab === 'permissions') return PERMISSIONS.ADMIN_ROLES
    return null
  }

  return (
    <Layout>
      <div className="w-full py-4 px-4">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">User Management</h1>
            <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-widest">
              Manage users, roles, and permissions
            </p>
          </div>
          <div className="flex gap-4">
            <RequirePermission permissions={permissions} permission={getCreateButtonPermission()}>
              <ExcelImportExport
                data={getCurrentData()}
                filename={`${activeTab}_${new Date().toISOString().split('T')[0]}`}
                sheetName={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                onImport={getImportHandler()}
                requiredFields={getExcelConfig().requiredFields}
                fieldMappings={getExcelConfig().fieldMappings}
                templateHeaders={getExcelConfig().templateHeaders}
                disabled={!canManageUsers && !canManageRoles}
              />
              <button
                onClick={() => handleCreate(activeTab.slice(0, -1))}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-semibold text-xs uppercase tracking-widest shadow-lg shadow-primary-200 dark:shadow-primary-900 transition-all flex items-center gap-2"
              >
                <Plus size={18} />
                Create New
              </button>
            </RequirePermission>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
            <nav className="flex -mb-px px-8">
              {tabs.map(tab => {
                const hasPermission = permissions?.includes(tab.permission) || permissions?.includes(PERMISSIONS.ADMIN_SYSTEM)
                if (!hasPermission) return null
                return (
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
                )
              })}
            </nav>
          </div>
          <div className="p-8">
            {activeTab === 'users' && renderUsersTab()}
            {activeTab === 'roles' && renderRolesTab()}
            {activeTab === 'permissions' && renderPermissionsTab()}
          </div>
        </div>
      </div>
      {renderModal()}
    </Layout>
  )
}

