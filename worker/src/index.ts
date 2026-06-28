import { Hono } from 'hono'
import { cors } from 'hono/cors'
import * as store from './db/store'
import auth from './routes/auth'
import apps from './routes/apps'
import devices from './routes/devices'
import notifications from './routes/notifications'
import templates from './routes/templates'

type Bindings = {
  DB: D1Database
  VAPID_PRIVATE_KEY: string
  VAPID_PUBLIC_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/*', cors())

let seeded = false
app.use('*', async (c, next) => {
  if (!seeded) {
    seeded = true
    await store.seedDemoData(c.env.DB)
  }
  await next()
})

app.route('/api/auth', auth)
app.route('/api/apps', apps)
app.route('/api/devices', devices)
app.route('/api/notify', notifications)
app.route('/api/templates', templates)

export default app
