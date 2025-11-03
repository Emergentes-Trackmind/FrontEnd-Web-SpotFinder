# 🚀 Inicio Rápido - Sistema de Notificaciones

## ⚡ Empezar en 3 Pasos

### 1. Instalar y Ejecutar

```bash
# Si acabas de clonar el proyecto
npm install

# Iniciar servidor de desarrollo + mock backend
npm run dev
```

### 2. Iniciar Sesión

Navega a: `http://localhost:4200/auth/login`

Usa cualquiera de estos usuarios de prueba:
- **Email**: `frank@gmail.com` | **Password**: `123456`
- **Email**: `fedro@gmail.com` | **Password**: `123456`

### 3. Probar el Sistema

#### Opción A: Demo de Toasts (Sin configuración)
1. Ve a: `http://localhost:4200/notificaciones/demo`
2. Haz clic en los botones para probar cada tipo de toast
3. Observa el comportamiento de la cola (máx. 3 visibles)

#### Opción B: Panel de Notificaciones
1. Ve a: `http://localhost:4200/notificaciones`
2. Verás notificaciones de ejemplo precargadas
3. Prueba las búsquedas y filtros
4. Marca como leídas o elimina notificaciones

#### Opción C: Badge en Sidebar
1. Observa el icono de campana 🔔 en el sidebar izquierdo
2. Muestra el contador de notificaciones no leídas
3. Haz clic para ir al panel de notificaciones

---

## 🔥 Características Disponibles AHORA

✅ **Toasts funcionales** - Sistema completo de toasts sin necesidad de Firebase  
✅ **Panel de notificaciones** - Búsqueda, filtros, acciones  
✅ **Mock backend** - API simulada con json-server  
✅ **Datos de ejemplo** - 5 notificaciones precargadas  
✅ **Componente de demo** - Testing interactivo  
✅ **Responsive** - Funciona en móvil y desktop  

---

## 📋 Próximos Pasos Opcionales

### Configurar Firebase Cloud Messaging (Producción)

Solo necesitas esto si quieres notificaciones push reales:

1. **Crear proyecto Firebase**
   - https://console.firebase.google.com/
   - Crear proyecto → Habilitar Cloud Messaging

2. **Obtener credenciales**
   - Configuración proyecto → General → Aplicación web
   - Copiar configuración

3. **Actualizar archivos**
   ```typescript
   // src/environments/environment.ts
   firebase: {
     apiKey: "TU_API_KEY_AQUI",
     authDomain: "tu-proyecto.firebaseapp.com",
     projectId: "tu-proyecto",
     // ... resto de credenciales
   }
   ```

4. **Actualizar Service Worker**
   ```javascript
   // public/firebase-messaging-sw.js
   const firebaseConfig = {
     apiKey: "TU_API_KEY_AQUI",
     // ... resto de credenciales
   };
   ```

5. **Reiniciar aplicación**
   ```bash
   npm run dev
   ```

Ver `NOTIFICATIONS_README.md` para instrucciones completas.

---

## 🎯 Rutas Disponibles

| Ruta | Descripción |
|------|-------------|
| `/notificaciones` | Panel principal de notificaciones |
| `/notificaciones/demo` | Demo interactivo de toasts |
| `/dashboard` | Dashboard principal |

---

## 🐛 Resolución de Problemas

### Los toasts no aparecen
- ✅ Verifica que estés en una ruta protegida (después de login)
- ✅ Abre la consola del navegador para ver errores
- ✅ Usa el componente de demo: `/notificaciones/demo`

### No veo el badge en el sidebar
- ✅ El badge solo aparece si hay notificaciones no leídas
- ✅ Verifica que estás autenticado
- ✅ Revisa que el mock server esté corriendo

### Error de Firebase
- ✅ Es normal si no has configurado Firebase
- ✅ El sistema funciona sin Firebase para desarrollo
- ✅ Solo afecta a notificaciones push reales

---

## 📚 Documentación Completa

- **NOTIFICATIONS_README.md** - Guía completa del sistema
- **NOTIFICATIONS_IMPLEMENTATION_SUMMARY.md** - Resumen técnico
- **test-notifications.ps1** - Script de pruebas de API

---

## 💡 Tips

1. **Desarrollo**: No necesitas configurar Firebase para desarrollar
2. **Testing**: Usa `/notificaciones/demo` para probar visualmente
3. **API**: El mock server simula todos los endpoints
4. **Producción**: Solo configura Firebase cuando vayas a producción

---

## ✨ ¡Listo!

El sistema está 100% funcional para desarrollo.  
Cualquier duda, revisa la documentación completa en `NOTIFICATIONS_README.md`

**Happy coding! 🎉**

