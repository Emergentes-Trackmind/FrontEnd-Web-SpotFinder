# 🔧 DEBUGGING: BOTÓN "AÑADIR DISPOSITIVO" DESHABILITADO

## ❌ Problema Reportado

El botón "Añadir Dispositivo" en la página de Dispositivos IoT está deshabilitado y el usuario sospecha que es por los límites del plan.

## 🔍 Análisis Realizado

### 1. Flujo de Habilitación del Botón

```typescript
// devices-dashboard.component.html
<button
  mat-raised-button
  color="primary"
  (click)="onAddDevice()"
  [disabled]="!canCreateDevice"
  [matTooltip]="addDeviceTooltip">
  <mat-icon>add</mat-icon>
  Añadir Dispositivo
</button>
```

El botón está controlado por:
- `[disabled]="!canCreateDevice"` - Se habilita cuando `canCreateDevice` es `true`

### 2. Propiedad `canCreateDevice`

```typescript
// devices-dashboard.component.ts
get canCreateDevice(): boolean {
  return this.limitsService.canCreateDevice();
}
```

Delega en `limitsService.canCreateDevice()`.

### 3. LimitsService

```typescript
// limits.service.ts
canCreateDevice(): boolean {
  return this.limitsInfo().iot.canCreate;
}

readonly limitsInfo = computed<LimitsInfo>(() => {
  const plan = this.currentPlan();
  const parkingsCount = this.currentParkingsCount();
  const iotCount = this.currentIotCount();

  if (!plan) {
    return {
      parkings: { current: parkingsCount, limit: 0, canCreate: false },
      iot: { current: iotCount, limit: 0, canCreate: false }
    };
  }

  return {
    parkings: {
      current: parkingsCount,
      limit: plan.parkingLimit,
      canCreate: parkingsCount < plan.parkingLimit
    },
    iot: {
      current: iotCount,
      limit: plan.iotLimit,
      canCreate: iotCount < plan.iotLimit  // ← AQUÍ SE DECIDE
    }
  };
});
```

**Condición para habilitar:** `iotCount < plan.iotLimit`

### 4. Posibles Causas del Problema

#### A) No hay plan cargado (`currentPlan()` es `null`)
```typescript
if (!plan) {
  return {
    iot: { current: iotCount, limit: 0, canCreate: false } // ← Botón deshabilitado
  };
}
```

**Síntomas:**
- `plan.iotLimit` sería `0`
- `canCreate` sería `false`
- Tooltip diría "Upgrade tu plan..."

#### B) Conteo IoT no inicializado correctamente
```typescript
// Si currentIotCount() no se actualizó:
iotCount === 0 (por defecto)
plan.iotLimit === 10 (plan Básico)
canCreate = 0 < 10 = true ✅  // Debería funcionar
```

#### C) Plan no tiene `iotLimit` definido
```json
// Si el plan en db.json no tiene iotLimit:
{
  "name": "Básico",
  "parkingLimit": 3,
  // iotLimit: undefined ❌
}
```

#### D) Orden de ejecución asíncrono
```typescript
// ngOnInit():
1. loadData() → loadDevices() → updateIotCount(total)
2. limitsService.load() → carga plan

// Si (1) se completa antes que (2):
// currentPlan() aún es null → canCreate = false
```

## 🔧 Solución Implementada

### 1. Logs de Debugging Agregados

#### En `devices-dashboard.component.ts`:
```typescript
ngOnInit(): void {
  this.loadData();

  console.log('🔄 [DevicesDashboard] Cargando límites...');
  this.limitsService.load().subscribe({
    next: () => {
      console.log('✅ [DevicesDashboard] Límites cargados:', {
        canCreate: this.canCreateDevice,
        limitsInfo: this.limitsService.limitsInfo(),
        tooltip: this.addDeviceTooltip
      });
    },
    error: (error) => {
      console.error('❌ [DevicesDashboard] Error cargando límites:', error);
    }
  });
}

loadData(): void {
  this.facade.loadDevices().subscribe({
    next: (paginatedDevices) => {
      console.log('📊 [DevicesDashboard] Dispositivos cargados:', {
        total: paginatedDevices.total,
        data: paginatedDevices.data.length
      });
      this.limitsService.updateIotCount(paginatedDevices.total);
      console.log('✅ [DevicesDashboard] Conteo IoT actualizado. Nuevo estado:', {
        canCreate: this.canCreateDevice,
        limitsInfo: this.limitsService.limitsInfo()
      });
    }
  });
}
```

