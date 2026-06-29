# DepEd Push Notification Integration Guide

Integrate payroll push notifications into the DepEd system using Pusher.

---

## Architecture Overview

```
┌─────────────────────┐          ┌──────────────────────┐          ┌─────────────┐
│  DepEd Frontend     │          │  Pusher API           │          │  Browser    │
│  (embed SDK)        │ ──────▶  │  (Cloudflare Worker)  │ ──────▶  │  Push       │
│                     │ register │                       │  notify   │  Service    │
└─────────────────────┘  device  └───────────────────────┘           └─────────────┘
                                          ▲
                                          │ POST /api/notify
                                          │
┌─────────────────────┐                   │
│  DepEd Backend      │ ──────────────────┘
│  (payroll script)   │  send notification
└─────────────────────┘
```

**Endpoints:**
- Frontend: `https://pusher-efm.pages.dev`
- API: `https://pusher-api.sanigkram24.workers.dev/api`

---

## Step 1: Sign In & Get an API Key

1. Go to **https://pusher-efm.pages.dev**
2. Sign in with:
   - **Email:** `demo@example.com`
   - **Password:** `password`
3. In the dashboard, click **Create App**
4. Give it a name (e.g., "DepEd Payroll")
5. Copy the generated **API key** (starts with `pk_`)

---

## Step 2: Embed the SDK in the DepEd Frontend

Insert this snippet **once** in the DepEd site's HTML layout template (e.g., `layout.blade.php`, `index.html`, or after login):

```html
<script src="https://pusher-efm.pages.dev/sdk.js"></script>
<script>
  new PushSDK('pk_live_YOUR_API_KEY_HERE', {
    apiUrl: 'https://pusher-api.sanigkram24.workers.dev/api',
    vapidPublicKey: 'BG8L5j6shixeAHAxNgRYT6AD27vSKyNOAHY7jGBVyt54eq_GILX-YwoRHWGQYPwQsbmqyN76LkTNYwPfjo4CUw4'
  }).init()
</script>
```

**Replace `pk_live_YOUR_API_KEY_HERE`** with the API key from Step 1.

### What this does:
- When a user visits the site, the browser asks: **"Allow notifications?"**
- If they click **Allow**, their device is automatically registered
- No database changes needed on the DepEd side

### PHP / Laravel example (blade layout):

```blade
{{-- resources/views/layouts/app.blade.php --}}
@auth
  <script src="https://pusher-efm.pages.dev/sdk.js"></script>
  <script>
    new PushSDK('pk_live_YOUR_API_KEY_HERE', {
      apiUrl: 'https://pusher-api.sanigkram24.workers.dev/api',
      vapidPublicKey: 'BG8L5j6shixeAHAxNgRYT6AD27vSKyNOAHY7jGBVyt54eq_GILX-YwoRHWGQYPwQsbmqyN76LkTNYwPfjo4CUw4'
    }).init()
  </script>
@endauth
```

---

## Step 3: Send Payroll Notifications from the Backend

When payroll is finalized, send a `POST` request from the DepEd backend.

### cURL example:

```bash
curl -X POST https://pusher-api.sanigkram24.workers.dev/api/notify \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "pk_live_YOUR_API_KEY_HERE",
    "title": "Payroll Posted",
    "body": "Your salary for June has been credited. Check the DepEd portal."
  }'
```

### PHP / Laravel example:

```php
use Illuminate\Support\Facades\Http;

$response = Http::post('https://pusher-api.sanigkram24.workers.dev/api/notify', [
    'apiKey' => 'pk_live_YOUR_API_KEY_HERE',
    'title'  => 'Payroll Posted',
    'body'   => 'Your salary for June has been credited. Check the DepEd portal.',
]);

if ($response->successful()) {
    // Notification sent to all registered devices
    $data = $response->json();
    echo "Sent to {$data['sent']} devices";
}
```

### Node.js example:

```js
const res = await fetch('https://pusher-api.sanigkram24.workers.dev/api/notify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    apiKey: 'pk_live_YOUR_API_KEY_HERE',
    title: 'Payroll Posted',
    body: 'Your salary for June has been credited. Check the DepEd portal.',
  }),
})
const data = await res.json()
console.log(`Sent to ${data.sent} devices`)
```

### Python example:

```python
import requests

res = requests.post('https://pusher-api.sanigkram24.workers.dev/api/notify', json={
    'apiKey': 'pk_live_YOUR_API_KEY_HERE',
    'title': 'Payroll Posted',
    'body': 'Your salary for June has been credited. Check the DepEd portal.',
})
data = res.json()
print(f"Sent to {data['sent']} devices")
```

### Response format:

```json
{
  "notification": { "id": "uuid", "appId": "app-id", "title": "Payroll Posted", "body": "...", "status": "sent", "createdAt": "2025-06-29T..." },
  "sent": 42,
  "failed": 0,
  "totalDevices": 42
}
```

---

## Step 4: Test the Full Flow

1. Open **https://pusher-efm.pages.dev/test.html**
2. Enter your API key (pre-filled with the demo key)
3. Click **Register Device**
4. Follow the steps — allow notifications, service worker registers
5. Go to the dashboard at **https://pusher-efm.pages.dev**
6. Click **Send Notification** on your app
7. You should receive a push notification on your device

---

## FAQ

### Does the DepEd system need a database?
**No.** All device registrations are stored in Pusher's Cloudflare D1 database. No schema changes, migrations, or new tables on your end.

### What if a user blocks notifications?
The SDK silently skips them. No errors. They simply won't receive push notifications.

### Can I send to specific users?
Currently, notifications are broadcast to all devices registered under an API key. Per-user targeting can be added if needed.

### What about Android / iOS?
The SDK handles web push. For native mobile apps, use the same API with the device's push token (FCM for Android, APNs for iOS).

### Is it secure?
Yes. The API key is your secret — keep it server-side in production. The SDK only exposes the public VAPID key on the frontend.

---

## Summary

| What | Where | When |
|---|---|---|
| Add SDK snippet | DepEd frontend (once) | Next deploy |
| Send notification | DepEd backend | On payroll finalization |
| Manage API keys | https://pusher-efm.pages.dev | As needed |

**Total integration time:** ~30 minutes — 5 minutes to embed the SDK, 5 minutes to add the API call, 20 minutes to test.
