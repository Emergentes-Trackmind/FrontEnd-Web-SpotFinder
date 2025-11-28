# Análisis de Conexión con Backend - SpotFinder

## 📋 Resumen Ejecutivo

El proyecto SpotFinder Frontend actualmente está configurado para conectarse a un backend local (`http://localhost:3001/api`). Se requiere actualizar la configuración para conectarlo con el backend desplegado en Azure.

**Backend Azure URL:** `https://spotfinderback-eaehduf4ehh7hjah.eastus2-01.azurewebsites.net`

---

## 🔍 Análisis de Endpoints Actuales

### 1. **Archivos de Configuración de Entorno**

El proyecto utiliza múltiples archivos de configuración de entorno:

- `environment.ts` - Producción
- `environment.development.ts` - Desarrollo local
- `environment.simulation.ts` - Simulación/Testing
- `environment.interface.ts` - Interfaz TypeScript para tipado

**URL Base Actual:** `http://localhost:3001/api`

### 2. **Interceptor HTTP**

**Archivo:** `src/app/core/http/api-prefix.interceptor.ts`

Este interceptor:
- Agrega automáticamente `environment.apiBase` a todas las peticiones que comienzan con `/`
- No intercepta URLs absolutas (que comienzan con `http`)
- Agrega headers comunes (Content-Type, Accept, etc.)
- Logging opcional según feature flag

### 3. **Servicios API Identificados**

#### 3.1 Autenticación (`AuthApi`)
**Ruta Base:** `/auth`
- POST `/auth/login` - Login de usuario
- POST `/auth/register` - Registro de usuario
- POST `/auth/refresh` - Renovar token
- POST `/auth/forgot-password` - Recuperar contraseña
- POST `/auth/reset-password` - Resetear contraseña

#### 3.2 Perfiles de Usuario (`ProfileApi`)
**Ruta Base:** `/profile`
- GET `/profile` - Obtener perfil actual
- PUT `/profile` - Actualizar perfil

#### 3.3 Parkings (`ParkingsApi`)
**Ruta Base:** `/parkings`
- GET `/parkings` - Listar parkings (con filtro opcional `?ownerId=`)
- GET `/parkings/:id` - Obtener parking por ID
- POST `/parkings` - Crear parking
- PUT `/parkings/:id` - Actualizar parking
- DELETE `/parkings/:id` - Eliminar parking

**Nota:** Los parkings incluyen datos embebidos de:
- Location (ubicación)
- Pricing (precios)
- Features (características)

#### 3.4 Analytics (`AnalyticsApi`)
**Ruta Base:** `/analytics`
- GET `/analytics/totals` - KPIs totales
- GET `/analytics/revenue` - Ingresos por mes
- GET `/analytics/occupancy` - Ocupación por hora
- GET `/analytics/activity` - Actividad reciente
- GET `/analytics/top-parkings` - Top parkings

#### 3.5 Reservaciones (`ReservationsApi`)
**Ruta Base:** `/reservations`
- GET `/reservations` - Listar reservaciones (con filtros y paginación)
- GET `/reservations/:id` - Obtener reservación por ID
- PATCH `/reservations/:id` - Actualizar reservación parcialmente

**Filtros soportados:**
- `currentUserId` - Para privacidad de datos
- Varios filtros personalizados

#### 3.6 Reviews (`ReviewsApi`)
**Ruta Base:** `/reviews`
- GET `/reviews` - Listar reviews (con filtros y paginación)
- GET `/reviews/:id` - Obtener review por ID
- PATCH `/reviews/:id` - Actualizar review
- POST `/reviews` - Crear review

**Filtros soportados:**
- `q` - Búsqueda
- `status` - Estado del review
- `rating` - Calificación
- `parkingId` - ID del parking
- `createdAt_gte`, `createdAt_lte` - Rango de fechas
- Paginación: `_page`, `_limit`, `_sort`, `_order`

#### 3.7 Dispositivos IoT (`DevicesApi`)
**Ruta Base:** `/iot/devices`
- GET `/iot/devices` - Listar dispositivos (con filtros y paginación)
- GET `/iot/devices/:id` - Obtener dispositivo por ID
- GET `/iot/devices/kpis` - KPIs de dispositivos
- POST `/iot/devices` - Crear dispositivo
- PUT `/iot/devices/:id` - Actualizar dispositivo
- DELETE `/iot/devices/:id` - Eliminar dispositivo
- POST `/iot/devices/:id/maintenance` - Establecer en mantenimiento
- POST `/iot/devices/:id/restore` - Restaurar dispositivo
- POST `/iot/devices/:serialNumber/telemetry` - Enviar telemetría

**Filtros soportados:**
- `type`, `status`, `parking_id`, `q`, `page`, `size`

