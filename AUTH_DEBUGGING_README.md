# 🔍 Guía de Depuración - Auth Interceptor y Endpoints

## 📋 Resumen de Problemas Encontrados y Solucionados

### Problemas Detectados:
1. **AuthInterceptor no incluía `/auth/refresh`** en rutas públicas → causaba loops infinitos
2. **Duplicación de `/api` en URLs** → `environment` usaba URLs absolutas con `/api` cuando `ApiPrefixInterceptor` ya lo agregaba
3. **Falta de método `getUserIdFromToken()`** → no se podía extraer el userId del JWT
4. **URLs hardcodeadas** en servicios → no usaban rutas relativas
5. **Rutas públicas mal definidas** → usaba `.includes()` en lugar de regex, causando falsos positivos

### Soluciones Implementadas:

✅ **AuthInterceptor corregido**
- Agregado `/auth/refresh` a lista de rutas públicas
- Cambiado de `.includes()` a regex para matching robusto
- Mejorado logging para debugging
- Agregado método `getAccessToken()` en AuthService

✅ **Decodificación JWT**
- Agregado `getUserIdFromToken()` en AuthService
- Decodifica claims `sub` o `userId` del token
- Solo lectura, NO validación (se hace en backend)

✅ **Environments normalizados**
- Cambiadas URLs absolutas a rutas relativas:
  - ❌ `http://localhost:3001/api/profile` 
  - ✅ `/profile`
- El `ApiPrefixInterceptor` agrega `apiBase` automáticamente

✅ **Servicios actualizados**
- `AnalyticsService` del profileparking usa rutas relativas
- `DebugProfileComponent` usa rutas relativas

---

## 🗺️ Matriz de Rutas: Públicas vs Protegidas

| Ruta Original | Ruta Final (con ApiPrefixInterceptor) | ¿Requiere Token? | Interceptor Adjunta Token |
|--------------|--------------------------------------|------------------|---------------------------|
| `/auth/login` | `http://localhost:3001/api/auth/login` | ❌ NO | ❌ NO (pública) |
| `/auth/register` | `http://localhost:3001/api/auth/register` | ❌ NO | ❌ NO (pública) |
| `/auth/refresh` | `http://localhost:3001/api/auth/refresh` | ❌ NO | ❌ NO (pública) |
| `/auth/forgot-password` | `http://localhost:3001/api/auth/forgot-password` | ❌ NO | ❌ NO (pública) |
| `/auth/reset-password` | `http://localhost:3001/api/auth/reset-password` | ❌ NO | ❌ NO (pública) |
| `/profile` | `http://localhost:3001/api/profile` | ✅ SÍ | ✅ SÍ (protegida) |
| `/analytics/totals` | `http://localhost:3001/api/analytics/totals` | ✅ SÍ | ✅ SÍ (protegida) |
| `/analytics/revenue` | `http://localhost:3001/api/analytics/revenue` | ✅ SÍ | ✅ SÍ (protegida) |
| `/analytics/occupancy` | `http://localhost:3001/api/analytics/occupancy` | ✅ SÍ | ✅ SÍ (protegida) |
| `/analytics/activity` | `http://localhost:3001/api/analytics/activity` | ✅ SÍ | ✅ SÍ (protegida) |
| `/analytics/top-parkings` | `http://localhost:3001/api/analytics/top-parkings` | ✅ SÍ | ✅ SÍ (protegida) |
| `/reservations` | `http://localhost:3001/api/reservations` | ✅ SÍ | ✅ SÍ (protegida) |
| `/parkingProfiles` | `http://localhost:3001/api/parkingProfiles` | ✅ SÍ | ✅ SÍ (protegida) |

---

## 🧪 Pruebas Manuales

### Pre-requisitos
1. Backend corriendo en `http://localhost:3001`
2. Tener un usuario registrado
3. Tener un token válido

### Obtener un Token de Prueba

