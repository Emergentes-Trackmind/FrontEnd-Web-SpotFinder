# 🚀 INICIO RÁPIDO - Sistema de Planes

## ⚠️ IMPORTANTE - PRIMER PASO

Si ya tenías el servidor mock corriendo, **debes reiniciarlo** para que cargue los nuevos cambios:

1. Presiona `Ctrl+C` en la terminal donde corre el servidor mock
2. Vuelve a ejecutar: `npm run mock:server`
3. Espera a que el servidor diga "JSON Server is running"
4. Recarga la página en el navegador

## ✅ ¿Qué se ha implementado?

Se ha creado un sistema completo de planes y suscripciones donde:
- Cada usuario tiene un campo `plan` que puede ser `'basic'` o `'premium'`
- Al registrarse, los usuarios automáticamente obtienen el plan básico
- Pueden cambiar de plan desde la página de Suscripciones
- Los cambios son inmediatos (sin pagos reales por ahora)

## 🎯 Para Probar el Sistema

### 1. Iniciar el Servidor Mock
```bash
npm run mock:server
```

### 2. Iniciar la Aplicación Angular
```bash
npm start
```

### 3. Probar en el Navegador
1. Abre `http://localhost:4200`
2. Registra un nuevo usuario (automáticamente tendrá plan básico)
3. Ve a la sección **"Suscripciones"** o **"Planes"** en el menú
4. Verás dos planes:
   - **Plan Básico** (€29/mes) - Tu plan actual
   - **Plan Avanzado** (€79/mes) - Marcado como "Popular"
5. Haz clic en **"Actualizar"** en el Plan Avanzado
6. Tu plan cambiará a Premium inmediatamente
7. Puedes hacer clic en **"Cancelar Suscripción"** para volver al plan básico

### 4. Probar con API (Opcional)
```bash
powershell -ExecutionPolicy Bypass -File test-billing.ps1
```

Este script prueba todos los endpoints automáticamente.

## 📋 Endpoints Disponibles

### GET /api/billing/me
Obtiene el plan actual del usuario autenticado
```json
{
  "userId": "123",
  "plan": {
    "id": "plan_basic",
    "name": "Plan Básico",
    "code": "BASIC",
    "price": 29,
    "currency": "EUR"
  },
  "status": "ACTIVE"
}
```

### GET /api/billing/plans
Lista todos los planes disponibles
```json
[
  {
    "id": "plan_basic",
    "name": "Plan Básico",
    "code": "BASIC",
    "price": 29,
    "features": ["Hasta 3 parkings", "Hasta 10 dispositivos IoT", ...]
  },
  {
    "id": "plan_advanced",
    "name": "Plan Avanzado",
    "code": "ADVANCED",
    "price": 79,
    "isPopular": true
  }
]
```

### POST /api/billing/subscribe
Cambia el plan del usuario
```json
// Request
{
  "planCode": "ADVANCED"
}

// Response
{
  "userId": "123",
  "plan": { ...plan avanzado... },
  "status": "ACTIVE"
}
```

### POST /api/billing/cancel
Cancela la suscripción (vuelve a plan básico)
```json
// Response
{
  "userId": "123",
  "plan": { ...plan básico... },
  "status": "ACTIVE"
}
```

## 🔍 Verificar que Todo Funciona

### 1. Verificar en la Base de Datos
Abre `server/db.json` y busca tu usuario. Deberías ver:
```json
{
  "id": "1234567890",
  "email": "test@example.com",
  "firstName": "Test",
  "plan": "basic"  // <-- Este campo debe existir
}
```

### 2. Verificar en la Consola del Navegador
Cuando cambias de plan, deberías ver en la consola:
```
🔄 Actualizando plan... { plan: 'Plan Avanzado', code: 'ADVANCED' }
✅ Plan actualizado exitosamente: {...}
```

### 3. Verificar en la Consola del Servidor
El servidor debe mostrar:
```
🔍 [Billing] GET /billing/me - userId: 1234567890
📦 [Billing] Planes encontrados: 2
✅ [Billing] Plan actualizado a: premium
```

## ❓ Solución de Problemas

### ⚠️ Error 404 en /api/billing/* (MUY IMPORTANTE)
✅ **Solución**: 
1. **REINICIA EL SERVIDOR MOCK** - Este es el error más común
2. Presiona `Ctrl+C` en la terminal del servidor
3. Ejecuta de nuevo: `npm run mock:server`
4. Espera a que diga "JSON Server is running"
5. Recarga la página en el navegador (F5)

El servidor necesita reiniciarse para cargar los cambios en `routes.json` y `billing.middleware.js`

### Error "No autorizado"
✅ **Solución**: Verifica que estés autenticado (token JWT válido)

### El plan no cambia
✅ **Solución**: 
1. Verifica que el servidor mock esté corriendo
2. Abre la consola del navegador y revisa los errores
3. Verifica que el middleware de billing esté cargado en package.json

### Los usuarios no tienen campo "plan"
✅ **Solución**: 
1. Cierra el servidor mock
2. Abre `server/db.json` y agrega `"plan": "basic"` a cada usuario
3. Reinicia el servidor mock

## 📚 Documentación Completa

Para más detalles, lee:
- `BILLING_IMPLEMENTATION_SUMMARY.md` - Documentación completa de la implementación
- `test-billing.ps1` - Script de prueba con ejemplos de todos los endpoints

## 🎉 ¡Listo!

El sistema de planes está completamente funcional. Los cambios son inmediatos y no requieren pagos reales. Cuando quieras integrar Stripe u otro procesador de pagos, solo tendrás que agregar la lógica de pago antes de actualizar el campo `plan` del usuario.

