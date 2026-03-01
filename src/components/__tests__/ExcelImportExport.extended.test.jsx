import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExcelImportExport from '../ExcelImportExport';

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

describe('ExcelImportExport - Extended Tests', () => {
  const mockData = [{ id: 1, name: 'Item 1' }];
  const mockOnImport = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles file upload with validation errors', async () => {
    const { validateExcelData } = await import('../../utils/excel');
    validateExcelData.mockReturnValueOnce({
      valid: false,
      errors: ['Missing required field: email'],
      mappedData: [],
    });

    render(
      <ExcelImportExport
        data={mockData}
        filename="test"
        onImport={mockOnImport}
        requiredFields={['email']}
      />
    );

    const fileInput = screen.getByTestId('file-input');
    const file = new File(['test'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    global.alert = vi.fn();
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(validateExcelData).toHaveBeenCalled();
    });
  });

  it('handles file read errors', async () => {
    const { readExcelFile } = await import('../../utils/excel');
    readExcelFile.mockRejectedValueOnce(new Error('Invalid file format'));

    render(
      <ExcelImportExport
        data={mockData}
        filename="test"
        onImport={mockOnImport}
      />
    );

    const fileInput = screen.getByTestId('file-input');
    const file = new File(['invalid'], 'test.xlsx');

    global.alert = vi.fn();
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalled();
    });
  });

  it('disables export when data is empty', () => {
    render(
      <ExcelImportExport data={[]} filename="test" onImport={mockOnImport} />
    );

    const exportButton = screen.getByText(/Export Excel/i);
    expect(exportButton).toBeDisabled();
  });

  it('enables export when data exists', () => {
    render(
      <ExcelImportExport
        data={mockData}
        filename="test"
        onImport={mockOnImport}
      />
    );

    const exportButton = screen.getByText(/Export Excel/i);
    expect(exportButton).not.toBeDisabled();
  });

  it('calls onImport with validated data', async () => {
    const { readExcelFile, validateExcelData } = await import('../../utils/excel');
    const validatedData = [{ email: 'test@example.com', name: 'Test' }];
    validateExcelData.mockReturnValueOnce({
      valid: true,
      errors: [],
      mappedData: validatedData,
    });

    render(
      <ExcelImportExport
        data={mockData}
        filename="test"
        onImport={mockOnImport}
      />
    );

    const fileInput = screen.getByTestId('file-input');
    const file = new File(['test'], 'test.xlsx');

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockOnImport).toHaveBeenCalledWith(validatedData);
    });
  });
});

