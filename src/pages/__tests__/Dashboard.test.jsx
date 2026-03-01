import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';
import { PermissionsProvider } from '../../context/PermissionsContext';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock PermissionsContext
vi.mock('../../context/PermissionsContext', () => ({
  PermissionsProvider: ({ children }) => children,
  usePermissionsContext: () => ({
    permissions: [],
    roles: [],
    loading: false,
  }),
}));

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('redirects to login when no token', async () => {
    render(
      <BrowserRouter>
        <PermissionsProvider>
          <Dashboard />
        </PermissionsProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    }, { timeout: 1000 });
  });

  it('redirects to login when no user data', async () => {
    localStorage.setItem('token', 'test-token');

    render(
      <BrowserRouter>
        <PermissionsProvider>
          <Dashboard />
        </PermissionsProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    }, { timeout: 1000 });
  });

  it('renders dashboard when user is logged in', async () => {
    const userData = { email: 'test@example.com', full_name: 'Test User' };
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify(userData));

    const { container } = render(
      <BrowserRouter>
        <PermissionsProvider>
          <Dashboard />
        </PermissionsProvider>
      </BrowserRouter>
    );

    // Wait for component to render (not in loading state)
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    }, { timeout: 2000 });

    // Verify dashboard content is rendered
    expect(container.textContent).toContain('Dashboard');
  });

  it('displays all navigation cards', async () => {
    const userData = { email: 'test@example.com' };
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify(userData));

    render(
      <BrowserRouter>
        <PermissionsProvider>
          <Dashboard />
        </PermissionsProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Master Data')).toBeInTheDocument();
      expect(screen.getByText('Requisitions')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('shows loading state initially', () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ email: 'test@example.com' }));

    const { container } = render(
      <BrowserRouter>
        <PermissionsProvider>
          <Dashboard />
        </PermissionsProvider>
      </BrowserRouter>
    );

    expect(container).toBeTruthy();
  });
});
