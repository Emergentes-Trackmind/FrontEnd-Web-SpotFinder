# 🔧 Solución: Dispositivos IoT no se muestran en la lista

## 🐛 Problema

Los dispositivos IoT se creaban correctamente y los KPIs de planes los contabilizaban, pero **NO aparecían en la lista de dispositivos** en el dashboard de IoT.

### Síntomas:
- ✅ Dispositivo se crea exitosamente
- ✅ Los planes muestran "current: 1" para IoT
- ❌ La lista de dispositivos muestra "No se encontraron dispositivos"
- ❌ KPIs muestran "Total Dispositivos: 0"

## 🔍 Causa Raíz

El middleware `server/iot.middleware.js` filtraba los dispositivos IoT de esta forma:

```javascript
// ❌ ANTES (INCORRECTO)
let devices = db.get('iotDevices')
  .filter(d => parkingIds.includes(d.parkingId))  // Solo dispositivos con parkingId
  .value();
```

Esto significaba que **SOLO mostraba dispositivos que estaban asignados a un parking del usuario**.

### El Problema:
Cuando creas un dispositivo IoT nuevo:
1. Se puede crear sin `parkingId` (dispositivo "disponible")
2. O se crea para asignar después a un parking
3. **Pero el filtro solo buscaba por `parkingId`** → dispositivo invisible

## ✅ Solución Implementada

### 1. Agregar campo `ownerId` a los dispositivos

Cada dispositivo ahora tiene un campo `ownerId` que rastrea a quién pertenece:

```javascript
const newDevice = {
  id: `dev-${Date.now()}`,
  ownerId: decoded.userId,        // ← NUEVO: Propietario del dispositivo
  parkingId: parkingId || null,   // Puede ser null
  // ... resto de campos
};
```

### 2. Modificar filtros para incluir dispositivos del usuario

**GET /api/iot/devices:**
```javascript
// ✅ AHORA (CORRECTO)
let devices = db.get('iotDevices')
  .filter(d => {
    // Dispositivo pertenece al usuario directamente
    const belongsToUser = d.ownerId === decoded.userId || 
                         d.ownerId === decoded.userId.toString();
    // O está en un parking del usuario
    const belongsToUserParking = d.parkingId && parkingIds.includes(d.parkingId);
    
    return belongsToUser || belongsToUserParking;
  })
  .value();
```

**GET /api/iot/devices/kpis:**
```javascript
const userDevices = db.get('iotDevices')
  .filter(d => {
    const belongsToUser = d.ownerId === decoded.userId || 
                         d.ownerId === decoded.userId.toString();
    const belongsToUserParking = d.parkingId && parkingIds.includes(d.parkingId);
    return belongsToUser || belongsToUserParking;
  })
  .value();
```

### 3. `parkingId` ahora es opcional al crear

```javascript
// ❌ ANTES
if (!serialNumber || !model || !type || !parkingId) {
  return res.status(400).json({ error: 'parkingId requerido' });
}

// ✅ AHORA
if (!serialNumber || !model || !type) {
  return res.status(400).json({ error: '...' });
}
// parkingId es opcional
```

### 4. Verificación de permisos actualizada

Todos los endpoints (GET, PUT, DELETE) ahora verifican permisos por:
- `ownerId` (propietario directo) **O**
- `parkingId` (a través del parking)

```javascript
const deviceBelongsToUser = device.ownerId === decoded.userId || 
                           device.ownerId === decoded.userId.toString();

let hasPermission = deviceBelongsToUser;

if (!hasPermission && device.parkingId) {
  const parking = db.get('parkingProfiles').find({ id: device.parkingId }).value();
  hasPermission = parking && (parking.ownerId === decoded.userId || 
                              parking.ownerId === decoded.userId.toString());
}

if (!hasPermission) {
  return res.status(403).json({ error: 'Acceso denegado' });
}
```

## 📊 Flujo Completo Corregido

```
ANTES ❌:
──────────────────────────────────────────────────────────────
1. Usuario crea dispositivo IoT
   ↓
2. Se guarda con parkingId (o sin él)
   ↓
3. GET /api/iot/devices filtra solo por parkingId
   ↓
4. Si el dispositivo no tiene parkingId → NO APARECE
   ↓
5. Lista vacía aunque el dispositivo existe


AHORA ✅:
──────────────────────────────────────────────────────────────
1. Usuario crea dispositivo IoT
   ↓
2. Se guarda con ownerId + parkingId (opcional)
   ↓
3. GET /api/iot/devices filtra por:
   - ownerId (propietario directo) O
   - parkingId (a través del parking)
   ↓
4. Dispositivo SIEMPRE aparece si pertenece al usuario
   ↓
5. Lista muestra todos los dispositivos del usuario
```

## 🔧 Endpoints Modificados

### 1. GET /api/iot/devices
- ✅ Filtra por `ownerId` O `parkingId`
- ✅ Muestra dispositivos sin parking asignado
- ✅ Enriquece con `parkingName: 'Sin asignar'` si no tiene parking

