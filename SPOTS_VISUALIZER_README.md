# 🚗 Módulo de Visualización de Plazas (Spots) - Step 2

## 📋 Descripción

Este módulo implementa el nuevo **Step 2: Visualización de Plazas** en el flujo de creación de parkings. Permite visualizar en tiempo real el estado de las plazas (spots) de un parking con integración IoT simulada.

## ✨ Características Implementadas

### 1. **Servicios Creados**

#### `ParkingStateService`
- Mantiene el estado temporal del parking durante el flujo de creación
- Almacena datos entre pasos del wizard
- Guarda filtro de visualización seleccionado

#### `SpotsService`
- Genera array de spots (1-300) basado en totalSpaces del Step 1
- Actualiza estado de spots en tiempo real
- Proporciona estadísticas (libre, ocupado, mantenimiento, offline)
- Asigna dispositivos IoT a spots

#### `IoTService` (Simulación)
- Simula eventos IoT en tiempo real usando RxJS
- Emite actualizaciones de estado cada 8-15 segundos
- Soporta múltiples estados: free, occupied, offline, maintenance
- Incluye datos de batería, señal y temperatura
- **Producción**: Conectar a WebSocket/SSE real

#### `IoTAlertsService`
- Procesa actualizaciones IoT y muestra notificaciones contextuales
- Detecta cambios significativos (plaza liberada, sensor offline, etc.)
- Usa MatSnackBar para notificaciones no intrusivas

### 2. **Componentes Creados**

#### `SpotBlockComponent`
**Ubicación**: `src/app/profileparking/components/spot-block/`

Representa un bloque individual de plaza con:
- Número de spot (grande y visible)
- Badge de estado con icono y color
- Indicador de dispositivo IoT
- Menú kebab con acciones:
  - Ver detalle de dispositivo IoT
  - Marcar/quitar de mantenimiento
- ChangeDetection OnPush para rendimiento
- Accesibilidad completa con aria-labels

**Estados visuales**:
- 🟢 Libre (verde) - `status-free`
- 🔴 Ocupado (rojo) - `status-occupied`  
- 🟠 Mantenimiento (ámbar) - `status-maintenance`
- ⚫ Offline (gris) - `status-offline`

#### `SpotsVisualizerStepComponent`
**Ubicación**: `src/app/profileparking/pages/parking-created/steps/spots-visualizer-step/`

Vista principal del Step 2 que incluye:

**Toolbar**:
- Título del paso (2 de 6)
- Badge con total de plazas

**Panel de KPIs** (5 tarjetas):
- Total de spots
- Libres
- Ocupados
- En mantenimiento
- Offline

**Filtros**:
- Chips interactivos para filtrar por estado
- Contador en tiempo real por categoría

**Visualización de Spots**:
- Angular CDK Virtual Scroll horizontal
- Scroll suave para 1-300 spots
- Hint de deslizamiento para >20 spots
- Render optimizado con trackBy

**Navegación**:
- Botón "Anterior" → vuelve al Step 1
- Botón "Siguiente" → avanza al Step 3 (Ubicación)

### 3. **Actualizaciones en Wizard**

#### `parking-created.page.ts`
- ✅ Steps actualizados de 5 a 6
- ✅ Progreso recalculado (X/6)
- ✅ Importado `SpotsVisualizerStepComponent`
- ✅ Validación de step final en 6

#### `parking-created.page.html`
- ✅ Indicador "Paso X de 6"
- ✅ Nuevo `<app-spots-visualizer-step>` en step 2
- ✅ Pasos renumerados: Location (3), Features (4), Pricing (5), Review (6)

#### `parking-create.service.ts`
- ✅ `goToStep()` acepta hasta 6 pasos
- ✅ `nextStep()` validación hasta 6
- ✅ `isStepValid(2)` siempre true (solo visualización)

#### `step-basic.component.ts`
- ✅ Actualiza `ParkingStateService` con datos básicos
- ✅ Permite avanzar al Step 2 con spots visualizer

## 🚀 Instalación

### Dependencias Requeridas

```bash
# Angular CDK (si no está instalado)
npm install @angular/cdk

# Angular Material (ya debería estar)
npm install @angular/material
```

### Sin dependencias externas
✅ Este módulo usa **Angular CDK Virtual Scroll** (nativo), no requiere SwiperJS.

## 🎮 Uso

### 1. Simular Eventos IoT

