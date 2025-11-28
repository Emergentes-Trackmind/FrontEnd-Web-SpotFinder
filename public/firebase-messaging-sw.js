// Firebase Messaging Service Worker
// Gestiona las notificaciones FCM cuando la app está en background

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// IMPORTANTE: Reemplazar con tu configuración real de Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyAuG2UFUsYthFQSf7cHaHowXV7E_3j7TNM',
  authDomain: 'spotfinder-notification.firebaseapp.com',
  projectId: 'spotfinder-notification',
  storageBucket: 'spotfinder-notification.firebasestorage.app',
  messagingSenderId: '1020617092469',
  appId: '1:1020617092469:web:91d0bcf8b4a18f091bb73c'
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Obtener instancia de messaging
const messaging = firebase.messaging();

// Manejar mensajes en background
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Mensaje recibido en background:', payload);

  const notificationTitle = payload.notification?.title || payload.data?.title || 'Nueva notificación';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || '',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/badge-72x72.png',
    tag: payload.data?.id || 'notification',
    data: {
      url: payload.data?.actionUrl || '/',
      ...payload.data
    },
    requireInteraction: false,
    vibrate: [200, 100, 200]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Click en notificación:', event);

  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Si ya hay una ventana abierta, enfocarla y navegar
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus().then(() => {
              return client.navigate(urlToOpen);
            });
          }
        }
        // Si no hay ventana abierta, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
