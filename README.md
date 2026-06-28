# Pusher — Push Notification SaaS

A full-stack push notification platform. React frontend (Vite + Tailwind), Hono/Cloudflare Workers backend, D1 persistence.

**Live**: [pusher-efm.pages.dev](https://pusher-efm.pages.dev) (frontend) · [pusher-api.sanigkram24.workers.dev](https://pusher-api.sanigkram24.workers.dev) (API)

**Demo credentials**: `demo@example.com` / `password`

---

## Architecture

```
┌─────────────────┐     ┌──────────────────────────┐     ┌──────────┐
│  React Frontend │────▶│  Hono API (Cloudflare    │────▶│  D1 DB   │
│  (Pages)        │     │  Workers)                 │     │ (SQLite)  │
└─────────────────┘     └──────────────────────────┘     └──────────┘
         │                         │
         │                         ▼
         │              ┌──────────────────┐
         │              │  FCM / Web Push   │
         └──────────────│  (Chrome/Android)  │
                        └──────────────────┘
```

### Frontend (`src/`)
- React 18 + React Router v6
- Tailwind CSS + custom animations
- PWA-ready (manifest.json + service worker)
- Mobile-first: bottom nav bar, bottom sheets, responsive

### Worker (`worker/src/`)
- Hono framework on Cloudflare Workers
- D1 (SQLite) for persistence
- VAPID JWT-signed Web Push via FCM
- Session-less auth: `x-user-id` header + API key

### Service Worker (`public/sw.js`)
- PWA lifecycle (install, activate, fetch)
- Push event → fetches `/api/notify/latest` → shows notification
- Click event → opens app

---

## Project Structure

```
pusher/
├── public/                  # Static assets (served at root)
│   ├── sw.js               # Service worker
│   ├── test.html           # Device registration test page
│   ├── sdk.js              # Bundled Web SDK
│   ├── manifest.json       # PWA manifest
│   ├── sdo_logo_colored.png
│   ├── logo-192.png
│   └── logo-512.png
├── src/                    # React frontend
│   ├── main.tsx
│   ├── App.tsx             # Routes
│   ├── index.css           # Tailwind + utilities
│   ├── config.ts           # VAPID public key
│   ├── components/
│   │   ├── Layout.tsx      # Sidebar (desktop) + bottom nav (mobile)
│   │   ├── ui.tsx          # Button, Input, Badge, Table, Modal, etc.
│   │   └── Toast.tsx
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── Dashboard.tsx
│   │   ├── AppSettings.tsx
│   │   ├── Devices.tsx
│   │   ├── SendNotification.tsx
│   │   ├── NotificationHistory.tsx
│   │   └── CreateApp.tsx
│   ├── data/
│   │   ├── api-context.tsx  # React context: all API state + actions
│   │   └── mock.tsx         # Type definitions
│   └── services/
│       └── api.ts           # HTTP client (fetch wrapper)
├── worker/                  # Cloudflare Worker backend
│   ├── wrangler.toml        # Worker config + D1 binding
│   ├── .dev.vars           # Local VAPID keys (gitignored)
│   ├── migrations/
│   │   ├── 0001_init.sql    # users, apps, devices, notifications
│   │   └── 0002_templates.sql
│   └── src/
│       ├── index.ts         # Hono app entry + seed middleware
│       ├── db/
│       │   └── store.ts     # All D1 queries + snake_case↔camelCase
│       ├── routes/
│       │   ├── auth.ts      # /api/auth/login, /api/auth/signup
│       │   ├── apps.ts      # /api/apps CRUD
│       │   ├── devices.ts   # /api/devices/register
│       │   ├── notifications.ts  # /api/notify (send + latest)
│       │   └── templates.ts # /api/templates CRUD
│       └── services/
│           └── push.ts      # VAPID JWT signing + FCM delivery
├── sdk/web/
│   └── src/index.ts        # Web SDK source (built to public/sdk.js)
├── .env                    # VITE_API_URL for production build
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## API Endpoints

All endpoints return JSON. `x-user-id` header is required for user-specific routes.

### Auth
| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/api/auth/signup` | `{ email, password }` | `{ user: { id, email } }` |
| POST | `/api/auth/login` | `{ email, password }` | `{ user: { id, email, createdAt } }` |

### Apps (require `x-user-id` header)
| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/api/apps` | — | `{ apps: [...] }` |
| POST | `/api/apps` | `{ name }` | `{ appId, apiKey }` |
| GET | `/api/apps/:id` | — | `{ app: {...} }` |
| PATCH | `/api/apps/:id` | `{ name }` | `{ app: {...} }` |
| DELETE | `/api/apps/:id` | — | `{ success: true }` |
| POST | `/api/apps/:id/rotate-key` | — | `{ apiKey }` |
| GET | `/api/apps/:id/devices` | — | `{ devices: [...] }` |
| GET | `/api/apps/:id/notifications` | — | `{ notifications: [...] }` |

### Devices (public, uses `apiKey`)
| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/api/devices/register` | `{ apiKey, token, platform }` | `{ device: {...} }` |
| DELETE | `/api/devices/:id` | — | `{ success: true }` |

### Notifications (public, uses `apiKey`)
| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/api/notify` | `{ apiKey, title, body }` | `{ notification, sent, failed, totalDevices }` |
| GET | `/api/notify/latest` | — | `{ notification: {...} }` |

### Templates (require `x-user-id` header)
| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/api/templates/:appId` | — | `{ templates: [...] }` |
| POST | `/api/templates/:appId` | `{ name, title, body }` | `{ template: {...} }` |
| DELETE | `/api/templates/:appId/:id` | — | `{ success: true }` |

---

## CLI Commands

### Setup

```bash
pnpm install                    # Install all deps (root + worker)
```

### Development

```bash
# Terminal 1 — Run worker locally
pnpm dev:worker                 # Starts wrangler dev at localhost:8787

# Terminal 2 — Run frontend locally
pnpm dev                        # Starts Vite at localhost:5173
```

The Vite dev server proxies `/api/*` to the worker at `localhost:8787`.

### Database Migrations

```bash
pnpm db:migrate                 # Applies pending D1 migrations
npx wrangler d1 migrations apply pusher-db --remote  # Apply to remote DB
npx wrangler d1 execute pusher-db --remote --command "SELECT * FROM users"  # Run raw SQL
```

### VAPID Keys (Web Push)

Generate:
```bash
npx web-push generate-vapid-keys --json
```

Set locally (`.dev.vars`):
```
VAPID_PUBLIC_KEY=BG8L...
VAPID_PRIVATE_KEY=MIG8...
```

Set in production:
```bash
echo "VAPID_PUBLIC_KEY=BG8L..." | wrangler secret put VAPID_PUBLIC_KEY
echo "VAPID_PRIVATE_KEY=MIG8..." | wrangler secret put VAPID_PRIVATE_KEY
```

### Build & Deploy

```bash
# Frontend (Cloudflare Pages)
pnpm build                          # Build SDK + TypeScript + Vite
npx wrangler pages deploy dist --project-name pusher

# Worker (Cloudflare Workers)
pnpm deploy:worker                  # Deploy worker to production
```

### SDK

The Web SDK (`sdk/web/src/index.ts`) is bundled via esbuild:
```bash
pnpm build:sdk                      # Outputs public/sdk.js (1.8KB)
```

---

## How Push Works

1. **User registers device** via `/test` or SDK → calls `POST /api/devices/register` with browser's FCM subscription JSON
2. **You compose notification** in dashboard → calls `POST /api/notify` with `{ apiKey, title, body }`
3. **Worker sends Web Push** to every device token:
   - Builds VAPID JWT (ES256 signed with private key)
   - Sends `POST` to FCM endpoint with empty body (no encryption)
   - FCM delivers to the device
4. **Service worker receives push** → fetches `GET /api/notify/latest` → shows notification with title, body, icon

### VAPID Flow

```
Browser                     FCM                        Worker
  │                         │                           │
  │── pushManager.subscribe──▶(stores endpoint + keys)──▶── POST /devices/register
  │                         │                           │
  │                         │        POST /api/notify   │
  │                         │◀──────────────────────────│
  │                         │                           │
  │                         │ VAPID JWT (signed with    │
  │                         │ ECDSA P-256 private key)  │
  │                         │                           │
  │◀────── push event ──────│                           │
  │                         │                           │
  │── fetch /api/notify/latest ────────────────────────▶│
  │◀─ { notification } ─────│───────────────────────────│
  │                         │                           │
  │── showNotification()    │                           │
```

### Important Notes

- **Empty body push**: FCM rejects unencrypted payloads. The push body is empty; the service worker fetches the notification content from `/api/notify/latest` when it receives the push event.
- **VAPID signing**: Cloudflare Workers Web Crypto API returns raw 64-byte ECDSA signatures (r||s), not DER. The code handles this correctly.
- **Snake_case mapping**: D1 returns `created_at` but the frontend expects `createdAt`. All queries go through mapping functions in `store.ts`.
- **Demo seed**: Seeded once on first request via middleware. Creates user, 2 apps, 4 devices, and sample notifications.
- **Device cleanup**: Stale subscriptions (HTTP 410) are cleaned periodically.

---

## Security

- Passwords stored as plaintext (MVP only — use bcrypt/argon2 for production)
- API keys: `pk_` prefix + 16 hex chars
- Session: user ID stored in `localStorage`, sent as `x-user-id` header
- VAPID keys stored as worker secrets, not in code

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, TypeScript |
| Backend | Hono, Cloudflare Workers |
| Database | Cloudflare D1 (SQLite) |
| Push Protocol | Web Push (VAPID + FCM) |
| Auth | Stateless (localStorage + `x-user-id`) |
| SDK | esbuild (IIFE bundle) |
| PWA | Service Worker + manifest.json |

---

## GitHub

[github.com/Broadmaker/Pusher](https://github.com/Broadmaker/Pusher)
