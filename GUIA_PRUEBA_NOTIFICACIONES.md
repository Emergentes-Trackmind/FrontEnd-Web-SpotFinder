# 🔔 Guía de Prueba - Sistema de Notificaciones SpotFinder

## 📋 Resumen

El sistema de notificaciones de SpotFinder está **completamente implementado** y listo para pruebas. Esta guía te ayudará a probar el sistema paso a paso.

---

## ✅ Estado Actual

### Componentes Implementados
- ✅ **FCM Service** - Gestión de Firebase Cloud Messaging
- ✅ **Notifications Service** - Estado reactivo y sincronización
- ✅ **Notifications API Client** - Cliente HTTP para backend
- ✅ **Mock Service** - Servicio mock para pruebas sin backend
- ✅ **Toast System** - Sistema de toasts en tiempo real
- ✅ **Notification Components** - Componentes de UI
- ✅ **Service Worker** - Notificaciones en background

### Configuración
- ⚠️ **Firebase**: NO configurado (usa placeholders)
- ✅ **Backend Endpoint**: Configurado para Azure
- ✅ **Rutas**: `/notificaciones` y `/notificaciones/demo`
- ✅ **Modo Mock**: Disponible para testing

---

## 🎯 Modos de Prueba

### Modo 1: Testing Sin Backend (Mock) ⭐ RECOMENDADO PARA EMPEZAR

Este modo usa datos simulados y no requiere backend ni Firebase.

**Ventajas:**
- ✅ Funciona inmediatamente
- ✅ No requiere configuración
- ✅ Ideal para probar UI y flujos

**Cómo usar:**
1. Ejecutar `test-notifications.bat`
2. O manualmente: `ng serve --configuration=development`
3. Abrir http://localhost:4200/notificaciones/demo

### Modo 2: Testing Con Backend (Sin FCM)

Usa el backend de Azure pero sin notificaciones push.

**Ventajas:**
- ✅ Prueba integración real con backend
- ✅ No requiere Firebase
- ⚠️ No hay notificaciones push

**Requisitos:**
- Backend debe tener endpoint `/api/notifications`
- Usuario autenticado

**Cómo usar:**
1. `serve-azure.bat`
2. Login en la aplicación
3. Navegar a `/notificaciones`

### Modo 3: Testing Completo (Con FCM) 🔐

Sistema completo con notificaciones push.

**Ventajas:**
- ✅ Funcionalidad completa
- ✅ Notificaciones push reales
- ✅ Background notifications

**Requisitos:**
- Proyecto Firebase configurado
- Credenciales en environment
- Service worker registrado

---

## 🚀 Guía de Prueba Paso a Paso

### Paso 1: Verificar Sistema

```bash
test-notifications.bat
```

Esto verificará:
- ✅ Archivos del sistema
- ✅ Configuración de Firebase
- ✅ Endpoint del backend
- ✅ Rutas configuradas
- ✅ Componentes presentes

### Paso 2: Iniciar Servidor

```bash
ng serve --configuration=development
```

O usar el script:
```bash
start-dev.bat
```

### Paso 3: Probar Demo de Toasts

1. Abrir navegador: http://localhost:4200/notificaciones/demo
2. Verás botones para generar diferentes tipos de notificaciones:
   - Info (azul)
   - Success (verde)
   - Warning (amarillo)
   - Error (rojo)
   - System (gris)

**Pruebas a realizar:**
- [ ] Click en cada botón
- [ ] Verificar que aparecen toasts
- [ ] Verificar máximo 3 toasts visibles
- [ ] Verificar cola de toasts
- [ ] Verificar que desaparecen automáticamente
- [ ] Cerrar toast manualmente

### Paso 4: Probar Página de Notificaciones

1. Hacer login: http://localhost:4200/auth/login
2. Navegar a: http://localhost:4200/notificaciones

**Pruebas a realizar:**
- [ ] Ver lista de notificaciones
- [ ] Verificar contador de no leídas (badge)
- [ ] Marcar como leída (click en notificación)
- [ ] Marcar todas como leídas
- [ ] Eliminar notificación individual
- [ ] Eliminar todas las notificaciones
- [ ] Buscar notificaciones
- [ ] Filtrar por leídas/no leídas

