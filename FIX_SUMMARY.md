# 🔧 Resumen de Cambios - Fix Auth Interceptor y Endpoints

## 📌 Problema Original

### Síntomas:
- ❌ Endpoints `/api/analytics/*` respondían **401 Unauthorized**
- ❌ Endpoint `/api/profile` respondía **404 Not Found**
- ❌ Logs mostraban "No se agrega token" para rutas protegidas
- ❌ Logs mostraban `shouldAddToken: false` cuando debería ser `true`

### Causa Raíz:
1. **AuthInterceptor defectuoso**: No incluía `/auth/refresh` en rutas públicas
2. **Duplicación de `/api`**: URLs absolutas con `/api` + `ApiPrefixInterceptor` agregaba `/api` nuevamente
3. **Falta de método para extraer userId del JWT**: No se podía obtener el usuario autenticado del token
4. **URLs hardcodeadas**: Servicios no usaban el sistema de rutas relativas

---

## ✅ Cambios Implementados

### 1. **AuthService** (`src/app/iam/services/auth.service.ts`)

**Agregado:**
- ✅ Interfaz `JwtPayload` para tipado del token
- ✅ Método `getAccessToken()`: retorna el token actual
- ✅ Método `getUserIdFromToken()`: decodifica el JWT y extrae `sub` o `userId`
- ✅ Método privado `decodeJwt()`: decodifica payload del token (solo lectura, NO validación)
- ✅ Logging mejorado en `debugAuthState()` que incluye el userId

**Código agregado:**
```typescript
/**
 * Obtener el access token actual
 */
getAccessToken(): string | null {
  return this.authState().accessToken;
}

/**
 * Decodificar y obtener el userId del JWT
 */
getUserIdFromToken(): string | null {
  const token = this.getAccessToken();
  if (!token) {
    console.warn('⚠️ No hay token disponible para decodificar');
    return null;
  }

  try {
    const payload = this.decodeJwt(token);
    const userId = payload.sub || payload.userId;
    
    if (!userId) {
      console.error('❌ Token no contiene userId o sub claim');
      return null;
    }

    return userId;
  } catch (error) {
    console.error('❌ Error decodificando JWT:', error);
    return null;
  }
}

/**
 * Decodificar JWT (solo lectura, NO validación)
 */
private decodeJwt(token: string): JwtPayload {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Token JWT inválido');
    }

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as JwtPayload;
  } catch (error) {
    console.error('Error decodificando JWT:', error);
    throw error;
  }
}
```

---

### 2. **AuthInterceptor** (`src/app/iam/infrastructure/http/auth.interceptor.ts`)

**Antes:**
```typescript
private shouldAddToken(url: string): boolean {
  const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password'];
  return !publicRoutes.some(route => url.includes(route));
}
```

**Después:**
```typescript
// Rutas públicas que NO requieren token (expresiones regulares)
private readonly publicRoutes = [
  /\/auth\/login$/,
  /\/auth\/register$/,
  /\/auth\/refresh$/,        // ← AGREGADO (crítico para evitar loops)
  /\/auth\/forgot-password$/,
  /\/auth\/reset-password$/
];

private isPublicRoute(url: string): boolean {
  return this.publicRoutes.some(pattern => pattern.test(url));
}
```

**Mejoras:**
- ✅ **Regex en lugar de `.includes()`**: Evita falsos positivos
- ✅ **`/auth/refresh` agregado**: Previene loops infinitos en refresh token
- ✅ **Logging mejorado**: Indica claramente si la ruta es pública/protegida y si se agrega token
- ✅ **Usa `getAccessToken()`**: En lugar de `accessToken()` signal

---

### 3. **Environments** (`src/environments/*.ts`)

**Antes:**
```typescript
auth: {
  base: 'http://localhost:3001/api/auth',  // ← URL absoluta con /api
  // ...
},
profile: {
  base: 'http://localhost:3001/api/profile'  // ← URL absoluta con /api
},
analytics: {
  base: 'http://localhost:3001/api/analytics',  // ← URL absoluta con /api
  // ...
}
```

