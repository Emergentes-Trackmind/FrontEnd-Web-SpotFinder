# 🔧 Troubleshooting - Reservas No Visibles

## ❌ Problema
Estás en la página de Reservas pero muestra "0" en todos los estados (Total, Pendientes, Confirmadas, Canceladas).

## 🔍 Posibles Causas

### 1. **Servidor No Reiniciado**
El servidor JSON necesita reiniciarse para cargar las nuevas reservas del db.json.

**Solución:**
```bash
reiniciar-con-reservas.bat
```
O manualmente:
1. Cierra la ventana del servidor JSON (donde está corriendo npm run mock:server)
2. Ejecuta nuevamente: `npm run mock:server`
3. Espera 5 segundos
4. Recarga el navegador: `Ctrl + Shift + R`

---

### 2. **Middleware No Registrado Correctamente**
El middleware de reservations debe estar registrado en `server/middleware.js`.

**Verificar:**
Abre `server/middleware.js` y busca estas líneas:

```javascript
const reservationsMiddleware = require('./reservations.middleware');

// ...más abajo...

if (req.path.startsWith('/reservations') || req.path.startsWith('/api/reservations')) {
  return reservationsMiddleware(req, res, next);
}
```

---

### 3. **currentUserId No Se Está Enviando**
El API debe enviar el `currentUserId` en la petición.

**Verificar en la Consola del Navegador:**
1. Abre DevTools (F12)
2. Ve a la pestaña "Network" (Red)
3. Filtra por "reservations"
4. Click en la petición GET
5. Ve a "Query String Parameters"
6. Debe aparecer: `currentUserId: 1761826163261`

**Si NO aparece:**
- El problema está en `reservations.api.ts`
- Verifica que el método `getCurrentUserId()` esté funcionando

---

### 4. **Usuario Incorrecto**
Estás logueado con un usuario diferente a Lucas Andres.

**Verificar:**
- En la esquina superior derecha debería decir "Lucas Andres"
- Email debe ser: frank@gmail.com
- ID debe ser: 1761826163261

**Si es otro usuario:**
1. Logout
2. Login con: frank@gmail.com / password123 (o tu password)

---

### 5. **parkingOwnerId No Coincide**
Las reservas en db.json deben tener `parkingOwnerId: "1761826163261"`.

**Verificar:**
Abre `server/db.json` y busca `res_11`:

```json
{
  "id": "res_11",
  "parkingOwnerId": "1761826163261",  // ← Debe ser este ID
  ...
}
```

---

## 🛠️ Pasos de Debugging

### Paso 1: Verificar Logs del Servidor
En la consola donde corre `npm run mock:server`, deberías ver:

```
[Reservations Middleware] GET /api/reservations
[Reservations Middleware] currentUserId extraído: 1761826163261
[Reservations Middleware] ✅ Filtrando reservations por parkingOwnerId: 1761826163261
```

**Si NO ves estos logs:**
- El middleware NO se está ejecutando
- Verifica que esté registrado en `middleware.js`

**Si ves pero dice "No se encontró currentUserId":**
- El frontend NO está enviando el `currentUserId`
- Verifica `reservations.api.ts`

---

### Paso 2: Verificar Respuesta del Servidor
En DevTools → Network → Petición GET /reservations:

**Response debe contener:**
```json
[
  {
    "id": "res_11",
    "userName": "Luis Lagos",
    "parkingName": "Estacionamiento Lucas",
    "parkingOwnerId": "1761826163261",
    ...
  },
  ... 7 más
]
```

**Si la respuesta es `[]` (vacío):**
- El filtro está funcionando pero no encuentra reservas
- Verifica que las reservas tengan el `parkingOwnerId` correcto

**Si la respuesta tiene TODAS las reservas (18 reservas):**
- El middleware NO está filtrando
- El `currentUserId` no se está enviando

---

### Paso 3: Verificar en db.json
Abre `server/db.json` y cuenta las reservas:

```bash
# Busca todas las reservas con parkingOwnerId: "1761826163261"
```

Deberían ser exactamente 8:
- res_11, res_12, res_13, res_14, res_15, res_16, res_17, res_18

---

### Paso 4: Verificar Estado de la App
En la consola del navegador:

```javascript
// Ejecuta esto en la consola:
localStorage.getItem('auth_user')
```

Debería retornar algo como:
```json
{"id":"1761826163261","email":"frank@gmail.com",...}
```

**Si es null:**
- No estás logueado
- Haz login nuevamente

**Si el ID es diferente:**
- Estás logueado con otro usuario
- Logout y login con frank@gmail.com

---

## ✅ Solución Rápida (Checklist)

1. [ ] **Reiniciar servidor:** `reiniciar-con-reservas.bat`
2. [ ] **Esperar 5 segundos** (que el servidor inicie)
3. [ ] **Recargar navegador:** `Ctrl + Shift + R`
4. [ ] **Verificar logs del servidor** en la consola
5. [ ] **Verificar usuario actual:** Debe ser Lucas Andres
6. [ ] **Verificar Network tab:** `currentUserId=1761826163261`
7. [ ] **Verificar Response:** Debe tener 8 reservas

---

## 🔍 Comandos de Verificación

### En la Consola del Servidor:
Debería aparecer al cargar la página de Reservas:
```
[Reservations Middleware] GET /api/reservations
[Reservations Middleware] Path normalizado: /reservations
[Reservations Middleware] GET /reservations detectado
[Reservations Middleware] currentUserId extraído: 1761826163261
[Reservations Middleware] ✅ Filtrando reservations por parkingOwnerId: 1761826163261
```

### En DevTools → Console:
```javascript
// Verifica que estés logueado
JSON.parse(localStorage.getItem('auth_user'))

// Debería retornar:
// { id: "1761826163261", email: "frank@gmail.com", ... }
```

### En DevTools → Network:
1. Filtra por "reservations"
2. Click en la petición GET
3. Ve a "Headers" → "Query String Parameters"
4. Debe mostrar: `currentUserId: 1761826163261`

---

## 🚨 Si Nada Funciona

### Opción 1: Limpiar Todo y Empezar de Nuevo
```bash
# 1. Cierra TODAS las ventanas de cmd/terminal
# 2. Cierra el navegador completamente
# 3. Reinicia el servidor:
npm run mock:server

# 4. Espera 10 segundos
# 5. Abre el navegador
# 6. Ve a http://localhost:4200
# 7. Login: frank@gmail.com
# 8. Ve a Reservas
```

### Opción 2: Verificar que Angular esté Compilando
En la consola donde corre `ng serve`, no debe haber errores de compilación.

**Si hay errores:**
- Detén el servidor: `Ctrl + C`
- Ejecuta: `npm install`
- Ejecuta: `ng serve`

### Opción 3: Limpiar Caché
```javascript
// En la consola del navegador:
localStorage.clear()
sessionStorage.clear()
location.reload()
```

---

## 📞 Información de Debug para Soporte

Si sigues teniendo problemas, proporciona:

1. **Logs del servidor** (copia toda la salida)
2. **Petición de Network** (Response completa)
3. **Usuario actual** (resultado de `localStorage.getItem('auth_user')`)
4. **Errores en consola** (si los hay)

---

¡Con estos pasos deberías poder identificar y resolver el problema! 🔧

