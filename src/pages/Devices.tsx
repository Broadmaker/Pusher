import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useApi } from '../data/api-context'
import type { Platform } from '../data/mock'
import { useToast } from '../components/Toast'
import { Button, Badge, Table, Skeleton, ConfirmDialog } from '../components/ui'

const platformConfig: Record<Platform, { label: string; variant: 'info' | 'success' | 'gray' }> = {
  web: { label: 'Web Browser', variant: 'info' },
  android: { label: 'Android', variant: 'success' },
  ios: { label: 'iOS', variant: 'gray' },
}

export default function Devices() {
  const { id } = useParams<{ id: string }>()
  const { apps, devices, registerDevice, deleteDevice } = useApi()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const app = apps.find(a => a.id === id)
  const appDevices = id ? (devices[id] || []) : []
  const filtered = appDevices.filter(d =>
    !search || d.token.toLowerCase().includes(search.toLowerCase()) || d.platform.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  if (!app) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 sm:p-12 text-center">
        <p className="text-gray-500 font-medium">App not found</p>
      </div>
    )
  }

  const columns = [
    {
      key: 'token',
      header: 'Token',
      render: (d: any) => <code className="text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-600 font-mono">{d.token}</code>,
    },
    {
      key: 'platform',
      header: 'Platform',
      render: (d: any) => {
        const cfg = platformConfig[d.platform as Platform]
        return <Badge variant={cfg.variant} dot>{cfg.label}</Badge>
      },
    },
    {
      key: 'createdAt',
      header: 'Registered',
      render: (d: any) => <span className="text-gray-500">{d.createdAt}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (d: any) => (
        <button
          onClick={(e) => { e.stopPropagation(); setDeleteTarget(d.id) }}
          className="text-sm font-semibold text-red-500 hover:text-red-700 transition-colors"
        >
          Delete
        </button>
      ),
    },
  ]

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <Skeleton.Box className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl" />
            <div className="min-w-0">
              <Skeleton.Box className="h-6 w-24 mb-1" />
              <Skeleton.Box className="h-4 w-48" />
            </div>
          </div>
        </div>
        <Skeleton.Table rows={3} cols={3} />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-sm shrink-0">
            {app.name[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Devices</h1>
            <p className="text-sm text-gray-500 truncate">{app.name} &mdash; {appDevices.length} device{appDevices.length !== 1 ? 's' : ''} registered</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
          type="text"
          placeholder="Search by token or platform..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-sm font-semibold text-gray-700">Registered Devices {search ? `(${filtered.length})` : ''}</h3>
          <Button size="sm" icon={
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          } onClick={async () => { try { await registerDevice(id!, 'web'); addToast('Mock device added') } catch { addToast('Failed to add device', 'error') } }} className="w-full sm:w-auto">
            Add Mock Device
          </Button>
        </div>
        {filtered.length === 0 && !search ? (
          <div className="p-6 sm:p-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-5 sm:p-6 mb-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-800">How to register devices</h3>
                  <ol className="mt-3 space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                      <span>Add the <code className="text-xs bg-gray-200 px-1.5 py-0.5 rounded font-mono">PushSDK</code> snippet to your website or app</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                      <span>Call <code className="text-xs bg-gray-200 px-1.5 py-0.5 rounded font-mono">PushSDK.init("YOUR_API_KEY")</code> to initialize</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                      <span>The SDK requests permission and registers the device automatically</span>
                    </li>
                  </ol>
                  <p className="text-xs text-gray-400 mt-3">For testing, use the "Add Mock Device" button above to simulate a registration.</p>
                </div>
              </div>
            </div>
            <div className="text-center py-4">
              <p className="text-gray-500 font-medium text-sm">No devices registered yet</p>
              <p className="text-gray-400 text-xs mt-1">Devices will appear here once users subscribe.</p>
            </div>
          </div>
        ) : filtered.length === 0 && search ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 font-medium text-sm">No devices match your search</p>
            <p className="text-gray-400 text-xs mt-1">Try a different search term.</p>
          </div>
        ) : (
          <div className="hidden sm:block">
            <Table columns={columns} data={filtered} />
          </div>
        )}
        {/* Mobile cards */}
        {filtered.length > 0 && (
          <div className="sm:hidden divide-y divide-gray-100">
            {filtered.map(d => {
              const cfg = platformConfig[d.platform]
              return (
                <div key={d.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={cfg.variant} dot>{cfg.label}</Badge>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{d.createdAt}</span>
                      <button
                        onClick={() => setDeleteTarget(d.id)}
                        className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <code className="block text-xs bg-gray-100 px-2 py-1.5 rounded-md text-gray-600 font-mono truncate">{d.token}</code>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => { if (deleteTarget && id) { try { await deleteDevice(id, deleteTarget); addToast('Device removed') } catch { addToast('Failed to remove device', 'error') } }; setDeleteTarget(null) }}
        title="Remove device?"
        message="This will unregister this device. It will no longer receive notifications."
        confirmLabel="Remove"
        variant="danger"
      />
    </div>
  )
}
