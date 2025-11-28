# 🚀 Guía de Despliegue - SpotFinder Frontend con Backend Azure

## 📋 Información del Backend

**Backend URL:** `https://spotfinderback-eaehduf4ehh7hjah.eastus2-01.azurewebsites.net`  
**API Base:** `https://spotfinderback-eaehduf4ehh7hjah.eastus2-01.azurewebsites.net/api`  
**Swagger:** [https://spotfinderback-eaehduf4ehh7hjah.eastus2-01.azurewebsites.net/swagger-ui/index.html](https://spotfinderback-eaehduf4ehh7hjah.eastus2-01.azurewebsites.net/swagger-ui/index.html)

---

## 🔧 Configuraciones Disponibles

El proyecto tiene **4 configuraciones de entorno**:

### 1. **Producción** (environment.ts)
- ✅ **Backend:** Azure (https://spotfinderback-eaehduf4ehh7hjah.eastus2-01.azurewebsites.net/api)
- ✅ **Logging:** Deshabilitado
- ✅ **Optimización:** Habilitada
- ✅ **Uso:** Despliegue a producción

### 2. **Producción Azure** (environment.production.ts)
- ✅ **Backend:** Azure (https://spotfinderback-eaehduf4ehh7hjah.eastus2-01.azurewebsites.net/api)
- ✅ **Logging:** Deshabilitado
- ✅ **Optimización:** Habilitada
- ✅ **Uso:** Build alternativo para producción

### 3. **Desarrollo** (environment.development.ts)
- 🏠 **Backend:** Local (http://localhost:3001/api)
- 📝 **Logging:** Habilitado
- 🛠️ **Optimización:** Deshabilitada
- 🔧 **Uso:** Desarrollo local con backend local

### 4. **Simulación** (environment.simulation.ts)
- 🏠 **Backend:** Local (http://localhost:3001/api)
- 🧪 **IoT:** http://localhost:8080/api/iot
- 📝 **Logging:** Habilitado
- 🎭 **Uso:** Testing y simulaciones

---

## 🏗️ Comandos de Build

### Build para Producción (Azure)
```bash
ng build --configuration=production
```
O usar el script:
```bash
build-production.bat
```

**Resultado:** Archivos optimizados en `dist/spotfinder-frontend-web/browser/`

### Build para Desarrollo
```bash
ng build --configuration=development
```

---

## 🌐 Comandos de Desarrollo

### 1. Desarrollo Local (Backend Local)
```bash
ng serve --configuration=development
```
O:
```bash
start-dev.bat
```
- Frontend: http://localhost:4200
- Backend: http://localhost:3001/api

### 2. Testing con Backend Azure
```bash
ng serve --configuration=production --optimization=false --source-map=true
```
O usar el script:
```bash
serve-azure.bat
```
- Frontend: http://localhost:4200
- Backend: https://spotfinderback-eaehduf4ehh7hjah.eastus2-01.azurewebsites.net/api

### 3. Modo Simulación
```bash
ng serve --configuration=simulation
```
O:
```bash
start-simulation.bat
```

---

## 📦 Despliegue a Producción

### Opción 1: Servidor Web Tradicional (Nginx, Apache, IIS)

1. **Build del proyecto:**
   ```bash
   build-production.bat
   ```

2. **Subir archivos:**
   - Copiar todo el contenido de `dist/spotfinder-frontend-web/browser/` al servidor

3. **Configurar servidor web:**

   **Nginx:**
   ```nginx
   server {
       listen 80;
       server_name tu-dominio.com;
       root /ruta/a/spotfinder/browser;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Caché para assets
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

   **Apache (.htaccess):**
   ```apache
   <IfModule mod_rewrite.c>
       RewriteEngine On
       RewriteBase /
       RewriteRule ^index\.html$ - [L]
       RewriteCond %{REQUEST_FILENAME} !-f
       RewriteCond %{REQUEST_FILENAME} !-d
       RewriteRule . /index.html [L]
   </IfModule>
   ```

   **IIS (web.config):**
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <configuration>
       <system.webServer>
           <rewrite>
               <rules>
                   <rule name="Angular" stopProcessing="true">
                       <match url=".*" />
                       <conditions logicalGrouping="MatchAll">
                           <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
                           <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
                       </conditions>
                       <action type="Rewrite" url="/" />
                   </rule>
               </rules>
           </rewrite>
       </system.webServer>
   </configuration>
   ```

### Opción 2: Azure Static Web Apps

1. **Build del proyecto:**
   ```bash
   ng build --configuration=production
   ```

2. **Desplegar con Azure CLI:**
   ```bash
   az staticwebapp create \
     --name spotfinder-frontend \
     --resource-group tu-resource-group \
     --source ./dist/spotfinder-frontend-web/browser \
     --location "East US 2"
   ```

### Opción 3: GitHub Pages

1. **Instalar angular-cli-ghpages:**
   ```bash
   npm install -g angular-cli-ghpages
   ```

2. **Build y deploy:**
   ```bash
   ng build --configuration=production --base-href="/FrontEnd-Web-SpotFinder/"
   npx angular-cli-ghpages --dir=dist/spotfinder-frontend-web/browser
   ```

### Opción 4: Vercel

1. **Instalar Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   ng build --configuration=production
   vercel --prod
   ```

---

## ⚙️ Configuración de CORS en Azure Backend

**IMPORTANTE:** El backend de Azure debe tener CORS configurado para aceptar peticiones del frontend.

Agregar en la configuración de Azure App Service:

```json
{
  "cors": {
    "allowedOrigins": [
      "https://tu-dominio-frontend.com",
      "http://localhost:4200"
    ],
    "allowCredentials": true
  }
}
```

O usando Azure CLI:
```bash
az webapp cors add \
  --resource-group tu-resource-group \
  --name spotfinderback-eaehduf4ehh7hjah \
  --allowed-origins https://tu-dominio-frontend.com http://localhost:4200
```

---

## 🔐 Variables de Entorno Sensibles

**ANTES DE DESPLEGAR A PRODUCCIÓN**, actualizar en `environment.production.ts`:

### 1. Stripe
```typescript
stripePublicKey: 'pk_live_TU_CLAVE_REAL_DE_STRIPE'
```

### 2. Firebase
```typescript
firebase: {
  apiKey: 'TU_API_KEY_REAL',
  authDomain: 'TU_PROJECT_ID.firebaseapp.com',
  projectId: 'TU_PROJECT_ID',
  storageBucket: 'TU_PROJECT_ID.appspot.com',
  messagingSenderId: 'TU_SENDER_ID',
  appId: 'TU_APP_ID',
  vapidKey: 'TU_VAPID_KEY_REAL'
}
```

---

## ✅ Checklist Pre-Despliegue

- [ ] Verificar que el backend de Azure esté activo
- [ ] Probar endpoints principales en Swagger
- [ ] Actualizar claves de Stripe (producción)
- [ ] Actualizar configuración de Firebase
- [ ] Configurar CORS en Azure backend
- [ ] Probar localmente con `serve-azure.bat`
- [ ] Verificar login/registro funcionan
- [ ] Verificar que se cargan parkings
- [ ] Verificar imágenes se suben correctamente
- [ ] Build de producción sin errores
- [ ] Configurar servidor web (Nginx/Apache/IIS)
- [ ] Configurar HTTPS/SSL
- [ ] Probar en producción

---

## 🧪 Testing Post-Despliegue

### 1. Funcionalidad Básica
```bash
# Login
POST /api/auth/login
{
  "email": "test@example.com",
  "password": "password123"
}

# Obtener parkings
GET /api/parkings?ownerId=USER_ID
Authorization: Bearer TOKEN
```

### 2. Verificar en Navegador
1. Abrir DevTools (F12)
2. Ir a Network tab
3. Verificar que las peticiones van a:
   `https://spotfinderback-eaehduf4ehh7hjah.eastus2-01.azurewebsites.net/api/*`
4. Verificar respuestas 200 OK (no 404, 500, CORS errors)

### 3. Verificar Funcionalidades
- [ ] Login funciona
- [ ] Registro funciona
- [ ] Dashboard se carga
- [ ] Listado de parkings
- [ ] Crear/editar parking
- [ ] Subir imágenes
- [ ] Analytics se cargan
- [ ] Reservaciones funcionan
- [ ] Reviews funcionan
- [ ] Dispositivos IoT (si aplica)

---

## 🐛 Troubleshooting

### Error: CORS Policy
**Síntoma:** `Access to XMLHttpRequest blocked by CORS policy`

**Solución:**
1. Verificar configuración CORS en Azure backend
2. Agregar dominio del frontend a allowed origins
3. Verificar que backend incluye headers CORS apropiados

### Error: 404 en rutas del frontend
**Síntoma:** Refresh en `/parkings` da 404

**Solución:**
- Configurar rewrite rules en servidor web (ver ejemplos arriba)
- Todas las rutas deben servir `index.html`

### Error: Assets no se cargan
**Síntoma:** Imágenes/CSS/JS con 404

**Solución:**
- Verificar `base-href` en build
- Verificar rutas relativas en servidor web
- Verificar que `/assets` está incluido en build

### Backend no responde
**Síntoma:** Timeout o ERR_CONNECTION_REFUSED

**Solución:**
1. Verificar que Azure App Service está running
2. Verificar URL en `environment.production.ts`
3. Verificar en Swagger: https://spotfinderback-eaehduf4ehh7hjah.eastus2-01.azurewebsites.net/swagger-ui/index.html
4. Ping al servidor para verificar conectividad

---

## 📞 Soporte

Si encuentras problemas:

1. Verificar logs en browser DevTools (Console + Network)
2. Verificar logs en Azure App Service
3. Verificar configuración CORS
4. Verificar endpoints en Swagger
5. Revisar este documento para troubleshooting

---

## 📚 Recursos Útiles

- **Angular Deployment:** https://angular.io/guide/deployment
- **Azure Static Web Apps:** https://docs.microsoft.com/azure/static-web-apps/
- **Azure CORS:** https://docs.microsoft.com/azure/app-service/app-service-web-tutorial-rest-api
- **Backend Swagger:** https://spotfinderback-eaehduf4ehh7hjah.eastus2-01.azurewebsites.net/swagger-ui/index.html

---

**Última actualización:** 2025-11-27  
**Versión:** 1.0