### 2. GET /api/iot/devices/kpis
- ✅ Cuenta dispositivos por `ownerId` O `parkingId`
- ✅ KPIs reflejan todos los dispositivos del usuario

### 3. GET /api/iot/devices/:id
- ✅ Verifica permisos por `ownerId` O `parkingId`
- ✅ Permite ver dispositivos sin parking asignado

### 4. POST /api/iot/devices
- ✅ `parkingId` ahora es opcional
- ✅ Agrega `ownerId` automáticamente
- ✅ Permite crear dispositivos "disponibles"

### 5. PUT /api/iot/devices/:id
- ✅ Verifica permisos por `ownerId` O `parkingId`
- ✅ Permite editar dispositivos sin parking

### 6. DELETE /api/iot/devices/:id
- ✅ Verifica permisos por `ownerId` O `parkingId`
- ✅ Permite eliminar dispositivos sin parking

## 🎯 Casos de Uso Soportados

### Caso 1: Dispositivo sin parking asignado
```javascript
{
  id: "dev-123",
  ownerId: "user-1",      // ← Propietario
  parkingId: null,        // ← Sin parking
  serialNumber: "SN001",
  // ...
}
```
✅ **AHORA SE MUESTRA** en la lista del usuario

### Caso 2: Dispositivo asignado a parking
```javascript
{
  id: "dev-456",
  ownerId: "user-1",      // ← Propietario
  parkingId: "parking-1", // ← Asignado
  serialNumber: "SN002",
  // ...
}
```
✅ Se muestra por `ownerId` Y por `parkingId`

### Caso 3: Dispositivo heredado (sin ownerId)
```javascript
{
  id: "dev-789",
  ownerId: undefined,     // ← Dispositivo viejo
  parkingId: "parking-1", // ← Solo tiene parking
  serialNumber: "SN003",
  // ...
}
```
✅ Se muestra por `parkingId` (compatibilidad con datos antiguos)

## 📁 Archivo Modificado

**server/iot.middleware.js**

Cambios realizados:
- ✅ Línea ~85: Modificado GET /api/iot/devices (filtro por ownerId)
- ✅ Línea ~38: Modificado GET /api/iot/devices/kpis (filtro por ownerId)
- ✅ Línea ~160: Modificado GET /api/iot/devices/:id (permisos por ownerId)
- ✅ Línea ~210: Modificado POST /api/iot/devices (agregar ownerId)
- ✅ Línea ~295: Modificado PUT /api/iot/devices/:id (permisos por ownerId)
- ✅ Línea ~352: Modificado DELETE /api/iot/devices/:id (permisos por ownerId)

## ✅ Resultado

**ANTES ❌:**
- Dispositivos creados pero invisibles
- Lista vacía
- KPIs en 0
- Planes muestran conteo correcto pero lista no

**AHORA ✅:**
- ✅ Dispositivos creados se muestran inmediatamente
- ✅ Lista muestra todos los dispositivos del usuario
- ✅ KPIs reflejan correctamente el total
- ✅ Consistencia entre planes y lista de dispositivos
- ✅ Se pueden crear dispositivos sin parking asignado
- ✅ Se pueden ver/editar/eliminar todos los dispositivos propios

## 🧪 Cómo Verificar

1. Inicia el servidor:
   ```bash
   json-server --watch server/db.json --port 3001 ...
   ```

2. Crea un dispositivo IoT en la aplicación

3. Ve al Dashboard de IoT

4. Verifica:
   - ✅ KPIs muestran "Total Dispositivos: 1"
   - ✅ La tabla muestra el dispositivo creado
   - ✅ Los planes muestran "current: 1"
   - ✅ Todo está sincronizado

## 📝 Notas Técnicas

### Compatibilidad con datos antiguos
Los dispositivos creados antes de este cambio (sin `ownerId`) seguirán funcionando porque el filtro verifica **AMBOS** casos:
- Si tiene `ownerId` → verifica por ownerId
- Si solo tiene `parkingId` → verifica por parkingId

### Migración de datos (opcional)
Si quieres agregar `ownerId` a dispositivos existentes:
```javascript
// En la consola de Node o un script
db.get('iotDevices').value().forEach(device => {
  if (!device.ownerId && device.parkingId) {
    const parking = db.get('parkingProfiles').find({ id: device.parkingId }).value();
    if (parking) {
      db.get('iotDevices')
        .find({ id: device.id })
        .assign({ ownerId: parking.ownerId })
        .write();
    }
  }
});
```

## 🎉 Conclusión

El problema era una **desconexión entre la creación y la visualización** de dispositivos. La creación funcionaba correctamente, pero el filtro de visualización no estaba preparado para mostrar dispositivos que no tuvieran `parkingId`.

**La solución:** Agregar `ownerId` a cada dispositivo y modificar los filtros para buscar por propietario directo además de por parking.

Ahora la lista de dispositivos IoT está **completamente conectada** con el flujo de creación y los KPIs de planes.

