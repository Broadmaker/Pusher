import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, Navigate, useLocation } from 'react-router-dom'
import { useApi } from '../data/api-context'

function BackButton() {
  const navigate = useNavigate()
  return (
    <button onClick={() => navigate(-1)} className="p-1.5 -ml-1.5 rounded-lg hover:bg-white/80 transition-colors">
      <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
    </button>
  )
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  )
}

function SendIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  )
}

function HistoryIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  )
}

const sidebarNavItems = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: <HomeIcon active />,
  },
]

function isAppPage(path: string): boolean {
  return path.startsWith('/apps/')
}

export default function Layout() {
  const { user, logout, apps } = useApi()
  const navigate = useNavigate()
  const location = useLocation()
  const [showProfile, setShowProfile] = useState(false)
  const [showNoApps, setShowNoApps] = useState<'send' | 'history' | null>(null)
  const [showAppPicker, setShowAppPicker] = useState<'send' | 'history' | null>(null)

  const profileRef = useRef<HTMLDivElement>(null)
  const noAppsRef = useRef<HTMLDivElement>(null)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showProfile) return
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false)
      }
    }
    setTimeout(() => document.addEventListener('click', handleClick), 0)
    return () => document.removeEventListener('click', handleClick)
  }, [showProfile])

  useEffect(() => {
    if (!showNoApps) return
    function handleClick(e: MouseEvent) {
      if (noAppsRef.current && !noAppsRef.current.contains(e.target as Node)) {
        setShowNoApps(null)
      }
    }
    setTimeout(() => document.addEventListener('click', handleClick), 0)
    return () => document.removeEventListener('click', handleClick)
  }, [showNoApps])

  useEffect(() => {
    if (!showAppPicker) return
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowAppPicker(null)
      }
    }
    setTimeout(() => document.addEventListener('click', handleClick), 0)
    return () => document.removeEventListener('click', handleClick)
  }, [showAppPicker])

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const isSubPage = isAppPage(location.pathname)
  const isSendPage = location.pathname.endsWith('/notify')
  const isHistoryPage = location.pathname.endsWith('/history')

  const handleSendNav = () => {
    if (apps.length === 0) setShowNoApps('send')
    else if (apps.length === 1) navigate(`/apps/${apps[0].id}/notify`)
    else setShowAppPicker('send')
  }
  const handleHistoryNav = () => {
    if (apps.length === 0) setShowNoApps('history')
    else if (apps.length === 1) navigate(`/apps/${apps[0].id}/history`)
    else setShowAppPicker('history')
  }

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 pt-5 pb-7 relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_100%,rgba(255,255,255,0.1)_0%,transparent_60%)]" />
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Pusher</span>
          </div>
          <p className="text-xs text-blue-200 mt-1">Push Notification Dashboard</p>
        </div>
      </div>

      <div className="px-4 py-3 flex items-center gap-3 border-b border-slate-800 shrink-0">
        <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-semibold text-blue-300">
          {user.email[0].toUpperCase()}
        </div>
        <span className="text-xs text-slate-400 truncate">{user.email}</span>
      </div>

      <nav className="flex flex-col gap-0.5 p-3 flex-1 overflow-y-auto">
        {sidebarNavItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600/20 text-blue-300 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-4 border-t border-slate-800 pt-3 shrink-0">
        <button
          onClick={() => { logout(); navigate('/login') }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 bg-slate-900 text-slate-300 flex-col sticky top-0 h-screen shrink-0">
        {sidebar}
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-30">
          {isSubPage ? (
            <>
              <BackButton />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <span className="font-bold text-gray-900">Pusher</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <span className="font-bold text-gray-900">Pusher</span>
            </div>
          )}
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto pb-20 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 min-w-0 px-3 py-1.5 rounded-xl transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <HomeIcon active={isActive} />
                <span className="text-[10px] font-semibold">Home</span>
              </>
            )}
          </NavLink>

          <button
            onClick={handleSendNav}
            className={`flex flex-col items-center justify-center gap-0.5 min-w-0 px-3 py-1.5 rounded-xl transition-colors ${
              isSendPage ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <SendIcon active={isSendPage} />
            <span className="text-[10px] font-semibold">Send</span>
          </button>

          <button
            onClick={handleHistoryNav}
            className={`flex flex-col items-center justify-center gap-0.5 min-w-0 px-3 py-1.5 rounded-xl transition-colors ${
              isHistoryPage ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <HistoryIcon active={isHistoryPage} />
            <span className="text-[10px] font-semibold">History</span>
          </button>

          <button
            onClick={() => setShowProfile(true)}
            className={`flex flex-col items-center justify-center gap-0.5 min-w-0 px-3 py-1.5 rounded-xl transition-colors ${
              showProfile ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <ProfileIcon active={showProfile} />
            <span className="text-[10px] font-semibold">Profile</span>
          </button>
        </div>
      </nav>

      {/* Profile sheet overlay */}
      {showProfile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowProfile(false)} />
          <div
            ref={profileRef}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl animate-slide-up"
          >
            <div className="flex items-center justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-lg font-bold text-white shadow-sm">
                  {user.email[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-900 truncate">{user.email}</div>
                  <div className="text-sm text-gray-500">Signed in</div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 bg-gray-50 rounded-xl">
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  <span>{apps.length} app{apps.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <button
                onClick={() => { logout(); navigate('/login'); setShowProfile(false) }}
                className="flex items-center justify-center gap-2 w-full mt-6 bg-red-50 text-red-600 font-semibold py-3 px-4 rounded-xl hover:bg-red-100 text-sm transition-all active:scale-[0.98]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No apps sheet */}
      {showNoApps && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowNoApps(null)} />
          <div
            ref={noAppsRef}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl animate-slide-up"
          >
            <div className="flex items-center justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-900">No apps yet</div>
                  <div className="text-sm text-gray-500">
                    {showNoApps === 'send' ? 'Create an app before sending notifications.' : 'Create an app before viewing history.'}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowNoApps(null); navigate('/dashboard') }}
                  className="flex-1 bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-blue-700 text-sm transition-all active:scale-[0.98]"
                >
                  Create an App
                </button>
                <button
                  onClick={() => setShowNoApps(null)}
                  className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-200 text-sm transition-all active:scale-[0.98]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* App picker sheet */}
      {showAppPicker && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowAppPicker(null)} />
          <div
            ref={pickerRef}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl animate-slide-up"
          >
            <div className="flex items-center justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Choose an App</div>
                  <div className="text-sm text-gray-500">{showAppPicker === 'send' ? 'Send a notification to' : 'View history for'}</div>
                </div>
              </div>
              <div className="mt-4 space-y-1 max-h-60 overflow-y-auto">
                {apps.map(app => (
                  <button
                    key={app.id}
                    onClick={() => {
                      setShowAppPicker(null)
                      navigate(showAppPicker === 'send' ? `/apps/${app.id}/notify` : `/apps/${app.id}/history`)
                    }}
                    className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-sm shrink-0">
                      {app.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm truncate">{app.name}</div>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowAppPicker(null)}
                className="w-full mt-3 bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-200 text-sm transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
