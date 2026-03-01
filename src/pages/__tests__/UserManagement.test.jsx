import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';

// Mock axios
vi.mock('axios');

// Mock PermissionsContext
vi.mock('../../context/PermissionsContext', () => ({
  PermissionsProvider: ({ children }) => children,
  usePermissionsContext: () => ({
    permissions: ['admin:users', 'admin:roles'],
    roles: ['Admin'],
    loading: false,
  }),
}));

// Mock RequirePermission to always allow rendering
vi.mock('../../components/RequirePermission', () => ({
  default: ({ children }) => <div data-testid="protected-content">{children}</div>,
}));

describe('UserManagement Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValue({ data: [] });
  });

  it('makes API calls to load users on mount', async () => {
    const UserManagement = (await import('../UserManagement')).default;

    render(
      <BrowserRouter>
        <UserManagement />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  it('handles API errors without crashing', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    axios.get.mockRejectedValue(new Error('Network error'));

    const UserManagement = (await import('../UserManagement')).default;

    render(
      <BrowserRouter>
        <UserManagement />
      </BrowserRouter>
    );

    // Should not throw an error
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });
});
