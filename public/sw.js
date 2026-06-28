self.addEventListener('push', function (event) {
  const data = event.data ? event.data.json() : { title: 'New notification', body: '' }

  const options = {
    body: data.body || '',
    icon: '/icon.png',
    badge: '/badge.png',
    vibrate: [200, 100, 200],
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Pusher', options)
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
