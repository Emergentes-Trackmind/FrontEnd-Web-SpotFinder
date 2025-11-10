# 🛰️ Simulación de Sensores IoT - SpotFinder

## 📋 Descripción

Este módulo permite simular sensores IoT para parkings utilizando números de serie reales de dispositivos físicos. Es ideal para:

- **Desarrollo**: Probar funcionalidades sin hardware físico
- **Demostración**: Mostrar el sistema en funcionamiento
- **Testing**: Validar la integración con APIs externas
- **Training**: Entrenar usuarios en el uso del sistema

## 🚀 Configuración Rápida

### 1. Usar el Environment de Simulación

```bash
# Iniciar con simulación habilitada
npm run start:simulation

# O usando Angular CLI directamente
ng serve --configuration=simulation
```

### 2. Iniciar API de Sensores Externa

```powershell
# Ejecutar el servidor de API de sensores
.\start-sensor-api.ps1
```

Esto iniciará un servidor en el puerto **3002** que simula una API externa de sensores IoT.

## 🔧 Configuración

### Environment Configuration

El archivo `environment.simulation.ts` contiene:

```typescript
iot: {
  sensorApiUrl: 'http://localhost:3002/api/sensors',
  endpoints: {
    devices: '/devices',      // GET - Lista de dispositivos
    status: '/status',        // GET - Estado de dispositivo específico
    simulation: '/simulation', // POST - Control de simulación
    bind: '/bind'             // POST/DELETE - Vincular/desvincular
  },
  simulation: {
    enabled: true,            // Habilitar simulación automática
    mockDataInterval: 30000   // Actualizar cada 30 segundos
  }
}
```

### Endpoints de la API Externa

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/sensors/devices` | Lista todos los dispositivos disponibles |
| `GET` | `/api/sensors/status/{serial}` | Estado de un dispositivo específico |
| `POST` | `/api/sensors/bind` | Vincular dispositivo a parking spot |
| `DELETE` | `/api/sensors/bind/{serial}` | Desvincular dispositivo |

## 📱 Interfaz de Simulación

### Acceder al Panel de Simulación

1. Iniciar la aplicación en modo simulación
2. Ir a: `http://localhost:4200/iot/simulation`
3. Login con credenciales válidas

### Funcionalidades del Panel

#### 🎛️ Control de Simulación
- **Iniciar/Detener**: Control manual de la simulación
- **Estado en tiempo real**: Indicador visual del estado
- **Configuración**: Muestra URL de API e intervalo

#### 📊 Gestión de Dispositivos
- **Lista de dispositivos**: Tabla con todos los sensores
- **Agregar dispositivos**: Formulario para nuevos sensores de prueba
- **Estado en tiempo real**: Batería, ocupación, conectividad
- **Vinculación**: Estado de vinculación con parking spots

#### 📈 Monitoreo de Lecturas
- **Lecturas recientes**: Últimas 10 lecturas de sensores
- **Datos en tiempo real**: Ocupación, batería, señal
- **Timestamps**: Marcas de tiempo de cada lectura

## 🔢 Números de Serie de Ejemplo

El sistema incluye dispositivos de ejemplo con números de serie realistas:

- `SN001-LIMA-001` - En línea, batería 85%
- `SN002-LIMA-002` - En línea, vinculado a spot_001
- `SN003-LIMA-003` - Fuera de línea, batería baja
- `SN004-LIMA-004` - En línea, no vinculado

### Formato de Números de Serie

```
SN{###}-{CIUDAD}-{###}
```

Ejemplo: `SN005-LIMA-001`
- `SN005`: Identificador secuencial
- `LIMA`: Ciudad de instalación
- `001`: Número del dispositivo en la ciudad

## 🔗 Vinculación de Dispositivos

### Vincular Sensor a Parking Spot

```typescript
// Ejemplo de vinculación
sensorService.bindDeviceToSpot('SN001-LIMA-001', 'spot_123')
  .subscribe(result => {
    console.log('Dispositivo vinculado:', result);
  });
```

### Datos de Vinculación

```json
{
  "serialNumber": "SN001-LIMA-001",
  "parkingSpotId": "spot_123",
  "bindTime": "2024-11-10T15:30:00.000Z",
  "active": true
}
```

