import { createContext, useContext, useState, type ReactNode } from 'react'

export type Platform = 'web' | 'android' | 'ios'

export interface App {
  id: string
  name: string
  apiKey: string
  createdAt: string
}

export interface Device {
  id: string
  token: string
  platform: Platform
  createdAt: string
}

export interface Notification {
  id: string
  appId: string
  title: string
  body: string
  status: string
  createdAt: string
}

export interface Template {
  id: string
  name: string
  title: string
  body: string
}

interface MockData {
  user: { email: string }
  apps: App[]
  devices: Record<string, Device[]>
  notifications: Record<string, Notification[]>
  templates: Record<string, Template[]>
  addApp: (name: string) => App
  updateApp: (id: string, name: string) => void
  deleteApp: (id: string) => void
  rotateApiKey: (id: string) => string
  registerDevice: (appId: string, platform: Platform) => Device
  deleteDevice: (appId: string, deviceId: string) => void
  sendNotification: (appId: string, title: string, body: string) => void
  addTemplate: (appId: string, name: string, title: string, body: string) => void
  deleteTemplate: (appId: string, templateId: string) => void
}

const MockContext = createContext<MockData | null>(null)

const initialApps: App[] = [
  { id: '1', name: 'My Production App', apiKey: 'pk_live_a1b2c3d4e5f6', createdAt: '2025-06-10' },
  { id: '2', name: 'Staging App', apiKey: 'pk_test_g7h8i9j0k1l2', createdAt: '2025-06-15' },
]

const initialDevices: Record<string, Device[]> = {
  '1': [
    { id: 'd1', token: 'fcm_token_android_xxx...', platform: 'android', createdAt: '2025-06-11' },
    { id: 'd2', token: 'web_push_token_yyy...', platform: 'web', createdAt: '2025-06-12' },
    { id: 'd3', token: 'fcm_token_ios_zzz...', platform: 'ios', createdAt: '2025-06-13' },
  ],
  '2': [
    { id: 'd4', token: 'fcm_token_android_123...', platform: 'android', createdAt: '2025-06-16' },
  ],
}

const initialNotifications: Record<string, Notification[]> = {
  '1': [
    { id: 'n1', appId: '1', title: 'Welcome!', body: 'Thanks for signing up', status: 'sent', createdAt: '2025-06-11' },
    { id: 'n2', appId: '1', title: 'Flash Sale', body: '50% off everything today!', status: 'sent', createdAt: '2025-06-13' },
  ],
  '2': [
    { id: 'n3', appId: '2', title: 'Test Notification', body: 'This is a test', status: 'sent', createdAt: '2025-06-16' },
  ],
}

const initialTemplates: Record<string, Template[]> = {
  '1': [
    { id: 't1', name: 'Welcome', title: 'Welcome!', body: 'Thanks for joining us!' },
    { id: 't2', name: 'Flash Sale', title: 'Flash Sale', body: '50% off everything today only!' },
  ],
  '2': [
    { id: 't3', name: 'Test', title: 'Test Notification', body: 'This is a test message' },
  ],
}

let nextId = 100

export function MockProvider({ children }: { children: ReactNode }) {
  const [apps, setApps] = useState<App[]>(initialApps)
  const [devices, setDevices] = useState<Record<string, Device[]>>(initialDevices)
  const [notifications, setNotifications] = useState<Record<string, Notification[]>>(initialNotifications)
  const [templates, setTemplates] = useState<Record<string, Template[]>>(initialTemplates)

  const addApp = (name: string) => {
    const app: App = {
      id: String(++nextId),
      name,
      apiKey: 'pk_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16),
      createdAt: new Date().toISOString().slice(0, 10),
    }
    setApps(prev => [...prev, app])
    setDevices(prev => ({ ...prev, [app.id]: [] }))
    setNotifications(prev => ({ ...prev, [app.id]: [] }))
    return app
  }

  const updateApp = (id: string, name: string) => {
    setApps(prev => prev.map(a => a.id === id ? { ...a, name } : a))
  }

  const deleteApp = (id: string) => {
    setApps(prev => prev.filter(a => a.id !== id))
    setDevices(prev => { const { [id]: _, ...rest } = prev; return rest })
    setNotifications(prev => { const { [id]: _, ...rest } = prev; return rest })
    setTemplates(prev => { const { [id]: _, ...rest } = prev; return rest })
  }

  const rotateApiKey = (id: string) => {
    const newKey = 'pk_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16)
    setApps(prev => prev.map(a => a.id === id ? { ...a, apiKey: newKey } : a))
    return newKey
  }

  const registerDevice = (appId: string, platform: Platform) => {
    const device: Device = {
      id: 'd' + String(++nextId),
      token: `${platform}_token_${crypto.randomUUID().slice(0, 8)}...`,
      platform,
      createdAt: new Date().toISOString().slice(0, 10),
    }
    setDevices(prev => ({
      ...prev,
      [appId]: [...(prev[appId] || []), device],
    }))
    return device
  }

  const deleteDevice = (appId: string, deviceId: string) => {
    setDevices(prev => ({
      ...prev,
      [appId]: (prev[appId] || []).filter(d => d.id !== deviceId),
    }))
  }

  const addTemplate = (appId: string, name: string, title: string, body: string) => {
    const t: Template = { id: 't' + String(++nextId), name, title, body }
    setTemplates(prev => ({ ...prev, [appId]: [...(prev[appId] || []), t] }))
  }

  const deleteTemplate = (appId: string, templateId: string) => {
    setTemplates(prev => ({ ...prev, [appId]: (prev[appId] || []).filter(t => t.id !== templateId) }))
  }

  const sendNotification = (appId: string, title: string, body: string) => {
    const notification: Notification = {
      id: 'n' + String(++nextId),
      appId,
      title,
      body: body || '(no message)',
      status: 'sent',
      createdAt: new Date().toISOString().slice(0, 10),
    }
    setNotifications(prev => ({
      ...prev,
      [appId]: [notification, ...(prev[appId] || [])],
    }))
  }

  return (
    <MockContext.Provider value={{
      user: { email: 'demo@example.com' },
      apps,
      devices,
      notifications,
      templates,
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
    </MockContext.Provider>
  )
}

export function useMock() {
  const ctx = useContext(MockContext)
  if (!ctx) throw new Error('useMock must be inside MockProvider')
  return ctx
}
