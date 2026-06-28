export type Platform = 'web' | 'android' | 'ios'

export interface User {
  id: string
  email: string
  passwordHash: string
  createdAt: string
}

export interface App {
  id: string
  userId: string
  name: string
  apiKey: string
  createdAt: string
}

export interface Device {
  id: string
  appId: string
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

// Users
export async function createUser(db: D1Database, email: string, password: string): Promise<User> {
  const existing = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
  if (existing) throw new Error('Email already registered')
  const id = crypto.randomUUID()
  const createdAt = new Date().toISOString().slice(0, 10)
  await db.prepare('INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)')
    .bind(id, email, password, createdAt).run()
  return { id, email, passwordHash: password, createdAt }
}

const mapUser = (r: any): User | undefined => r ? { id: r.id, email: r.email, passwordHash: r.passwordHash || r.password_hash, createdAt: r.createdAt || r.created_at } : undefined

export async function findUserByEmail(db: D1Database, email: string): Promise<User | undefined> {
  const r = await db.prepare('SELECT id, email, password_hash, created_at FROM users WHERE email = ?')
    .bind(email).first()
  return mapUser(r)
}

export async function findUserById(db: D1Database, id: string): Promise<User | undefined> {
  const r = await db.prepare('SELECT id, email, password_hash, created_at FROM users WHERE id = ?')
    .bind(id).first()
  return mapUser(r)
}

// Apps
export async function createApp(db: D1Database, userId: string, name: string): Promise<App> {
  const id = crypto.randomUUID()
  const apiKey = 'pk_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16)
  const createdAt = new Date().toISOString().slice(0, 10)
  await db.prepare('INSERT INTO apps (id, user_id, name, api_key, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind(id, userId, name, apiKey, createdAt).run()
  return { id, userId, name, apiKey, createdAt }
}

const mapApp = (r: any): App | undefined => r ? { id: r.id, userId: r.userId || r.user_id, name: r.name, apiKey: r.apiKey || r.api_key, createdAt: r.createdAt || r.created_at } : undefined
const mapApps = (results: any[]): App[] => results.map(r => ({ id: r.id, userId: r.userId || r.user_id, name: r.name, apiKey: r.apiKey || r.api_key, createdAt: r.createdAt || r.created_at }))

export async function findAppByApiKey(db: D1Database, apiKey: string): Promise<App | undefined> {
  const r = await db.prepare('SELECT id, user_id, name, api_key, created_at FROM apps WHERE api_key = ?')
    .bind(apiKey).first()
  return mapApp(r)
}

export async function findAppsByUser(db: D1Database, userId: string): Promise<App[]> {
  const res = await db.prepare('SELECT id, user_id, name, api_key, created_at FROM apps WHERE user_id = ? ORDER BY created_at DESC')
    .bind(userId).all()
  return mapApps(res.results as any[])
}

export async function findAppById(db: D1Database, id: string): Promise<App | undefined> {
  const r = await db.prepare('SELECT id, user_id, name, api_key, created_at FROM apps WHERE id = ?')
    .bind(id).first()
  return mapApp(r)
}

export async function updateAppName(db: D1Database, id: string, name: string): Promise<void> {
  await db.prepare('UPDATE apps SET name = ? WHERE id = ?').bind(name, id).run()
}

export async function rotateApiKey(db: D1Database, id: string): Promise<string> {
  const apiKey = 'pk_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16)
  await db.prepare('UPDATE apps SET api_key = ? WHERE id = ?').bind(apiKey, id).run()
  return apiKey
}

export async function deleteApp(db: D1Database, id: string): Promise<void> {
  await db.prepare('DELETE FROM devices WHERE app_id = ?').bind(id).run()
  await db.prepare('DELETE FROM notifications WHERE app_id = ?').bind(id).run()
  await db.prepare('DELETE FROM apps WHERE id = ?').bind(id).run()
}

// Devices
export async function registerDevice(db: D1Database, appId: string, token: string, platform: Platform): Promise<Device> {
  const id = crypto.randomUUID()
  const createdAt = new Date().toISOString().slice(0, 10)
  await db.prepare('INSERT INTO devices (id, app_id, token, platform, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind(id, appId, token, platform, createdAt).run()
  return { id, appId, token, platform, createdAt }
}

const mapDevice = (r: any): Device => ({ id: r.id, appId: r.appId || r.app_id, token: r.token, platform: r.platform, createdAt: r.createdAt || r.created_at })
const mapDevices = (results: any[]): Device[] => results.map(r => ({ id: r.id, appId: r.appId || r.app_id, token: r.token, platform: r.platform, createdAt: r.createdAt || r.created_at }))
const mapNotification = (r: any): Notification => ({ id: r.id, appId: r.appId || r.app_id, title: r.title, body: r.body, status: r.status, createdAt: r.createdAt || r.created_at })
const mapNotifications = (results: any[]): Notification[] => results.map(r => ({ id: r.id, appId: r.appId || r.app_id, title: r.title, body: r.body, status: r.status, createdAt: r.createdAt || r.created_at }))

export async function findDevicesByApp(db: D1Database, appId: string): Promise<Device[]> {
  const res = await db.prepare('SELECT id, app_id, token, platform, created_at FROM devices WHERE app_id = ? ORDER BY created_at DESC')
    .bind(appId).all()
  return mapDevices(res.results as any[])
}

export async function deleteDeviceById(db: D1Database, id: string): Promise<void> {
  await db.prepare('DELETE FROM devices WHERE id = ?').bind(id).run()
}

// Notifications
export async function createNotification(db: D1Database, appId: string, title: string, body: string): Promise<Notification> {
  const id = crypto.randomUUID()
  const createdAt = new Date().toISOString().slice(0, 10)
  await db.prepare('INSERT INTO notifications (id, app_id, title, body, status, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(id, appId, title, body || '(no message)', 'sent', createdAt).run()
  return { id, appId, title, body: body || '(no message)', status: 'sent', createdAt }
}

export async function findNotificationsByApp(db: D1Database, appId: string): Promise<Notification[]> {
  const res = await db.prepare('SELECT id, app_id, title, body, status, created_at FROM notifications WHERE app_id = ? ORDER BY created_at DESC')
    .bind(appId).all()
  return mapNotifications(res.results as any[])
}

// Seed
export async function seedDemoData(db: D1Database): Promise<void> {
  const existing = await db.prepare('SELECT id FROM users WHERE email = ?').bind('demo@example.com').first()
  if (existing) return

  const userId = 'demo-user'
  await db.prepare('INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)')
    .bind(userId, 'demo@example.com', 'password', '2025-06-01').run()

  const appIds = ['app-1', 'app-2']
  await db.prepare('INSERT INTO apps (id, user_id, name, api_key, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind('app-1', userId, 'My Production App', 'pk_live_a1b2c3d4e5f6', '2025-06-10').run()
  await db.prepare('INSERT INTO apps (id, user_id, name, api_key, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind('app-2', userId, 'Staging App', 'pk_test_g7h8i9j0k1l2', '2025-06-15').run()

  await db.prepare('INSERT INTO devices (id, app_id, token, platform, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind('dev-1', 'app-1', 'fcm_token_android_xxx...', 'android', '2025-06-11').run()
  await db.prepare('INSERT INTO devices (id, app_id, token, platform, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind('dev-2', 'app-1', 'web_push_token_yyy...', 'web', '2025-06-12').run()
  await db.prepare('INSERT INTO devices (id, app_id, token, platform, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind('dev-3', 'app-1', 'fcm_token_ios_zzz...', 'ios', '2025-06-13').run()
  await db.prepare('INSERT INTO devices (id, app_id, token, platform, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind('dev-4', 'app-2', 'fcm_token_android_123...', 'android', '2025-06-16').run()

  await db.prepare('INSERT INTO notifications (id, app_id, title, body, status, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .bind('notif-1', 'app-1', 'Welcome!', 'Thanks for signing up', 'sent', '2025-06-11').run()
  await db.prepare('INSERT INTO notifications (id, app_id, title, body, status, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .bind('notif-2', 'app-1', 'Flash Sale', '50% off everything today!', 'sent', '2025-06-13').run()
  await db.prepare('INSERT INTO notifications (id, app_id, title, body, status, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .bind('notif-3', 'app-2', 'Test Notification', 'This is a test', 'sent', '2025-06-16').run()
}
