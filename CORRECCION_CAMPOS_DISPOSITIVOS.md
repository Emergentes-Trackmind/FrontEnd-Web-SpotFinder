# 🔧 Corrección: Compatibilidad de Campos en Dispositivos IoT

## 🐛 Problema

Los dispositivos se creaban correctamente pero **no se mostraban en la tabla** porque había una discrepancia entre los campos:

### Datos del Servidor:
```json
{
  "name": "PlazaNorte",           // ← Campo usado en el formulario
  "serialNumber": "sn45323",
  "status": "available",           // ← Status usado al crear
  "parkingId": null,
  "parkingName": undefined         // ← Faltaba este campo
}
```

### Lo que Esperaba la Tabla:
```typescript
device.model       // ← Buscaba 'model' pero llegaba 'name'
device.status      // ← 'available' no tenía estilos
device.parkingName // ← Esperaba string, llegaba undefined
```

## ✅ Solución Implementada

### 1. Frontend: Tabla Más Flexible

**device-table.component.ts:**

#### A. Manejo de model/name:
```typescript
// Ahora acepta ambos campos
<strong>{{ device.model || device.name || 'Sin nombre' }}</strong>
```

#### B. Normalización de Status:
```typescript
getNormalizedStatus(status: string): string {
  // Convertir 'available' a 'offline' para compatibilidad con estilos
  if (status === 'available') return 'offline';
  return status;
}

getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    online: 'Online',
    offline: 'Offline',
    available: 'Disponible',    // ← NUEVO
    maintenance: 'Mantenimiento'
  };
  return labels[status] || status;
}
```

#### C. Estilos para 'available':
```css
.status-available {
  background-color: #e0e7ff;
  color: #3730a3;

  .status-dot {
    background-color: #6366f1;
  }
}
```

### 2. Backend: Normalización de Datos

**server/iot.middleware.js:**

```javascript
// Enriquecer con datos relacionados y normalizar campos
devices = devices.map(device => {
  const parking = userParkings.find(p => p.id === device.parkingId);
  const spot = device.parkingSpotId
    ? db.get('parkingSpots').find({ id: device.parkingSpotId }).value()
    : null;

  return {
    ...device,
    // 🔧 Normalizar: Si tiene 'name' pero no 'model', copiar a model
    model: device.model || device.name || 'Sin modelo',
    // Agregar parkingName siempre (incluso si es null)
    parkingName: parking?.name || 'Sin asignar',
    parkingSpotLabel: spot?.label || null,
    // Normalizar lastCheckIn
    lastCheckIn: device.lastCheckIn || device.lastSeen || new Date().toISOString()
  };
});
```

#### Búsqueda Flexible:
```javascript
if (q) {
  const query = q.toLowerCase();
  devices = devices.filter(d => {
    const model = (d.model || d.name || '').toLowerCase();
    const serial = (d.serialNumber || '').toLowerCase();
    return model.includes(query) || serial.includes(query);
  });
}
```

## 📊 Antes vs Ahora

### ANTES ❌:
```
Servidor devuelve:
{
  name: "PlazaNorte",
  status: "available",
  parkingName: undefined
}

Tabla busca:
device.model        → undefined → NO SE MUESTRA
device.parkingName  → undefined → Error
status-available    → No tiene estilos → Se ve mal
```

### AHORA ✅:
```
Servidor normaliza y devuelve:
{
  name: "PlazaNorte",
  model: "PlazaNorte",      ← Copiado de name
  status: "available",
  parkingName: "Sin asignar" ← Siempre presente
}

Tabla maneja:
device.model || device.name  → "PlazaNorte" ✅
device.parkingName           → "Sin asignar" ✅
status-available             → Estilos correctos ✅
```

## 🎯 Campos Normalizados

| Campo Original | Campo Normalizado | Valor por Defecto |
|----------------|-------------------|-------------------|
| `name` | `model` | 'Sin modelo' |
| `lastSeen` | `lastCheckIn` | Fecha actual |
| `parkingName` (null) | `parkingName` | 'Sin asignar' |
| `status` (available) | `status` | Mantiene 'available' |

## 🔄 Compatibilidad

Esta solución es **totalmente compatible** con:

✅ **Dispositivos nuevos** (con campo 'name')
✅ **Dispositivos viejos** (con campo 'model')
✅ **Dispositivos sin parking** (parkingId null)
✅ **Dispositivos con parking** (parkingId asignado)
✅ **Todos los status** (online, offline, available, maintenance)

## 📁 Archivos Modificados

1. **device-table.component.ts**
   - Columna dispositivo: `device.model || device.name`
   - Método `getNormalizedStatus()`
   - Método `getStatusLabel()` actualizado
   - Estilos para `.status-available`

2. **server/iot.middleware.js**
   - Normalización en el map de devices
   - Búsqueda flexible con name o model
   - parkingName siempre presente

## 🧪 Verificación

1. Reinicia el servidor y la aplicación
2. Ve al Dashboard de IoT
3. Los dispositivos deben mostrarse:
   - ✅ Columna "Dispositivo" muestra el nombre
   - ✅ Columna "Parking" muestra "Sin asignar"
   - ✅ Columna "Estado" muestra "Disponible" con color morado
   - ✅ Todas las columnas visibles

## ✅ Estado

**Problema:** RESUELTO ✅

La tabla ahora es **flexible y compatible** con ambos formatos de datos:
- Dispositivos con campo `name` (del formulario)
- Dispositivos con campo `model` (del sistema antiguo)
- Dispositivos con cualquier combinación de campos

**El servidor normaliza los datos** para que la tabla siempre reciba la estructura correcta.

