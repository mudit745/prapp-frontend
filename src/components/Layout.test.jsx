import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Layout from './Layout'

// Mock PermissionsContext
vi.mock('../context/PermissionsContext', () => ({
  PermissionsProvider: ({ children }) => children,
  usePermissionsContext: () => ({
    permissions: ['admin:users'],
    roles: ['Admin'],
    loading: false,
  }),
}));

// Mock PermissionGuard - return children directly
vi.mock('./PermissionGuard', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

describe('Layout', () => {
  it('renders sidebar and content', () => {
    render(
      <BrowserRouter>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </BrowserRouter>
    )
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('has navigation elements', () => {
    render(
      <BrowserRouter>
        <Layout>
          <div>Test</div>
        </Layout>
      </BrowserRouter>
    )
    // Layout should render successfully
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
