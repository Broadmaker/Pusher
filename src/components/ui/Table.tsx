import type { ReactNode } from 'react'

interface Column<T> {
  key: string
  header: string
  render?: (item: T) => ReactNode
  className?: string
}

interface Props<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (item: T) => void
  emptyMessage?: string
}

export default function Table<T extends Record<string, any>>({ columns, data, onRowClick, emptyMessage = 'No data' }: Props<T>) {
  if (data.length === 0) {
    return <div className="p-12 text-center text-gray-400 text-sm">{emptyMessage}</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            {columns.map(col => (
              <th key={col.key} className={`text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => (
            <tr
              key={item.id || i}
              className={`border-b border-gray-50 transition-colors ${onRowClick ? 'cursor-pointer hover:bg-blue-50/30' : 'hover:bg-gray-50/50'}`}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map(col => (
                <td key={col.key} className={`px-5 py-4 ${col.className || ''}`}>
                  {col.render ? col.render(item) : item[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function MobileCardList<T extends Record<string, any>>({ columns, data, onRowClick }: Props<T>) {
  if (data.length === 0) return null

  return (
    <div className="sm:hidden divide-y divide-gray-100">
      {data.map((item, i) => (
        <div
          key={item.id || i}
          className={`p-4 ${onRowClick ? 'cursor-pointer hover:bg-blue-50/30' : ''}`}
          onClick={() => onRowClick?.(item)}
        >
          {columns.map(col => (
            <div key={col.key} className={col.className || ''}>
              {col.render ? col.render(item) : String(item[col.key] ?? '')}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