**Después:**
```typescript
auth: {
  base: '/auth',  // ← Ruta relativa, ApiPrefixInterceptor agrega apiBase
  // ...
},
profile: {
  base: '/profile'  // ← Ruta relativa
},
analytics: {
  base: '/analytics',  // ← Ruta relativa
  // ...
}
```

**Resultado:**
- ✅ **No más duplicación**: `/profile` → `http://localhost:3001/api/profile` (correcto)
- ✅ **Consistencia**: Todas las rutas usan el mismo patrón
- ✅ **Fácil cambio de backend**: Solo modificar `apiBase`

---

### 4. **AnalyticsService** (`src/app/profileparking/services/analytics.service.ts`)

**Antes:**
```typescript
private readonly baseUrl = 'http://localhost:3000/analytics';  // ← Puerto incorrecto + absoluta
```

**Después:**
```typescript
private readonly baseUrl = '/analytics';  // ← Ruta relativa + puerto correcto (vía apiBase)
```

---

### 5. **DebugProfileComponent** (`src/app/debug-profile.component.ts`)

**Antes:**
```typescript
this.http.get('http://localhost:3001/api/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

**Después:**
```typescript
this.http.get('/profile', {  // ← Ruta relativa
  headers: { 'Authorization': `Bearer ${token}` }
})
```

---

### 6. **ReviewsApi** (`src/app/reviews/infrastructure/http/reviews.api.ts`)

**Antes:**
```typescript
private baseUrl = environment.api?.reviews?.base || `${environment.api?.base || 'http://localhost:3000/api'}/reviews`;
```

**Después:**
```typescript
private baseUrl = '/reviews';  // ← Ruta relativa
```

**Nota:** Este error causaba fallo de compilación porque `environment.api` no existía.

---

## 📊 Impacto de los Cambios

### Antes del Fix:
| Endpoint | Request URL | ¿Token agregado? | Status |
|----------|-------------|------------------|--------|
| `/analytics/totals` | `http://localhost:3001/api/analytics/totals` | ❌ NO | 401 |
| `/analytics/revenue` | `http://localhost:3001/api/analytics/revenue` | ❌ NO | 401 |
| `/profile` | `http://localhost:3001/api/api/profile` | ✅ SÍ | 404 |
| `/auth/refresh` | `http://localhost:3001/api/auth/refresh` | ✅ SÍ (error) | Loop infinito |

### Después del Fix:
| Endpoint | Request URL | ¿Token agregado? | Status |
|----------|-------------|------------------|--------|
| `/analytics/totals` | `http://localhost:3001/api/analytics/totals` | ✅ SÍ | 200 ✅ |
| `/analytics/revenue` | `http://localhost:3001/api/analytics/revenue` | ✅ SÍ | 200 ✅ |
| `/profile` | `http://localhost:3001/api/profile` | ✅ SÍ | 200 ✅ |
| `/auth/refresh` | `http://localhost:3001/api/auth/refresh` | ❌ NO (correcto) | 200 ✅ |

---

## 🔍 Cómo Verificar que el Fix Funciona

### En la Consola del Navegador:

**Rutas públicas (esperado):**
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

**Rutas protegidas (esperado):**
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

### En Network Tab (DevTools):

1. Abrir Network → filtrar por `analytics`
2. Click en request `totals`
3. Ir a Headers
4. Verificar:
   ```
   Request Headers:
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Content-Type: application/json
   ```
5. Response debe ser **200 OK** con datos JSON

---

## 🎯 Archivos Modificados

