import { Hono } from 'hono'
import * as store from '../db/store'
import { sendPush } from '../services/push'

const router = new Hono<{ Bindings: { DB: D1Database; VAPID_PRIVATE_KEY: string; VAPID_PUBLIC_KEY: string } }>()

router.post('/', async (c) => {
  try {
    const { apiKey, title, body } = await c.req.json()
    if (!apiKey || !title?.trim()) return c.json({ error: 'apiKey and title required' }, 400)

    const app = await store.findAppByApiKey(c.env.DB, apiKey)
    if (!app) return c.json({ error: 'Invalid API key' }, 401)

    const devices = await store.findDevicesByApp(c.env.DB, app.id)

    const results = await Promise.allSettled(
      devices.map(d => sendPush(d.token, title.trim(), body || '', c.env))
    )

    const sent = results.filter(r => r.status === 'fulfilled' && (r as any).value?.success).length
    const failed = results.filter(r => r.status === 'fulfilled' && !(r as any).value?.success).length
    const details = results
      .filter(r => r.status === 'fulfilled')
      .map(r => ({ status: (r as any).value?.status, error: (r as any).value?.error || null }))
      .filter(r => !r.status || r.status >= 400)
      .slice(0, 5)

    const notification = await store.createNotification(c.env.DB, app.id, title.trim(), body || '', sent, failed, devices.length)

    return c.json({
      notification,
      sent,
      failed,
      totalDevices: devices.length,
      details,
    }, 201)
  } catch (e: any) {
    return c.json({ error: e.message }, 400)
  }
})

router.get('/latest', async (c) => {
  const result: any = await c.env.DB.prepare('SELECT id, app_id, title, body, status, created_at, sent_count, failed_count, total_devices FROM notifications ORDER BY created_at DESC LIMIT 1').first()
  const map = (r: any) => r ? { id: r.id, appId: r.appId || r.app_id, title: r.title, body: r.body, status: r.status, createdAt: r.createdAt || r.created_at, sentCount: r.sentCount ?? r.sent_count, failedCount: r.failedCount ?? r.failed_count, totalDevices: r.totalDevices ?? r.total_devices } : null
  const n = map(result)
  return c.json({ notification: n })
})

export default router
