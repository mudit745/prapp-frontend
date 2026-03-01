import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import MasterData from './pages/MasterData'
import UserManagement from './pages/UserManagement'
import Requisitions from './pages/Requisitions'
import RequisitionCreate from './pages/RequisitionCreate'
import RequisitionView from './pages/RequisitionView'
import UserManual from './pages/UserManual'
import BusinessRuleManagement from './pages/BusinessRuleManagement'
import WorkflowRuleEditor from './pages/WorkflowRuleEditor'
import Inbox from './pages/Inbox'
import Reports from './pages/Reports'
import UARSection from './pages/UARSection'
import SystemIntegration from './pages/SystemIntegration'
import QuotationRequests from './pages/QuotationRequests'
import QuotationRequestCreate from './pages/QuotationRequestCreate'
import QuotationRequestConfirmation from './pages/QuotationRequestConfirmation'
import QuotationSubmissions from './pages/QuotationSubmissions'
import QuotationEvaluation from './pages/QuotationEvaluation'
import VendorQuotationSubmit from './pages/VendorQuotationSubmit'
import { PermissionsProvider, usePermissionsContext } from './context/PermissionsContext'
import { hasPermission, hasAnyPermission } from './utils/permissions'
import { PERMISSIONS } from './utils/permissions'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

function RequireConfigRoute({ requiredPermissions, children }) {
  const { permissions } = usePermissionsContext()
  const hasAccess = hasAnyPermission(permissions, ...requiredPermissions)
  return hasAccess ? children : <Navigate to="/dashboard" replace />
}

function RequireMasterDataRoute({ children }) {
  const { permissions, roles } = usePermissionsContext()
  const canManage = hasPermission(permissions, PERMISSIONS.MASTER_DATA_MANAGE)
  const canViewOnly = hasPermission(permissions, PERMISSIONS.MASTER_DATA_VIEW)
  const isRequestor = roles && roles.some(r => r === 'Requestor')
  const hasAccess = canManage || (canViewOnly && !isRequestor)
  return hasAccess ? children : <Navigate to="/dashboard" replace />
}

function App() {
  useEffect(() => {
    // Apply theme on mount (light | dark | amoled)
    const theme = localStorage.getItem('theme') || (localStorage.getItem('darkMode') === 'true' ? 'dark' : 'light')
    document.documentElement.classList.remove('dark', 'amoled')
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (theme === 'amoled') {
      document.documentElement.classList.add('dark', 'amoled')
    }
  }, [])

  // Prevent React Router from scrolling to top on navigation
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  return (
    <PermissionsProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          success: {
            className: '!border-2 !border-green-500 !bg-green-50 !text-green-900 dark:!border-green-400 dark:!bg-green-900 dark:!text-green-100',
            iconTheme: { primary: '#059669', secondary: '#fff' }
          },
          error: {
            className: '!border-2 !border-red-500 !bg-red-50 !text-red-900 dark:!border-red-400 dark:!bg-red-900 dark:!text-red-100',
            iconTheme: { primary: '#dc2626', secondary: '#fff' }
          },
          default: {
            className: '!border-2 !border-gray-400 !bg-white !text-gray-900 dark:!border-gray-500 dark:!bg-gray-800 dark:!text-gray-100',
            iconTheme: { primary: '#6b7280', secondary: '#fff' }
          }
        }}
      />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/master-data"
          element={
            <PrivateRoute>
              <RequireMasterDataRoute>
                <MasterData />
              </RequireMasterDataRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/user-management"
          element={
            <PrivateRoute>
              <UserManagement />
            </PrivateRoute>
          }
        />
        <Route
          path="/requisitions"
          element={
            <PrivateRoute>
              <Requisitions />
            </PrivateRoute>
          }
        />
        <Route
          path="/requisitions/create"
          element={
            <PrivateRoute>
              <RequisitionCreate />
            </PrivateRoute>
          }
        />
        <Route
          path="/requisitions/edit/:id"
          element={
            <PrivateRoute>
              <RequisitionCreate />
            </PrivateRoute>
          }
        />
        <Route
          path="/requisitions/view/:id"
          element={
            <PrivateRoute>
              <RequisitionView />
            </PrivateRoute>
          }
        />
        <Route
          path="/user-manual"
          element={
            <PrivateRoute>
              <UserManual />
            </PrivateRoute>
          }
        />
        <Route
          path="/business-rules"
          element={
            <PrivateRoute>
              <RequireConfigRoute requiredPermissions={[PERMISSIONS.ADMIN_SYSTEM, PERMISSIONS.ADMIN_ROLES, PERMISSIONS.WORKFLOW_VIEW]}>
                <BusinessRuleManagement />
              </RequireConfigRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/business-rules/workflow/new"
          element={
            <PrivateRoute>
              <RequireConfigRoute requiredPermissions={[PERMISSIONS.ADMIN_SYSTEM, PERMISSIONS.ADMIN_ROLES, PERMISSIONS.WORKFLOW_VIEW]}>
                <WorkflowRuleEditor />
              </RequireConfigRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/business-rules/workflow/:id"
          element={
            <PrivateRoute>
              <RequireConfigRoute requiredPermissions={[PERMISSIONS.ADMIN_SYSTEM, PERMISSIONS.ADMIN_ROLES, PERMISSIONS.WORKFLOW_VIEW]}>
                <WorkflowRuleEditor />
              </RequireConfigRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/inbox"
          element={
            <PrivateRoute>
              <Inbox />
            </PrivateRoute>
          }
        />
        <Route
          path="/quotation-requests"
          element={
            <PrivateRoute>
              <QuotationRequests />
            </PrivateRoute>
          }
        />
        <Route
          path="/quotation-requests/create"
          element={
            <PrivateRoute>
              <QuotationRequestCreate />
            </PrivateRoute>
          }
        />
        <Route
          path="/quotation-requests/confirmation/:id"
          element={
            <PrivateRoute>
              <QuotationRequestConfirmation />
            </PrivateRoute>
          }
        />
        <Route
          path="/quotation-requests/:id/evaluate"
          element={
            <PrivateRoute>
              <QuotationEvaluation />
            </PrivateRoute>
          }
        />
        <Route
          path="/quotation-requests/:id/submissions"
          element={
            <PrivateRoute>
              <QuotationSubmissions />
            </PrivateRoute>
          }
        />
        <Route path="/submit-quotation/:token" element={<VendorQuotationSubmit />} />
        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <Reports />
            </PrivateRoute>
          }
        />
        <Route
          path="/uar"
          element={
            <PrivateRoute>
              <RequireConfigRoute requiredPermissions={[PERMISSIONS.ADMIN_SYSTEM, PERMISSIONS.ADMIN_ROLES]}>
                <UARSection />
              </RequireConfigRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/system-integration"
          element={
            <PrivateRoute>
              <RequireConfigRoute requiredPermissions={[PERMISSIONS.ADMIN_SYSTEM, PERMISSIONS.ADMIN_ROLES, PERMISSIONS.WORKFLOW_VIEW, PERMISSIONS.INTEGRATION_VIEW]}>
                <SystemIntegration />
              </RequireConfigRoute>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
    </PermissionsProvider>
  )
}

export default App

