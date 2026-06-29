import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { api } from '../services/api'
import type { Platform, App, Device, Notification, Template } from './mock'

interface ApiData {
  user: { email: string } | null
  loading: boolean
  apps: App[]
  devices: Record<string, Device[]>
  notifications: Record<string, Notification[]>
  templates: Record<string, Template[]>
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => void
  addApp: (name: string) => Promise<App>
  updateApp: (id: string, name: string) => Promise<void>
  deleteApp: (id: string) => Promise<void>
  rotateApiKey: (id: string) => Promise<string>
  registerDevice: (appId: string, platform: Platform) => Promise<Device>
  deleteDevice: (appId: string, deviceId: string) => Promise<void>
  sendNotification: (appId: string, title: string, body: string) => Promise<void>
  addTemplate: (appId: string, name: string, title: string, body: string) => void
  deleteTemplate: (appId: string, templateId: string) => void
}

const ApiContext = createContext<ApiData | null>(null)

function loadSession(): { userId: string; email: string } | null {
  try {
    const raw = localStorage.getItem('pusher_session')
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveSession(session: { userId: string; email: string }) {
  localStorage.setItem('pusher_session', JSON.stringify(session))
}

function clearSession() {
  localStorage.removeItem('pusher_session')
}

export function ApiProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<{ userId: string; email: string } | null>(loadSession)
  const [loading, setLoading] = useState(true)
  const [apps, setApps] = useState<App[]>([])
  const [devices, setDevices] = useState<Record<string, Device[]>>({})
  const [notifications, setNotifications] = useState<Record<string, Notification[]>>({})
  const [templates, setTemplates] = useState<Record<string, Template[]>>({})

  // Fetch all data on session load
  useEffect(() => {
    if (!session) { setLoading(false); return }
    setLoading(true)
    Promise.all([
      api.listApps(session.userId).catch(() => ({ apps: [] })),
    ]).then(([appsRes]) => {
      const fetchedApps: App[] = appsRes.apps.map((a: any) => ({
        id: a.id,
        name: a.name,
        apiKey: a.apiKey,
        createdAt: a.createdAt,
      }))
      setApps(fetchedApps)

      // Fetch devices, notifications, and templates per app
      return Promise.all(
        fetchedApps.map(app =>
          Promise.all([
            api.listDevices(app.id).then(r => ({ appId: app.id, devices: r.devices })),
            api.listNotifications(app.id).then(r => ({ appId: app.id, notifications: r.notifications })),
            api.listTemplates(app.id).then(r => ({ appId: app.id, templates: r.templates })),
          ])
        )
      )
    }).then(results => {
      const devMap: Record<string, Device[]> = {}
      const notifMap: Record<string, Notification[]> = {}
      const tmplMap: Record<string, Template[]> = {}
      for (const [devRes, notifRes, tmplRes] of results) {
        devMap[devRes.appId] = devRes.devices
        notifMap[notifRes.appId] = notifRes.notifications
        tmplMap[tmplRes.appId] = tmplRes.templates
      }
      setDevices(devMap)
      setNotifications(notifMap)
      setTemplates(tmplMap)
    }).finally(() => setLoading(false))
  }, [session])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password)
    saveSession({ userId: res.user.id, email: res.user.email })
    setSession({ userId: res.user.id, email: res.user.email })
  }, [])

  const signup = useCallback(async (email: string, password: string) => {
    const res = await api.signup(email, password)
    saveSession({ userId: res.user.id, email: res.user.email })
    setSession({ userId: res.user.id, email: res.user.email })
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
    setApps([])
    setDevices({})
    setNotifications({})
  }, [])

  const addApp = useCallback(async (name: string) => {
    if (!session) throw new Error('Not logged in')
    const res = await api.createApp(name, session.userId)
    const app: App = { id: res.appId, name, apiKey: res.apiKey, createdAt: new Date().toISOString().slice(0, 10) }
    setApps(prev => [...prev, app])
    setDevices(prev => ({ ...prev, [app.id]: [] }))
    setNotifications(prev => ({ ...prev, [app.id]: [] }))
    return app
  }, [session])

  const updateApp = useCallback(async (id: string, name: string) => {
    await api.updateApp(id, name)
    setApps(prev => prev.map(a => a.id === id ? { ...a, name } : a))
  }, [])

  const deleteApp = useCallback(async (id: string) => {
    await api.deleteApp(id)
    setApps(prev => prev.filter(a => a.id !== id))
    setDevices(prev => { const { [id]: _, ...rest } = prev; return rest })
    setNotifications(prev => { const { [id]: _, ...rest } = prev; return rest })
    setTemplates(prev => { const { [id]: _, ...rest } = prev; return rest })
  }, [])

  const rotateApiKey = useCallback(async (id: string) => {
    const res = await api.rotateApiKey(id)
    setApps(prev => prev.map(a => a.id === id ? { ...a, apiKey: res.apiKey } : a))
    return res.apiKey
  }, [])

  const registerDevice = useCallback(async (appId: string, platform: Platform) => {
    const app = apps.find(a => a.id === appId)
    if (!app) throw new Error('App not found')
    const token = `${platform}_token_${crypto.randomUUID().slice(0, 8)}...`
    const res = await api.registerDevice({ apiKey: app.apiKey, token, platform })
    const device: Device = res.device
    setDevices(prev => ({ ...prev, [appId]: [...(prev[appId] || []), device] }))
    return device
  }, [apps])

  const deleteDevice = useCallback(async (appId: string, deviceId: string) => {
    await api.deleteDevice(deviceId)
    setDevices(prev => ({ ...prev, [appId]: (prev[appId] || []).filter(d => d.id !== deviceId) }))
  }, [])

  const sendNotification = useCallback(async (appId: string, title: string, body: string) => {
    const app = apps.find(a => a.id === appId)
    if (!app) throw new Error('App not found')
    const res = await api.sendNotification({ apiKey: app.apiKey, title, body })
    const notification: Notification = {
      id: res.notification.id,
      appId,
      title,
      body: body || '(no message)',
      status: 'sent',
      createdAt: res.notification.createdAt,
      sentCount: res.sent,
      failedCount: res.failed,
      totalDevices: res.totalDevices,
    }
    setNotifications(prev => ({ ...prev, [appId]: [notification, ...(prev[appId] || [])] }))
  }, [apps])

  const addTemplate = useCallback(async (appId: string, name: string, title: string, body: string) => {
    const res = await api.createTemplate(appId, name, title, body)
    setTemplates(prev => ({ ...prev, [appId]: [...(prev[appId] || []), res.template] }))
  }, [])

  const deleteTemplate = useCallback(async (appId: string, templateId: string) => {
    await api.deleteTemplate(appId, templateId)
    setTemplates(prev => ({ ...prev, [appId]: (prev[appId] || []).filter(t => t.id !== templateId) }))
  }, [])

  return (
    <ApiContext.Provider value={{
      user: session ? { email: session.email } : null,
      loading,
      apps,
      devices,
      notifications,
      templates,
      login,
      signup,
      logout,
      addApp,
      updateApp,
      deleteApp,
      rotateApiKey,
      registerDevice,
      deleteDevice,
      sendNotification,
      addTemplate,
      deleteTemplate,
    }}>
      {children}
    </ApiContext.Provider>
  )
}

export function useApi() {
  const ctx = useContext(ApiContext)
  if (!ctx) throw new Error('useApi must be inside ApiProvider')
  return ctx
}
