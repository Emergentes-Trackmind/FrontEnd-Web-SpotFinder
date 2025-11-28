# 🔥 Guía Completa: Configurar Firebase para Notificaciones Push

## 📋 Resumen

Esta guía te llevará paso a paso para configurar Firebase Cloud Messaging (FCM) en SpotFinder para habilitar:
- ✅ Notificaciones push en tiempo real
- ✅ Notificaciones cuando la app está en background
- ✅ Notificaciones cuando la app está cerrada
- ✅ Click handlers para navegar al hacer click

---

## 🎯 Tiempo Estimado

- **Creación de proyecto Firebase:** 10 minutos
- **Configuración Frontend:** 15 minutos
- **Configuración Backend:** 20 minutos
- **Testing:** 15 minutos
- **TOTAL:** ~60 minutos

---

## 📦 Prerrequisitos

- ✅ Cuenta de Google
- ✅ Proyecto SpotFinder Frontend funcionando
- ✅ Backend de SpotFinder con acceso
- ✅ Node.js y npm instalados
- ✅ Navegador moderno (Chrome, Firefox, Edge)

---

# PARTE 1: CONFIGURACIÓN DE FIREBASE (10 minutos)

## Paso 1.1: Crear Proyecto Firebase

1. **Ir a Firebase Console:**
   ```
   https://console.firebase.google.com/
   ```

2. **Crear Nuevo Proyecto:**
   - Click en "Agregar proyecto" o "Add project"
   - Nombre del proyecto: `spotfinder` (o el nombre que prefieras)
   - Click en "Continuar"

3. **Google Analytics (Opcional):**
   - Puedes habilitarlo o deshabilitarlo
   - Para desarrollo, puedes deshabilitarlo
   - Click en "Crear proyecto"
   - Espera ~30 segundos mientras se crea

4. **Click en "Continuar"** cuando esté listo

---

## Paso 1.2: Agregar Aplicación Web

1. **En la página principal del proyecto:**
   - Click en el ícono **</>** (Web)
   - O ir a: Configuración del proyecto → Tus apps → Agregar app → Web

2. **Registrar App:**
   - Alias de la app: `SpotFinder Web`
   - ⚠️ **NO** marcar "Configurar Firebase Hosting" (no lo necesitamos)
   - Click en "Registrar app"

3. **Copiar la Configuración:**
   Verás algo como esto:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q",
     authDomain: "spotfinder-12345.firebaseapp.com",
     projectId: "spotfinder-12345",
     storageBucket: "spotfinder-12345.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:a1b2c3d4e5f6g7h8i9j0k1",
     measurementId: "G-ABCD123456"
   };
   ```
   
   **⚠️ IMPORTANTE: Copia y guarda esta configuración**

4. **Click en "Continuar a la consola"**

---

## Paso 1.3: Habilitar Cloud Messaging

1. **Ir a Configuración del Proyecto:**
   - Click en el ícono de engranaje ⚙️ → "Configuración del proyecto"
   - O ir directamente a: Project Settings

2. **Ir a la pestaña "Cloud Messaging":**
   - Click en la pestaña "Cloud Messaging"
   - Scroll hasta "Web Push certificates"

3. **Generar Certificado Web Push:**
   - En la sección "Web Push certificates"
   - Click en "Generar par de claves" o "Generate key pair"
   - Se generará una clave VAPID
   - **⚠️ IMPORTANTE: Copia esta clave VAPID** (ejemplo: `BH7k8...`)

4. **Guardar ambas claves:**
   ```
   apiKey: "AIzaSy..."
   authDomain: "spotfinder-12345.firebaseapp.com"
   projectId: "spotfinder-12345"
   storageBucket: "spotfinder-12345.appspot.com"
   messagingSenderId: "123456789012"
   appId: "1:123456789012:web:..."
   vapidKey: "BH7k8..." ← LA CLAVE WEB PUSH
   ```

---

## Paso 1.4: Obtener Server Key (Para Backend)

1. **En la misma página "Cloud Messaging":**
   - Scroll arriba
   - Busca "Cloud Messaging API (Legacy)"
   - Si dice "Disabled", click en "..." → "Manage API in Google Cloud Console"
   - Habilita "Cloud Messaging API"

2. **Copiar Server Key:**
   - Vuelve a Firebase Console → Cloud Messaging
   - Copia el "Server key" (comienza con `AAAA...`)
   - **⚠️ Esta clave es para el BACKEND**

3. **Guardar Server Key:**
   ```
   Server Key: "AAAAa1b2c3d4:..."
   ```

---

# PARTE 2: CONFIGURACIÓN DEL FRONTEND (15 minutos)

## Paso 2.1: Actualizar Archivos Environment

### 📝 Archivo 1: `src/environments/environment.production.ts`

```typescript
import { Environment } from './environment.interface';