#### En `limits.service.ts`:
```typescript
updateIotCount(count: number) {
  console.log('🔢 [LimitsService] Actualizando conteo IoT:', {
    anterior: this.currentIotCount(),
    nuevo: count
  });
  this.currentIotCount.set(count);
  console.log('✅ [LimitsService] Conteo IoT actualizado. Límites actuales:', this.limitsInfo());
}

readonly limitsInfo = computed<LimitsInfo>(() => {
  const plan = this.currentPlan();
  const parkingsCount = this.currentParkingsCount();
  const iotCount = this.currentIotCount();

  console.log('🧮 [LimitsService] Calculando limitsInfo:', {
    plan: plan?.name,
    parkingLimit: plan?.parkingLimit,
    iotLimit: plan?.iotLimit,
    parkingsCount,
    iotCount
  });

  if (!plan) {
    console.warn('⚠️ [LimitsService] No hay plan activo - límites en 0');
    return {
      parkings: { current: parkingsCount, limit: 0, canCreate: false },
      iot: { current: iotCount, limit: 0, canCreate: false }
    };
  }

  const result = {
    parkings: {
      current: parkingsCount,
      limit: plan.parkingLimit,
      canCreate: parkingsCount < plan.parkingLimit
    },
    iot: {
      current: iotCount,
      limit: plan.iotLimit,
      canCreate: iotCount < plan.iotLimit
    }
  };

  console.log('✅ [LimitsService] Límites calculados:', result);
  return result;
});
```

## 📋 Checklist de Verificación (Para el Usuario)

### Paso 1: Abrir la Consola del Navegador
1. F12 o Click derecho → Inspeccionar
2. Ir a la pestaña "Console"
3. Navegar a la página "Dispositivos IoT"
4. Buscar los logs que empiezan con 🔄, 📊, 🔢, 🧮

### Paso 2: Verificar en los Logs

#### ✅ Escenario Correcto (Botón debe estar habilitado):
```javascript
🔄 [DevicesDashboard] Cargando límites...
📊 [DevicesDashboard] Dispositivos cargados: { total: 0, data: 0 }
🔢 [LimitsService] Actualizando conteo IoT: { anterior: 0, nuevo: 0 }
🧮 [LimitsService] Calculando limitsInfo: {
  plan: "Básico",
  parkingLimit: 3,
  iotLimit: 10,  // ← Debe existir
  parkingsCount: 0,
  iotCount: 0
}
✅ [LimitsService] Límites calculados: {
  iot: {
    current: 0,
    limit: 10,
    canCreate: true  // ← Debe ser true
  }
}
✅ [DevicesDashboard] Límites cargados: {
  canCreate: true,  // ← Debe ser true
  tooltip: "Añadir un nuevo dispositivo IoT"
}
```

#### ❌ Escenario Incorrecto (Botón deshabilitado):

**Opción A - No hay plan:**
```javascript
⚠️ [LimitsService] No hay plan activo - límites en 0
✅ [LimitsService] Límites calculados: {
  iot: {
    current: 0,
    limit: 0,  // ← Límite en 0
    canCreate: false  // ← Por eso está deshabilitado
  }
}
```
**Solución:** Asegurarse de que el usuario tenga un plan asignado en `/api/billing/me`

