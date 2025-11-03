# 🔧 Guía de Implementación Backend - Sistema de Notificaciones

Esta guía es para el equipo de backend que implementará los endpoints de notificaciones.

## 📋 Endpoints Requeridos

### 1. Listar Notificaciones
```
GET /api/notifications
```

**Query Parameters:**
- `q` (opcional): string - Búsqueda por título o contenido
- `read` (opcional): boolean - Filtrar por leídas/no leídas
- `page` (opcional): number - Número de página (default: 1)
- `size` (opcional): number - Elementos por página (default: 20)

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "string",
      "userId": "string",
      "title": "string",
      "body": "string",
      "kind": "info" | "success" | "warning" | "error" | "system",
      "createdAt": "ISO-8601 string",
      "read": boolean,
      "actionLabel": "string" (opcional),
      "actionUrl": "string" (opcional),
      "metadata": {} (opcional)
    }
  ],
  "total": number,
  "unreadCount": number,
  "page": number,
  "size": number
}
```

**Notas:**
- Filtrar notificaciones por `userId` del token JWT
- Ordenar por `createdAt` descendente
- Implementar búsqueda full-text en `title` y `body`

---

### 2. Obtener Contador de No Leídas
```
GET /api/notifications/unread-count
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Response (200):**
```json
{
  "count": number
}
```

**Notas:**
- Contar solo notificaciones con `read: false` del usuario actual

---

### 3. Marcar Notificación como Leída
```
PATCH /api/notifications/:id/read
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Response (200):**
```json
{
  "success": true
}
```

**Errores:**
- 404: Notificación no encontrada
- 403: La notificación no pertenece al usuario

**Notas:**
- Actualizar campo `read: true`
- Verificar que la notificación pertenezca al usuario del token

---

### 4. Marcar Todas como Leídas
```
PATCH /api/notifications/read-all
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Response (200):**
```json
{
  "success": true,
  "updated": number
}
```

**Notas:**
- Actualizar todas las notificaciones del usuario a `read: true`
- Retornar cantidad de notificaciones actualizadas

---

### 5. Eliminar Notificación
```
DELETE /api/notifications/:id
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Response (200):**
```json
{
  "success": true
}
```

**Errores:**
- 404: Notificación no encontrada
- 403: La notificación no pertenece al usuario

**Notas:**
- Eliminar permanentemente la notificación
- Verificar pertenencia al usuario

---

### 6. Eliminar Todas las Notificaciones
```
DELETE /api/notifications
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Response (200):**
```json
{
  "success": true,
  "deleted": number
}
```

**Notas:**
- Eliminar todas las notificaciones del usuario
- Retornar cantidad eliminada

---

### 7. Enviar Notificación (Dispara FCM + Email)
```
POST /api/notifications/send
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Body:**
```json
{
  "userId": "string",
  "title": "string",
  "body": "string",
  "kind": "info" | "success" | "warning" | "error" | "system",
  "sendEmail": boolean,
  "actionLabel": "string" (opcional),
  "actionUrl": "string" (opcional),
  "metadata": {} (opcional)
}
```

**Response (200):**
```json
{
  "success": true,
  "notificationId": "string"
}
```

**Lógica del Backend:**
1. Crear notificación en base de datos
2. **En paralelo:**
   - Obtener el token FCM del usuario de la tabla `fcm_tokens`
   - Enviar mensaje FCM usando Firebase Admin SDK
   - Si `sendEmail: true`, enviar email al usuario
3. Retornar éxito

**Estructura mensaje FCM:**
```json
{
  "notification": {
    "title": "título de la notificación",
    "body": "cuerpo de la notificación"
  },
  "data": {
    "id": "id de la notificación",
    "kind": "tipo",
    "actionLabel": "etiqueta acción",
    "actionUrl": "url acción",
    "createdAt": "ISO-8601",
    "metadata": "JSON.stringify(metadata)"
  },
  "token": "token_fcm_del_usuario"
}
```

**Notas:**
- Usar Firebase Admin SDK para enviar FCM
- Manejar errores si el token FCM es inválido
- El envío de email puede ser asíncrono (cola)

---

### 8. Registrar Token FCM
```
POST /api/notifications/register-fcm-token
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Body:**
```json
{
  "token": "string"
}
```

**Response (200):**
```json
{
  "success": true
}
```

**Notas:**
- Guardar/actualizar token FCM asociado al `userId` del JWT
- Un usuario puede tener múltiples tokens (diferentes dispositivos)
- Tabla sugerida: `fcm_tokens` (userId, token, deviceInfo, createdAt)
- Opcionalmente, eliminar tokens antiguos del mismo dispositivo

---

## 🗄️ Esquema de Base de Datos Sugerido

