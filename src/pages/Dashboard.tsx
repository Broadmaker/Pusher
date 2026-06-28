import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../data/api-context'
import type { Platform } from '../data/mock'
import { useToast } from '../components/Toast'
import { Button, Table, Skeleton, ConfirmDialog, Badge } from '../components/ui'
import CreateAppModal from './CreateApp'

const tabs = [
  { id: 'all', label: 'Apps' },
  { id: 'recent', label: 'Recent Activity' },
  { id: 'insights', label: 'Insights' },
]

export default function Dashboard() {
  const { apps, devices, notifications, deleteApp, loading: apiLoading } = useApi()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  const totalDevices = Object.values(devices).flat().length
  const totalNotifications = Object.values(notifications).flat().length

  const platformCounts = Object.values(devices).flat().reduce((acc, d) => {
    acc[d.platform] = (acc[d.platform] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const allNotifications = Object.values(notifications).flat()
  const recentNotifications = allNotifications.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8)

  const hasApps = apps.length > 0

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (app: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
            {app.name[0].toUpperCase()}
          </div>
          <span className="font-medium text-gray-900">{app.name}</span>
        </div>
      ),
    },
    {
      key: 'apiKey',
      header: 'API Key',
      render: (app: any) => (
        <code className="text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-600 font-mono">{app.apiKey.slice(0, 14)}...</code>
      ),
    },
    {
      key: 'devices',
      header: 'Devices',
      render: (app: any) => <span className="font-medium text-gray-600">{(devices[app.id] || []).length}</span>,
    },
    {
      key: 'notifications',
      header: 'Sent',
      render: (app: any) => <span className="font-medium text-gray-600">{(notifications[app.id] || []).length}</span>,
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (app: any) => <span className="text-gray-500">{app.createdAt}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (app: any) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/apps/${app.id}`) }}
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Open &rarr;
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(app.id) }}
            className="text-sm font-semibold text-red-400 hover:text-red-600 transition-colors ml-2"
          >
            Delete
          </button>
        </div>
      ),
    },
  ]

  if (loading || apiLoading) {
    return (
      <div>
        <div className="mb-8">
          <Skeleton.Box className="h-8 w-48 mb-2" />
          <Skeleton.Box className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map(i => <Skeleton.Card key={i} />)}
        </div>
        <Skeleton.Box className="h-5 w-20 mb-4" />
        <Skeleton.Table rows={4} cols={6} />
      </div>
    )
  }

  return (
    <div>
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {hasApps ? 'Welcome back' : 'Welcome to Pusher'}
        </h1>
        <p className="text-sm text-gray-500 mt-1.5">
          {hasApps
            ? `You have ${apps.length} app${apps.length > 1 ? 's' : ''} across ${totalDevices} device${totalDevices !== 1 ? 's' : ''}`
            : 'Create your first app and start sending push notifications in minutes'}
        </p>
      </div>

      {/* Empty state with onboarding */}
      {!hasApps ? (
        <div className="space-y-6">
          {/* Getting started steps */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Getting Started</h2>
            <p className="text-sm text-gray-500 mb-6">Follow these steps to send your first push notification</p>
            <div className="grid sm:grid-cols-4 gap-4">
              {[
                { step: '1', title: 'Create an App', desc: 'Register your project and get an API key', icon: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z' },
                { step: '2', title: 'Install the SDK', desc: 'Add our snippet to your website or app', icon: 'M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5' },
                { step: '3', title: 'Register Devices', desc: 'Users subscribe & device tokens are saved', icon: 'M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3' },
                { step: '4', title: 'Send Notifications', desc: 'Compose & send from the dashboard or API', icon: 'M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5' },
              ].map(item => (
                <div key={item.step} className="relative flex sm:flex-col items-start sm:items-center gap-4 sm:gap-3 sm:text-center p-4 rounded-xl bg-gray-50/70 border border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-sm">
                    {item.step}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 text-sm">{item.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button size="md" icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              } onClick={() => setShowCreate(true)}>
                Create Your First App
              </Button>
              <Button variant="secondary" onClick={() => addToast('Quickstart docs coming soon!')}>
                View Documentation
              </Button>
            </div>
          </div>

          {/* Why Pusher card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Why Pusher?</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    <span>One API for Web, Android, and iOS push notifications</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    <span>No infrastructure to manage — fully serverless</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    <span>Delivered in milliseconds with real-time delivery tracking</span>
                  </li>
                </ul>
              </div>
              <div className="w-full sm:w-48 h-32 bg-white/60 rounded-xl border border-blue-200/50 flex items-center justify-center">
                <svg className="w-12 h-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{apps.length}</div>
              <div className="text-sm text-gray-500 mt-0.5">Apps</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                  </svg>
                </div>
                {platformCounts.web || platformCounts.android || platformCounts.ios ? (
                  <div className="flex gap-1">
                    {(['web', 'android', 'ios'] as Platform[]).map(p => platformCounts[p] ? (
                      <span key={p} className="text-xs font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                        {p === 'web' ? '🌐' : p === 'android' ? '📱' : '🍎'}{platformCounts[p]}
                      </span>
                    ) : null)}
                  </div>
                ) : null}
              </div>
              <div className="text-3xl font-bold text-gray-900">{totalDevices}</div>
              <div className="text-sm text-gray-500 mt-0.5">Devices</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-gray-500">All time</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{totalNotifications}</div>
              <div className="text-sm text-gray-500 mt-0.5">Notifications Sent</div>
            </div>
          </div>

          {/* Quick actions row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-3 bg-white border border-dashed border-gray-300 rounded-xl px-4 py-3.5 hover:border-blue-400 hover:bg-blue-50/30 transition-all group text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-700 group-hover:text-blue-700 transition-colors">New App</div>
                <div className="text-xs text-gray-400">Create another project</div>
              </div>
            </button>
            <button
              onClick={() => { if (apps.length > 0) navigate(`/apps/${apps[0].id}/notify`) }}
              className="flex items-center gap-3 bg-white border border-dashed border-gray-300 rounded-xl px-4 py-3.5 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all group text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-gray-500 group-hover:text-emerald-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-700 group-hover:text-emerald-700 transition-colors">Send Notification</div>
                <div className="text-xs text-gray-400">Compose a push message</div>
              </div>
            </button>
            <button
              onClick={() => { if (apps.length > 0) navigate(`/apps/${apps[0].id}/devices`) }}
              className="flex items-center gap-3 bg-white border border-dashed border-gray-300 rounded-xl px-4 py-3.5 hover:border-violet-400 hover:bg-violet-50/30 transition-all group text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-violet-100 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-gray-500 group-hover:text-violet-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-700 group-hover:text-violet-700 transition-colors">View Devices</div>
                <div className="text-xs text-gray-400">See registered devices</div>
              </div>
            </button>
          </div>

          {/* Tabs bar */}
          <div className="flex items-center justify-between border-b border-gray-200 mb-6">
            <div className="flex gap-6">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 text-sm font-medium transition-colors relative ${
                    activeTab === tab.id ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
                </button>
              ))}
            </div>
            <Button size="sm" icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            } onClick={() => setShowCreate(true)} className="hidden sm:flex">
              New App
            </Button>
          </div>

          {/* Mobile FAB */}
          <button
            onClick={() => setShowCreate(true)}
            className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all active:scale-[0.95] flex items-center justify-center z-20"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>

          {/* Tab content */}
          {activeTab === 'all' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">All Apps ({apps.length})</h3>
              </div>
              <div className="hidden sm:block">
                <Table columns={columns} data={apps} onRowClick={(app) => navigate(`/apps/${app.id}`)} />
              </div>
              <div className="sm:hidden divide-y divide-gray-100">
                {apps.map(app => (
                  <div key={app.id} className="p-4 hover:bg-blue-50/30 transition-colors cursor-pointer" onClick={() => navigate(`/apps/${app.id}`)}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                        {app.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm truncate">{app.name}</div>
                        <code className="text-xs text-gray-500 font-mono">{app.apiKey.slice(0, 14)}...</code>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(app.id) }}
                          className="text-xs font-semibold text-red-400 hover:text-red-600 transition-colors"
                        >
                          Delete
                        </button>
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>{(devices[app.id] || []).length} devices</span>
                      <span>{(notifications[app.id] || []).length} sent</span>
                      <span>{app.createdAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'recent' && (
            <>
              {recentNotifications.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium text-sm">No notifications yet</p>
                  <p className="text-gray-400 text-xs mt-1">Send your first notification to see activity here.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentNotifications.map(n => {
                    const app = apps.find(a => a.id === n.appId)
                    return (
                      <div key={n.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-start gap-4 hover:shadow-md transition-shadow">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-sm shrink-0 mt-0.5">
                          {app?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <span className="font-semibold text-gray-900 text-sm">{n.title}</span>
                              <span className="text-gray-400 mx-1.5">&middot;</span>
                              <span className="text-xs text-gray-500">{app?.name || 'Unknown app'}</span>
                            </div>
                            <Badge variant="success" dot>Sent</Badge>
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5 truncate">{n.body}</p>
                          <p className="text-xs text-gray-400 mt-1.5">{n.createdAt}</p>
                        </div>
                      </div>
                    )
                  })}
                  {allNotifications.length > 8 && (
                    <div className="text-center pt-2">
                      <button
                        onClick={() => { if (apps[0]) navigate(`/apps/${apps[0].id}/history`) }}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        View all history &rarr;
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === 'insights' && (
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Devices by platform */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Devices by Platform</h3>
                {totalDevices === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No devices registered yet</p>
                ) : (
                  <div className="space-y-3">
                    {(['web', 'android', 'ios'] as Platform[]).map(p => {
                      const count = platformCounts[p] || 0
                      const pct = totalDevices ? Math.round((count / totalDevices) * 100) : 0
                      return (
                        <div key={p}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700 capitalize">{p === 'web' ? 'Web Browser' : p === 'android' ? 'Android' : 'iOS'}</span>
                            <span className="text-gray-500">{count} ({pct}%)</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${
                              p === 'web' ? 'bg-blue-500' : p === 'android' ? 'bg-emerald-500' : 'bg-gray-500'
                            }`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Notifications per app */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Notifications per App</h3>
                {totalNotifications === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No notifications sent yet</p>
                ) : (
                  <div className="space-y-3">
                    {apps.map(app => {
                      const count = (notifications[app.id] || []).length
                      const pct = totalNotifications ? Math.round((count / totalNotifications) * 100) : 0
                      return (
                        <div key={app.id}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700 truncate mr-2">{app.name}</span>
                            <span className="text-gray-500 shrink-0">{count} ({pct}%)</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Quick tip card */}
              <div className="sm:col-span-2 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800">Pro Tip</h4>
                    <p className="text-sm text-gray-600 mt-0.5">Use notification templates to save time. Create reusable messages with variables for personalized pushes.</p>
                    <button
                      onClick={() => { if (apps[0]) navigate(`/apps/${apps[0].id}/notify`) }}
                      className="text-sm font-semibold text-amber-700 hover:text-amber-900 transition-colors mt-2"
                    >
                      Try it now &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {showCreate && <CreateAppModal onClose={() => setShowCreate(false)} />}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return
          try {
            await deleteApp(deleteTarget)
            addToast('App deleted')
          } catch { addToast('Failed to delete app', 'error') }
          setDeleteTarget(null)
        }}
        title="Delete App?"
        message="This will permanently delete this app and all its devices and notification history."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  )
}