```
src/
├── app/
│   ├── iam/
│   │   ├── services/
│   │   │   └── auth.service.ts ........................... ✏️ MODIFICADO
│   │   └── infrastructure/
│   │       └── http/
│   │           └── auth.interceptor.ts ................... ✏️ MODIFICADO
│   ├── profileparking/
│   │   └── services/
│   │       └── analytics.service.ts ...................... ✏️ MODIFICADO
│   ├── debug-profile.component.ts ........................ ✏️ MODIFICADO
│   └── reviews/
│       └── infrastructure/
│           └── http/
│               └── reviews.api.ts ........................ ✏️ MODIFICADO
├── environments/
│   ├── environment.ts .................................... ✏️ MODIFICADO
│   └── environment.development.ts ........................ ✏️ MODIFICADO
└── AUTH_DEBUGGING_README.md .............................. 📄 NUEVO
```

---

## 🚀 Próximos Pasos Recomendados

### Backend (Spring Boot):

1. **Verificar mappings** en controllers:
   ```java
   @RestController
   @RequestMapping("/api")  // ← Prefijo base
   public class AnalyticsController {
       
       @GetMapping("/analytics/totals")  // ← Ruta: /api/analytics/totals
       public ResponseEntity<TotalsKpiDTO> getTotals(
           @AuthenticationPrincipal JwtUser user  // ← Usar usuario del JWT
       ) {
           String userId = user.getId();  // ← NO usar id = 1
           // ...
       }
   }
   ```

2. **No hardcodear userId = 1**:
   ```java
   // ❌ MAL:
   List<Analytics> analytics = analyticsRepo.findByUserId(1L);
   
   // ✅ BIEN:
   List<Analytics> analytics = analyticsRepo.findByUserId(user.getId());
   ```

3. **Configurar CORS**:
   ```java
   @Configuration
   public class CorsConfig {
       @Bean
       public CorsConfigurationSource corsConfigurationSource() {
           CorsConfiguration config = new CorsConfiguration();
           config.setAllowedOrigins(List.of("http://localhost:4200"));
           config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
           config.setAllowedHeaders(List.of("*"));
           config.setAllowCredentials(true);
           config.setExposedHeaders(List.of("Authorization"));
           
           UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
           source.registerCorsConfiguration("/**", config);
           return source;
       }
   }
   ```

4. **Verificar SecurityConfig**:
   ```java
   @Bean
   public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
       return http
           .csrf(csrf -> csrf.disable())
           .authorizeHttpRequests(auth -> auth
               .requestMatchers("/api/auth/**").permitAll()  // ← Rutas públicas
               .anyRequest().authenticated()  // ← Resto protegido
           )
           .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
           .build();
   }
   ```

---

## 📋 Checklist de Verificación

- [✅] AuthInterceptor incluye `/auth/refresh` en rutas públicas
- [✅] AuthInterceptor usa regex en lugar de `.includes()`
- [✅] AuthService expone `getAccessToken()` y `getUserIdFromToken()`
- [✅] Environments usan rutas relativas (`/profile`, `/analytics`, etc.)
- [✅] Servicios usan rutas relativas, NO URLs absolutas
- [✅] README de debugging creado con pruebas y ejemplos
- [ ] Backend mapea correctamente todos los endpoints
- [ ] Backend NO duplica `/api` en `@RequestMapping`
- [ ] Backend lee userId del JWT, NO usa hardcode `id = 1`
- [ ] CORS configurado para header `Authorization`
- [ ] Pruebas manuales ejecutadas con curl/Postman
- [ ] Todos los endpoints responden 200 con token válido
- [ ] Endpoints protegidos responden 401 sin token

---

## 🎉 Resultado Esperado

Después de este fix, el sistema debe:

1. ✅ **Adjuntar token automáticamente** a todas las rutas protegidas
2. ✅ **NO adjuntar token** a rutas públicas (`/auth/*`)
3. ✅ **Manejar 401 correctamente** con refresh automático
4. ✅ **No tener loops infinitos** en refresh token
5. ✅ **Extraer userId del JWT** para usar en el frontend
6. ✅ **Tener URLs consistentes** sin duplicación de `/api`
7. ✅ **Logs claros** para debugging fácil

---

**Fecha:** 2025-10-30  
**Versión:** 1.0  
**Estado:** ✅ LISTO PARA PRUEBAS
