import type { ReactNode } from 'react'

function Box({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} style={style} />
}

function Text({ lines = 1, lastWidth = '60%' }: { lines?: number; lastWidth?: string }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Box
          key={i}
          className="h-3"
          style={i === lines - 1 && lines > 1 ? { width: lastWidth } : undefined}
        />
      ))}
    </div>
  )
}

function Card({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-5 ${className}`}>
      {children || (
        <div className="space-y-4">
          <Box className="w-10 h-10" />
          <Box className="h-8 w-20" />
          <Box className="h-3 w-16" />
        </div>
      )}
    </div>
  )
}

function TableRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-gray-50">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <Box className={`h-4 ${i === cols - 1 ? 'w-12 ml-auto' : 'w-full'}`} />
        </td>
      ))}
    </tr>
  )
}

function Table({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="px-5 py-3.5">
                  <Box className="h-3 w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <TableRow key={i} cols={cols} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export const Skeleton = { Box, Text, Card, Table, TableRow }
