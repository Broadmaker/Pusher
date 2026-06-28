import type { ReactNode } from 'react'

type Variant = 'success' | 'info' | 'warning' | 'gray'

interface Props {
  children: ReactNode
  variant?: Variant
  dot?: boolean
}

const variants: Record<Variant, string> = {
  success: 'bg-emerald-50 text-emerald-700',
  info: 'bg-blue-50 text-blue-700',
  warning: 'bg-amber-50 text-amber-700',
  gray: 'bg-gray-100 text-gray-600',
}

const dots: Record<Variant, string> = {
  success: 'bg-emerald-500',
  info: 'bg-blue-500',
  warning: 'bg-amber-500',
  gray: 'bg-gray-400',
}

export default function Badge({ children, variant = 'gray', dot: showDot = false }: Props) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${variants[variant]}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dots[variant]}`} />}
      {children}
    </span>
  )
}