export const environment: Environment = {
  production: true,
  apiBase: 'https://spotfinderback-eaehduf4ehh7hjah.eastus2-01.azurewebsites.net/api',
  
  // ...resto de la configuración existente...
  
  // ⬇️ REEMPLAZAR ESTA SECCIÓN ⬇️
  firebase: {
    apiKey: 'AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q',           // ← TU API KEY
    authDomain: 'spotfinder-12345.firebaseapp.com',              // ← TU AUTH DOMAIN
    projectId: 'spotfinder-12345',                               // ← TU PROJECT ID
    storageBucket: 'spotfinder-12345.appspot.com',              // ← TU STORAGE BUCKET
    messagingSenderId: '123456789012',                           // ← TU SENDER ID
    appId: '1:123456789012:web:a1b2c3d4e5f6g7h8i9j0k1',        // ← TU APP ID
    vapidKey: 'BH7k8...'                                        // ← TU VAPID KEY (Web Push Certificate)
  },
  
  // ...resto de la configuración...
};
```

### 📝 Archivo 2: `src/environments/environment.ts`

**⚠️ Copiar la misma configuración de Firebase**

```typescript
// ...existing code...

firebase: {
  apiKey: 'AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q',
  authDomain: 'spotfinder-12345.firebaseapp.com',
  projectId: 'spotfinder-12345',
  storageBucket: 'spotfinder-12345.appspot.com',
  messagingSenderId: '123456789012',
  appId: '1:123456789012:web:a1b2c3d4e5f6g7h8i9j0k1',
  vapidKey: 'BH7k8...'
},

// ...existing code...
```

### 📝 Archivo 3: `src/environments/environment.development.ts`

**⚠️ Copiar la misma configuración de Firebase**

```typescript
// ...existing code...

firebase: {
  apiKey: 'AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q',
  authDomain: 'spotfinder-12345.firebaseapp.com',
  projectId: 'spotfinder-12345',
  storageBucket: 'spotfinder-12345.appspot.com',
  messagingSenderId: '123456789012',
  appId: '1:123456789012:web:a1b2c3d4e5f6g7h8i9j0k1',
  vapidKey: 'BH7k8...'
},

