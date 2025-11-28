# 🔥 RESUMEN RÁPIDO: Configurar Firebase Push Notifications

## ⏱️ Tiempo Total: ~60 minutos

---

## 📋 CHECKLIST RÁPIDO

### PARTE 1: Firebase Console (10 min) 🔥

```
□ Crear proyecto en Firebase Console
□ Agregar aplicación Web
□ Copiar configuración (apiKey, authDomain, projectId, etc.)
□ Habilitar Cloud Messaging
□ Generar Web Push Certificate (vapidKey)
□ Copiar Server Key (para backend)
□ Descargar archivo firebase-service-account.json
```

**URLs importantes:**
- Console: https://console.firebase.google.com/
- Documentación: https://firebase.google.com/docs/cloud-messaging

---

### PARTE 2: Frontend (15 min) 💻

#### Archivos a Editar:

**1. Environments (4 archivos):**
```typescript
// src/environments/environment.ts
// src/environments/environment.production.ts
// src/environments/environment.development.ts
// src/environments/environment.simulation.ts

firebase: {
  apiKey: 'AIzaSy...',           // ← Copiar de Firebase Console
  authDomain: 'proyecto.firebaseapp.com',
  projectId: 'proyecto-id',
  storageBucket: 'proyecto.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123:web:abc...',
  vapidKey: 'BH7k8...'           // ← Web Push Certificate
}
```

**2. Service Worker:**
```javascript
// public/firebase-messaging-sw.js

const firebaseConfig = {
  // ← Misma configuración que en environments
};
```

**3. Instalar Firebase:**
```bash
npm install firebase@10.7.1
```

---

### PARTE 3: Backend (20 min) ☕

#### Archivos a Crear/Editar:

**1. pom.xml**
```xml
<dependency>
    <groupId>com.google.firebase</groupId>
    <artifactId>firebase-admin</artifactId>
    <version>9.2.0</version>
</dependency>
```

**2. firebase-service-account.json**
```
backend/src/main/resources/firebase-service-account.json
← Descargar de Firebase Console → Cuentas de servicio
```

**3. FirebaseConfig.java**
```java
// Inicializa Firebase Admin SDK
```

**4. FcmService.java**
```java
// Servicio para enviar notificaciones
// Métodos: sendNotification, sendMulticast, etc.
```

**5. FcmToken.java (Entity)**
```java
// Modelo para guardar tokens FCM
```

**6. FcmTokenRepository.java**
```java
// Repositorio JPA
```

**7. NotificationsController.java**
```java
// Agregar endpoints:
// POST /api/notifications/register-fcm-token
// POST /api/notifications/send
// DELETE /api/notifications/fcm-token/{token}
```

**8. SQL Migration**
```sql
CREATE TABLE fcm_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    device_info VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

### PARTE 4: Testing (15 min) 🧪

```bash
# 1. Reiniciar frontend
ng serve --configuration=development

# 2. Reiniciar backend
mvn spring-boot:run

# 3. Abrir navegador
http://localhost:4200

# 4. Verificar en Console (F12):
✅ Firebase inicializado correctamente
✅ Token FCM obtenido: eG7x...
✅ Token FCM registrado en backend

# 5. Aceptar permisos de notificaciones

# 6. Enviar notificación de prueba:
curl -X POST http://localhost:8080/api/notifications/send \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "title": "Test",
    "body": "Notificación de prueba",
    "actionUrl": "/dashboard"
  }'

# 7. Verificar:
✅ Notificación aparece (foreground)
✅ Notificación del SO (background)
✅ Click abre la app
```

---

## 🎯 FLUJO COMPLETO

### Frontend → Backend → Firebase → Usuario

```
1. Usuario abre la app
   ↓
2. App solicita permisos de notificaciones
   ↓
3. Usuario acepta
   ↓
4. FCM Service obtiene token
   ↓
5. Token se envía al backend (/register-fcm-token)
   ↓
6. Backend guarda token en BD
   ↓
7. Cuando hay evento, backend envía notificación
   ↓
8. Backend llama Firebase Admin SDK
   ↓
9. Firebase envía push al dispositivo
   ↓
