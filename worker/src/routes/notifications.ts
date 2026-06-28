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
    const notification = await store.createNotification(c.env.DB, app.id, title.trim(), body || '')

    const results = await Promise.allSettled(
      devices.map(d => sendPush(d.token, title.trim(), body || '', c.env))
    )

    const sent = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    return c.json({
      notification,
      sent,
      failed,
      totalDevices: devices.length,
    }, 201)
  } catch (e: any) {
    return c.json({ error: e.message }, 400)
  }
})

export default router