**Opción B - Plan sin iotLimit:**
```javascript
🧮 [LimitsService] Calculando limitsInfo: {
  plan: "Básico",
  parkingLimit: 3,
  iotLimit: undefined,  // ← Falta definir
  parkingsCount: 0,
  iotCount: 0
}
```
**Solución:** Agregar `iotLimit` al plan en `server/db.json`

**Opción C - Límite alcanzado:**
```javascript
✅ [LimitsService] Límites calculados: {
  iot: {
    current: 10,  // ← Ya tiene 10 dispositivos
    limit: 10,
    canCreate: false  // ← Límite alcanzado
  }
}
```
**Solución:** Eliminar dispositivos o hacer upgrade del plan

## 🔧 Posibles Soluciones según el Diagnóstico

### Si el problema es: "No hay plan activo"

#### Verificar en db.json:
```json
{
  "subscriptions": [
    {
      "id": "sub-1",
      "userId": "1",  // ← Debe coincidir con el userId del token
      "planCode": "BASIC",
      "status": "active"
    }
  ]
}
```

#### Verificar endpoint `/api/billing/me`:
```bash
# En el navegador o Postman:
GET http://localhost:3001/api/billing/me
Authorization: Bearer {tu-token}

# Debe retornar:
{
  "subscription": {
    "id": "sub-1",
    "status": "active",
    "currentPlan": {
      "code": "BASIC",
      "name": "Básico",
      "parkingLimit": 3,
      "iotLimit": 10  // ← Debe existir
    }
  }
}
```

### Si el problema es: "Plan sin iotLimit"

Verificar que TODOS los planes en `server/db.json` tengan `iotLimit`:

```json
{
  "plans": [
    {
      "id": "plan-basic",
      "code": "BASIC",
      "name": "Básico",
      "parkingLimit": 3,
      "iotLimit": 10  // ← Agregar si falta
    },
    {
      "id": "plan-advanced",
      "code": "ADVANCED",
      "name": "Avanzado",
      "parkingLimit": 10,
      "iotLimit": 50  // ← Agregar si falta
    }
  ]
}
```

### Si el problema es: "Límite alcanzado"

El usuario ya tiene el máximo de dispositivos permitidos por su plan:
- Plan Básico: 10 dispositivos
- Plan Avanzado: 50 dispositivos

**Opciones:**
1. Eliminar dispositivos no usados
2. Hacer upgrade del plan a "Avanzado"

## 📝 Próximos Pasos

1. **Recargar la página de Dispositivos IoT**
2. **Abrir la consola del navegador** (F12)
3. **Buscar los logs** que empiezan con 🔄, 📊, 🔢, 🧮
4. **Copiar y enviar los logs** para diagnóstico preciso

## 🎯 Verificación Rápida

Para una verificación rápida sin logs, ejecutar en la consola del navegador:

```javascript
// Copiar y pegar esto en la consola:
const limitsService = window['ng'].getAllComponents()[0]?.injector?.get('LimitsService');
if (limitsService) {
  const info = limitsService.limitsInfo();
  console.log('🔍 Diagnóstico rápido:', {
    plan: limitsService.currentPlan(),
    limitsInfo: info,
    canCreateDevice: info.iot.canCreate,
    botónDebería: info.iot.canCreate ? 'ESTAR HABILITADO ✅' : 'ESTAR DESHABILITADO ❌'
  });
}
```

## 📊 Resumen de Archivos Modificados

### Frontend:
- ✅ `src/app/iot/presentation/pages/devices-dashboard/devices-dashboard.component.ts` - Logs agregados
- ✅ `src/app/billing/services/limits.service.ts` - Logs agregados

### Logs Agregados:
- 🔄 Cargando límites
- 📊 Dispositivos cargados
- 🔢 Actualizando conteo IoT
- 🧮 Calculando limitsInfo
- ✅ Estados finales
- ⚠️ Advertencias si no hay plan

**¡Los logs están listos para diagnosticar el problema!** 🔍

Ahora solo necesitas:
1. Recargar la página
2. Abrir consola (F12)
3. Ver qué dicen los logs
4. Compartir los logs para diagnóstico final

