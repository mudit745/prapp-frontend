import * as XLSX from 'xlsx'
import toast from 'react-hot-toast'

/**
 * Export data to Excel file
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file (without extension)
 * @param {string} sheetName - Name of the Excel sheet
 */
export function exportToExcel(data, filename = 'export', sheetName = 'Sheet1') {
  if (!data || data.length === 0) {
    toast.error('No data to export')
    return
  }

  // Create a new workbook
  const wb = XLSX.utils.book_new()
  
  // Convert data to worksheet
  const ws = XLSX.utils.json_to_sheet(data)
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  
  // Generate Excel file and trigger download
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

/**
 * Read Excel file and return data as array of objects
 * @param {File} file - Excel file to read
 * @returns {Promise<Array>} Promise that resolves to array of objects
 */
export function readExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        
        // Get first sheet
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          raw: false, // Convert dates and numbers to strings for easier handling
          defval: '' // Default value for empty cells
        })
        
        resolve(jsonData)
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error.message}`))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Validate Excel data against expected fields
 * @param {Array} data - Data from Excel
 * @param {Array} requiredFields - Array of required field names
 * @param {Object} fieldMappings - Optional mapping of Excel column names to API field names
 * @returns {Object} { valid: boolean, errors: Array, mappedData: Array }
 */
export function validateExcelData(data, requiredFields = [], fieldMappings = {}) {
  const errors = []
  const mappedData = []
  
  if (!data || data.length === 0) {
    return { valid: false, errors: ['Excel file is empty'], mappedData: [] }
  }
  
  data.forEach((row, index) => {
    const rowNum = index + 2 // +2 because Excel rows start at 1 and we have a header
    const rowErrors = []
    const mappedRow = {}
    
    // Check required fields
    requiredFields.forEach(field => {
      const excelField = fieldMappings[field] || field
      if (!row[excelField] || row[excelField].toString().trim() === '') {
        rowErrors.push(`Row ${rowNum}: Missing required field "${field}"`)
      }
    })
    
    // Map fields if mappings provided
    Object.keys(row).forEach(excelField => {
      // Find the API field name (reverse lookup in mappings)
      const apiField = Object.keys(fieldMappings).find(
        key => fieldMappings[key] === excelField
      ) || excelField
      
      // Convert empty strings to null for optional fields
      const value = row[excelField]
      mappedRow[apiField] = value === '' ? null : value
    })
    
    if (rowErrors.length > 0) {
      errors.push(...rowErrors)
    } else {
      mappedData.push(mappedRow)
    }
  })
  
  return {
    valid: errors.length === 0,
    errors,
    mappedData
  }
}

/**
 * Download Excel template with headers
 * @param {Array} headers - Array of header objects { key: string, label: string }
 * @param {string} filename - Name of the template file
 */
export function downloadExcelTemplate(headers, filename = 'template') {
  const templateData = [headers.reduce((acc, header) => {
    acc[header.key] = header.label
    return acc
  }, {})]
  
  exportToExcel(templateData, filename, 'Template')
}

