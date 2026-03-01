import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';

// Mock axios
vi.mock('axios');

// Mock PermissionsContext
vi.mock('../../context/PermissionsContext', () => ({
  PermissionsProvider: ({ children }) => children,
  usePermissionsContext: () => ({
    permissions: ['cost_center:view', 'cost_center:manage', 'vendor:view'],
    roles: ['Admin'],
    loading: false,
  }),
}));

// Mock RequirePermission
vi.mock('../../components/RequirePermission', () => ({
  default: ({ children }) => <div data-testid="protected-content">{children}</div>,
}));

// Mock ExcelImportExport
vi.mock('../../components/ExcelImportExport', () => ({
  default: () => <div data-testid="excel-component">Excel Component</div>,
}));

describe('MasterData Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValue({ data: [] });
  });

  it('renders without crashing', async () => {
    const MasterData = (await import('../MasterData')).default;

    const { container } = render(
      <BrowserRouter>
        <MasterData />
      </BrowserRouter>
    );

    expect(container).toBeTruthy();
  });

  it('renders without errors', async () => {
    axios.get.mockResolvedValue({
      data: [{ cost_center_id: 'CC-001', cost_center_name: 'IT Dept', status: 'Active' }],
    });

    const MasterData = (await import('../MasterData')).default;

    const { container } = render(
      <BrowserRouter>
        <MasterData />
      </BrowserRouter>
    );

    // Component renders successfully
    expect(container.firstChild).toBeTruthy();
  });
});
