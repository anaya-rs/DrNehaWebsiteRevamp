import React from 'react'

export interface Column<T = any> {
  header: string
  accessor?: keyof T
  render?: (row: T, index: number) => React.ReactNode
  width?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  onRowClick?: (row: T) => void
  keyField?: keyof T
  emptyMessage?: string
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="skeleton h-4 rounded w-3/4" />
        </td>
      ))}
    </tr>
  )
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  onRowClick,
  keyField,
  emptyMessage = 'No data found',
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[rgba(11,107,78,0.13)] bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            {columns.map((col, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap"
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} cols={columns.length} />
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-400">
                <div className="flex flex-col items-center gap-2">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <span className="text-sm">{emptyMessage}</span>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={keyField ? String(row[keyField]) : rowIndex}
                onClick={() => onRowClick?.(row)}
                className={[
                  'border-b border-gray-50 last:border-0 transition-colors',
                  rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/50',
                  onRowClick ? 'cursor-pointer hover:bg-[#f0fdf4]' : 'hover:bg-gray-50',
                ].join(' ')}
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-4 py-3 text-gray-700">
                    {col.render
                      ? col.render(row, rowIndex)
                      : col.accessor
                      ? String(row[col.accessor] ?? '—')
                      : '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
