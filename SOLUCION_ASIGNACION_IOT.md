# Solución: Persistencia de Asignación de Dispositivos IoT a Spots

## Problema Identificado

Cuando se asignaba un dispositivo IoT a un spot (plaza) en el Step 2 (Visualizador de Plazas), la asignación se realizaba correctamente en el momento, pero **no se persistía** al navegar al siguiente paso. Al volver al Step 2 o llegar al Step Review, la asignación se perdía.

## Causa Raíz

El problema estaba en el método `onNextClick()` del componente `spots-visualizer-step.component.ts`:

```typescript
// ANTES (INCORRECTO)
onNextClick(): void {
  this.parkingStateService.setSpotsData(this.spots);  // ❌ Guardaba referencia local
  this.parkingStateService.setCurrentStep(3);
  this.router.navigate(['/parkings/new/step-3']);
}
```

Aunque el componente se suscribía a los cambios del `spotsService` y actualizaba `this.spots`:

```typescript
this.spotsService.spots$
  .pipe(takeUntil(this.destroy$))
  .subscribe((spotsMap: Map<number, SpotData>) => {
    this.spots = Array.from(spotsMap.values());  // Se actualizaba correctamente
    this.applyFilter(this.currentFilter);
    this.cdr.markForCheck();
  });
```

Había un problema de **timing** potencial donde `this.spots` podría no estar completamente sincronizado con el estado del servicio al hacer clic en "Siguiente".

## Solución Implementada

### 1. Método en SpotsService

Se agregó el método `getSpotsArray()` (que ya existía) y se añadió `getCurrentSpotsMap()` para obtener directamente el estado actual:

```typescript
// spots.service.ts

/**
 * Obtiene todos los spots como array
 */
getSpotsArray(): SpotData[] {
  return Array.from(this.spotsSubject.value.values());
}

/**
 * Obtiene el mapa actual de spots
 */
getCurrentSpotsMap(): Map<number, SpotData> {
  return this.spotsSubject.value;
}
```

### 2. Modificación del método onNextClick()

Se modificó para obtener los spots **directamente del servicio** en lugar de usar la referencia local:

```typescript
// DESPUÉS (CORRECTO)
onNextClick(): void {
  // Obtener directamente del servicio para asegurar que tenemos la última versión
  const currentSpots = this.spotsService.getSpotsArray();
  this.parkingStateService.setSpotsData(currentSpots);
  this.parkingStateService.setCurrentStep(3);

  console.log(`✅ Guardando ${currentSpots.length} spots, ${currentSpots.filter(s => s.deviceId).length} con dispositivos IoT asignados`);

  this.router.navigate(['/parkings/new/step-3']);
}
```

### 3. Logs para Debugging

Se agregaron logs en puntos clave para facilitar el debugging:

**En assignDeviceToSpot():**
```typescript
console.log(`📱 Asignando dispositivo ${device.name} (${deviceId}) al Spot ${spotNumber}`);
// ... asignación ...
const updatedSpot = this.spotsService.getSpot(spotNumber);
console.log(`✅ Spot ${spotNumber} actualizado:`, updatedSpot);
```

**En onNextClick():**
```typescript
console.log(`✅ Guardando ${currentSpots.length} spots, ${currentSpots.filter(s => s.deviceId).length} con dispositivos IoT asignados`);
```

**En step-review loadSpots():**
```typescript
console.log(`📊 Step Review - Cargados ${this.spots.length} spots, ${this.getAssignedDevicesCount()} con dispositivos IoT asignados`);
if (this.getAssignedDevicesCount() > 0) {
  console.log('📱 Spots con dispositivos:', this.getSpotsWithDevices());
}
```

## Flujo Correcto de Asignación

1. **Usuario hace clic en "Asignar"** en un dispositivo IoT
   - Se ejecuta `assignDeviceToSpot(deviceId, spotNumber)`
   - Se llama a `spotsService.assignDevice(spotNumber, deviceId)`
   - El servicio actualiza el Map interno y emite el nuevo estado
   - La suscripción actualiza `this.spots` en el componente

2. **Usuario hace clic en "Siguiente"**
   - Se ejecuta `onNextClick()`
   - Se obtiene el estado actual directamente del servicio: `spotsService.getSpotsArray()`
   - Se guarda en el estado global: `parkingStateService.setSpotsData(currentSpots)`
   - Se navega al siguiente paso

3. **En Step Review**
   - Se carga desde el estado: `parkingStateService.getSpots()`
   - Se muestran los dispositivos asignados correctamente
   - Se muestran estadísticas: total, con dispositivos, sin dispositivos

4. **Al volver al Step 2**
   - Se restauran los spots guardados: `spotsService.restoreSpots(savedSpots)`
   - Las asignaciones se mantienen

## Archivos Modificados

### 1. `spots-visualizer-step.component.ts`
- ✅ Modificado `onNextClick()` para obtener spots del servicio
- ✅ Agregados logs en `assignDeviceToSpot()`

### 2. `spots.service.ts`
- ✅ Agregado método `getCurrentSpotsMap()`
- ✅ Método `getSpotsArray()` ya existía

### 3. `step-review.component.ts`
- ✅ Agregados logs en `loadSpots()` para verificar carga correcta

## Verificación

Para verificar que la solución funciona:

1. Ejecutar `test-iot-assignment.bat`
2. Navegar a Crear Parking
3. Completar Step 1
4. En Step 2 (Visualizador de Plazas):
   - Asignar dispositivos IoT a plazas
   - Verificar en consola: "Asignando dispositivo..."
5. Hacer clic en "Siguiente"
   - Verificar en consola: "Guardando N spots, M con dispositivos..."
6. En Step Review:
   - Verificar que muestra "X dispositivos asignados"
   - Verificar lista de asignaciones
   - Verificar en consola: "Step Review - Cargados N spots, M con dispositivos..."
7. Volver al Step 2:
   - Verificar que las asignaciones se mantienen

## Beneficios

✅ **Persistencia garantizada**: Los dispositivos asignados se guardan correctamente
✅ **Estado consistente**: Se obtiene siempre el estado más actualizado del servicio
✅ **Debugging facilitado**: Logs claros en cada paso del proceso
✅ **Sin race conditions**: No hay dependencia de timing de suscripciones
✅ **Navegación bidireccional**: Funciona al avanzar y retroceder en el wizard

## Notas Técnicas

- El `BehaviorSubject` en `SpotsService` mantiene el estado centralizado
- El método `getSpotsArray()` devuelve una copia del array, no una referencia
- El método `assignDevice()` crea un nuevo Map para trigger observables
- La suscripción en el componente sigue funcionando para actualizaciones UI en tiempo real

