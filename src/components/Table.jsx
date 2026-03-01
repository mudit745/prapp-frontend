import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Flexible table component with client-side pagination, sorting, and filtering.
 * Props:
 *  - columns: [{ key, header, render?, sortable?, searchable?, filterable? }]
 *  - data: array of records
 *  - rowKey: string | (row) => string (default: 'id' or index fallback)
 *  - loading: boolean
 *  - emptyMessage: string
 *  - paginationMode: 'client' | 'server' (default 'client')
 *  - pageSizeOptions: number[] (default [10,20,50])
 *  - defaultPageSize: number (default 10)
 *  - totalCount: number (required for server mode)
 *  - page: number (1-based, server mode)
 *  - onPageChange: (page, pageSize) => void
 *  - onSortChange: ({ key, direction }) => void (for server mode)
 */
export default function Table({
  columns = [],
  data = [],
  rowKey = 'id',
  loading = false,
  emptyMessage = 'No data found',
  paginationMode = 'client',
  pageSizeOptions = [10, 20, 50],
  defaultPageSize = 10,
  totalCount,
  page,
  onPageChange,
  onSortChange,
}) {
  const [density, setDensity] = useState('compact') // 'compact' | 'comfortable' | 'spacious'
  const densityStyles = {
    compact: {
      th: 'px-3 py-2 text-xs',
      td: 'px-3 py-2 text-sm',
      row: 'h-10'
    },
    comfortable: {
      th: 'px-4 py-3 text-xs',
      td: 'px-4 py-3 text-sm',
      row: 'h-12'
    },
    spacious: {
      th: 'px-6 py-4 text-sm',
      td: 'px-6 py-4 text-sm',
      row: 'h-14'
    }
  }

  const densityClasses = densityStyles[density] || densityStyles.comfortable

  const [searchTerm, setSearchTerm] = useState('')
  const [localPage, setLocalPage] = useState(1)
  const [localPageSize, setLocalPageSize] = useState(defaultPageSize)
  const [localSort, setLocalSort] = useState({ key: null, direction: null })
  const [activeFilter, setActiveFilter] = useState({ columnKey: null, value: null }) // Only one filter at a time

  const safeData = Array.isArray(data) ? data : []

  const effectivePage = paginationMode === 'server' ? page || 1 : localPage
  const effectivePageSize = paginationMode === 'server' ? defaultPageSize : localPageSize

  // Get unique filter values for each filterable column
  const filterOptions = useMemo(() => {
    const options = {}
    columns.forEach(col => {
      if (col.filterable) {
        const values = new Set()
        safeData.forEach(row => {
          const val = col.renderFilterValue ? col.renderFilterValue(row) : row[col.key]
          if (val != null && val !== '') {
            values.add(String(val))
          }
        })
        options[col.key] = Array.from(values).sort()
      }
    })
    return options
  }, [safeData, columns])

  const filteredData = useMemo(() => {
    if (paginationMode === 'server') return safeData
    
    let result = safeData

    // Apply column filter (only one active at a time)
    if (activeFilter.columnKey && activeFilter.value) {
      const col = columns.find(c => c.key === activeFilter.columnKey)
      if (col) {
        result = result.filter((row) => {
          const val = col.renderFilterValue ? col.renderFilterValue(row) : row[col.key]
          return String(val ?? '') === activeFilter.value
        })
      }
    }

    // Apply search term
    const term = searchTerm.trim().toLowerCase()
    if (term) {
      result = result.filter((row) =>
        columns.some((col) => {
          if (col.searchable === false) return false
          const val = typeof col.renderSearchValue === 'function'
            ? col.renderSearchValue(row)
            : row[col.key]
          return String(val ?? '').toLowerCase().includes(term)
        })
      )
    }

    return result
  }, [safeData, columns, searchTerm, activeFilter, paginationMode])

  const sortedData = useMemo(() => {
    if (paginationMode === 'server') return filteredData
    const { key, direction } = localSort
    if (!key || !direction) return filteredData
    const col = columns.find((c) => c.key === key)
    return [...filteredData].sort((a, b) => {
      const av = col?.sortValue ? col.sortValue(a) : a[key]
      const bv = col?.sortValue ? col.sortValue(b) : b[key]
      if (av === bv) return 0
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'number' && typeof bv === 'number') {
        return direction === 'asc' ? av - bv : bv - av
      }
      return direction === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av))
    })
  }, [filteredData, localSort, columns, paginationMode])

  const pagedData = useMemo(() => {
    if (paginationMode === 'server') return safeData
    const start = (effectivePage - 1) * effectivePageSize
    return sortedData.slice(start, start + effectivePageSize)
  }, [sortedData, effectivePage, effectivePageSize, paginationMode, safeData])

  const pageCount = useMemo(() => {
    if (paginationMode === 'server') {
      if (!totalCount || !effectivePageSize) return 1
      return Math.max(1, Math.ceil(totalCount / effectivePageSize))
    }
    return Math.max(1, Math.ceil(sortedData.length / effectivePageSize))
  }, [sortedData, effectivePageSize, paginationMode, totalCount])

  const totalItems = paginationMode === 'server'
    ? (totalCount ?? safeData.length)
    : filteredData.length

  const handleSort = (key, sortable) => {
    if (!sortable) return
    if (paginationMode === 'server') {
      if (onSortChange) {
        const next =
          localSort.key === key && localSort.direction === 'asc'
            ? 'desc'
            : localSort.key === key && localSort.direction === 'desc'
              ? null
              : 'asc'
        const nextState = next ? { key, direction: next } : { key: null, direction: null }
        setLocalSort(nextState)
        onSortChange(nextState)
      }
      return
    }
    const next =
      localSort.key === key && localSort.direction === 'asc'
        ? 'desc'
        : localSort.key === key && localSort.direction === 'desc'
          ? null
          : 'asc'
    setLocalSort(next ? { key, direction: next } : { key: null, direction: null })
  }

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > pageCount) return
    if (paginationMode === 'server') {
      onPageChange && onPageChange(nextPage, effectivePageSize)
    } else {
      setLocalPage(nextPage)
    }
  }

  const handlePageSizeChange = (size) => {
    const newSize = Number(size)
    if (paginationMode === 'server') {
      onPageChange && onPageChange(1, newSize)
    } else {
      setLocalPageSize(newSize)
      setLocalPage(1)
    }
  }

  const handleFilterChange = (columnKey, value) => {
    // Only one filter at a time - set new filter and clear others
    if (value && value !== '') {
      setActiveFilter({ columnKey, value })
    } else {
      setActiveFilter({ columnKey: null, value: null })
    }
    setLocalPage(1) // Reset to first page when filter changes
  }

  const resolveRowKey = (row, idx) => {
    if (typeof rowKey === 'function') return rowKey(row)
    return row[rowKey] ?? idx
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center gap-3">
        {paginationMode === 'client' ? (
          <div className="w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setLocalPage(1)
              }}
              placeholder="Search..."
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-4 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
        ) : (
          <div className="flex-1" />
        )}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Density:</span>
          <select
            value={density}
            onChange={(e) => setDensity(e.target.value)}
            className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-3 pr-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white"
          >
            <option value="compact">Compact</option>
            <option value="comfortable">Comfortable</option>
            <option value="spacious">Spacious</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`${densityClasses.th} text-left font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest select-none`}
                    onClick={() => handleSort(col.key, col.sortable)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-gray-400">
                          {localSort.key === col.key
                            ? localSort.direction === 'asc'
                              ? '▲'
                              : localSort.direction === 'desc'
                                ? '▼'
                                : '⇅'
                            : '⇅'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
              {/* Filter row */}
              <tr>
                {columns.map((col) => (
                  <th key={`filter-${col.key}`} className={`${densityClasses.th} bg-gray-50 dark:bg-gray-800`}>
                    {col.filterable ? (
                      <select
                        value={activeFilter.columnKey === col.key ? activeFilter.value : ''}
                        onChange={(e) => handleFilterChange(col.key, e.target.value)}
                        onClick={(e) => e.stopPropagation()} // Prevent header click
                        className="w-full text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white"
                      >
                        <option value="">All</option>
                        {filterOptions[col.key]?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="h-full" />
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className={`${densityClasses.td} text-center text-sm text-gray-500 dark:text-gray-400`}>
                    Loading...
                  </td>
                </tr>
              ) : pagedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className={`${densityClasses.td} text-center text-sm text-gray-500 dark:text-gray-400`}>
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                pagedData.map((row, idx) => (
                  <tr key={resolveRowKey(row, idx)} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${densityClasses.row}`}>
                    {columns.map((col) => (
                      <td key={col.key} className={`${densityClasses.td} whitespace-nowrap text-sm text-gray-900 dark:text-gray-300`}>
                        {col.render ? col.render(row) : formatCell(row[col.key])}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Page {effectivePage} of {pageCount}
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {totalItems} total
          </div>
          <select
            value={effectivePageSize}
            onChange={(e) => handlePageSizeChange(e.target.value)}
            className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-3 pr-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 dark:text-white"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>{opt} / page</option>
            ))}
          </select>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handlePageChange(effectivePage - 1)}
              disabled={effectivePage <= 1}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-xs font-semibold uppercase tracking-widest disabled:opacity-50 flex items-center gap-1 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              <ChevronLeft size={16} />
              Prev
            </button>
            <button
              onClick={() => handlePageChange(effectivePage + 1)}
              disabled={effectivePage >= pageCount}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-xs font-semibold uppercase tracking-widest disabled:opacity-50 flex items-center gap-1 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatCell(value) {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (value == null) return '-'
  return String(value)
}

