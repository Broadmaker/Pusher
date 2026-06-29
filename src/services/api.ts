const API_BASE = import.meta.env.VITE_API_URL || '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (options?.headers) {
      Object.assign(headers, options.headers)
    }
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    })
    let data: any
    try {
      data = await res.json()
    } catch {
      throw new Error(res.status === 500 ? 'Server error — please try again' : `Request failed (${res.status})`)
    }
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
    return data
  } catch (err: any) {
    if (err.name === 'AbortError') throw new Error('Request timed out — is the worker running?')
    throw err
  } finally {
    clearTimeout(timeout)
  }
}

export const api = {
  // Auth
  signup: (email: string, password: string) =>
    request<{ user: { id: string; email: string } }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  login: (email: string, password: string) =>
    request<{ user: { id: string; email: string; createdAt: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // Apps
  listApps: (userId: string) =>
    request<{ apps: any[] }>('/apps', {
      headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
    }),
  createApp: (name: string, userId: string) =>
    request<{ appId: string; apiKey: string }>('/apps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
      body: JSON.stringify({ name }),
    }),
  getApp: (id: string) =>
    request<{ app: any }>(`/apps/${id}`),
  updateApp: (id: string, name: string) =>
    request<{ app: any }>(`/apps/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    }),
  deleteApp: (id: string) =>
    request<{ success: boolean }>(`/apps/${id}`, { method: 'DELETE' }),
  rotateApiKey: (id: string) =>
    request<{ apiKey: string }>(`/apps/${id}/rotate-key`, { method: 'POST' }),

  // Devices
  registerDevice: (data: { apiKey: string; token: string; platform: string }) =>
    request<{ device: any }>('/devices/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteDevice: (id: string) =>
    request<{ success: boolean }>(`/devices/${id}`, { method: 'DELETE' }),
  listDevices: (appId: string) =>
    request<{ devices: any[] }>(`/apps/${appId}/devices`),

  // Notifications
  sendNotification: (data: { apiKey: string; title: string; body: string }) =>
    request<{ notification: any; sent: number; failed: number; totalDevices: number }>('/notify', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  listNotifications: (appId: string) =>
    request<{ notifications: any[] }>(`/apps/${appId}/notifications`),

  // Templates
  listTemplates: (appId: string) =>
    request<{ templates: any[] }>(`/templates/${appId}`),
  createTemplate: (appId: string, name: string, title: string, body: string) =>
    request<{ template: any }>(`/templates/${appId}`, {
      method: 'POST',
      body: JSON.stringify({ name, title, body }),
    }),
  deleteTemplate: (appId: string, templateId: string) =>
    request<{ success: boolean }>(`/templates/${appId}/${templateId}`, { method: 'DELETE' }),
}