### Tabla: `notifications`
```sql
CREATE TABLE notifications (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  kind ENUM('info', 'success', 'warning', 'error', 'system') DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  action_label VARCHAR(100),
  action_url VARCHAR(500),
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_created (user_id, created_at),
  INDEX idx_user_read (user_id, read),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Tabla: `fcm_tokens`
```sql
CREATE TABLE fcm_tokens (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  token TEXT NOT NULL,
  device_info VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE INDEX idx_user_token (user_id, token(255)),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 🔥 Configurar Firebase Admin SDK (Backend)

### 1. Instalar Dependencia
```bash
# Node.js
npm install firebase-admin

# Python
pip install firebase-admin

# Java
# Ver: https://firebase.google.com/docs/admin/setup
```

### 2. Obtener Credenciales de Servicio
1. Firebase Console → Configuración del proyecto → Cuentas de servicio
2. Generar nueva clave privada → Descargar JSON

### 3. Inicializar en Backend (Ejemplo Node.js)
```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const messaging = admin.messaging();
```

### 4. Enviar Notificación FCM
```javascript
async function sendFCMNotification(notification, userToken) {
  const message = {
    notification: {
      title: notification.title,
      body: notification.body
    },
    data: {
      id: notification.id,
      kind: notification.kind,
      actionLabel: notification.actionLabel || '',
      actionUrl: notification.actionUrl || '',
      createdAt: notification.createdAt,
      metadata: JSON.stringify(notification.metadata || {})
    },
    token: userToken
  };

  try {
    const response = await messaging.send(message);
    console.log('Notificación FCM enviada:', response);
    return true;
  } catch (error) {
    console.error('Error enviando FCM:', error);
    // Si el token es inválido, eliminarlo de la BD
    if (error.code === 'messaging/invalid-registration-token' ||
        error.code === 'messaging/registration-token-not-registered') {
      await deleteFCMToken(userToken);
    }
    return false;
  }
}
```

---

## 📧 Envío de Emails (Paralelo)

Al enviar una notificación con `sendEmail: true`:

```javascript
async function sendNotificationEmail(user, notification) {
  // Usar tu servicio de email (SendGrid, Mailgun, etc.)
  const emailData = {
    to: user.email,
    subject: notification.title,
    html: `
      <h2>${notification.title}</h2>
      <p>${notification.body}</p>
      ${notification.actionUrl ? 
        `<a href="${process.env.FRONTEND_URL}${notification.actionUrl}">
          ${notification.actionLabel || 'Ver más'}
        </a>` : ''}
    `
  };
  
  // Enviar de forma asíncrona (puede ser una cola)
  await emailService.send(emailData);
}
```

---

## 🔐 Seguridad

### Validaciones Obligatorias
- ✅ Verificar JWT en todas las peticiones
- ✅ Filtrar notificaciones por `userId` del token
- ✅ No permitir acceso a notificaciones de otros usuarios
- ✅ Validar que `userId` en POST coincida con el del token (o ignorar y usar el del token)
- ✅ Sanitizar inputs (prevenir XSS)
- ✅ Rate limiting en endpoint de envío

### Ejemplo Middleware (Node.js/Express)
```javascript
const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.userId = user.id;
    next();
  });
};
```

---

## 🧪 Testing

### Endpoints a Probar
```bash
# 1. Registrar token FCM
curl -X POST http://localhost:3000/api/notifications/register-fcm-token \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"token": "test_fcm_token"}'

# 2. Enviar notificación
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "123",
    "title": "Test",
    "body": "Mensaje de prueba",
    "kind": "info",
    "sendEmail": true
  }'

# 3. Listar notificaciones
curl -X GET "http://localhost:3000/api/notifications?read=false" \
  -H "Authorization: Bearer $TOKEN"

# 4. Marcar como leída
curl -X PATCH http://localhost:3000/api/notifications/abc123/read \
  -H "Authorization: Bearer $TOKEN"

# 5. Eliminar
curl -X DELETE http://localhost:3000/api/notifications/abc123 \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Casos de Uso

### 1. Nueva Reserva Creada
```javascript
await sendNotification({
  userId: parking.ownerId,
  title: 'Nueva reserva confirmada',
  body: `Reserva #${reservation.id} para ${reservation.startDate}`,
  kind: 'success',
  sendEmail: true,
  actionLabel: 'Ver detalles',
  actionUrl: `/reservations/${reservation.id}`
});
```

### 2. Pago Procesado
```javascript
await sendNotification({
  userId: payment.userId,
  title: 'Pago procesado exitosamente',
  body: `Pago de ${payment.amount}€ confirmado`,
  kind: 'success',
  sendEmail: true,
  actionLabel: 'Ver recibo',
  actionUrl: `/billing/payments/${payment.id}`
});
```

### 3. Dispositivo IoT Desconectado
```javascript
await sendNotification({
  userId: device.ownerId,
  title: 'Dispositivo desconectado',
  body: `El sensor "${device.name}" está offline`,
  kind: 'warning',
  sendEmail: false,
  actionLabel: 'Ver dispositivos',
  actionUrl: '/iot/devices'
});
```

---

## 📝 Checklist de Implementación

- [ ] Crear tablas `notifications` y `fcm_tokens`
- [ ] Implementar 8 endpoints
- [ ] Configurar Firebase Admin SDK
- [ ] Implementar envío de FCM
- [ ] Implementar envío de emails
- [ ] Añadir validación JWT
- [ ] Añadir filtrado por usuario
- [ ] Implementar búsqueda full-text
- [ ] Añadir rate limiting
- [ ] Crear tests unitarios
- [ ] Crear tests de integración
- [ ] Documentar API (Swagger/OpenAPI)
- [ ] Configurar monitoreo/logs

---

## 🎯 Prioridades

### Fase 1 (MVP - Crítico)
1. Crear tabla `notifications`
2. Endpoints CRUD básicos (listar, marcar leída, eliminar)
3. Validación JWT

### Fase 2 (Importante)
4. Endpoint de envío de notificaciones
5. Tabla `fcm_tokens` y endpoint de registro
6. Integración FCM básica

### Fase 3 (Nice to have)
7. Envío de emails
8. Búsqueda avanzada
9. Paginación optimizada

---

**Contacto Frontend:**
Si tienes dudas sobre los contratos o necesitas cambios, contacta al equipo de frontend.

**Happy coding! 🚀**

