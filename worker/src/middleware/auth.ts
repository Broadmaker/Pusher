import { createMiddleware } from 'hono/factory'
import * as store from '../db/store'

export const requireAuth = createMiddleware<{ Bindings: { DB: D1Database } }>(async (c, next) => {
  const userId = c.req.header('x-user-id')
  if (!userId) return c.json({ error: 'Unauthorized' }, 401)
  const user = await store.findUserById(c.env.DB, userId)
  if (!user) return c.json({ error: 'User not found' }, 401)
  await next()
})

export const requireApiKey = createMiddleware<{ Bindings: { DB: D1Database } }>(async (c, next) => {
  const apiKey = c.req.header('x-api-key')
  if (!apiKey) return c.json({ error: 'API key required' }, 401)
  const app = await store.findAppByApiKey(c.env.DB, apiKey)
  if (!app) return c.json({ error: 'Invalid API key' }, 401)
  c.set('app', app)
  await next()
})
