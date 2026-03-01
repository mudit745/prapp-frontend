import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, Menu, Sun, Moon, Book, Circle, LayoutGrid, Database, Users, Inbox, FileText, ShoppingCart, Receipt, BarChart3, FileSpreadsheet, Settings, ShoppingBag, Shield, Network, PanelLeftClose, PanelLeftOpen, MessageSquareQuote } from 'lucide-react'
import { usePermissionsContext } from '../context/PermissionsContext'
import { hasPermission } from '../utils/permissions'
import { PERMISSIONS } from '../utils/permissions'
import toast from 'react-hot-toast'
import Chatbot from './Chatbot'

export default function Layout({ children }) {
  const [theme, setTheme] = useState('light') // light | dark | amoled
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebarCollapsed') === 'true'
    } catch {
      return false
    }
  })
  const location = useLocation()
  const navigate = useNavigate()
  const { roles, permissions } = usePermissionsContext()
  const navRef = useRef(null)

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const legacyDark = localStorage.getItem('darkMode') === 'true'
    const initial = stored || (legacyDark ? 'dark' : 'light')
    setTheme(initial)

    document.documentElement.classList.remove('dark', 'amoled')
    if (initial === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (initial === 'amoled') {
      document.documentElement.classList.add('dark', 'amoled')
    }
  }, [])

  // Preserve sidebar scroll position on navigation
  // Use useLayoutEffect to restore scroll before paint to prevent flashing
  useLayoutEffect(() => {
    // Restore scroll position immediately before browser paints
    if (navRef.current) {
      const savedScroll = sessionStorage.getItem('sidebarScroll')
      if (savedScroll) {
        navRef.current.scrollTop = parseInt(savedScroll, 10)
      }
    }
  }, [location.pathname])

  const cycleTheme = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'amoled' : 'light'
    setTheme(next)
    localStorage.setItem('theme', next)
    // keep legacy key in sync for older code paths
    localStorage.setItem('darkMode', (next !== 'light').toString())

    document.documentElement.classList.remove('dark', 'amoled')
    if (next === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (next === 'amoled') {
      document.documentElement.classList.add('dark', 'amoled')
    }
  }

  const navigation = [
    {
      group: 'Main',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutGrid },
        { name: 'Master Data', path: '/master-data', icon: Database, permissionAny: ['master_data:manage', 'master_data:view'], hideForRoles: ['Requestor'] },
        { name: 'User Management', path: '/user-management', icon: Users, permission: 'admin:users' },
      ]
    },
    {
      group: 'Procurement',
      items: [
        { name: 'Requests', path: '/requisitions', icon: FileText },
        { name: 'Quotation Requests', path: '/quotation-requests', icon: MessageSquareQuote },
        { name: 'Inbox', path: '/inbox', icon: Inbox },
      ]
    },
    {
      group: 'Reports',
      items: [
        { name: 'Reports', path: '/reports', icon: FileSpreadsheet },
        { name: 'Analytics', path: '/analytics', icon: BarChart3, comingSoon: true },
      ]
    },
    {
      group: 'Configuration',
      items: [
        { name: 'Business Rules', path: '/business-rules', icon: Settings, permissionAny: [PERMISSIONS.ADMIN_SYSTEM, PERMISSIONS.ADMIN_ROLES, PERMISSIONS.WORKFLOW_VIEW] },
        { name: 'User Access Review', path: '/uar', icon: Shield, permissionAny: [PERMISSIONS.ADMIN_SYSTEM, PERMISSIONS.ADMIN_ROLES] },
        { name: 'System Integration', path: '/system-integration', icon: Network, permissionAny: [PERMISSIONS.ADMIN_SYSTEM, PERMISSIONS.ADMIN_ROLES, PERMISSIONS.WORKFLOW_VIEW, PERMISSIONS.INTEGRATION_VIEW] },
      ]
    },
    {
      group: 'Help',
      items: [
        { name: 'User Manual', path: '/user-manual', icon: Book },
      ]
    }
  ]

  const isItemVisible = (item) => {
    if (item.permission && !hasPermission(permissions, item.permission) && !hasPermission(permissions, PERMISSIONS.ADMIN_SYSTEM)) return false
    if (item.permissionAny) {
      const hasAny = item.permissionAny.some(p => hasPermission(permissions, p))
      if (!hasAny) return false
      if (item.hideForRoles && Array.isArray(item.hideForRoles) && roles && roles.some(r => item.hideForRoles.includes(r))) return false
      return true
    }
    return true
  }

  const isActive = (path) => location.pathname === path

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem('sidebarCollapsed', String(next))
      } catch (_) {}
      return next
    })
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // Trigger custom event to notify PermissionsContext
    window.dispatchEvent(new Event('tokenChanged'))
    toast('You have been signed out.', { icon: <LogOut className="w-4 h-4" aria-hidden /> })
    navigate('/login')
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors text-gray-900 dark:text-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-[width,transform] duration-200 ease-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${sidebarCollapsed ? 'lg:w-16 w-64' : 'w-64'}`}
      >
        <div className="h-full flex flex-col w-full min-w-0 overflow-hidden">
          {/* Logo */}
          <div className={`border-b border-gray-200 dark:border-gray-700 shrink-0 ${sidebarCollapsed ? 'p-3 lg:flex lg:justify-center' : 'p-4'}`}>
            <Link
              to="/dashboard"
              className={`flex items-center text-base font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors ${sidebarCollapsed ? 'lg:justify-center' : 'space-x-2.5'}`}
              title="Dashboard"
            >
              <ShoppingBag size={22} className="text-primary-600 dark:text-primary-400 shrink-0" />
              {!sidebarCollapsed && <span className="truncate">Procurement App</span>}
            </Link>
          </div>

          {/* Navigation */}
          <nav
            ref={navRef}
            className={`flex-1 overflow-y-auto space-y-6 transition-all ${sidebarCollapsed ? 'p-2 lg:px-2' : 'p-4'}`}
            onScroll={(e) => {
              sessionStorage.setItem('sidebarScroll', e.target.scrollTop.toString())
            }}
          >
            {navigation.map((section) => {
              const visibleItems = section.items.filter((item) => isItemVisible(item))
              if (visibleItems.length === 0) return null
              return (
                <div key={section.group}>
                  {!sidebarCollapsed && (
                    <h3 className="text-[10px] font-medium text-gray-400 dark:text-gray-500 tracking-widest mb-2 px-3">
                      {section.group}
                    </h3>
                  )}
                  <ul className="space-y-1.5">
                    {visibleItems.map((item) => {
                      const Icon = item.icon
                      const active = isActive(item.path)
                      return (
                        <li key={item.path}>
                          <Link
                            to={item.path}
                            onClick={() => {
                              if (navRef.current) {
                                sessionStorage.setItem('sidebarScroll', navRef.current.scrollTop.toString())
                              }
                              setSidebarOpen(false)
                            }}
                            title={item.name}
                            className={`flex items-center rounded-lg text-xs font-medium transition-all ${
                              sidebarCollapsed
                                ? 'lg:justify-center lg:px-0 lg:py-2.5 px-3 py-2'
                                : 'space-x-2.5 px-3 py-2'
                            } ${
                              active
                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 dark:shadow-primary-900'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                            } ${item.comingSoon ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {Icon && <Icon size={18} className={active ? 'text-white shrink-0' : 'text-gray-500 dark:text-gray-400 shrink-0'} />}
                            {!sidebarCollapsed && (
                              <>
                                <span className="capitalize truncate">{item.name}</span>
                                {item.comingSoon && (
                                  <span className="ml-auto text-[10px] text-gray-500">Soon</span>
                                )}
                              </>
                            )}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </nav>

          {/* Collapse toggle (desktop only) */}
          <div className={`shrink-0 border-t border-gray-200 dark:border-gray-700 ${sidebarCollapsed ? 'p-2 lg:flex lg:justify-center' : 'p-2'}`}>
            <button
              type="button"
              onClick={toggleSidebarCollapsed}
              className="hidden lg:flex items-center justify-center w-full py-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
            </button>
          </div>

          {/* Footer in sidebar */}
          <div className={`border-t border-gray-200 dark:border-gray-700 space-y-3 shrink-0 ${sidebarCollapsed ? 'p-2 lg:flex lg:flex-col lg:items-center' : 'p-4'}`}>
            <button
              onClick={handleLogout}
              title="Logout"
              className={`w-full text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-lg shadow-red-200 dark:shadow-red-900 flex items-center justify-center gap-2 ${sidebarCollapsed ? 'lg:w-10 lg:px-0 lg:py-2.5 px-3 py-2' : 'px-3 py-2'}`}
            >
              <LogOut size={16} className="shrink-0" />
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
            {!sidebarCollapsed && (
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                © 2025 Procurement App
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex flex-col min-h-screen transition-[padding] duration-200 pl-0 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}`}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            >
              <Menu size={24} />
            </button>

            <div className="flex items-center space-x-4 ml-auto">
              {/* Theme toggle (Light -> Dark -> AMOLED -> Light) */}
              <button
                onClick={cycleTheme}
                className="p-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                aria-label="Toggle theme"
                title={theme === 'light' ? 'Theme: Light' : theme === 'dark' ? 'Theme: Dark' : 'Theme: AMOLED'}
              >
                {theme === 'light' ? <Moon size={20} /> : theme === 'dark' ? <Circle size={20} /> : <Sun size={20} />}
              </button>

              {/* User menu */}
              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {user.email || 'User'}
                  </span>
                  {roles && roles.length > 0 && (
                    <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 tracking-widest">
                      {roles.join(', ')}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-lg shadow-red-200 dark:shadow-red-900 flex items-center gap-1.5"
                  title="Logout"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 text-gray-900 dark:text-gray-100">
          {children}
        </main>

        {/* Footer */}
        {/* <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                © 2025 Procurement App. All rights reserved.
              </div>
              <div className="flex space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400">Help</a>
                <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400">About</a>
                <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400">Contact</a>
              </div>
            </div>
          </div>
        </footer> */}
      </div>

      {/* AI Chatbot */}
      <Chatbot />
    </div>
  )
}