El servicio `IoTService` inicia automáticamente la simulación cuando se carga el Step 2.

**Eventos aleatorios cada 8-15 segundos**:
```typescript
// En spots-visualizer-step.component.ts
this.iotService.startSimulation(this.totalSpots);
```

**Simular evento manual**:
```typescript
this.iotService.simulateUpdate(spotNumber: 7, 'occupied');
```

### 2. Conectar a Backend Real (Producción)

Reemplazar simulación en `IoTService`:

**Server-Sent Events (SSE)**:
```typescript
connectToSSE(parkingId: string): Observable<IoTStatusUpdate> {
  const eventSource = new EventSource(`/api/iot/stream?parkingId=${parkingId}`);
  
  return new Observable(observer => {
    eventSource.onmessage = (event) => {
      const update: IoTStatusUpdate = JSON.parse(event.data);
      observer.next(update);
    };
    
    eventSource.onerror = (error) => {
      observer.error(error);
    };
    
    return () => eventSource.close();
  });
}
```

**WebSocket**:
```typescript
connectToWebSocket(parkingId: string): Observable<IoTStatusUpdate> {
  const ws = new WebSocket(`ws://localhost:3001/iot?parkingId=${parkingId}`);
  
  return new Observable(observer => {
    ws.onmessage = (event) => {
      const update: IoTStatusUpdate = JSON.parse(event.data);
      observer.next(update);
    };
    
    ws.onerror = (error) => observer.error(error);
    ws.onclose = () => observer.complete();
    
    return () => ws.close();
  });
}
```

### 3. API Endpoints Esperados

```typescript
// GET /api/parkings/:parkingId/spots
interface SpotResponse {
  spotNumber: number;
  deviceId: string | null;
  status: 'free' | 'occupied' | 'maintenance' | 'offline';
}

// PATCH /api/parkings/:parkingId/spots/:spotNumber
interface UpdateSpotRequest {
  status: 'maintenance' | 'free';
}

// SSE Stream: GET /api/iot/stream?parkingId=...
interface IoTStatusUpdate {
  deviceId: string;
  spotNumber: number;
  status: 'free' | 'occupied' | 'offline';
  battery: number;
  signalStrength: number;
  lastSeen: string; // ISO 8601
  temperature?: number;
}
```

## 📊 Reglas de Negocio

1. ✅ **Máximo 300 spots**: Validación en generación
2. ✅ **Mínimo 1 spot**: Validación obligatoria
3. ✅ **Estado Mantenimiento tiene prioridad**: Si un spot está en mantenimiento, aunque IoT reporte "occupied", se muestra "maintenance"
4. ✅ **Navegación Step 1 ↔ Step 2**: Si se cambia totalSpaces en Step 1 y se vuelve a Step 2, se regeneran los spots
5. ✅ **Filtro persistente**: La selección de filtro se guarda en `ParkingStateService`
6. ✅ **Sin sensor = acción bloqueada**: "Ver detalle IoT" deshabilitado si deviceId es null

## 🎨 Personalización de Estilos

### Colores de Estados

Modificar en `spot-block.component.css`:

```css
.status-free {
  border-color: #4caf50;  /* Verde */
  background-color: #f1f8f4;
}

.status-occupied {
  border-color: #f44336;  /* Rojo */
  background-color: #fef5f5;
}

.status-maintenance {
  border-color: #ff9800;  /* Ámbar */
  background-color: #fff8f0;
}

.status-offline {
  border-color: #9e9e9e;  /* Gris */
  background-color: #f5f5f5;
}
```

### Tamaño de Bloques

```css
.spot-card {
  width: 140px;
  min-width: 140px;
  height: 140px;
}
```

## 🧪 Testing

### Casos de Prueba Implementados

1. ✅ **N=4**: Renderiza 4 bloques
2. ✅ **N=120**: Scroll horizontal fluido
3. ✅ **N=300**: Sin jank, rendimiento óptimo
4. ✅ **Evento IoT spot 7 → occupied**: Bloque 7 cambia a rojo, contador "Ocupados" sube
5. ✅ **Filtro "Libres"**: Solo muestra spots con status=free
6. ✅ **Marcar en mantenimiento**: Spot cambia a ámbar, contador se actualiza
7. ✅ **Click "Ver detalle"**: Navega a `/iot/devices/:deviceId`

### Ejecutar Tests

```bash
# Unit tests
ng test