```bash
# 1. Login para obtener token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Respuesta esperada (200):
{
  "user": { ... },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600
}

# ⚠️ Guardar el accessToken para las siguientes pruebas
```

### Prueba 1: Rutas Públicas (NO deben requerir token)

```bash
# Login - debe responder 200/401 según credenciales, NO 403
curl -i -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "wrong"}'

# Resultado esperado: 401 Unauthorized (credenciales incorrectas)
# ❌ NO debe ser 403 Forbidden

# Register - debe responder 201/400, NO 403
curl -i -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Resultado esperado: 201 Created o 400 Bad Request
```

### Prueba 2: Rutas Protegidas SIN Token (deben fallar con 401)

```bash
# Analytics totals sin token - debe responder 401
curl -i http://localhost:3001/api/analytics/totals

# Resultado esperado: 401 Unauthorized
# ❌ NO debe ser 404 Not Found

# Profile sin token - debe responder 401
curl -i http://localhost:3001/api/profile

# Resultado esperado: 401 Unauthorized
```

### Prueba 3: Rutas Protegidas CON Token (deben funcionar)

```bash
# Reemplaza <TOKEN> con el accessToken obtenido en el login

# Analytics totals con token - debe responder 200
curl -i http://localhost:3001/api/analytics/totals \
  -H "Authorization: Bearer <TOKEN>"

# Resultado esperado: 200 OK con datos JSON

# Analytics revenue con token
curl -i http://localhost:3001/api/analytics/revenue \
  -H "Authorization: Bearer <TOKEN>"

# Resultado esperado: 200 OK

# Analytics occupancy con token
curl -i http://localhost:3001/api/analytics/occupancy \
  -H "Authorization: Bearer <TOKEN>"

# Resultado esperado: 200 OK

# Analytics activity con token
curl -i http://localhost:3001/api/analytics/activity \
  -H "Authorization: Bearer <TOKEN>"

# Resultado esperado: 200 OK

# Analytics top-parkings con token
curl -i http://localhost:3001/api/analytics/top-parkings \
  -H "Authorization: Bearer <TOKEN>"

# Resultado esperado: 200 OK

# Profile con token
curl -i http://localhost:3001/api/profile \
  -H "Authorization: Bearer <TOKEN>"

# Resultado esperado: 200 OK con datos del usuario
```

### Prueba 4: Refresh Token

```bash
# Reemplaza <REFRESH_TOKEN> con el refreshToken obtenido en el login

curl -i -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "<REFRESH_TOKEN>"}'

# Resultado esperado: 200 OK con nuevo accessToken
```

---

## 🔍 Verificación en Frontend (Angular)

### Verificar Interceptor en Consola del Navegador

1. Abrir DevTools (F12)
2. Ir a Console
3. Hacer login
4. Navegar a Dashboard
5. Buscar logs del interceptor:

**Logs esperados para rutas públicas:**
```
🔍 AuthInterceptor: {
  url: "http://localhost:3001/api/auth/login",
  method: "POST",
  hasToken: false,
  isPublicRoute: true,
  willAddToken: false
}
⚪ Ruta pública, no se agrega token: http://localhost:3001/api/auth/login
```

**Logs esperados para rutas protegidas:**
```
🔍 AuthInterceptor: {
  url: "http://localhost:3001/api/analytics/totals",
  method: "GET",
  hasToken: true,
  isPublicRoute: false,
  willAddToken: true
}
✅ Agregando token Bearer a la petición: http://localhost:3001/api/analytics/totals
```

### Verificar Network Tab

1. Abrir DevTools → Network
2. Filtrar por `analytics`
3. Click en request de `totals`
4. Verificar Headers:
   - ✅ `Authorization: Bearer eyJhbGci...`
   - ✅ `Content-Type: application/json`
5. Verificar Response:
   - ✅ Status: 200 OK
   - ✅ Body con datos JSON

---

## 🐛 Debugging: Casos Comunes de Error

