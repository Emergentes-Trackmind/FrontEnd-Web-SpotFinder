# Instrucciones de Uso - API & Servicios

## 🚀 Cómo ejecutar la aplicación

### Opción 1: Solo API Fake (JSON Server)
```bash
npm run mock:server
```
Esto iniciará JSON Server en `http://localhost:3001`

### Opción 2: Aplicación + API Fake simultáneamente
```bash
npm run dev
```
Esto iniciará tanto Angular (`http://localhost:4200`) como JSON Server (`http://localhost:3001`)

### Opción 3: Solo Angular (para usar API real)
1. Cambiar en `environment.ts`: `useMockApi: false`
2. Ejecutar: `npm start`

## 📁 Archivos Generados

### Environments
- `src/environments/environment.development.ts` - Configuración de desarrollo
- `src/environments/environment.ts` - Configuración de producción

### Interceptores HTTP
- `src/app/core/http/api-prefix.interceptor.ts` - Prepende apiBase y headers
- `src/app/core/http/http-error.interceptor.ts` - Manejo centralizado de errores

### Servicios
- `src/app/profileparking/services/parking-profile.service.ts` - CRUD principal
- `src/app/profileparking/services/analytics.service.ts` - Métricas y analytics
- `src/app/profileparking/services/types.ts` - DTOs y tipos
- `src/app/profileparking/services/mappers.ts` - Mappers y defaults

### API Fake
- `server/db.json` - Datos de prueba con 3 perfiles
- `server/routes.json` - Configuración de rutas
- Scripts en `package.json` para ejecutar JSON Server

### Tests
- `src/app/profileparking/services/parking-profile.service.spec.ts` - Tests básicos

### Documentación
- `design.md` - Documentación completa de endpoints

## 🔧 Configuración por Environment

### Development (useMockApi: true)
- API Base: `http://localhost:3001/api`
- Logs HTTP: Activados
- JSON Server: Puerto 3001

### Production (useMockApi: false)
- API Base: `https://api.spotfinder.com/api`
- Logs HTTP: Desactivados
- API Real: Configurada

## 💾 Datos de Prueba Incluidos

El `db.json` incluye 3 perfiles de ejemplo:

1. **"Parking Centro Comercial"** - Datos completos con analytics
2. **"Parking Plaza Mayor"** - Datos parciales
3. **"Parking Residencial Norte"** - Datos vacíos (para probar defaults)

## 🔄 Cómo los Servicios Manejan Defaults

### ProfileParking
- strings vacíos → `''`
- números faltantes → `0`
- enum no válido → `ParkingType.Comercial`

### Analytics
- KPIs faltantes → `0`
- Trends faltantes → `0`
- hourlyOccupancy vacío → array con 9 elementos en 0%
- recentActivity vacío → `[]`

### Ubicación, Precios, Características
- Todos los campos tienen defaults seguros
- Los mappers aplican sanitización automática

## 📝 Ejemplos de Uso en Componentes

### Cargar y mostrar perfil
```typescript
ngOnInit() {
  this.parkingService.getProfileById('1').subscribe(profile => {
    // Los defaults ya están aplicados
    this.form.patchValue(profile);
  });
}
```

### Actualizar sección específica
```typescript
onSave() {
  const locationData = this.locationForm.value;
  this.parkingService.updateLocation('1', locationData).subscribe(
    updated => console.log('Ubicación actualizada:', updated)
  );
}
```

### Cargar analytics
```typescript
ngOnInit() {
  this.analyticsService.getProfileAnalytics('1').subscribe(data => {
    // Si no hay datos, se devuelven valores por defecto
    this.kpis = data.kpis;
    this.charts = data.hourlyOccupation;
  });
}
```

## 🎛️ Feature Flags Disponibles

### `useMockApi`
- `true`: Usa JSON Server local
- `false`: Usa API real configurada en `apiBase`

### `logHttp`
- `true`: Logs detallados de todas las requests HTTP
- `false`: Sin logs (recomendado para producción)

### `enableOfflineMode`
- `true`: Cache más agresiva y fallbacks offline
- `false`: Cache normal

## 🧪 Ejecutar Tests

```bash
npm test
```

Los tests cubren:
- Mapeo de datos API → UI
- Aplicación de defaults
- Cache management
- Manejo de errores 404

## 🔧 Instalación de Dependencias Faltantes

Si necesitas instalar JSON Server:
```bash
npm install --save-dev json-server concurrently
```

## ⚠️ Notas Importantes

1. **Cache**: Los servicios implementan cache inteligente que se limpia automáticamente al actualizar datos
2. **Errors**: Todos los errores HTTP se manejan centralmente y muestran mensajes legibles
3. **Defaults**: NUNCA verás `null` o `undefined` en la UI - todo tiene defaults seguros
4. **TypeScript**: Tipado estricto en toda la cadena API → Service → Component

## 🔄 Switching entre Mock y Real API

1. Cambiar `useMockApi` en `environment.ts`
2. Ajustar `apiBase` para apuntar a tu API real
3. La estructura de datos debe coincidir con los DTOs definidos