// ...existing code...
```

---

## Paso 2.2: Actualizar Service Worker

### 📝 Archivo: `public/firebase-messaging-sw.js`

```javascript
// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// ⬇️ REEMPLAZAR CON TU CONFIGURACIÓN ⬇️
const firebaseConfig = {
  apiKey: 'AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q',
  authDomain: 'spotfinder-12345.firebaseapp.com',
  projectId: 'spotfinder-12345',
  storageBucket: 'spotfinder-12345.appspot.com',
  messagingSenderId: '123456789012',
  appId: '1:123456789012:web:a1b2c3d4e5f6g7h8i9j0k1'
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
```

---

## Paso 2.3: Verificar package.json

Asegúrate de tener Firebase instalado:

```bash
npm install firebase@10.7.1
```

O verificar en `package.json`:
```json
{
  "dependencies": {
    "firebase": "^10.7.1"
  }
}
```

---

## Paso 2.4: Registrar Service Worker en index.html (Opcional)

Si aún no está registrado, agregar en `src/index.html`:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <!-- ...existing code... -->
</head>
<body>
  <app-root></app-root>
  
  <!-- Registrar Service Worker -->
  <script>
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service Worker registrado:', registration);
        })
        .catch((err) => {
          console.error('Error al registrar Service Worker:', err);
        });
    }
  </script>
</body>
</html>
```

---

# PARTE 3: CONFIGURACIÓN DEL BACKEND (20 minutos)

## Paso 3.1: Agregar Dependencias (Spring Boot + Java)

### 📝 Archivo: `pom.xml`

Agregar la dependencia de Firebase Admin SDK:

```xml
<dependencies>
    <!-- ...dependencias existentes... -->
    
    <!-- Firebase Admin SDK -->
    <dependency>
        <groupId>com.google.firebase</groupId>
        <artifactId>firebase-admin</artifactId>
        <version>9.2.0</version>
    </dependency>
</dependencies>
```

Luego ejecutar:
```bash
mvn clean install
```

---

## Paso 3.2: Crear Archivo de Credenciales de Firebase

1. **Ir a Firebase Console:**
   - Configuración del proyecto (⚙️)
   - Pestaña "Cuentas de servicio"
   - Click en "Generar nueva clave privada"
   - Se descargará un archivo JSON

2. **Guardar archivo en el proyecto:**
   ```
   backend/src/main/resources/firebase-service-account.json
   ```

3. **⚠️ IMPORTANTE: Agregar a .gitignore**
   ```
   firebase-service-account.json
   ```

---

## Paso 3.3: Crear Configuración de Firebase

### 📝 Archivo: `config/FirebaseConfig.java`

```java
package com.spotfinder.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void initialize() {
        try {
            InputStream serviceAccount = new ClassPathResource("firebase-service-account.json").getInputStream();

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                System.out.println("✅ Firebase Admin SDK inicializado correctamente");
            }
        } catch (IOException e) {
            System.err.println("❌ Error al inicializar Firebase Admin SDK: " + e.getMessage());
            throw new RuntimeException("No se pudo inicializar Firebase", e);
        }
    }
}
```

---

## Paso 3.4: Crear Servicio de Notificaciones FCM

### 📝 Archivo: `service/FcmService.java`

```java
package com.spotfinder.service;

import com.google.firebase.messaging.*;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FcmService {
    
    private static final Logger logger = LoggerFactory.getLogger(FcmService.class);

    /**
     * Enviar notificación a un solo dispositivo
     */
    public String sendNotification(String token, String title, String body, Map<String, String> data) {
        try {
            // Construir el mensaje
            Message message = Message.builder()
                    .setToken(token)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .putAllData(data != null ? data : new HashMap<>())
                    .setWebpushConfig(WebpushConfig.builder()
                            .setNotification(WebpushNotification.builder()
                                    .setTitle(title)
                                    .setBody(body)
                                    .setIcon("/assets/icons/icon-192x192.png")
                                    .setBadge("/assets/icons/badge-72x72.png")
                                    .setTag("notification")
                                    .setRequireInteraction(false)
                                    .build())
                            .build())
                    .build();

            // Enviar mensaje
            String response = FirebaseMessaging.getInstance().send(message);
            logger.info("✅ Notificación enviada exitosamente: {}", response);
            return response;

        } catch (FirebaseMessagingException e) {
            logger.error("❌ Error al enviar notificación: {}", e.getMessage());
            throw new RuntimeException("Error al enviar notificación FCM", e);
        }
    }

    /**
     * Enviar notificación a múltiples dispositivos
     */
    public BatchResponse sendMulticastNotification(List<String> tokens, String title, String body, Map<String, String> data) {
        try {
            MulticastMessage message = MulticastMessage.builder()
                    .addAllTokens(tokens)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .putAllData(data != null ? data : new HashMap<>())
                    .build();

            BatchResponse response = FirebaseMessaging.getInstance().sendMulticast(message);
            logger.info("✅ {} notificaciones enviadas exitosamente de {}", 
                    response.getSuccessCount(), tokens.size());
            
            return response;

        } catch (FirebaseMessagingException e) {
            logger.error("❌ Error al enviar notificaciones multicast: {}", e.getMessage());
            throw new RuntimeException("Error al enviar notificaciones FCM", e);
        }
    }

    /**
     * Suscribir token a un topic
     */
    public void subscribeToTopic(List<String> tokens, String topic) {
        try {
            TopicManagementResponse response = FirebaseMessaging.getInstance()
                    .subscribeToTopic(tokens, topic);
            logger.info("✅ {} tokens suscritos al topic '{}'", response.getSuccessCount(), topic);
        } catch (FirebaseMessagingException e) {
            logger.error("❌ Error al suscribir a topic: {}", e.getMessage());
            throw new RuntimeException("Error al suscribir a topic", e);
        }
    }

    /**
     * Enviar notificación a un topic
     */
    public String sendTopicNotification(String topic, String title, String body, Map<String, String> data) {
        try {
            Message message = Message.builder()
                    .setTopic(topic)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .putAllData(data != null ? data : new HashMap<>())
                    .build();

            String response = FirebaseMessaging.getInstance().send(message);
            logger.info("✅ Notificación enviada al topic '{}': {}", topic, response);
            return response;

        } catch (FirebaseMessagingException e) {
            logger.error("❌ Error al enviar notificación al topic: {}", e.getMessage());
            throw new RuntimeException("Error al enviar notificación al topic", e);
        }
    }
}
```

---

## Paso 3.5: Crear Entidad para Tokens FCM

### 📝 Archivo: `model/FcmToken.java`

```java
package com.spotfinder.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "fcm_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FcmToken {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long userId;
    
    @Column(nullable = false, unique = true, length = 500)
    private String token;
    
    @Column(name = "device_info")
    private String deviceInfo; // Browser, OS, etc.
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "is_active")
    private Boolean isActive = true;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

---

## Paso 3.6: Crear Repositorio

### 📝 Archivo: `repository/FcmTokenRepository.java`

```java
package com.spotfinder.repository;

import com.spotfinder.model.FcmToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FcmTokenRepository extends JpaRepository<FcmToken, Long> {
    
    List<FcmToken> findByUserIdAndIsActiveTrue(Long userId);
    
    Optional<FcmToken> findByToken(String token);
    
    void deleteByToken(String token);
    
    List<FcmToken> findAllByIsActiveTrue();
}
```

---

## Paso 3.7: Actualizar NotificationsController

### 📝 Archivo: `controller/NotificationsController.java`

Agregar estos endpoints:

```java
package com.spotfinder.controller;

import com.spotfinder.model.FcmToken;
import com.spotfinder.repository.FcmTokenRepository;
import com.spotfinder.service.FcmService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
public class NotificationsController {

    @Autowired
    private FcmTokenRepository fcmTokenRepository;

    @Autowired
    private FcmService fcmService;

    // ...existing endpoints...

    /**
     * Registrar token FCM de un usuario
     */
    @PostMapping("/register-fcm-token")
    public ResponseEntity<?> registerFcmToken(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        
        try {
            String token = request.get("token");
            String deviceInfo = request.get("deviceInfo");
            
            if (token == null || token.isEmpty()) {
                return ResponseEntity.badRequest().body("Token is required");
            }

            // Obtener userId del usuario autenticado
            Long userId = getUserIdFromAuthentication(authentication);

            // Buscar si el token ya existe
            Optional<FcmToken> existingToken = fcmTokenRepository.findByToken(token);
            
            if (existingToken.isPresent()) {
                // Actualizar token existente
                FcmToken fcmToken = existingToken.get();
                fcmToken.setUserId(userId);
                fcmToken.setDeviceInfo(deviceInfo);
                fcmToken.setIsActive(true);
                fcmTokenRepository.save(fcmToken);
            } else {
                // Crear nuevo token
                FcmToken newToken = new FcmToken();
                newToken.setUserId(userId);
                newToken.setToken(token);
                newToken.setDeviceInfo(deviceInfo);
                newToken.setIsActive(true);
                fcmTokenRepository.save(newToken);
            }

            return ResponseEntity.ok().body(Map.of("message", "Token registered successfully"));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to register token: " + e.getMessage()));
        }
    }

    /**
     * Enviar notificación push a un usuario
     */
    @PostMapping("/send")
    public ResponseEntity<?> sendNotification(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        
        try {
            Long targetUserId = Long.parseLong(request.get("userId").toString());
            String title = request.get("title").toString();
            String body = request.get("body").toString();
            String actionUrl = (String) request.get("actionUrl");
            
            // Obtener tokens activos del usuario
            List<FcmToken> tokens = fcmTokenRepository.findByUserIdAndIsActiveTrue(targetUserId);
            
            if (tokens.isEmpty()) {
                return ResponseEntity.ok().body(Map.of(
                    "message", "No active tokens found for user",
                    "sent", false
                ));
            }

            // Preparar data
            Map<String, String> data = new HashMap<>();
            data.put("title", title);
            data.put("body", body);
            if (actionUrl != null) {
                data.put("actionUrl", actionUrl);
            }
            data.put("createdAt", LocalDateTime.now().toString());

            // Enviar a todos los tokens del usuario
            List<String> tokenStrings = tokens.stream()
                    .map(FcmToken::getToken)
                    .collect(Collectors.toList());

            if (tokenStrings.size() == 1) {
                // Un solo token
                fcmService.sendNotification(tokenStrings.get(0), title, body, data);
            } else {
                // Múltiples tokens
                fcmService.sendMulticastNotification(tokenStrings, title, body, data);
            }

            // También crear notificación en la BD (para historial)
            // ...tu código existente para crear Notification entity...

            return ResponseEntity.ok().body(Map.of(
                "message", "Notification sent successfully",
                "sent", true,
                "tokenCount", tokenStrings.size()
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to send notification: " + e.getMessage()));
        }
    }

    /**
     * Invalidar token FCM (cuando el usuario cierra sesión o deshabilita notificaciones)
     */
    @DeleteMapping("/fcm-token/{token}")
    public ResponseEntity<?> deleteFcmToken(@PathVariable String token) {
        try {
            fcmTokenRepository.deleteByToken(token);
            return ResponseEntity.ok().body(Map.of("message", "Token deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to delete token: " + e.getMessage()));
        }
    }

    // Helper method
    private Long getUserIdFromAuthentication(Authentication authentication) {
        // Implementar según tu sistema de autenticación
        // Ejemplo:
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return userDetails.getId();
    }
}
```

---

## Paso 3.8: Crear Migración de Base de Datos

### 📝 Archivo: `resources/db/migration/V1__create_fcm_tokens_table.sql`

```sql
CREATE TABLE IF NOT EXISTS fcm_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    device_info VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_fcm_tokens_user_id ON fcm_tokens(user_id);
CREATE INDEX idx_fcm_tokens_token ON fcm_tokens(token);
CREATE INDEX idx_fcm_tokens_is_active ON fcm_tokens(is_active);
```

---

# PARTE 4: TESTING (15 minutos)

## Paso 4.1: Reiniciar el Proyecto

### Frontend:
```bash
# Detener servidor si está corriendo (Ctrl+C)
# Reinstalar dependencias
npm install

# Iniciar servidor
ng serve --configuration=development
```

### Backend:
```bash
# Reiniciar el servidor Spring Boot
mvn spring-boot:run
```

---

## Paso 4.2: Verificar Inicialización

1. **Abrir navegador en:** http://localhost:4200

2. **Abrir DevTools (F12) → Console**

3. **Deberías ver:**
   ```
   ✅ Firebase inicializado correctamente
   ✅ Token FCM obtenido: eG7x...
   ✅ Token FCM registrado en backend
   ```

4. **El navegador pedirá permisos:**
   - Click en "Permitir" o "Allow"

---

## Paso 4.3: Probar Notificación desde Backend

### Usando Postman o cURL:

```bash
# 1. Hacer login y obtener JWT token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tu@email.com",
    "password": "tupassword"
  }'

# 2. Guardar el token JWT
TOKEN="eyJhbGc..."

# 3. Enviar notificación de prueba
curl -X POST http://localhost:8080/api/notifications/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "userId": 1,
    "title": "🎉 Prueba de Notificación",
    "body": "¡Las notificaciones push están funcionando!",
    "actionUrl": "/dashboard"
  }'
```

**Deberías ver:**
- ✅ Notificación aparece como toast en la app (si está abierta)
- ✅ Notificación del sistema operativo (si está en background)
- ✅ Badge de contador se actualiza

---

## Paso 4.4: Probar en Background

1. **Minimizar o cambiar de pestaña** en el navegador

2. **Enviar otra notificación** (usar el cURL de arriba)

3. **Deberías ver:**
   - ✅ Notificación del sistema operativo
   - ✅ Sonido/vibración
   - ✅ Badge en el ícono del navegador

4. **Click en la notificación:**
   - ✅ Abre/enfoca la app
   - ✅ Navega a la URL especificada en `actionUrl`

---

## Paso 4.5: Probar desde Firebase Console

1. **Ir a Firebase Console:**
   ```
   https://console.firebase.google.com/
   ```

2. **Tu proyecto → Cloud Messaging → Send your first message**

3. **Llenar formulario:**
   - **Notification title:** "Test desde Firebase"
   - **Notification text:** "Esta es una prueba"
   - Click "Send test message"

4. **Agregar tu token FCM:**
   - Copiar el token de la console del navegador
   - Pegarlo en "Add an FCM registration token"
   - Click "Test"

5. **Deberías ver la notificación**

---

# PARTE 5: SOLUCIÓN DE PROBLEMAS

## Problema 1: "Permission denied" o no pide permisos

**Solución:**
- Verificar que estás en `https://` o `localhost`
- Limpiar cache del navegador
- Verificar en Settings → Privacy → Site settings → Notifications

## Problema 2: "Firebase not initialized"

**Solución:**
- Verificar que copiaste correctamente la configuración
- Verificar que el archivo `firebase-messaging-sw.js` está en `/public`
- Reiniciar el servidor

## Problema 3: "Token inválido" en backend

**Solución:**
- Verificar que el Server Key está correcto
- Verificar que Cloud Messaging API está habilitada
- Verificar que el token no expiró

## Problema 4: Notificaciones no aparecen en background

**Solución:**
- Verificar que el Service Worker está registrado
- Abrir DevTools → Application → Service Workers
- Verificar que el estado es "activated"
- Unregister y volver a registrar

## Problema 5: CORS errors en el backend

**Solución:**
```java
@Configuration
public class WebConfig {
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOrigin("http://localhost:4200");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

---

# PARTE 6: BEST PRACTICES

## ✅ Seguridad

1. **Nunca commitear el archivo `firebase-service-account.json`**
   ```
   # .gitignore
   firebase-service-account.json
   ```

2. **Usar variables de entorno para producción**
   ```bash
   export FIREBASE_CREDENTIALS=/path/to/firebase-service-account.json
   ```

3. **Rotar claves periódicamente**

4. **Validar tokens en el backend**

---

## ✅ Performance

1. **Limitar frecuencia de notificaciones**
   - No enviar más de 1 notificación por minuto por usuario

2. **Usar topics para notificaciones masivas**
   ```java
   fcmService.sendTopicNotification("all-users", "Título", "Cuerpo", data);
   ```

3. **Limpiar tokens inactivos**
   ```java
   @Scheduled(cron = "0 0 2 * * ?") // 2 AM cada día
   public void cleanInactiveTokens() {
       LocalDateTime threshold = LocalDateTime.now().minusDays(30);
       fcmTokenRepository.deleteByUpdatedAtBefore(threshold);
   }
   ```

---

## ✅ UX

1. **Respetar preferencias del usuario**
   ```typescript
   // Guardar preferencia
   localStorage.setItem('notifications_enabled', 'true');
   
   // Verificar antes de solicitar permisos
   if (localStorage.getItem('notifications_enabled') === 'true') {
     fcmService.init();
   }
   ```

2. **Mostrar estado claro**
   ```html
   <div *ngIf="notificationsEnabled">
     🔔 Notificaciones activadas
   </div>
   ```

3. **Permitir desactivar**
   ```typescript
   disableNotifications() {
     localStorage.setItem('notifications_enabled', 'false');
     // Invalidar token en backend
     this.apiClient.deleteFcmToken(this.currentToken);
   }
   ```

---

# PARTE 7: CHECKLIST FINAL

## Frontend ✅
- [ ] Firebase configurado en todos los environments
- [ ] Service Worker actualizado con tu configuración
- [ ] Dependencies instaladas (`firebase@10.7.1`)
- [ ] Permisos solicitados y aceptados
- [ ] Token FCM obtenido
- [ ] Token registrado en backend

## Backend ✅
- [ ] Dependencia `firebase-admin` agregada
- [ ] Archivo `firebase-service-account.json` descargado
- [ ] `FirebaseConfig.java` creado
- [ ] `FcmService.java` creado
- [ ] Tabla `fcm_tokens` creada
- [ ] Endpoints de notificaciones actualizados
- [ ] Backend reiniciado

## Testing ✅
- [ ] Notificación en foreground funciona
- [ ] Notificación en background funciona
- [ ] Click en notificación abre la app
- [ ] Badge se actualiza correctamente
- [ ] Múltiples dispositivos funcionan

---

# 🎉 ¡FELICIDADES!

Si llegaste hasta aquí y todos los checkboxes están marcados, ¡tienes un sistema de notificaciones push completamente funcional!

---

## 📞 Soporte

**Documentación oficial:**
- Firebase: https://firebase.google.com/docs/cloud-messaging
- Firebase Admin SDK: https://firebase.google.com/docs/admin/setup

**Problemas comunes:**
- Ver sección "PARTE 5: SOLUCIÓN DE PROBLEMAS"

---

**Creado:** 2025-11-27  
**Versión:** 1.0  
**Tiempo estimado:** 60 minutos  
**Dificultad:** Media

