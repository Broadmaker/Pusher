import { Hono } from 'hono'
import * as store from '../db/store'

const router = new Hono<{ Bindings: { DB: D1Database } }>()

router.get('/:appId', async (c) => {
  const templates = await store.findTemplatesByApp(c.env.DB, c.req.param('appId'))
  return c.json({ templates })
})

router.post('/:appId', async (c) => {
  try {
    const { name, title, body } = await c.req.json()
    if (!name?.trim() || !title?.trim()) return c.json({ error: 'name and title required' }, 400)
    const template = await store.createTemplate(c.env.DB, c.req.param('appId'), name.trim(), title.trim(), body || '')
    return c.json({ template }, 201)
  } catch (e: any) {
    return c.json({ error: e.message }, 400)
  }
})

router.delete('/:appId/:templateId', async (c) => {
  await store.deleteTemplate(c.env.DB, c.req.param('templateId'))
  return c.json({ success: true })
})

export default router
