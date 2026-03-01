import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Search, X, ChevronDown, Loader2 } from 'lucide-react'
import axios from '../utils/axios'

/**
 * Lookup Component - Searchable dropdown for large datasets
 * 
 * @param {string} apiEndpoint - API endpoint for search (e.g., '/api/v1/vendors/search')
 * @param {string} value - Selected value (ID)
 * @param {function} onChange - Callback when selection changes (receives selected item)
 * @param {function} displayValue - Function to format display value (item) => string
 * @param {function} displaySubtext - Optional function to format subtext (item) => string
 * @param {string} placeholder - Placeholder text
 * @param {boolean} disabled - Whether the field is disabled
 * @param {string} className - Additional CSS classes
 * @param {object} selectedItem - Pre-selected item object (optional, for display)
 */
export default function Lookup({
  apiEndpoint,
  value,
  onChange,
  displayValue = (item) => item?.name || item?.id || '',
  displaySubtext,
  placeholder = 'Search...',
  disabled = false,
  className = '',
  selectedItem = null,
  error = null,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(selectedItem)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const searchTimeoutRef = useRef(null)

  // Load selected item if value is provided
  useEffect(() => {
    if (value && !selected && apiEndpoint) {
      loadSelectedItem(value)
    } else if (selectedItem) {
      setSelected(selectedItem)
    }
  }, [value, selectedItem])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen])

  const loadSelectedItem = async (id) => {
    if (!apiEndpoint || !id) return
    
    try {
      setLoading(true)
      // Try to fetch the item by ID - adjust endpoint as needed
      const response = await axios.get(`${apiEndpoint.replace('/search', '')}/${id}`)
      if (response.data) {
        setSelected(response.data)
      }
    } catch (err) {
      console.error('Error loading selected item:', err)
    } finally {
      setLoading(false)
    }
  }

  const search = async (term, initialLoad = false) => {
    if (!apiEndpoint) {
      setResults([])
      return
    }

    // For initial load, fetch first 10 items even without search term
    // For search, require at least 2 characters
    if (!initialLoad && term.length < 2) {
      setResults([])
      return
    }

    try {
      setLoading(true)
      const params = { limit: initialLoad ? 20 : 50 }
      if (term && term.length > 0) {
        params.q = term
      }
      const response = await axios.get(apiEndpoint, { params })
      let data = response.data
      // Handle different response formats
      let resultsArray = []
      if (Array.isArray(data)) {
        resultsArray = data
      } else if (data && Array.isArray(data.items)) {
        resultsArray = data.items
      } else if (data && Array.isArray(data.data)) {
        resultsArray = data.data
      } else {
        resultsArray = []
      }
      
      // Debug logging
      if (resultsArray.length > 0) {
      } else {
      }
      
      setResults(resultsArray)
      setHighlightedIndex(-1)
    } catch (err) {
      console.error('Search error:', err)
      console.error('API endpoint:', apiEndpoint)
      console.error('Error details:', err.response?.data || err.message)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (e) => {
    const term = e.target.value
    setSearchTerm(term)

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      search(term, false)
    }, 300)
  }

  const handleSelect = (item) => {
    setSelected(item)
    setSearchTerm('')
    setIsOpen(false)
    setResults([])
    setHighlightedIndex(-1)
    if (onChange) {
      onChange(item)
    }
  }

  const handleClear = (e) => {
    e.stopPropagation()
    setSelected(null)
    setSearchTerm('')
    setResults([])
    if (onChange) {
      onChange(null)
    }
  }

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        setIsOpen(true)
        inputRef.current?.focus()
        // Load initial results when opening
        if (!searchTerm && results.length === 0) {
          search('', true)
        }
        return
      }
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex(prev => {
        const newIndex = prev < results.length - 1 ? prev + 1 : prev
        // Scroll to highlighted item
      if (listRef.current && newIndex >= 0) {
        const tbody = listRef.current.querySelector('tbody')
        if (tbody && tbody.children[newIndex]) {
          tbody.children[newIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' })
        }
      }
        return newIndex
      })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex(prev => {
        const newIndex = prev > 0 ? prev - 1 : -1
        // Scroll to highlighted item
      if (listRef.current && newIndex >= 0) {
        const tbody = listRef.current.querySelector('tbody')
        if (tbody && tbody.children[newIndex]) {
          tbody.children[newIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' })
        }
      }
        return newIndex
      })
    } else if (e.key === 'Enter' && highlightedIndex >= 0 && results[highlightedIndex]) {
      e.preventDefault()
      handleSelect(results[highlightedIndex])
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setSearchTerm('')
    }
  }

  const displayText = selected ? displayValue(selected) : ''
  const displaySub = selected && displaySubtext ? displaySubtext(selected) : null

  // Helper function to get table columns based on item type
  const getTableColumns = (items) => {
    if (!items || items.length === 0) return []
    
    const firstItem = items[0]
    const columns = []
    
    // Determine item type and get relevant columns
    // IMPORTANT: Check product_id FIRST because products also have vendor_id
    if (firstItem.product_id) {
      // Product
      columns.push(
        { key: 'product_id', label: 'Product ID' },
        { key: 'product_name', label: 'Product Name' },
        { key: 'description', label: 'Description' },
        { key: 'product_type', label: 'Type' },
        { key: 'uom', label: 'Unit' },
        { key: 'unit_cost', label: 'Unit Cost' },
        { key: 'gl_code', label: 'Account Code' },
        { key: 'vendor_id', label: 'Supplier ID' },
        { key: 'status', label: 'Status' }
      )
    } else if (firstItem.vendor_id && !firstItem.product_id) {
      // Vendor (only if it's not a product)
      columns.push(
        { key: 'vendor_id', label: 'Supplier ID' },
        { key: 'vendor_name', label: 'Supplier Name' },
        { key: 'address', label: 'Address' },
        { key: 'city', label: 'City' },
        { key: 'country', label: 'Country' },
        { key: 'contact_person', label: 'Contact Person' },
        { key: 'contact_email', label: 'Email' },
        { key: 'contact_phone', label: 'Phone' },
        { key: 'currency', label: 'Currency' },
        { key: 'status', label: 'Status' }
      )
    } else if (firstItem.facility_id) {
      // Facility
      columns.push(
        { key: 'facility_id', label: 'Facility ID' },
        { key: 'facility_name', label: 'Facility Name' },
        { key: 'address', label: 'Address' },
        { key: 'city', label: 'City' },
        { key: 'state', label: 'State' },
        { key: 'country', label: 'Country' },
        { key: 'status', label: 'Status' }
      )
    } else if (firstItem.budget_id) {
      // Budget
      columns.push(
        { key: 'budget_id', label: 'Budget ID' },
        { key: 'project_id', label: 'Initiative ID' },
        { key: 'cost_center_id', label: 'Department' },
        { key: 'gl_code', label: 'Account Code' },
        { key: 'fiscal_year', label: 'Fiscal Year' },
        { key: 'allocated_budget', label: 'Allocated' },
        { key: 'consumed_budget', label: 'Consumed' },
        { key: 'remaining_budget', label: 'Remaining' },
        { key: 'status', label: 'Status' }
      )
    } else if (firstItem.gl_code) {
      // Account Code
      columns.push(
        { key: 'gl_code', label: 'Account Code' },
        { key: 'description', label: 'Description' },
        { key: 'account_type', label: 'Account Type' },
        { key: 'reporting_group', label: 'Reporting Group' },
        { key: 'tax_code', label: 'Tax Code' },
        { key: 'status', label: 'Status' }
      )
    } else if (firstItem.project_id) {
      // Initiative
      columns.push(
        { key: 'project_id', label: 'Initiative ID' },
        { key: 'project_name', label: 'Initiative Name' },
        { key: 'start_date', label: 'Start Date' },
        { key: 'end_date', label: 'End Date' },
        { key: 'status', label: 'Status' },
        { key: 'total_budget', label: 'Total Budget' },
        { key: 'currency', label: 'Currency' }
      )
    } else if (firstItem.cost_center_id) {
      // Department
      columns.push(
        { key: 'cost_center_id', label: 'Department ID' },
        { key: 'cost_center_name', label: 'Department Name' },
        { key: 'facility', label: 'Facility' },
        { key: 'budget_limit', label: 'Budget Limit' },
        { key: 'gl_code_default', label: 'Default Account Code' },
        { key: 'status', label: 'Status' }
      )
    } else {
      // Generic - show all keys except internal ones
      const excludeKeys = ['id', 'tenant_id', 'created_at', 'updated_at', 'created_by', 'updated_by', 'ai_metadata']
      Object.keys(firstItem).forEach(key => {
        if (!excludeKeys.includes(key) && typeof firstItem[key] !== 'object') {
          columns.push({ key, label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) })
        }
      })
    }
    
    return columns
  }

  const formatCellValue = (value) => {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (typeof value === 'number') {
      // Format currency values
      if (value.toString().includes('.')) {
        return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      }
      return value.toLocaleString()
    }
    return String(value)
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className={`
          relative w-full border rounded-xl shadow-sm
          ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
          ${disabled ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800 cursor-pointer'}
          ${isOpen ? 'ring-2 ring-primary-500 border-primary-500' : ''}
        `}
        onClick={() => {
          if (!disabled) {
            const newOpenState = !isOpen
            setIsOpen(newOpenState)
            // Load initial results when opening
            if (newOpenState && !searchTerm && results.length === 0) {
              search('', true)
            }
          }
        }}
      >
        {selected ? (
          <div className="flex items-center justify-between px-3 py-2 min-h-[38px]">
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-900 dark:text-white truncate">
                {displayText}
              </div>
              {displaySub && (
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                  {displaySub}
                </div>
              )}
            </div>
            {!disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center px-3 py-2 min-h-[38px]">
            <span className="text-sm text-gray-400 dark:text-gray-500">{placeholder}</span>
          </div>
        )}
        {!selected && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <ChevronDown size={18} className="text-gray-400 dark:text-gray-500" />
          </div>
        )}
      </div>

      {isOpen && !disabled && createPortal(
        <>
          {/* Backdrop - Freezes background */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-[9998] backdrop-blur-sm"
            onClick={() => {
              setIsOpen(false)
              setSearchTerm('')
              setHighlightedIndex(-1)
            }}
          />
          
          {/* Modal Dialog */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <div
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col pointer-events-auto border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {placeholder || 'Select an item'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    setSearchTerm('')
                    setHighlightedIndex(-1)
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search Input */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                      // Load initial results when input is focused and no results yet
                      if (!searchTerm && results.length === 0) {
                        search('', true)
                      }
                    }}
                    placeholder="Type to search..."
                    className="w-full pl-10 pr-4 py-3 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    autoFocus
                  />
                </div>
              </div>

              {/* Results Table */}
              <div
                ref={listRef}
                className="flex-1 overflow-auto"
              >
                {loading ? (
                  <div className="p-8 text-center">
                    <Loader2 className="animate-spin mx-auto text-gray-400" size={24} />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">Loading...</p>
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    {searchTerm.length < 2 && searchTerm.length > 0 ? 'Type at least 2 characters to search' : 'No results found'}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                        <tr>
                          {getTableColumns(results).map((column) => (
                            <th
                              key={column.key}
                              className="px-4 py-3 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap"
                            >
                              {column.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {results.map((item, index) => (
                          <tr
                            key={item.id || item.vendor_id || item.product_id || item.facility_id || item.budget_id || index}
                            onClick={() => handleSelect(item)}
                            className={`
                              cursor-pointer transition-colors
                              ${highlightedIndex === index ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}
                            `}
                          >
                            {getTableColumns(results).map((column) => (
                              <td
                                key={column.key}
                                className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap"
                              >
                                {formatCellValue(item[column.key])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Click a row to select • Use arrow keys to navigate, Enter to select, Esc to close</span>
                  <span>{results.length} {results.length === 1 ? 'record' : 'records'}</span>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}