10. Usuario ve notificación
```

---

## 🔑 DATOS CLAVE DE FIREBASE

### Para Frontend (7 valores):
```
apiKey: "AIzaSy..."
authDomain: "proyecto.firebaseapp.com"
projectId: "proyecto-id"
storageBucket: "proyecto.appspot.com"
messagingSenderId: "123456789"
appId: "1:123:web:abc..."
vapidKey: "BH7k8..."  ← Web Push Certificate
```

### Para Backend (1 archivo):
```
firebase-service-account.json  ← Archivo JSON completo
```

---

## 📂 ESTRUCTURA DE ARCHIVOS

### Frontend:
```
src/
├── environments/
│   ├── environment.ts                    ← Actualizar
│   ├── environment.production.ts         ← Actualizar
│   ├── environment.development.ts        ← Actualizar
│   └── environment.simulation.ts         ← Actualizar
└── app/notifications/services/
    ├── fcm.service.ts                    ✅ Ya existe
    ├── notifications.service.ts          ✅ Ya existe
    └── notifications-api.client.ts       ✅ Ya existe

public/
└── firebase-messaging-sw.js              ← Actualizar
```

### Backend:
```
src/main/
├── resources/
│   ├── firebase-service-account.json     ← CREAR (no commitear)
│   └── db/migration/
│       └── V1__create_fcm_tokens.sql     ← CREAR
└── java/com/spotfinder/
    ├── config/
    │   └── FirebaseConfig.java           ← CREAR
    ├── service/
    │   └── FcmService.java               ← CREAR
    ├── model/
    │   └── FcmToken.java                 ← CREAR
    ├── repository/
    │   └── FcmTokenRepository.java       ← CREAR
    └── controller/
        └── NotificationsController.java  ← ACTUALIZAR
```

---

## ⚠️ IMPORTANTE - NO OLVIDAR

### Seguridad:
```bash
# .gitignore
firebase-service-account.json
```

### CORS en Backend:
```java
config.addAllowedOrigin("http://localhost:4200");
config.addAllowedOrigin("https://tu-dominio-produccion.com");
```

### Permisos de Notificaciones:
- Solo funcionan en `https://` o `localhost`
- Usuario debe aceptar permisos
- Se pueden revocar en ajustes del navegador

---

## 🐛 PROBLEMAS COMUNES

| Problema | Solución |
|----------|----------|
| "Firebase not initialized" | Verificar configuración en environments |
| "Permission denied" | Usuario debe aceptar permisos |
| "Token inválido" | Verificar Server Key en backend |
| No aparecen en background | Verificar Service Worker registrado |
| CORS errors | Configurar CORS en backend |

---

## 📚 DOCUMENTACIÓN

**Guía completa:**
```
GUIA_FIREBASE_PUSH_NOTIFICATIONS.md  ← Leer para detalles
```

**Script de verificación:**
```bash
verify-firebase-config.bat  ← Ejecutar para verificar
```

---

## 🚀 COMANDOS RÁPIDOS

```bash
# Verificar configuración
verify-firebase-config.bat

# Instalar Firebase
npm install firebase@10.7.1

# Iniciar frontend
ng serve --configuration=development

# Iniciar backend
mvn spring-boot:run

# Probar notificación
curl -X POST http://localhost:8080/api/notifications/send \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"title":"Test","body":"Prueba"}'
```

---

## ✅ VERIFICACIÓN FINAL

### Frontend:
- [ ] 4 archivos environment actualizados
- [ ] Service worker actualizado
- [ ] Firebase instalado (`npm install`)
- [ ] Servidor reiniciado
- [ ] Permisos aceptados en navegador
- [ ] Token FCM obtenido

### Backend:
- [ ] Dependencia firebase-admin agregada
- [ ] firebase-service-account.json descargado
- [ ] 5 archivos Java creados/actualizados
- [ ] Tabla fcm_tokens creada
- [ ] Servidor reiniciado
- [ ] Endpoint /register-fcm-token funciona

### Testing:
- [ ] Notificación en foreground ✅
- [ ] Notificación en background ✅
- [ ] Click abre la app ✅
- [ ] Badge se actualiza ✅

---

## 🎉 ¡LISTO!

Si todos los checkboxes están marcados:
- ✅ **Push notifications funcionando**
- ✅ **Background notifications funcionando**
- ✅ **Sistema completo operativo**

**Tiempo invertido:** ~60 minutos  
**Resultado:** Sistema de notificaciones push en producción

---

## 🔗 ENLACES ÚTILES

- **Firebase Console:** https://console.firebase.google.com/
- **Guía completa:** GUIA_FIREBASE_PUSH_NOTIFICATIONS.md
- **Script verificación:** verify-firebase-config.bat
- **Docs Firebase:** https://firebase.google.com/docs/cloud-messaging

---

**Fecha:** 2025-11-27  
**Versión:** 1.0  
**Estado:** Listo para implementar