#### 3.8 Pagos
**Ruta Base:** `/reservationPayments`
- (Endpoints específicos no vistos en el análisis, pero configurados en environment)

---

## 🛠️ Cambios Requeridos

### 1. Crear Nuevo Environment de Producción Azure

Crear `environment.production.ts` con:
```typescript
apiBase: 'https://spotfinderback-eaehduf4ehh7hjah.eastus2-01.azurewebsites.net/api'
```

### 2. Actualizar `environment.ts` (Producción por defecto)

Cambiar de:
```typescript
apiBase: 'http://localhost:3001/api'
```

A:
```typescript
apiBase: 'https://spotfinderback-eaehduf4ehh7hjah.eastus2-01.azurewebsites.net/api'
```

### 3. Mantener Environments de Desarrollo

- `environment.development.ts` - Mantener `http://localhost:3001/api` para desarrollo local
- `environment.simulation.ts` - Mantener para testing

### 4. Actualizar `angular.json`

Agregar configuración de build para producción con Azure:
```json
"production-azure": {
  "fileReplacements": [{
    "replace": "src/environments/environment.ts",
    "with": "src/environments/environment.production.ts"
  }]
}
```

### 5. Configuración de IoT

**Nota Importante:** El backend de Azure puede o no tener un servicio IoT separado. Verificar:

- ¿Existe un endpoint `/api/iot` en el backend de Azure?
- ¿O los dispositivos IoT se manejan a través de un servicio edge separado?

**Opción 1:** Si IoT está en el mismo backend:
```typescript
iot: {
  sensorApiUrl: 'https://spotfinderback-eaehduf4ehh7hjah.eastus2-01.azurewebsites.net/api/iot'
}
```

**Opción 2:** Si IoT está en un servicio separado:
```typescript
iot: {
  sensorApiUrl: 'https://[TU_IOT_SERVICE_URL]/api/iot'
}
```

### 6. CORS Configuration

Asegurar que el backend de Azure tenga configurado CORS para permitir peticiones desde:
- Dominio de producción del frontend
- `http://localhost:4200` (para desarrollo)

---

## 📝 Endpoints que Requieren Verificación en Swagger

Verificar en el Swagger de Azure que existen estos endpoints:

### Críticos (Funcionalidad Core)
- ✅ `/api/auth/login`
- ✅ `/api/auth/register`
- ✅ `/api/parkings`
- ✅ `/api/profile`

### Importantes
- ⚠️ `/api/analytics/*`
- ⚠️ `/api/reservations`
- ⚠️ `/api/reviews`
- ⚠️ `/api/iot/devices`

### Opcionales
- 🔄 `/api/reservationPayments`

---

## 🚀 Pasos de Implementación

1. ✅ **Crear `environment.production.ts`**
2. ✅ **Actualizar `environment.ts`** para producción
3. ✅ **Verificar endpoints en Swagger de Azure**
4. ✅ **Actualizar configuración IoT** según disponibilidad
5. ✅ **Probar localmente** con `ng build --configuration=production`
6. ✅ **Desplegar a producción**
7. ✅ **Verificar CORS en Azure**
8. ✅ **Testing completo** de funcionalidades

---

## 🔧 Comandos Útiles

```bash
# Build para desarrollo local
ng build --configuration=development

# Build para producción (Azure)
ng build --configuration=production

# Serve en modo desarrollo
ng serve --configuration=development

# Serve en modo simulación
ng serve --configuration=simulation
```

---

## ⚠️ Consideraciones de Seguridad

1. **HTTPS:** El backend de Azure ya usa HTTPS ✅
2. **JWT Tokens:** Verificar que el backend acepte tokens JWT en headers
3. **Refresh Tokens:** Asegurar que el mecanismo de refresh funcione
4. **CORS:** Configurar adecuadamente en Azure
5. **Environment Variables:** No commitear claves sensibles (Firebase, Stripe, etc.)

---

## 📊 Checklist de Verificación Post-Despliegue

- [ ] Login funciona correctamente
- [ ] Registro de nuevos usuarios funciona
- [ ] Listado de parkings se carga
- [ ] Creación/edición de parkings funciona
- [ ] Analytics se cargan correctamente
- [ ] Reservaciones se listan y actualizan
- [ ] Reviews se cargan y envían
- [ ] Dispositivos IoT se listan (si aplica)
- [ ] Imágenes se cargan correctamente
- [ ] Notificaciones funcionan
- [ ] Pagos se procesan (si aplica)

---

## 🔗 Enlaces Útiles

- **Backend Swagger:** https://spotfinderback-eaehduf4ehh7hjah.eastus2-01.azurewebsites.net/swagger-ui/index.html
- **Backend Base URL:** https://spotfinderback-eaehduf4ehh7hjah.eastus2-01.azurewebsites.net

---

**Fecha de Análisis:** 2025-11-27
**Estado:** Pendiente de Implementación