### Error: 401 en rutas protegidas a pesar de tener token

**Síntomas:**
- Console muestra: `✅ Agregando token Bearer a la petición`
- Pero respuesta es 401

**Posibles causas:**
1. Token expirado → verificar claim `exp` del JWT
2. Token inválido → verificar firma en backend
3. Backend no reconoce el header → verificar CORS

**Solución:**
```bash
# Decodificar token para ver claims (en https://jwt.io)
# Verificar:
# - exp (expiración) > timestamp actual
# - sub o userId existe
# - roles correctos
```

### Error: 404 en `/api/profile` o `/api/analytics/*`

**Síntomas:**
- Request llega al backend
- Respuesta 404 Not Found

**Posibles causas:**
1. Backend no tiene el endpoint mapeado
2. Mapping incorrecto en controller
3. Duplicación de `/api` en URL

**Solución en Backend (Spring Boot):**
```java
@RestController
@RequestMapping("/api") // ← Prefijo base
public class AnalyticsController {
    
    @GetMapping("/analytics/totals") // ← Ruta completa: /api/analytics/totals
    public ResponseEntity<TotalsKpiDTO> getTotals() {
        // ...
    }
}

// ⚠️ NO uses:
@RequestMapping("/api/analytics") // Duplicado
@GetMapping("/totals") // Esto generaría /api/analytics/totals
```

### Error: No se agrega token a rutas protegidas

**Síntomas:**
- Console muestra: `⚠️ No se agrega token: token no disponible`
- Usuario está logueado

**Solución:**
```javascript
// En console del navegador:
localStorage.getItem('auth_token') // Debe retornar el token
// Si es null → problema en login/storage
```

### Error: Loop infinito en refresh token

**Síntomas:**
- Console muestra múltiples: `🔄 Token expirado, intentando refresh...`
- App se congela

**Causa:**
- `/auth/refresh` no está en lista de rutas públicas

**Verificar:**
```typescript
// auth.interceptor.ts
private readonly publicRoutes = [
  /\/auth\/refresh$/, // ← Debe estar presente
  // ...
];
```

---

## 📊 Checklist de Verificación Pre-Deploy

- [ ] AuthInterceptor incluye todas las rutas públicas
- [ ] Environment usa rutas relativas (empiezan con `/`)
- [ ] `apiBase` en environment apunta a backend correcto
- [ ] AuthService tiene `getAccessToken()` y `getUserIdFromToken()`
- [ ] Todos los servicios usan rutas relativas, NO URLs absolutas
- [ ] Backend mapea correctamente todos los endpoints
- [ ] Backend NO duplica `/api` en `@RequestMapping`
- [ ] CORS configurado en backend para headers `Authorization`
- [ ] Logs del interceptor se muestran correctamente
- [ ] Login funciona y guarda token en localStorage
- [ ] Rutas protegidas reciben status 200 con token válido
- [ ] Rutas protegidas reciben status 401 sin token
- [ ] Refresh token funciona sin loops

---

## 🎯 Scripts de Prueba Automatizada (PowerShell)

Guarda esto como `test-auth.ps1`:

```powershell
# Test Auth Endpoints
Write-Host "🧪 Testing Auth Endpoints..." -ForegroundColor Cyan

$baseUrl = "http://localhost:3001/api"

# 1. Test Login (should work without token)
Write-Host "`n1️⃣ Testing Login (public)..." -ForegroundColor Yellow
$loginResponse = Invoke-WebRequest -Uri "$baseUrl/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"email":"test@example.com","password":"password123"}' `
    -SkipHttpErrorCheck

Write-Host "Status: $($loginResponse.StatusCode) - $(if($loginResponse.StatusCode -eq 200){'✅ PASS'}else{'❌ FAIL'})" -ForegroundColor $(if($loginResponse.StatusCode -eq 200){'Green'}else{'Red'})

