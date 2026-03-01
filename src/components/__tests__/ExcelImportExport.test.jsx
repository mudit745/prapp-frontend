import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock the excel utility functions
vi.mock('../../utils/excel', () => ({
  exportToExcel: vi.fn(),
  readExcelFile: vi.fn().mockResolvedValue([{ test: 'data' }]),
  validateExcelData: vi.fn().mockReturnValue({
    valid: true,
    errors: [],
    mappedData: [{ test: 'data' }],
  }),
  downloadExcelTemplate: vi.fn(),
}));

describe('ExcelImportExport Component', () => {
  const mockData = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
  ];

  const mockOnImport = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all buttons', async () => {
    const ExcelImportExport = (await import('../ExcelImportExport')).default;

    render(
      <ExcelImportExport
        data={mockData}
        filename="test"
        onImport={mockOnImport}
        templateHeaders={[{ key: 'name', label: 'Name' }]}
      />
    );

    expect(screen.getByText(/Export Excel/i)).toBeInTheDocument();
    expect(screen.getByText(/Download Template/i)).toBeInTheDocument();
    expect(screen.getByText(/Import Excel/i)).toBeInTheDocument();
  });

  it('exports data when Export Excel button is clicked', async () => {
    const { exportToExcel } = await import('../../utils/excel');
    const ExcelImportExport = (await import('../ExcelImportExport')).default;

    render(
      <ExcelImportExport
        data={mockData}
        filename="test"
        onImport={mockOnImport}
      />
    );

    const exportButton = screen.getByText(/Export Excel/i);
    fireEvent.click(exportButton);

    expect(exportToExcel).toHaveBeenCalled();
  });

  it('disables export when no data', async () => {
    const ExcelImportExport = (await import('../ExcelImportExport')).default;

    render(
      <ExcelImportExport data={[]} filename="test" onImport={mockOnImport} />
    );

    const exportButton = screen.getByText(/Export Excel/i);
    expect(exportButton).toBeDisabled();
  });
});