### Paso 5: Probar en Navegador

**Abrir DevTools (F12) → Console**

Deberías ver:
```
⚠️ Firebase no está configurado. FCM no estará disponible.
ℹ️ Las notificaciones funcionarán solo a través del backend.
ℹ️ Para habilitar notificaciones push, configura Firebase en environment.ts
```

Esto es **normal** y esperado si no has configurado Firebase.

**Verificar Network Tab:**
- Filtrar por `/api/notifications`
- Debería haber peticiones GET al endpoint
- Status 200 OK (si backend funciona)
- Status 401/404 (si backend no tiene endpoint)

---

## 🧪 Pruebas de Funcionalidad

### 1. Sistema de Toasts

```typescript
// En el navegador console:
// (Requiere que estés en la app)

// Inyectar servicio
const notifService = ng.probe(document.querySelector('app-root'))
  .injector.get('NotificationsService');

// Crear notificación
const notif = {
  id: 'test-1',
  title: 'Prueba',
  body: 'Esta es una notificación de prueba',
  kind: 'success',
  createdAt: new Date().toISOString(),
  read: false
};

notifService.pushToast(notif);
```

### 2. Mock Service (Para Testing)

El `NotificationsMockService` viene con 5 notificaciones de ejemplo:

1. **Bienvenido** (success) - No leída
2. **Nueva reservación** (info) - No leída
3. **Parking ocupado** (warning) - Leída
4. **Dispositivo IoT** (error) - Leída
5. **Mantenimiento** (system) - Leída

**Generar notificación aleatoria:**
```typescript
const mockService = ng.probe(document.querySelector('app-root'))
  .injector.get('NotificationsMockService');

const randomNotif = mockService.generateRandomNotification();
```

### 3. Verificar Estado Reactivo

El sistema usa **Angular Signals** para estado reactivo:

```typescript
// Ver notificaciones actuales
console.log(notifService.notifications());

// Ver contador de no leídas
console.log(notifService.unreadCount());

// Ver toasts visibles
console.log(notifService.visibleToasts());
```

---

## 🔧 Configurar Firebase (Opcional)

### Para Habilitar Notificaciones Push Completas

1. **Crear Proyecto Firebase**
   - Ir a: https://console.firebase.google.com/
   - Click en "Agregar proyecto"
   - Nombre: "SpotFinder"
   - Habilitar Google Analytics (opcional)

2. **Agregar Aplicación Web**
   - En el proyecto, click en "Web" (</> icono)
   - Nombre: "SpotFinder Web"
   - NO marcar "Configurar Firebase Hosting"

