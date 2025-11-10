# 🌐 Configuración Edge Server IoT - Azure

## 📋 Configuración para tu Edge Server

### 🔄 Cambiar entre Simulación Local y Edge Server

#### Para usar tu Edge Server en Azure:

```typescript
// en environment.simulation.ts
iot: {
  sensorApiUrl: 'https://tu-edge-server.azurewebsites.net/api/sensors',
  endpoints: {
    devices: '/devices',
    status: '/status', 
    simulation: '/simulation',
    bind: '/bind'
  },
  simulation: {
    enabled: false, // Deshabilitado para edge server real
    mockDataInterval: 30000
  }
}
```

#### Para volver a simulación local:

```typescript
// en environment.simulation.ts
iot: {
  sensorApiUrl: 'http://localhost:3002/api/sensors',
  endpoints: {
    devices: '/devices',
    status: '/status',
    simulation: '/simulation', 
    bind: '/bind'
  },
  simulation: {
    enabled: true, // Habilitado para simulación
    mockDataInterval: 30000
  }
}
```

## 🚀 **Pasos para Usar tu Edge Server:**

### 1. **Actualizar la URL:**
Reemplaza `'https://tu-edge-server.azurewebsites.net/api/sensors'` con la URL real de tu edge server en Azure.

### 2. **Verificar Endpoints:**
Asegúrate de que tu edge server tenga estos endpoints:
- `GET /api/sensors/devices` - Lista de dispositivos
- `GET /api/sensors/status/{serial}` - Estado de dispositivo específico  
- `POST /api/sensors/bind` - Vincular dispositivo a parking
- `DELETE /api/sensors/bind/{serial}` - Desvincular dispositivo

### 3. **Configurar CORS (si es necesario):**
Tu edge server debe permitir requests desde `http://localhost:4200` durante desarrollo.

### 4. **Formato de Datos Esperados:**

#### Dispositivo (SensorDevice):
```json
{
  "serialNumber": "SN001-LIMA-001",
  "deviceId": "dev_001",
  "parkingSpotId": "spot_123",
  "status": "online", // "online" | "offline" | "error"
  "lastSeen": "2024-11-10T15:30:00.000Z",
  "batteryLevel": 85,
  "occupied": false,
  "location": {
    "lat": -12.0464,
    "lng": -77.0428
  }
}
```

#### Lista de Dispositivos:
```json
[
  {
    "serialNumber": "SN001-LIMA-001",
    "deviceId": "dev_001",
    "status": "online",
    "lastSeen": "2024-11-10T15:30:00.000Z",
    "batteryLevel": 85,
    "occupied": false
  },
  {
    "serialNumber": "SN002-LIMA-002", 
    "deviceId": "dev_002",
    "status": "online",
    "lastSeen": "2024-11-10T15:29:45.000Z",
    "batteryLevel": 92,
    "occupied": true,
    "parkingSpotId": "spot_001"
  }
]
```

#### Vincular Dispositivo (POST /bind):
```json
{
  "serialNumber": "SN001-LIMA-001",
  "parkingSpotId": "spot_123",
  "bindTime": "2024-11-10T15:30:00.000Z"
}
```

## 🔧 **Configuraciones Adicionales:**

### Para Producción:
```typescript
// environment.ts (producción)
iot: {
  sensorApiUrl: 'https://tu-edge-server-prod.azurewebsites.net/api/sensors',
  endpoints: {
    devices: '/devices',
    status: '/status',
    simulation: '/simulation',
    bind: '/bind'
  },
  simulation: {
    enabled: false,
    mockDataInterval: 60000 // Mayor intervalo en producción
  }
}
```

### Autenticación (si tu edge server la requiere):
```typescript
// Si necesitas autenticación, puedes agregar headers en el servicio
headers: {
  'Authorization': 'Bearer YOUR_TOKEN',
  'X-API-Key': 'YOUR_API_KEY'
}
```

## 🧪 **Testing con tu Edge Server:**

### 1. **Verificar Conectividad:**
```bash
curl https://tu-edge-server.azurewebsites.net/api/sensors/devices
```

### 2. **Probar desde la App:**
1. Iniciar: `npm run start:simulation`
2. Ir a: `http://localhost:4200/iot/simulation`
3. Verificar que aparezcan dispositivos de tu edge server
4. Probar vinculación/desvinculación

### 3. **Monitorear Requests:**
Con `logHttp: true` en el environment, verás todas las llamadas HTTP en la consola del navegador.

## 🔄 **Variables de Environment Flexibles:**

Para hacer más fácil el cambio, puedes usar variables de entorno:

```typescript
// environment.simulation.ts
iot: {
  sensorApiUrl: process.env['IOT_API_URL'] || 'https://tu-edge-server.azurewebsites.net/api/sensors',
  // ...resto de la configuración
}
```

## 📋 **Checklist para Deployment:**

- [ ] Edge server desplegado en Azure
- [ ] Endpoints funcionando correctamente
- [ ] CORS configurado para el dominio del frontend
- [ ] URL actualizada en environment.simulation.ts
- [ ] Formato de datos compatible
- [ ] Testing de conectividad completo
- [ ] Autenticación configurada (si es necesaria)

---

> 💡 **Tip:** Mantén siempre la configuración de simulación local como backup para desarrollo sin conexión.

> 🔧 **Pro Tip:** Considera usar variables de entorno para cambiar fácilmente entre desarrollo, staging y producción sin modificar código.
