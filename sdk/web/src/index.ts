class PushSDK {
  private apiKey: string
  private apiUrl: string
  private vapidKey: string

  constructor(apiKey: string, options?: { apiUrl?: string; vapidPublicKey?: string }) {
    this.apiKey = apiKey
    this.apiUrl = options?.apiUrl || '/api'
    this.vapidKey = options?.vapidPublicKey || ''
  }

  async init() {
    if (!('Notification' in window)) {
      console.warn('[PushSDK] Push notifications not supported')
      return
    }

    if (Notification.permission === 'granted') {
      await this.subscribe()
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        await this.subscribe()
      }
    }
  }

  private async subscribe() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !this.vapidKey) {
      await this.registerFallback()
      return
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidKey),
      })
      const token = JSON.stringify(subscription.toJSON())
      await this.registerToken(token, 'web')
    } catch {
      await this.registerFallback()
    }
  }

  private async registerFallback() {
    await this.registerToken('web_token_' + crypto.randomUUID().slice(0, 12), 'web')
  }

  private async registerToken(token: string, platform: string) {
    await fetch(`${this.apiUrl}/devices/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: this.apiKey, token, platform }),
    })
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)))
  }
}

;(window as any).PushSDK = PushSDK
