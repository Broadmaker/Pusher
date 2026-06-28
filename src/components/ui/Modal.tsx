import type { ReactNode } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  subtitle?: string
  icon?: ReactNode
  gradient?: boolean
  wide?: boolean
}

export default function Modal({ open, onClose, children, title, subtitle, icon, gradient = true, wide = false }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-2xl' : 'max-w-md'} overflow-hidden`}>
        {gradient ? (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 pt-6 pb-8 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_100%,rgba(255,255,255,0.1)_0%,transparent_60%)]" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                {icon && <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">{icon}</div>}
                <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors ml-auto">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {title && <h2 className="text-xl font-bold text-white">{title}</h2>}
              {subtitle && <p className="text-sm text-blue-200 mt-1">{subtitle}</p>}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between px-6 pt-6 pb-2">
            <div>
              {title && <h2 className="text-xl font-bold text-gray-900">{title}</h2>}
              {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