3. **Obtener Configuración**
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "spotfinder-xxxxx.firebaseapp.com",
     projectId: "spotfinder-xxxxx",
     storageBucket: "spotfinder-xxxxx.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef",
     measurementId: "G-XXXXXXXXXX"
   };
   ```

4. **Habilitar Cloud Messaging**
   - En Firebase Console → Project Settings
   - Tab "Cloud Messaging"
   - En "Web Push certificates" → Generate key pair
   - Copiar el VAPID key

5. **Actualizar Environments**

   Editar todos los archivos environment:
   - `src/environments/environment.ts`
   - `src/environments/environment.production.ts`
   - `src/environments/environment.development.ts`
   - `src/environments/environment.simulation.ts`

   ```typescript
   firebase: {
     apiKey: 'TU_API_KEY_REAL',
     authDomain: 'TU_PROJECT_ID.firebaseapp.com',
     projectId: 'TU_PROJECT_ID',
     storageBucket: 'TU_PROJECT_ID.appspot.com',
     messagingSenderId: 'TU_SENDER_ID',
     appId: 'TU_APP_ID',
     vapidKey: 'TU_VAPID_KEY'
   }
   ```

6. **Actualizar Service Worker**

   Editar `public/firebase-messaging-sw.js`:
   ```javascript
   const firebaseConfig = {
     // Misma configuración que en environment
   };
   ```

7. **Probar Notificaciones Push**
   - Reiniciar servidor
   - Debería pedir permisos de notificaciones
   - Enviar notificación de prueba desde Firebase Console

---

## 📊 Endpoints del Backend

### Requeridos para Funcionamiento Completo

```
GET    /api/notifications              - Listar notificaciones
GET    /api/notifications/unread-count - Contador de no leídas
PATCH  /api/notifications/:id/read     - Marcar como leída
PATCH  /api/notifications/read-all     - Marcar todas como leídas
DELETE /api/notifications/:id          - Eliminar notificación
DELETE /api/notifications              - Eliminar todas
POST   /api/notifications/send         - Enviar notificación
POST   /api/notifications/register-fcm-token - Registrar token FCM
```

### Verificar en Swagger

```
https://spotfinderback-eaehduf4ehh7hjah.eastus2-01.azurewebsites.net/swagger-ui/index.html
```

Buscar el controlador `NotificationController` o similar.

---

## 🐛 Troubleshooting

### Error: "Firebase no está configurado"
✅ **Normal** si no has configurado Firebase  
✅ Las notificaciones del backend seguirán funcionando  
⚠️ Para FCM, sigue la sección "Configurar Firebase"

### Error: "Cannot read property 'push' of undefined"
❌ El servicio de notificaciones no está inicializado  
✅ Verifica que estás autenticado  
✅ Verifica que `app.component.ts` llama a `initializeNotifications()`

### Error: 404 en /api/notifications
❌ El backend no tiene el endpoint  
✅ Usa el modo mock para testing  
✅ Solicita al equipo backend implementar el endpoint

### Los toasts no aparecen
❌ Verifica que `ToastContainerComponent` esté en app.component.html  
❌ Verifica que no hay errores en console  
✅ Prueba en `/notificaciones/demo`

### Service Worker no se registra
❌ Verifica que `firebase-messaging-sw.js` esté en `/public`  
❌ Verifica que Firebase esté configurado  
✅ Solo funciona en HTTPS o localhost

---

## ✅ Checklist de Pruebas

### Funcionalidad Básica
- [ ] Sistema inicia sin errores
- [ ] Página /notificaciones carga
- [ ] Demo /notificaciones/demo funciona
- [ ] Toasts aparecen y desaparecen
- [ ] Máximo 3 toasts visibles simultáneamente

### Interacciones
- [ ] Click en notificación la marca como leída
- [ ] Botón "Marcar todas como leídas" funciona
- [ ] Botón "Eliminar" funciona
- [ ] Botón "Eliminar todas" funciona
- [ ] Badge muestra contador correcto

### Integración Backend (Si disponible)
- [ ] GET /api/notifications funciona
- [ ] Notificaciones se cargan al iniciar
- [ ] Marcar como leída actualiza backend
- [ ] Eliminar actualiza backend
- [ ] Contador se sincroniza

### FCM (Si configurado)
- [ ] Solicita permisos de notificaciones
- [ ] Token FCM se obtiene
- [ ] Token se registra en backend
- [ ] Mensajes en foreground se reciben
- [ ] Mensajes en background se reciben
- [ ] Click en notificación abre app

---

## 📝 Notas Adicionales

### Prioridad de Implementación

**Para Testing Inmediato:**
1. ✅ Modo mock (ya disponible)
2. ✅ Sistema de toasts (ya funciona)
3. ✅ UI de notificaciones (ya funciona)

**Para Integración:**
4. ⚠️ Verificar endpoints en backend
5. ⚠️ Ajustar DTOs si es necesario
6. ⚠️ Configurar CORS

**Para Producción:**
7. 🔐 Configurar Firebase
8. 🔐 Probar FCM completo
9. 🔐 Testing en dispositivos reales

---

## 🔗 Enlaces Útiles

- **Firebase Console:** https://console.firebase.google.com/
- **FCM Docs:** https://firebase.google.com/docs/cloud-messaging/js/client
- **Backend Swagger:** https://spotfinderback-eaehduf4ehh7hjah.eastus2-01.azurewebsites.net/swagger-ui/index.html
- **Análisis Completo:** ANALISIS_NOTIFICACIONES.md

---

**Última actualización:** 2025-11-27  
**Estado:** ✅ Listo para pruebas  
**Modo Recomendado:** Mock (sin backend) para empezar

