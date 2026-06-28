export async function sendPush(token: string, title: string, body: string, env: Record<string, any>) {
  const { VAPID_PRIVATE_KEY, VAPID_PUBLIC_KEY } = env

  if (!VAPID_PRIVATE_KEY || !VAPID_PUBLIC_KEY) {
    console.log(`[push] No VAPID keys, mock: "${title}: ${body}" to ${token.slice(0, 20)}...`)
    return { success: true, mock: true }
  }

  let sub: any
  try { sub = JSON.parse(token) } catch { return { success: true, mock: true } }
  if (!sub?.endpoint || !sub?.keys?.p256dh) {
    console.log(`[push] Not a Web Push subscription, skipping (mock device)`)
    return { success: true, mock: true }
  }

  try {
    const jwt = await buildVapidJWT(VAPID_PRIVATE_KEY, new URL(sub.endpoint).origin, 'mailto:admin@example.com')

    const res = await fetch(sub.endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Crypto-Key': `p256ecdsa=${VAPID_PUBLIC_KEY}`,
        TTL: '86400',
      },
    })

    const errorText = res.ok ? '' : await res.text().catch(() => '')
    console.log(`[push] Sent to ${sub.endpoint.slice(0, 50)}... — ${res.status} ${res.statusText} ${errorText.slice(0, 200)}`)
    return { success: res.ok, token, status: res.status, error: errorText.slice(0, 200) }
  } catch (err: any) {
    console.error(`[push] Error:`, err)
    return { success: false, error: err.message }
  }
}

// --- VAPID JWT helpers ---

async function buildVapidJWT(privateKeyB64: string, aud: string, sub: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'pkcs8', b64urlToBuf(privateKeyB64),
    { name: 'ECDSA', namedCurve: 'P-256' },
    false, ['sign']
  )

  const header = b64url(JSON.stringify({ alg: 'ES256', typ: 'JWT' }))
  const payload = b64url(JSON.stringify({
    aud, sub,
    exp: Math.floor(Date.now() / 1000) + 86400,
  }))

  const toSign = new TextEncoder().encode(`${header}.${payload}`)
  const sigBuf = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, toSign)
  const sig = new Uint8Array(sigBuf)

  // Web Crypto returns raw r||s (64 bytes), not DER
  const raw = new Uint8Array(64)
  if (sig.length === 64) {
    raw.set(sig)
  } else {
    throw new Error(`Unexpected signature length: ${sig.length}`)
  }

  return `${header}.${payload}.${b64url(raw)}`
}

function pad32(buf: Uint8Array): Uint8Array {
  const p = new Uint8Array(32)
  p.set(buf, 32 - buf.length)
  return p
}

function b64url(input: string | Uint8Array): string {
  if (input instanceof Uint8Array) {
    let binary = ''
    for (let i = 0; i < input.length; i++) binary += String.fromCharCode(input[i])
    return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  }
  return btoa(input).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function b64urlToBuf(b64: string): ArrayBuffer {
  const raw = atob(b64.replace(/-/g, '+').replace(/_/g, '/'))
  const buf = new ArrayBuffer(raw.length)
  const bytes = new Uint8Array(buf)
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i)
  return buf
}
