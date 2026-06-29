import { Hono } from 'hono'
import * as store from '../db/store'

const router = new Hono<{ Bindings: { DB: D1Database } }>()

router.post('/signup', async (c) => {
  try {
    const { email, password } = await c.req.json()
    if (!email || !password) return c.json({ error: 'Email and password required' }, 400)
    const user = await store.createUser(c.env.DB, email, password)
    return c.json({ user: { id: user.id, email: user.email } }, 201)
  } catch (e: any) {
    return c.json({ error: e.message }, 409)
  }
})

router.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json()
    if (!email || !password) return c.json({ error: 'Email and password required' }, 400)
    const user = await store.findUserByEmail(c.env.DB, email)
    if (!user || user.passwordHash !== password) return c.json({ error: 'Invalid credentials' }, 401)
    return c.json({ user: { id: user.id, email: user.email, createdAt: user.createdAt } })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

export default router