# E2E tests
ng e2e
```

## 📱 Responsive

- **Desktop (>1440px)**: 7 bloques visibles
- **Laptop (1024-1440px)**: 5 bloques visibles
- **Tablet (640-1024px)**: 3 bloques visibles
- **Mobile (<640px)**: 2 bloques visibles

Grid automático en estadísticas:
- Desktop: 5 columnas
- Mobile: 2 columnas (Total/Libres, Ocupados/Manten., Offline solo)

## 🔗 Navegación IoT

Cuando el usuario hace click en "Ver detalle de dispositivo IoT":

```typescript
onOpenDeviceDetails(deviceId: string): void {
  this.router.navigate(['/iot/devices', deviceId]);
}
```

**Asegúrate de tener la ruta configurada**:
```typescript
// app.routes.ts
{
  path: 'iot/devices/:id',
  component: IoTDeviceDetailComponent
}
```

## ⚡ Rendimiento

### Optimizaciones Implementadas

1. **ChangeDetection OnPush**: En `SpotBlockComponent`
2. **Virtual Scroll**: Solo renderiza spots visibles
3. **TrackBy Function**: Evita re-render innecesario
4. **Debounce**: Actualizaciones IoT no saturan el DOM
5. **Lazy Loading**: Componentes cargados solo cuando se necesitan

### Métricas Esperadas

- **Tiempo de carga inicial (300 spots)**: <500ms
- **Update IoT → DOM**: <50ms
- **Scroll FPS**: 60fps estable
- **Memoria**: +15MB por 300 spots (aceptable)

## 🐛 Debugging

### Logs Habilitados

```typescript
console.log('✅ Step 2 iniciado con X spots');
console.log('✅ X dispositivos IoT registrados');
console.log('📡 IoT Update: Spot X → status');
console.log('✅ Plaza X marcada en mantenimiento');
```

### Troubleshooting

**Problema**: Los spots no se actualizan
- ✅ Verificar que `iotService.startSimulation()` se llama
- ✅ Verificar suscripción a `statusUpdates$`

**Problema**: Scroll no funciona
- ✅ Verificar que `@angular/cdk` está instalado
- ✅ Verificar `ScrollingModule` en imports

**Problema**: Navegación al Step 2 falla
- ✅ Verificar que `totalSpaces` en Step 1 es válido (1-300)
- ✅ Verificar que `ParkingStateService.setBasicInfo()` se llama

## 📚 Arquitectura de Archivos

```
src/app/profileparking/
├── services/
│   ├── parking-state.service.ts      ← Estado temporal del wizard
│   ├── spots.service.ts              ← Gestión de spots
│   ├── iot-simulation.service.ts    ← Simulación IoT
│   └── iot-alerts.service.ts         ← Notificaciones IoT
│
├── components/
│   └── spot-block/
│       ├── spot-block.component.ts   ← Bloque individual de spot
│       ├── spot-block.component.html
│       └── spot-block.component.css
│
└── pages/
    └── parking-created/
        ├── parking-created.page.ts   ← Wizard principal (actualizado)
        ├── parking-created.page.html ← Template (actualizado)
        └── steps/
            ├── step-basic/           ← Step 1 (actualizado)
            ├── spots-visualizer-step/ ← Step 2 (NUEVO)
            │   ├── spots-visualizer-step.component.ts
            │   ├── spots-visualizer-step.component.html
            │   └── spots-visualizer-step.component.css
            ├── step-location/        ← Step 3 (antes 2)
            ├── step-features/        ← Step 4 (antes 3)
            ├── step-pricing/         ← Step 5 (antes 4)
            └── step-review/          ← Step 6 (antes 5)
```

## 🎯 Próximos Pasos (Mejoras Futuras)

1. **Drag & Drop**: Reordenar spots manualmente
2. **Búsqueda**: Buscar spot por número
3. **Selección múltiple**: Marcar varios spots en mantenimiento
4. **Vista de mapa**: Visualizar spots en un plano 2D
5. **Historial**: Ver cambios de estado por spot
6. **Exportar**: Descargar reporte de ocupación

## 📝 Licencia

Proyecto interno - Todos los derechos reservados

## 👨‍💻 Autor

Senior Frontend Engineer - Angular + IoT Integration

---

**¿Preguntas?** Revisa los comentarios en el código o consulta la documentación de Angular Material y CDK.

