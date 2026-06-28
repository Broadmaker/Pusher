import { Hono } from 'hono'
import * as store from '../db/store'
import type { Platform } from '../db/store'

const router = new Hono<{ Bindings: { DB: D1Database } }>()

router.post('/register', async (c) => {
  try {
    const { apiKey, token, platform } = await c.req.json()
    if (!apiKey || !token || !platform) return c.json({ error: 'apiKey, token, and platform required' }, 400)
    if (!['web', 'android', 'ios'].includes(platform)) return c.json({ error: 'Invalid platform' }, 400)

    const app = await store.findAppByApiKey(c.env.DB, apiKey)
    if (!app) return c.json({ error: 'Invalid API key' }, 401)

    const device = await store.registerDevice(c.env.DB, app.id, token, platform as Platform)
    return c.json({ device }, 201)
  } catch (e: any) {
    return c.json({ error: e.message }, 400)
  }
})

router.delete('/:id', async (c) => {
  await store.deleteDeviceById(c.env.DB, c.req.param('id'))
  return c.json({ success: true })
})

export default router
