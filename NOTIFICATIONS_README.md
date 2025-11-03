# Sistema de Notificaciones con FCM

Sistema completo de notificaciones push con Firebase Cloud Messaging (FCM), toasts y panel de gestión.

## 📋 Características

- ✅ **Toasts en tiempo real** - Esquina superior derecha, máximo 3 visibles, auto-cierre a 10s
- ✅ **Panel de notificaciones** - Página completa con búsqueda, filtros y gestión
- ✅ **Firebase Cloud Messaging** - Notificaciones push en foreground y background
- ✅ **Service Worker** - Manejo de notificaciones cuando la app está cerrada
- ✅ **Badge de contador** - Indicador visual de notificaciones no leídas
- ✅ **Tipos de notificaciones** - info, success, warning, error, system
- ✅ **Responsive** - Funciona en desktop y móvil
- ✅ **Accesibilidad** - ARIA labels, navegación por teclado

## 🚀 Configuración Inicial

### 1. Instalar Dependencias

```bash
npm install firebase
```

### 2. Configurar Firebase

1. **Crear proyecto en Firebase Console**
   - Ve a [Firebase Console](https://console.firebase.google.com/)
   - Crea un nuevo proyecto o selecciona uno existente
   - Habilita Cloud Messaging

2. **Obtener credenciales**
   - En configuración del proyecto → General
   - En "Tus aplicaciones" → Web app
   - Copia las credenciales de configuración

3. **Generar clave VAPID**
   - Ve a Cloud Messaging
   - En la pestaña "Web Push certificates"
   - Genera o copia tu clave pública (VAPID key)

4. **Actualizar `environment.ts` y `environment.development.ts`**

```typescript
export const environment = {
  // ... resto de configuración
  firebase: {
    apiKey: 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    authDomain: 'tu-proyecto.firebaseapp.com',
    projectId: 'tu-proyecto',
    storageBucket: 'tu-proyecto.appspot.com',
    messagingSenderId: '123456789012',
    appId: '1:123456789012:web:abcdef1234567890',
    vapidKey: 'BNXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXx...'
  }
};
```

5. **Actualizar Service Worker**
   - Edita `public/firebase-messaging-sw.js`
   - Reemplaza las credenciales de Firebase con las tuyas

### 3. Registrar Service Worker

El Service Worker ya está configurado en `public/firebase-messaging-sw.js`. Angular lo servirá automáticamente desde la carpeta public.

Para verificar que funciona:
1. Abre DevTools → Application → Service Workers
2. Deberías ver `firebase-messaging-sw.js` registrado

## 📁 Estructura del Módulo

```
src/app/notifications/
├── models/
│   └── notification.models.ts          # Interfaces y tipos
├── services/
│   ├── notifications-api.client.ts     # Cliente HTTP (endpoints backend)
│   ├── notifications.service.ts        # Estado y lógica de negocio
│   └── fcm.service.ts                  # Gestión FCM
├── components/
│   ├── toast/
│   │   ├── toast.component.ts          # Toast individual
│   │   └── toast-container.component.ts # Contenedor de toasts
│   ├── notification-item/
│   │   └── notification-item.component.ts # Item en el panel
│   └── notifications-panel-header/
│       └── notifications-panel-header.component.ts # Cabecera del panel
├── pages/
│   └── notifications-page/
│       ├── notifications-page.component.ts
│       ├── notifications-page.component.html
│       └── notifications-page.component.scss
├── notifications.routes.ts
└── notifications.providers.ts
```

## 🔌 Endpoints del Backend (Hooks HTTP)

El frontend espera que el backend implemente estos endpoints:

### Listar notificaciones
```
GET /api/notifications
Query params: q, read, page, size
Response: { data: AppNotification[], total, unreadCount, page, size }
```

### Marcar como leída
```
PATCH /api/notifications/:id/read
Response: void
```

### Marcar todas como leídas
```
PATCH /api/notifications/read-all
Response: void
```

### Eliminar notificación
```
DELETE /api/notifications/:id
Response: void
```

### Eliminar todas
```
DELETE /api/notifications
Response: void
```

### Enviar notificación (dispara FCM + email)
```
POST /api/notifications/send
Body: SendNotificationRequest
Response: void
```

**Nota**: El backend es responsable de:
- Enviar el mensaje FCM al token del usuario
- Enviar el correo electrónico en paralelo
- Almacenar la notificación en la base de datos

### Registrar token FCM
```
POST /api/notifications/register-fcm-token
Body: { token: string }
Response: void
```

### Obtener contador de no leídas
```
GET /api/notifications/unread-count
Response: { count: number }
```

## 🧪 Probar el Sistema

### 1. Probar Toasts Localmente

Desde la consola del navegador:

```javascript
// Inyectar NotificationsService
const notifService = ng.probe(document.querySelector('app-root')).injector.get('NotificationsService');

// Mostrar toast de prueba
notifService.pushToast({
  id: 'test-1',
  title: 'Prueba de Toast',
  body: 'Este es un toast de prueba',
  kind: 'success',
  createdAt: new Date().toISOString(),
  read: false
});
```

### 2. Probar con Firebase CLI

Instala Firebase CLI:
```bash
npm install -g firebase-tools
```

Envía una notificación de prueba:
```bash
firebase login
firebase projects:list
firebase messaging:send --token="TU_TOKEN_FCM" --notification-title="Prueba" --notification-body="Mensaje de prueba"
```

### 3. Probar con Postman / cURL

Envía una notificación desde el backend:

```bash
curl -X POST http://localhost:3001/api/notifications/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -d '{
    "userId": "123",
    "title": "Nueva reserva",
    "body": "Tienes una nueva reserva para el parking Centro",
    "kind": "info",
    "sendEmail": true,
    "actionLabel": "Ver detalles",
    "actionUrl": "/reservations/456"
  }'
```

## 🎨 Tipos de Notificaciones

- **info** (azul) - Información general
- **success** (verde) - Operaciones exitosas
- **warning** (ámbar) - Advertencias
- **error** (rojo) - Errores
- **system** (morado) - Notificaciones del sistema

## 🔔 Flujo Completo

### Foreground (app abierta)
1. Backend envía mensaje FCM
2. `FcmService.onMessage()` captura el mensaje
3. `NotificationsService.onMessage()` agrega al estado
4. Se muestra un toast automáticamente
5. Se actualiza el badge de notificaciones
6. La notificación aparece en el panel

### Background (app cerrada/minimizada)
1. Backend envía mensaje FCM
2. Service Worker captura el mensaje
3. Se muestra notificación nativa del navegador
4. Al hacer clic, abre la app en `/notificaciones`
5. Al abrir la app, se cargan las notificaciones

## 🎯 Uso en la Aplicación

### Inicialización Automática
El sistema se inicializa automáticamente en `AppComponent`:
- Solicita permisos de notificaciones
- Obtiene y registra el token FCM
- Comienza a escuchar mensajes
- Carga notificaciones iniciales

### Acceder al Panel
- Ir a `/notificaciones`
- O hacer clic en el icono de campana en el sidebar

### Probar Toasts
- Ir a `/notificaciones/demo` para acceder al componente de demostración interactivo

### Badge de Notificaciones
El icono de notificaciones en el sidebar muestra un badge con el contador de notificaciones no leídas.

## 📱 Accesibilidad

- `aria-live="polite"` para anuncios de toasts
- `aria-label` en todos los botones
- Navegación por teclado
- Foco visible
- Contraste de colores WCAG AA

## 🐛 Troubleshooting

### No recibo notificaciones
1. Verifica que Firebase esté configurado correctamente
2. Revisa que el Service Worker esté registrado (DevTools → Application)
3. Comprueba que los permisos de notificaciones estén otorgados
4. Revisa la consola para errores de FCM

### El Service Worker no se registra
1. Asegúrate de que el archivo esté en `public/firebase-messaging-sw.js`
2. Verifica que la configuración de Firebase sea correcta
3. Debe servirse desde HTTPS (excepto localhost)

### Las notificaciones no aparecen en el panel
1. Verifica que el backend devuelva datos en el formato correcto
2. Revisa la consola del navegador para errores HTTP
3. Comprueba que el token JWT sea válido

## 📚 Recursos

- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Angular Signals](https://angular.dev/guide/signals)
- [Material Design Notifications](https://material.io/components/snackbars)
- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)

## 🔐 Seguridad

- Los tokens FCM se vinculan al usuario autenticado
- Cada usuario solo ve sus propias notificaciones
- El backend filtra notificaciones por usuario
- Los tokens se eliminan al cerrar sesión (implementar en backend)

## 🚧 TODO / Mejoras Futuras

- [ ] Implementar paginación infinita en el panel
- [ ] Agregar filtros por tipo de notificación
- [ ] Permitir configurar preferencias de notificaciones
- [ ] Implementar notificaciones agrupadas
- [ ] Agregar sonidos personalizados
- [ ] Modo "No molestar"
- [ ] Exportar historial de notificaciones

---

**Desarrollado con ❤️ para SpotFinder**
# Sistema de Notificaciones con FCM

Sistema completo de notificaciones push con Firebase Cloud Messaging (FCM), toasts y panel de gestión.

## 📋 Características

- ✅ **Toasts en tiempo real** - Esquina superior derecha, máximo 3 visibles, auto-cierre a 10s
- ✅ **Panel de notificaciones** - Página completa con búsqueda, filtros y gestión
- ✅ **Firebase Cloud Messaging** - Notificaciones push en foreground y background
- ✅ **Service Worker** - Manejo de notificaciones cuando la app está cerrada
- ✅ **Badge de contador** - Indicador visual de notificaciones no leídas
- ✅ **Tipos de notificaciones** - info, success, warning, error, system
- ✅ **Responsive** - Funciona en desktop y móvil
- ✅ **Accesibilidad** - ARIA labels, navegación por teclado

## 🚀 Configuración Inicial

### 1. Instalar Dependencias

```bash
npm install firebase
```

### 2. Configurar Firebase

1. **Crear proyecto en Firebase Console**
   - Ve a [Firebase Console](https://console.firebase.google.com/)
   - Crea un nuevo proyecto o selecciona uno existente
   - Habilita Cloud Messaging

2. **Obtener credenciales**
   - En configuración del proyecto → General
   - En "Tus aplicaciones" → Web app
   - Copia las credenciales de configuración

3. **Generar clave VAPID**
   - Ve a Cloud Messaging
   - En la pestaña "Web Push certificates"
   - Genera o copia tu clave pública (VAPID key)

4. **Actualizar `environment.ts` y `environment.development.ts`**

```typescript
export const environment = {
  // ... resto de configuración
  firebase: {
    apiKey: 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    authDomain: 'tu-proyecto.firebaseapp.com',
    projectId: 'tu-proyecto',
    storageBucket: 'tu-proyecto.appspot.com',
    messagingSenderId: '123456789012',
    appId: '1:123456789012:web:abcdef1234567890',
    vapidKey: 'BNXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXx...'
  }
};
```

5. **Actualizar Service Worker**
   - Edita `public/firebase-messaging-sw.js`
   - Reemplaza las credenciales de Firebase con las tuyas

### 3. Registrar Service Worker

El Service Worker ya está configurado en `public/firebase-messaging-sw.js`. Angular lo servirá automáticamente desde la carpeta public.

Para verificar que funciona:
1. Abre DevTools → Application → Service Workers
2. Deberías ver `firebase-messaging-sw.js` registrado

## 📁 Estructura del Módulo

```
src/app/notifications/
├── models/
│   └── notification.models.ts          # Interfaces y tipos
├── services/
│   ├── notifications-api.client.ts     # Cliente HTTP (endpoints backend)
│   ├── notifications.service.ts        # Estado y lógica de negocio
│   └── fcm.service.ts                  # Gestión FCM
├── components/
│   ├── toast/
│   │   ├── toast.component.ts          # Toast individual
│   │   └── toast-container.component.ts # Contenedor de toasts
│   ├── notification-item/
│   │   └── notification-item.component.ts # Item en el panel
│   └── notifications-panel-header/
│       └── notifications-panel-header.component.ts # Cabecera del panel
├── pages/
│   └── notifications-page/
│       ├── notifications-page.component.ts
│       ├── notifications-page.component.html
│       └── notifications-page.component.scss
├── notifications.routes.ts
└── notifications.providers.ts
```

## 🔌 Endpoints del Backend (Hooks HTTP)

El frontend espera que el backend implemente estos endpoints:

### Listar notificaciones
```
GET /api/notifications
Query params: q, read, page, size
Response: { data: AppNotification[], total, unreadCount, page, size }
```

### Marcar como leída
```
PATCH /api/notifications/:id/read
Response: void
```

### Marcar todas como leídas
```
PATCH /api/notifications/read-all
Response: void
```

### Eliminar notificación
```
DELETE /api/notifications/:id
Response: void
```

### Eliminar todas
```
DELETE /api/notifications
Response: void
```

### Enviar notificación (dispara FCM + email)
```
POST /api/notifications/send
Body: SendNotificationRequest
Response: void
```

**Nota**: El backend es responsable de:
- Enviar el mensaje FCM al token del usuario
- Enviar el correo electrónico en paralelo
- Almacenar la notificación en la base de datos

### Registrar token FCM
```
POST /api/notifications/register-fcm-token
Body: { token: string }
Response: void
```

### Obtener contador de no leídas
```
GET /api/notifications/unread-count
Response: { count: number }
```

## 🧪 Probar el Sistema

### 1. Usar el Componente de Demo (Recomendado)

La forma más fácil de probar los toasts es usar el componente de demostración integrado:

1. Inicia el servidor de desarrollo: `npm run dev`
2. Inicia sesión en la aplicación
3. Ve a `/notificaciones/demo`
4. Haz clic en los botones para probar diferentes tipos de toasts

El componente de demo permite:
- Probar los 5 tipos de notificaciones (info, success, warning, error, system)
- Ver el comportamiento de la cola (máximo 3 visibles)
- Probar la funcionalidad de pausa al hacer hover
- No requiere configuración de Firebase

### 2. Probar Toasts desde la Consola

Desde la consola del navegador:

```javascript
// Inyectar NotificationsService
const notifService = ng.probe(document.querySelector('app-root')).injector.get('NotificationsService');

// Mostrar toast de prueba
notifService.pushToast({
  id: 'test-1',
  title: 'Prueba de Toast',
  body: 'Este es un toast de prueba',
  kind: 'success',
  createdAt: new Date().toISOString(),
  read: false
});
```

### 2. Probar con Firebase CLI

Instala Firebase CLI:
```bash
npm install -g firebase-tools
```

Envía una notificación de prueba:
```bash
firebase login
firebase projects:list
firebase messaging:send --token="TU_TOKEN_FCM" --notification-title="Prueba" --notification-body="Mensaje de prueba"
```

### 3. Probar con Postman / cURL

Envía una notificación desde el backend:

```bash
curl -X POST http://localhost:3001/api/notifications/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -d '{
    "userId": "123",
    "title": "Nueva reserva",
    "body": "Tienes una nueva reserva para el parking Centro",
    "kind": "info",
    "sendEmail": true,
    "actionLabel": "Ver detalles",
    "actionUrl": "/reservations/456"
  }'
```

## 🎨 Tipos de Notificaciones

- **info** (azul) - Información general
- **success** (verde) - Operaciones exitosas
- **warning** (ámbar) - Advertencias
- **error** (rojo) - Errores
- **system** (morado) - Notificaciones del sistema

## 🔔 Flujo Completo

### Foreground (app abierta)
1. Backend envía mensaje FCM
2. `FcmService.onMessage()` captura el mensaje
3. `NotificationsService.onMessage()` agrega al estado
4. Se muestra un toast automáticamente
5. Se actualiza el badge de notificaciones
6. La notificación aparece en el panel

### Background (app cerrada/minimizada)
1. Backend envía mensaje FCM
2. Service Worker captura el mensaje
3. Se muestra notificación nativa del navegador
4. Al hacer clic, abre la app en `/notificaciones`
5. Al abrir la app, se cargan las notificaciones

## 🎯 Uso en la Aplicación

### Inicialización Automática
El sistema se inicializa automáticamente en `AppComponent`:
- Solicita permisos de notificaciones
- Obtiene y registra el token FCM
- Comienza a escuchar mensajes
- Carga notificaciones iniciales

### Acceder al Panel
- Ir a `/notificaciones`
- O hacer clic en el icono de campana en el sidebar

### Badge de Notificaciones
El icono de notificaciones en el sidebar muestra un badge con el contador de notificaciones no leídas.

## 📱 Accesibilidad

- `aria-live="polite"` para anuncios de toasts
- `aria-label` en todos los botones
- Navegación por teclado
- Foco visible
- Contraste de colores WCAG AA

## 🐛 Troubleshooting

### No recibo notificaciones
1. Verifica que Firebase esté configurado correctamente
2. Revisa que el Service Worker esté registrado (DevTools → Application)
3. Comprueba que los permisos de notificaciones estén otorgados
4. Revisa la consola para errores de FCM

### El Service Worker no se registra
1. Asegúrate de que el archivo esté en `public/firebase-messaging-sw.js`
2. Verifica que la configuración de Firebase sea correcta
3. Debe servirse desde HTTPS (excepto localhost)

### Las notificaciones no aparecen en el panel
1. Verifica que el backend devuelva datos en el formato correcto
2. Revisa la consola del navegador para errores HTTP
3. Comprueba que el token JWT sea válido

## 📚 Recursos

- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Angular Signals](https://angular.dev/guide/signals)
- [Material Design Notifications](https://material.io/components/snackbars)
- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)

## 🔐 Seguridad

- Los tokens FCM se vinculan al usuario autenticado
- Cada usuario solo ve sus propias notificaciones
- El backend filtra notificaciones por usuario
- Los tokens se eliminan al cerrar sesión (implementar en backend)

## 🚧 TODO / Mejoras Futuras

- [ ] Implementar paginación infinita en el panel
- [ ] Agregar filtros por tipo de notificación
- [ ] Permitir configurar preferencias de notificaciones
- [ ] Implementar notificaciones agrupadas
- [ ] Agregar sonidos personalizados
- [ ] Modo "No molestar"
- [ ] Exportar historial de notificaciones

---

**Desarrollado con ❤️ para SpotFinder**

