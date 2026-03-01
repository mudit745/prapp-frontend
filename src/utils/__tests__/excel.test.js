import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportToExcel, readExcelFile, validateExcelData, downloadExcelTemplate } from '../excel';
import * as XLSX from 'xlsx';

// Mock XLSX
vi.mock('xlsx', () => ({
  utils: {
    book_new: vi.fn(() => ({})),
    json_to_sheet: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
    sheet_to_json: vi.fn(() => [{ name: 'Test', value: '123' }]),
  },
  writeFile: vi.fn(),
  read: vi.fn(() => ({
    SheetNames: ['Sheet1'],
    Sheets: { Sheet1: {} },
  })),
}));

// Mock alert
global.alert = vi.fn();

describe('Excel Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('exportToExcel', () => {
    it('exports data to Excel file', () => {
      const data = [{ name: 'Test', value: 123 }];
      exportToExcel(data, 'test-export', 'TestSheet');

      expect(XLSX.utils.book_new).toHaveBeenCalled();
      expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith(data);
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalled();
      expect(XLSX.writeFile).toHaveBeenCalledWith({}, 'test-export.xlsx');
    });

    it('shows alert when no data', () => {
      exportToExcel([], 'test');
      expect(global.alert).toHaveBeenCalledWith('No data to export');
      expect(XLSX.writeFile).not.toHaveBeenCalled();
    });

    it('shows alert when data is null', () => {
      exportToExcel(null, 'test');
      expect(global.alert).toHaveBeenCalledWith('No data to export');
    });
  });

  describe('readExcelFile', () => {
    it('reads Excel file and returns data', async () => {
      const file = new File(['test'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const result = await readExcelFile(file);

      expect(XLSX.read).toHaveBeenCalled();
      expect(result).toEqual([{ name: 'Test', value: '123' }]);
    });

    it('handles file read errors', async () => {
      const file = new File(['invalid'], 'test.xlsx');
      XLSX.read.mockImplementationOnce(() => {
        throw new Error('Invalid file');
      });

      await expect(readExcelFile(file)).rejects.toThrow('Invalid file');
    });
  });

  describe('validateExcelData', () => {
    it('validates data with required fields', () => {
      const data = [{ name: 'Test', email: 'test@example.com' }];
      const requiredFields = ['name', 'email'];
      const result = validateExcelData(data, requiredFields);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('returns errors for missing required fields', () => {
      const data = [{ name: 'Test' }];
      const requiredFields = ['name', 'email'];
      const result = validateExcelData(data, requiredFields);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('downloadExcelTemplate', () => {
    it('downloads template with headers', () => {
      const headers = [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
      ];

      downloadExcelTemplate(headers, 'template');

      expect(XLSX.utils.book_new).toHaveBeenCalled();
      expect(XLSX.writeFile).toHaveBeenCalled();
    });
  });
});

