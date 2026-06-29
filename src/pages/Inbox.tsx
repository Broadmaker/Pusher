import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

function formatDate(raw: string): string {
  if (!raw) return ''
  const d = new Date(raw)
  if (isNaN(d.getTime())) return raw
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const isToday = diff < 86400000 && d.getDate() === now.getDate()
  const datePart = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const timePart = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  if (isToday) return `Today at ${timePart}`
  if (diff < 86400000 * 2) return `Yesterday at ${timePart}`
  return `${datePart} at ${timePart}`
}

export default function Inbox() {
  const { apiKey: urlKey } = useParams<{ apiKey: string }>()
  const [savedKey, setSavedKey] = useState(localStorage.getItem('pusher_api_key') || '')
  const [inputKey, setInputKey] = useState(urlKey || savedKey || '')
  const apiKey = urlKey || savedKey
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = (key: string) => {
    setLoading(true)
    setError('')
    fetch(`${API_BASE}/notify/public/${key}`)
      .then(r => { if (!r.ok) throw new Error('Invalid API key'); return r.json() })
      .then(data => {
        setNotifications(data.notifications || [])
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load notifications')
        setLoading(false)
      })
  }

  useEffect(() => {
    if (!apiKey) {
      setLoading(false)
      return
    }
    load(apiKey)
  }, [apiKey])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputKey.trim()) return
    localStorage.setItem('pusher_api_key', inputKey.trim())
    setSavedKey(inputKey.trim())
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-500">Your recent push notifications</p>
          </div>
        </div>

        {!apiKey ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Enter your API Key</h2>
            <p className="text-xs text-gray-500 mb-4">Paste the API key from the app that registered your device to view your notifications.</p>
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="text"
                value={inputKey}
                onChange={e => setInputKey(e.target.value)}
                placeholder="pk_live_..."
                className="flex-1 px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button type="submit" disabled={!inputKey.trim()} className="bg-blue-600 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-700 text-sm transition-all disabled:opacity-50">
                View
              </button>
            </form>
          </div>
        ) : loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium text-sm">{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium text-sm">No notifications yet</p>
            <p className="text-gray-400 text-xs mt-1">Notifications you receive will appear here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => (
              <div key={n.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0 mt-0.5">
                    {n.title[0]?.toUpperCase() || 'N'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-gray-900 text-sm">{n.title}</span>
                      <span className="text-xs text-gray-400 shrink-0">{formatDate(n.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{n.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
