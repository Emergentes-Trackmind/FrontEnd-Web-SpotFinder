# 🚗 SpotFinder - Frontend Web Application

Sistema de gestión inteligente de estacionamientos con integración IoT, analytics en tiempo real y gestión de reservaciones.

## 🌐 Backend Conectado

**Backend URL:** https://spotfinderback-eaehduf4ehh7hjah.eastus2-01.azurewebsites.net  
**API Base:** https://spotfinderback-eaehduf4ehh7hjah.eastus2-01.azurewebsites.net/api  
**Swagger:** [Ver Documentación API](https://spotfinderback-eaehduf4ehh7hjah.eastus2-01.azurewebsites.net/swagger-ui/index.html)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuraciones Disponibles](#-configuraciones-disponibles)
- [Comandos de Desarrollo](#-comandos-de-desarrollo)
- [Build y Despliegue](#-build-y-despliegue)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Documentación Adicional](#-documentación-adicional)

---

## ✨ Características

### 🏢 Gestión de Parkings
- Crear, editar y eliminar parkings
- Configuración de ubicación con mapas interactivos
- Gestión de precios y horarios
- Características y amenidades personalizables

### 📊 Analytics y KPIs
- Dashboard con métricas en tiempo real
- Gráficos de ingresos por mes
- Ocupación por hora
- Top parkings por desempeño
- Actividad reciente

### 🔌 Integración IoT
- Gestión de dispositivos IoT
- Monitoreo en tiempo real de sensores
- Telemetría de dispositivos
- Estados de ocupación automáticos

### 📅 Sistema de Reservaciones
- Listado y gestión de reservaciones
- Filtros avanzados
- Estados de reservación
- Privacidad de datos por usuario

### ⭐ Sistema de Reviews
- Gestión de reseñas de usuarios
- Calificaciones y comentarios
- Filtros y búsqueda
- Moderación de contenido

### 👤 Gestión de Usuarios
- Autenticación JWT
- Registro y login
- Perfil de usuario
- Gestión de sesiones

---

## 🔧 Requisitos Previos

- **Node.js:** v18.x o superior
- **npm:** v9.x o superior
- **Angular CLI:** v18.x
- **Backend:** Azure App Service (ya desplegado)

### Instalar Angular CLI
```bash
npm install -g @angular/cli@18
```

---

## 📦 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/FrontEnd-Web-SpotFinder.git
cd FrontEnd-Web-SpotFinder
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Verificar backend Azure
```bash
powershell -ExecutionPolicy Bypass -File verify-azure-backend.ps1
```

---

## ⚙️ Configuraciones Disponibles

El proyecto tiene **4 configuraciones de entorno**:

### 1. **Producción** (Por defecto)
- **Backend:** Azure
- **Archivo:** `src/environments/environment.ts`
- **Uso:** Despliegue a producción
```bash
ng serve --configuration=production
# o
serve-azure.bat
```

### 2. **Desarrollo Local**
- **Backend:** http://localhost:3001/api
- **Archivo:** `src/environments/environment.development.ts`
- **Uso:** Desarrollo con backend local
```bash
ng serve --configuration=development
# o
start-dev.bat
```

### 3. **Simulación**
- **Backend:** Local con mock data
- **Archivo:** `src/environments/environment.simulation.ts`
- **Uso:** Testing y demos
```bash
ng serve --configuration=simulation
# o
start-simulation.bat
```

---

## 🚀 Comandos de Desarrollo

### Desarrollo Local (Backend Local)
```bash
npm start
# o
ng serve --configuration=development
```
**Acceso:** http://localhost:4200  
**Backend:** http://localhost:3001/api

### Testing con Backend Azure
```bash
serve-azure.bat
# o
ng serve --configuration=production --optimization=false --source-map=true
```
**Acceso:** http://localhost:4200  
**Backend:** Azure

### Ver Configuración Actual
```bash
show-config.bat
```

### Verificar Backend Azure
```bash
powershell -ExecutionPolicy Bypass -File verify-azure-backend.ps1
```

---

## 🏗️ Build y Despliegue

### Build para Producción
```bash
build-production.bat
# o
ng build --configuration=production
```
**Output:** `dist/spotfinder-frontend-web/browser/`

### Build para Desarrollo
```bash
ng build --configuration=development
```

### Despliegue

#### Servidor Web Tradicional
1. Build del proyecto
2. Subir contenido de `dist/spotfinder-frontend-web/browser/` al servidor
3. Configurar rewrite rules (ver guía de despliegue)

#### Azure Static Web Apps
```bash
az staticwebapp create --name spotfinder-frontend --resource-group tu-rg ...
```

#### Vercel
```bash
npm install -g vercel
ng build --configuration=production
vercel --prod
```

**Ver guía completa:** [GUIA_DESPLIEGUE_AZURE.md](GUIA_DESPLIEGUE_AZURE.md)

---

## 📁 Estructura del Proyecto

```
FrontEnd-Web-SpotFinder/
├── src/
│   ├── app/
│   │   ├── core/              # Servicios core e interceptores
│   │   ├── shared/            # Componentes compartidos
│   │   ├── iam/               # Autenticación y autorización
│   │   ├── profileparking/    # Gestión de parkings
│   │   ├── dashboard/         # Dashboard y analytics
│   │   ├── reservations/      # Sistema de reservaciones
│   │   ├── reviews/           # Sistema de reviews
│   │   ├── iot/               # Integración IoT
│   │   ├── billing/           # Facturación
│   │   └── notifications/     # Notificaciones
│   ├── environments/          # Configuraciones de entorno
│   ├── assets/                # Recursos estáticos
│   └── styles.css             # Estilos globales (Tailwind)
├── docs/                      # Documentación adicional
├── angular.json               # Configuración de Angular
├── package.json               # Dependencias del proyecto
└── README.md                  # Este archivo
```

---

## 📚 Documentación Adicional

### Guías Principales
- **[CONFIGURACION_COMPLETADA.md](CONFIGURACION_COMPLETADA.md)** - Estado actual del proyecto ✅
- **[GUIA_DESPLIEGUE_AZURE.md](GUIA_DESPLIEGUE_AZURE.md)** - Guía completa de despliegue
- **[CONEXION_BACKEND_AZURE.md](CONEXION_BACKEND_AZURE.md)** - Análisis técnico de endpoints
- **[RESUMEN_CAMBIOS_AZURE.md](RESUMEN_CAMBIOS_AZURE.md)** - Cambios realizados

### Guías de Funcionalidades
- **SISTEMA_REVIEWS_COMPLETO.md** - Sistema de reviews
- **TRADUCCIONES_*.md** - Internacionalización (i18n)
- **GUIA_I18N_IMPLEMENTACION.md** - Implementación de i18n
- **SPOTS_VISUALIZER_COMPLETADO.md** - Visualizador de espacios

### Guías Técnicas
- **SOLUCION_*.md** - Soluciones a problemas específicos
- **CORRECCION_*.md** - Correcciones implementadas

---

## 🔐 Configuración CORS

**IMPORTANTE:** El backend de Azure debe tener CORS configurado para aceptar peticiones del frontend.

```bash
az webapp cors add \
  --resource-group tu-resource-group \
  --name spotfinderback-eaehduf4ehh7hjah \
  --allowed-origins http://localhost:4200 https://tu-dominio-frontend.com
```

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Angular 18** - Framework principal
- **TypeScript** - Lenguaje de programación
- **Tailwind CSS** - Framework de estilos
- **Leaflet** - Mapas interactivos
- **Chart.js** - Gráficos y visualizaciones
- **RxJS** - Programación reactiva

### Herramientas de Desarrollo
- **Angular CLI** - Herramienta de línea de comandos
- **ESLint** - Linter de código
- **Prettier** - Formateador de código

### Backend (Azure)
- **Spring Boot** - Framework backend (Java)
- **PostgreSQL** - Base de datos
- **Azure App Service** - Hosting
- **Swagger** - Documentación de API

---

## 🧪 Testing

### Ejecutar Tests Unitarios
```bash
ng test
```

### Ejecutar Tests E2E
```bash
ng e2e
```

---

## 📊 Scripts Disponibles

| Script | Comando | Descripción |
|--------|---------|-------------|
| Start | `npm start` | Desarrollo local |
| Build | `npm run build` | Build para producción |
| Test | `npm test` | Ejecutar tests |
| Lint | `npm run lint` | Analizar código |
| **Build Producción** | `build-production.bat` | Build optimizado para Azure |
| **Servir Azure** | `serve-azure.bat` | Testing con backend Azure |
| **Verificar Backend** | `verify-azure-backend.ps1` | Verificar conectividad |
| **Ver Config** | `show-config.bat` | Mostrar configuración |

---

## 🐛 Troubleshooting

### Error: CORS Policy
**Síntoma:** `Access to XMLHttpRequest blocked by CORS policy`  
**Solución:** Configurar CORS en Azure backend

### Error: 404 en Rutas
**Síntoma:** Refresh en `/parkings` da 404  
**Solución:** Configurar rewrite rules en servidor web

### Backend no Responde
**Síntoma:** Timeout o ERR_CONNECTION_REFUSED  
**Solución:** Verificar que Azure App Service esté running

**Más soluciones:** Ver [GUIA_DESPLIEGUE_AZURE.md](GUIA_DESPLIEGUE_AZURE.md) - Sección Troubleshooting

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

---

## 📝 Licencia

Este proyecto es privado y está protegido por derechos de autor.

---

## 📞 Contacto

- **Backend Swagger:** https://spotfinderback-eaehduf4ehh7hjah.eastus2-01.azurewebsites.net/swagger-ui/index.html
- **Documentación:** Ver carpeta `docs/`

---

## 🎯 Estado del Proyecto

✅ **CONFIGURADO Y LISTO PARA USAR**

- ✅ Backend Azure conectado y funcionando
- ✅ Swagger accesible
- ✅ Endpoints verificados
- ✅ Configuraciones de entorno listas
- ✅ Scripts de utilidad creados
- ✅ Documentación completa

**Próximo paso:** Ejecutar `serve-azure.bat` para probar la aplicación.

---

**Última actualización:** 2025-11-27  
**Versión:** 1.0.0  
**Angular:** 18.x

