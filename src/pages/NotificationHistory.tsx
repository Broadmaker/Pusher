import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useApi } from '../data/api-context'
import { Badge, Table, Skeleton } from '../components/ui'

export default function NotificationHistory() {
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])
  const { apps, notifications } = useApi()
  const app = apps.find(a => a.id === id)
  const appNotifications = id ? (notifications[id] || []) : []
  const filtered = appNotifications.filter(n =>
    !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.body.toLowerCase().includes(search.toLowerCase())
  )

  if (!app) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 sm:p-12 text-center">
        <p className="text-gray-500 font-medium">App not found</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <Skeleton.Box className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl" />
            <div className="min-w-0">
              <Skeleton.Box className="h-6 w-40 mb-1" />
              <Skeleton.Box className="h-4 w-52" />
            </div>
          </div>
        </div>
        <Skeleton.Table rows={3} cols={4} />
      </div>
    )
  }

  const columns = [
    {
      key: 'title',
      header: 'Title',
      render: (n: any) => <span className="font-medium text-gray-900">{n.title}</span>,
    },
    {
      key: 'body',
      header: 'Message',
      render: (n: any) => <span className="text-gray-500 max-w-xs truncate block">{n.body}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (n: any) => <Badge variant="success" dot>{n.status}</Badge>,
    },
    {
      key: 'createdAt',
      header: 'Sent',
      render: (n: any) => <span className="text-gray-500">{n.createdAt}</span>,
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-sm shrink-0">
            {app.name[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Notification History</h1>
            <p className="text-sm text-gray-500 truncate">{app.name} &mdash; {appNotifications.length} notification{appNotifications.length !== 1 ? 's' : ''} sent</p>
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
          placeholder="Search by title or message..."
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
        {filtered.length === 0 ? (
          <div className="p-8 sm:p-16 text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium text-sm">{search ? 'No matching notifications' : 'No notifications sent'}</p>
            <p className="text-gray-400 text-xs mt-1">{search ? 'Try a different search term.' : 'Send your first notification to see it here.'}</p>
          </div>
        ) : (
          <>
            <div className="hidden sm:block">
              <Table columns={columns} data={filtered} />
            </div>
            <div className="sm:hidden divide-y divide-gray-100">
              {filtered.map(n => (
                <div key={n.id} className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 text-sm">{n.title}</span>
                    <Badge variant="success" dot>{n.status}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{n.body}</p>
                  <p className="text-xs text-gray-400">{n.createdAt}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