## 📊 Datos Simulados

### Estructura de Sensor Device

```typescript
interface SensorDevice {
  serialNumber: string;        // SN001-LIMA-001
  deviceId: string;           // dev_001
  parkingSpotId?: string;     // spot_123 (si está vinculado)
  status: 'online' | 'offline' | 'error';
  lastSeen: Date;
  batteryLevel?: number;      // 0-100%
  occupied: boolean;          // Estado del parking
  location?: {
    lat: number;
    lng: number;
  };
}
```

### Estructura de Sensor Reading

```typescript
interface SensorReading {
  deviceId: string;
  serialNumber: string;
  occupied: boolean;          // Estado detectado
  timestamp: Date;
  batteryLevel: number;       // Nivel actual de batería
  signalStrength: number;     // Fuerza de señal 0-100%
}
```

## 🛠️ Desarrollo

### Agregar Nuevos Dispositivos

```typescript
// En el servicio
sensorService.addMockDevice({
  serialNumber: 'SN010-LIMA-010',
  status: 'online',
  batteryLevel: 95,
  occupied: false
});
```

### Personalizar Intervalos de Simulación

```typescript
// En environment.simulation.ts
simulation: {
  enabled: true,
  mockDataInterval: 15000  // Cambiar a 15 segundos
}
```

### Integrar con Edge Server de Azure

Para usar tu edge server en Azure:

1. **Actualizar URL en environment.simulation.ts:**
   ```typescript
   iot: {
     sensorApiUrl: 'https://tu-edge-server.azurewebsites.net/api/sensors',
     simulation: { enabled: false }
   }
   ```

2. **Verificar endpoints en tu edge server:**
   - `GET /api/sensors/devices`
   - `GET /api/sensors/status/{serial}`
   - `POST /api/sensors/bind`
   - `DELETE /api/sensors/bind/{serial}`

3. **Configurar CORS** para permitir `http://localhost:4200`

4. **Usar el botón "Actualizar"** para refrescar desde tu edge server

## 🚨 Troubleshooting

### Problemas Comunes

#### La simulación no inicia
- Verificar que `simulation.enabled = true`
- Revisar consola del navegador para errores
- Confirmar que el puerto 3002 está libre

#### Dispositivos no aparecen
- Verificar que el servidor de API esté corriendo
- Revisar logs del servidor json-server
- Confirmar conectividad de red

#### Errores de CORS
```javascript
// Si usas API externa, agregar headers CORS
{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE",
  "Access-Control-Allow-Headers": "Content-Type"
}
```

## 📝 Logs y Debugging

### Habilitar Logs HTTP

```typescript
// En environment
featureFlags: {
  logHttp: true  // Ver todas las llamadas HTTP
}
```

### Ver Estado del Servicio

```typescript
// En consola del navegador
const service = window.ng?.getComponent?.($0)?.sensorService;
console.log('Simulación activa:', service?.isSimulationRunning());
console.log('Dispositivos:', service?.connectedDevices$.value);
```

## 🔄 Comandos Útiles

```bash
# Iniciar simulación completa
npm run start:simulation

# Solo API de sensores
.\start-sensor-api.ps1

# Build para simulación
ng build --configuration=simulation

# Limpiar datos de sensores
del server\sensors-db.json
```

## 🌟 Casos de Uso

### Demo para Cliente
1. Iniciar simulación con datos preconfigurados
2. Mostrar dispositivos en tiempo real
3. Demostrar vinculación con parkings
4. Simular cambios de estado (ocupado/libre)

### Testing de Integración
1. Probar API endpoints
2. Validar manejo de errores
3. Verificar sincronización de datos
4. Testear casos extremos (batería baja, pérdida de conexión)

### Desarrollo de Funcionalidades
1. Desarrollar sin hardware físico
2. Probar diferentes escenarios
3. Simular condiciones específicas
4. Validar UI/UX

---

> 💡 **Tip**: Para una experiencia completa, ejecuta tanto la aplicación Angular como el servidor de API de sensores en terminales separadas.

> 🔧 **Desarrollo**: Este módulo está preparado para integración con APIs reales. Solo necesitas cambiar la configuración de endpoints.