# Extract token if login successful
if ($loginResponse.StatusCode -eq 200) {
    $token = ($loginResponse.Content | ConvertFrom-Json).accessToken
    Write-Host "Token obtenido: $($token.Substring(0,20))..." -ForegroundColor Green

    # 2. Test Analytics endpoints WITH token
    Write-Host "`n2️⃣ Testing Analytics Totals (protected with token)..." -ForegroundColor Yellow
    $headers = @{ Authorization = "Bearer $token" }
    
    $totalsResponse = Invoke-WebRequest -Uri "$baseUrl/analytics/totals" `
        -Headers $headers `
        -SkipHttpErrorCheck
    
    Write-Host "Status: $($totalsResponse.StatusCode) - $(if($totalsResponse.StatusCode -eq 200){'✅ PASS'}else{'❌ FAIL'})" -ForegroundColor $(if($totalsResponse.StatusCode -eq 200){'Green'}else{'Red'})

    # 3. Test Profile WITH token
    Write-Host "`n3️⃣ Testing Profile (protected with token)..." -ForegroundColor Yellow
    $profileResponse = Invoke-WebRequest -Uri "$baseUrl/profile" `
        -Headers $headers `
        -SkipHttpErrorCheck
    
    Write-Host "Status: $($profileResponse.StatusCode) - $(if($profileResponse.StatusCode -eq 200){'✅ PASS'}else{'❌ FAIL'})" -ForegroundColor $(if($profileResponse.StatusCode -eq 200){'Green'}else{'Red'})
}

# 4. Test Analytics WITHOUT token (should fail with 401)
Write-Host "`n4️⃣ Testing Analytics Totals WITHOUT token (should be 401)..." -ForegroundColor Yellow
$noTokenResponse = Invoke-WebRequest -Uri "$baseUrl/analytics/totals" `
    -SkipHttpErrorCheck

Write-Host "Status: $($noTokenResponse.StatusCode) - $(if($noTokenResponse.StatusCode -eq 401){'✅ PASS (correctly rejected)'}else{'❌ FAIL (should be 401)'})" -ForegroundColor $(if($noTokenResponse.StatusCode -eq 401){'Green'}else{'Red'})

Write-Host "`n✅ Tests completados!" -ForegroundColor Green
```

**Ejecutar:**
```powershell
.\test-auth.ps1
```

---

## 📝 Notas Importantes

1. **Decodificación JWT**: El frontend solo **lee** el JWT, NO lo valida. La validación se hace en el backend.

2. **LocalStorage**: Los tokens se guardan en localStorage con las keys:
   - `auth_token` → Access Token
   - `auth_refresh` → Refresh Token
   - `auth_user` → Datos del usuario

3. **Orden de Interceptors** (en `app.config.ts`):
   - `ApiPrefixInterceptor` (1º) → Agrega baseUrl
   - `AuthInterceptor` (2º) → Agrega Authorization header
   - `HttpErrorInterceptor` (3º) → Maneja errores globales

4. **CORS**: Asegúrate que el backend permita:
   - Header `Authorization`
   - Methods `GET, POST, PUT, DELETE, OPTIONS`
   - Origin `http://localhost:4200`

5. **JWT Claims esperados**:
   - `sub` o `userId` → ID del usuario
   - `email` → Email del usuario
   - `roles` → Array de roles
   - `exp` → Timestamp de expiración
   - `iat` → Timestamp de emisión

---

## 🎉 Resultado Final

Después de estos cambios:

✅ **Rutas públicas** NO requieren token  
✅ **Rutas protegidas** adjuntan token automáticamente  
✅ **No hay duplicación** de `/api` en URLs  
✅ **JWT decodificable** para obtener userId  
✅ **Refresh token** funciona sin loops  
✅ **401 manejado** con retry de refresh automático  
✅ **Logs claros** para debugging  

---

**Autor:** GitHub Copilot  
**Fecha:** 2025-10-30  
**Versión:** 1.0

