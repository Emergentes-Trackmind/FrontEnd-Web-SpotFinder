@echo off
REM ================================================================
REM Script para mostrar la configuración actual del proyecto
REM ================================================================
echo.
echo ========================================
echo   Configuración Actual - SpotFinder
echo ========================================
echo.

echo [Archivos de Entorno Disponibles]
echo.
if exist "src\environments\environment.ts" (
    echo   ✓ environment.ts ^(Producción - Azure^)
) else (
    echo   ✗ environment.ts NO ENCONTRADO
)

if exist "src\environments\environment.production.ts" (
    echo   ✓ environment.production.ts ^(Producción - Azure^)
) else (
    echo   ✗ environment.production.ts NO ENCONTRADO
)

if exist "src\environments\environment.development.ts" (
    echo   ✓ environment.development.ts ^(Desarrollo - Local^)
) else (
    echo   ✗ environment.development.ts NO ENCONTRADO
)

if exist "src\environments\environment.simulation.ts" (
    echo   ✓ environment.simulation.ts ^(Simulación^)
) else (
    echo   ✗ environment.simulation.ts NO ENCONTRADO
)

echo.
echo [Scripts Disponibles]
echo.
if exist "build-production.bat" (
    echo   ✓ build-production.bat - Build para producción
) else (
    echo   ✗ build-production.bat NO ENCONTRADO
)

if exist "serve-azure.bat" (
    echo   ✓ serve-azure.bat - Servir con backend Azure
) else (
    echo   ✗ serve-azure.bat NO ENCONTRADO
)

if exist "verify-azure-backend.ps1" (
    echo   ✓ verify-azure-backend.ps1 - Verificar backend Azure
) else (
    echo   ✗ verify-azure-backend.ps1 NO ENCONTRADO
)

if exist "start-dev.bat" (
    echo   ✓ start-dev.bat - Desarrollo local
) else (
    echo   ✗ start-dev.bat NO ENCONTRADO
)

echo.
echo [Documentación]
echo.
if exist "GUIA_DESPLIEGUE_AZURE.md" (
    echo   ✓ GUIA_DESPLIEGUE_AZURE.md
) else (
    echo   ✗ GUIA_DESPLIEGUE_AZURE.md NO ENCONTRADO
)

if exist "CONEXION_BACKEND_AZURE.md" (
    echo   ✓ CONEXION_BACKEND_AZURE.md
) else (
    echo   ✗ CONEXION_BACKEND_AZURE.md NO ENCONTRADO
)

if exist "RESUMEN_CAMBIOS_AZURE.md" (
    echo   ✓ RESUMEN_CAMBIOS_AZURE.md
) else (
    echo   ✗ RESUMEN_CAMBIOS_AZURE.md NO ENCONTRADO
)

echo.
echo [Configuración del Backend]
echo.
echo   Backend URL:
echo   https://spotfinderback-eaehduf4ehh7hjah.eastus2-01.azurewebsites.net
echo.
echo   API Base:
echo   https://spotfinderback-eaehduf4ehh7hjah.eastus2-01.azurewebsites.net/api
echo.
echo   Swagger:
echo   https://spotfinderback-eaehduf4ehh7hjah.eastus2-01.azurewebsites.net/swagger-ui/index.html
echo.

echo ========================================
echo   Comandos Disponibles
echo ========================================
echo.
echo   1. Desarrollo Local ^(Backend Local^):
echo      ng serve --configuration=development
echo      start-dev.bat
echo.
echo   2. Testing con Azure ^(Sin Build^):
echo      ng serve --configuration=production --optimization=false
echo      serve-azure.bat
echo.
echo   3. Build para Producción:
echo      ng build --configuration=production
echo      build-production.bat
echo.
echo   4. Verificar Backend Azure:
echo      powershell -ExecutionPolicy Bypass -File verify-azure-backend.ps1
echo.

echo ========================================
echo   Próximos Pasos Recomendados
echo ========================================
echo.
echo   1. Verificar conectividad con backend:
echo      powershell -ExecutionPolicy Bypass -File verify-azure-backend.ps1
echo.
echo   2. Probar localmente con Azure:
echo      serve-azure.bat
echo.
echo   3. Si todo funciona, hacer build:
echo      build-production.bat
echo.
echo   4. Leer guía de despliegue:
echo      GUIA_DESPLIEGUE_AZURE.md
echo.

pause

