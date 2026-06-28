import { Hono } from 'hono'
import * as store from '../db/store'

const router = new Hono<{ Bindings: { DB: D1Database } }>()

router.get('/', async (c) => {
  const userId = c.req.header('x-user-id')
  if (!userId) return c.json({ error: 'Unauthorized' }, 401)
  const apps = await store.findAppsByUser(c.env.DB, userId)
  return c.json({ apps })
})

router.post('/', async (c) => {
  try {
    const userId = c.req.header('x-user-id')
    if (!userId) return c.json({ error: 'Unauthorized' }, 401)
    const { name } = await c.req.json()
    if (!name?.trim()) return c.json({ error: 'App name required' }, 400)
    const app = await store.createApp(c.env.DB, userId, name.trim())
    return c.json({ appId: app.id, apiKey: app.apiKey }, 201)
  } catch (e: any) {
    return c.json({ error: e.message }, 400)
  }
})

router.get('/:id', async (c) => {
  const app = await store.findAppById(c.env.DB, c.req.param('id'))
  if (!app) return c.json({ error: 'App not found' }, 404)
  return c.json({ app })
})

router.patch('/:id', async (c) => {
  const { name } = await c.req.json()
  if (!name?.trim()) return c.json({ error: 'App name required' }, 400)
  const app = await store.findAppById(c.env.DB, c.req.param('id'))
  if (!app) return c.json({ error: 'App not found' }, 404)
  await store.updateAppName(c.env.DB, app.id, name.trim())
  return c.json({ app: { ...app, name: name.trim() } })
})

router.delete('/:id', async (c) => {
  const app = await store.findAppById(c.env.DB, c.req.param('id'))
  if (!app) return c.json({ error: 'App not found' }, 404)
  await store.deleteApp(c.env.DB, app.id)
  return c.json({ success: true })
})

router.post('/:id/rotate-key', async (c) => {
  const app = await store.findAppById(c.env.DB, c.req.param('id'))
  if (!app) return c.json({ error: 'App not found' }, 404)
  const apiKey = await store.rotateApiKey(c.env.DB, app.id)
  return c.json({ apiKey })
})

router.get('/:id/devices', async (c) => {
  const app = await store.findAppById(c.env.DB, c.req.param('id'))
  if (!app) return c.json({ error: 'App not found' }, 404)
  const devices = await store.findDevicesByApp(c.env.DB, app.id)
  return c.json({ devices })
})

router.get('/:id/notifications', async (c) => {
  const app = await store.findAppById(c.env.DB, c.req.param('id'))
  if (!app) return c.json({ error: 'App not found' }, 404)
  const notifications = await store.findNotificationsByApp(c.env.DB, app.id)
  return c.json({ notifications })
})

export default router
