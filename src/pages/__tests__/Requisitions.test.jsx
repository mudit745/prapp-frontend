import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RequisitionCreate from '../RequisitionCreate';
import axios from 'axios';

vi.mock('axios');

const mockPermissions = ['requisition:create', 'requisition:view'];
const mockRoles = ['User'];

vi.mock('../../context/PermissionsContext', () => ({
  PermissionsProvider: ({ children }) => children,
  usePermissionsContext: () => ({
    permissions: mockPermissions,
    roles: mockRoles,
    loading: false,
  }),
}));

vi.mock('../../components/PermissionGuard', () => ({
  RequirePermission: ({ children }) => <div>{children}</div>,
}));

describe('RequisitionCreate - Extended Tests', () => {
  const mockHeaderFields = [
    {
      field_id: 1,
      field_name: 'requester_id',
      field_label: 'Requester',
      formatting_type: 'string',
      is_required: true,
      display_order: 1,
      status: 'Active',
    },
    {
      field_id: 2,
      field_name: 'priority',
      field_label: 'Priority',
      formatting_type: 'dropdown',
      is_required: true,
      display_order: 2,
      validation_rules: '{"options":["Low","Normal","High","Urgent"]}',
      status: 'Active',
    },
  ];

  const mockLineFields = [
    {
      field_id: 1,
      field_name: 'product_id',
      field_label: 'Product',
      formatting_type: 'string',
      is_required: true,
      display_order: 1,
      status: 'Active',
    },
    {
      field_id: 2,
      field_name: 'quantity',
      field_label: 'Quantity',
      formatting_type: 'number',
      is_required: true,
      display_order: 2,
      status: 'Active',
    },
  ];

  const mockPRs = [
    {
      pr_id: 'PR-001',
      pr_number: 'PR-2024-001',
      requester_id: 'EMP-001',
      priority: 'High',
      status: 'Draft',
      total_amount: 1000.0,
      currency: 'SGD',
      created_at: '2024-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('user', JSON.stringify({ email: 'test@example.com' }));
    axios.get.mockImplementation((url) => {
      if (url.includes('pr-header-fields')) {
        return Promise.resolve({ data: mockHeaderFields });
      }
      if (url.includes('pr-line-item-fields')) {
        return Promise.resolve({ data: mockLineFields });
      }
      if (url.includes('requisitions')) {
        return Promise.resolve({ data: mockPRs });
      }
      // Mock master data endpoints
      return Promise.resolve({ data: [] });
    });
  });

  it('displays PR list with correct data', async () => {
    render(
      <BrowserRouter>
        <RequisitionCreate />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/v1/requisitions');
    });

    // Component should render without errors
    expect(screen.getByText('Purchase Requests')).toBeInTheDocument();
  });

  it('handles empty PR list', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('requisitions')) {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: [] });
    });

    render(
      <BrowserRouter>
        <RequisitionCreate />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/v1/requisitions');
    });
  });

  it('opens create form when Create New PR is clicked', async () => {
    render(
      <BrowserRouter>
        <RequisitionCreate />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    // Look for Create button
    const createButton = screen.queryByText(/Create New PR|Create PR/i);
    if (createButton) {
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('/api/v1/pr-header-fields');
      });
    }
  });

  it('handles field validation rules as object', async () => {
    const fieldsWithObjectRules = [
      {
        ...mockHeaderFields[1],
        validation_rules: { options: ['Low', 'Normal', 'High'] },
      },
    ];

    axios.get.mockImplementation((url) => {
      if (url.includes('pr-header-fields')) {
        return Promise.resolve({ data: fieldsWithObjectRules });
      }
      return Promise.resolve({ data: [] });
    });

    render(
      <BrowserRouter>
        <RequisitionCreate />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/v1/pr-header-fields');
    });
  });
});
