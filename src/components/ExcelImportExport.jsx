import { useRef } from 'react'
import { Download, Upload, FileSpreadsheet } from 'lucide-react'
import toast from 'react-hot-toast'
import { exportToExcel, readExcelFile, validateExcelData, downloadExcelTemplate } from '../utils/excel'

/**
 * Reusable component for Excel import/export functionality
 * 
 * @param {Object} props
 * @param {Array} props.data - Data to export
 * @param {string} props.filename - Base filename for export
 * @param {string} props.sheetName - Excel sheet name
 * @param {Function} props.onImport - Callback when import is successful (receives validated data)
 * @param {Array} props.requiredFields - Required fields for validation
 * @param {Object} props.fieldMappings - Mapping of Excel columns to API fields
 * @param {Array} props.templateHeaders - Headers for template download [{ key, label }]
 * @param {boolean} props.disabled - Disable import/export buttons
 */
export default function ExcelImportExport({
  data = [],
  filename = 'export',
  sheetName = 'Data',
  onImport,
  requiredFields = [],
  fieldMappings = {},
  templateHeaders = [],
  disabled = false
}) {
  const fileInputRef = useRef(null)

  const handleExport = () => {
    exportToExcel(data, filename, sheetName)
  }

  const handleDownloadTemplate = () => {
    if (templateHeaders.length === 0) {
      toast.error('Template headers not configured')
      return
    }
    downloadExcelTemplate(templateHeaders, `${filename}_template`)
  }

  const handleImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ]
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast.error('Please select a valid Excel file (.xlsx, .xls, or .csv)')
      return
    }

    try {
      const excelData = await readExcelFile(file)
      
      // Validate data
      const validation = validateExcelData(excelData, requiredFields, fieldMappings)
      
      if (!validation.valid) {
        const errorMsg = `Validation errors: ${validation.errors.slice(0, 5).join('; ')}${validation.errors.length > 5 ? ` and ${validation.errors.length - 5} more` : ''}`
        toast.error(errorMsg)
        return
      }

      // Call the import callback with validated data
      if (onImport) {
        onImport(validation.mappedData)
      }
    } catch (error) {
      toast.error(`Failed to import Excel file: ${error.message}`)
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExport}
        disabled={disabled || data.length === 0}
        className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-md text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:border-gray-200 dark:disabled:border-gray-700 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
        title="Export current data to Excel"
      >
        <Download size={18} /> Export Excel
      </button>
      
      {templateHeaders.length > 0 && (
        <button
          onClick={handleDownloadTemplate}
          disabled={disabled}
          className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:border-gray-200 dark:disabled:border-gray-700 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          title="Download Excel template"
        >
          <FileSpreadsheet size={18} /> Download Template
        </button>
      )}
      
      <button
        onClick={handleImportClick}
        disabled={disabled}
        className="px-4 py-2 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-md text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/30 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:border-gray-200 dark:disabled:border-gray-700 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
        title="Import data from Excel file"
      >
        <Upload size={18} /> Import Excel
      </button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleImport}
        data-testid="file-input"
        className="hidden"
      />
    </div>
  )
}

