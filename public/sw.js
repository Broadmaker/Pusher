self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request))
})

self.addEventListener('push', function (event) {
  event.waitUntil(
    fetch('https://pusher-api.sanigkram24.workers.dev/api/notify/latest')
      .then(r => r.json())
      .then(data => {
        const n = data.notification
        self.registration.showNotification(n?.title || 'Pusher', {
          body: n?.body || '',
          icon: '/logo-192.png',
          badge: '/logo-192.png',
          vibrate: [200, 100, 200],
          data: { url: '/' },
        })
      })
      .catch(() => {
        self.registration.showNotification('Pusher', {
          body: 'Tap to open',
          icon: '/logo-192.png',
          badge: '/logo-192.png',
          vibrate: [200, 100, 200],
        })
      })
  )
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) return client.focus()
      }
      if (clients.openWindow) clients.openWindow('/')
    })
  )
})
