@echo off
REM ================================================================
REM Script para probar el sistema de notificaciones de SpotFinder
REM ================================================================
echo.
echo ========================================
echo   Prueba del Sistema de Notificaciones
echo ========================================
echo.

echo [INFO] Este script verifica y prueba el sistema de notificaciones
echo.

echo [1/5] Verificando archivos del sistema...
echo.

set "ALL_GOOD=1"

if exist "src\app\notifications\services\fcm.service.ts" (
    echo   [32m✓[0m fcm.service.ts
) else (
    echo   [31m✗[0m fcm.service.ts NO ENCONTRADO
    set "ALL_GOOD=0"
)

if exist "src\app\notifications\services\notifications.service.ts" (
    echo   [32m✓[0m notifications.service.ts
) else (
    echo   [31m✗[0m notifications.service.ts NO ENCONTRADO
    set "ALL_GOOD=0"
)

if exist "src\app\notifications\services\notifications-api.client.ts" (
    echo   [32m✓[0m notifications-api.client.ts
) else (
    echo   [31m✗[0m notifications-api.client.ts NO ENCONTRADO
    set "ALL_GOOD=0"
)

if exist "src\app\notifications\services\notifications-mock.service.ts" (
    echo   [32m✓[0m notifications-mock.service.ts
) else (
    echo   [33m⚠[0m notifications-mock.service.ts NO ENCONTRADO (opcional)
)

if exist "public\firebase-messaging-sw.js" (
    echo   [32m✓[0m firebase-messaging-sw.js
) else (
    echo   [31m✗[0m firebase-messaging-sw.js NO ENCONTRADO
    set "ALL_GOOD=0"
)

echo.
echo [2/5] Verificando configuración de Firebase...
echo.

findstr /C:"TU_API_KEY" "src\environments\environment.ts" >nul
if %ERRORLEVEL% EQU 0 (
    echo   [33m⚠[0m Firebase NO configurado en environment.ts
    echo   [33m  → FCM no funcionará hasta que configures Firebase[0m
    echo   [33m  → Las notificaciones funcionarán solo con el backend[0m
) else (
    echo   [32m✓[0m Firebase configurado en environment.ts
)

echo.
echo [3/5] Verificando endpoint del backend...
echo.

powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://spotfinderback-eaehduf4ehh7hjah.eastus2-01.azurewebsites.net/api/notifications' -Method GET -UseBasicParsing -ErrorAction Stop; Write-Host '  ✓ Endpoint /api/notifications responde (Status:' $response.StatusCode ')' -ForegroundColor Green; exit 0 } catch { $statusCode = $_.Exception.Response.StatusCode.Value__; if ($statusCode -eq 401 -or $statusCode -eq 403) { Write-Host '  ⚠ Endpoint existe pero requiere autenticación (Status:' $statusCode ')' -ForegroundColor Yellow; Write-Host '    → Esto es normal para endpoints protegidos' -ForegroundColor Gray; exit 0 } elseif ($statusCode -eq 404) { Write-Host '  ✗ Endpoint /api/notifications NO EXISTE (Status: 404)' -ForegroundColor Red; Write-Host '    → El backend no tiene el endpoint de notificaciones' -ForegroundColor Gray; exit 1 } else { Write-Host '  ✗ Error al verificar endpoint:' $_.Exception.Message -ForegroundColor Red; exit 1 } }"

set "ENDPOINT_STATUS=%ERRORLEVEL%"

echo.
echo [4/5] Verificando rutas de notificaciones...
echo.

findstr /C:"notificaciones" "src\app\app.routes.ts" >nul
if %ERRORLEVEL% EQU 0 (
    echo   [32m✓[0m Rutas de notificaciones configuradas
    echo   [32m  → /notificaciones - Página principal[0m
    echo   [32m  → /notificaciones/demo - Demo de toasts[0m
) else (
    echo   [31m✗[0m Rutas de notificaciones NO configuradas
    set "ALL_GOOD=0"
)

echo.
echo [5/5] Verificando componentes...
echo.

if exist "src\app\notifications\components\toast\toast-container.component.ts" (
    echo   [32m✓[0m Toast container
) else (
    echo   [31m✗[0m Toast container NO ENCONTRADO
    set "ALL_GOOD=0"
)

if exist "src\app\notifications\pages\notifications-page\notifications-page.component.ts" (
    echo   [32m✓[0m Página de notificaciones
) else (
    echo   [31m✗[0m Página de notificaciones NO ENCONTRADA
    set "ALL_GOOD=0"
)

echo.
echo ========================================
echo   Resumen de la Verificación
echo ========================================
echo.

if "%ALL_GOOD%"=="1" (
    echo [32m✓ Sistema de notificaciones configurado correctamente[0m
) else (
    echo [31m✗ Hay problemas con la configuración[0m
)

echo.
echo [INFO] Estado del sistema:
echo.

if "%ENDPOINT_STATUS%"=="0" (
    echo   [32m✓[0m Backend: Endpoint de notificaciones disponible
) else (
    echo   [33m⚠[0m Backend: Endpoint de notificaciones no verificado
    echo   [33m  → Usa el servicio mock para pruebas locales[0m
)

findstr /C:"TU_API_KEY" "src\environments\environment.ts" >nul
if %ERRORLEVEL% EQU 0 (
    echo   [33m⚠[0m Firebase: NO configurado
    echo   [33m  → Solo notificaciones del backend funcionarán[0m
    echo   [33m  → Para notificaciones push, configura Firebase[0m
) else (
    echo   [32m✓[0m Firebase: Configurado
)

echo.
echo ========================================
echo   Opciones de Prueba
echo ========================================
echo.
echo [1] Iniciar servidor con notificaciones:
echo     ng serve --configuration=development
echo.
echo [2] Probar página de notificaciones:
echo     http://localhost:4200/notificaciones
echo.
echo [3] Probar demo de toasts:
echo     http://localhost:4200/notificaciones/demo
echo.
echo [4] Ver documentación completa:
echo     ANALISIS_NOTIFICACIONES.md
echo.

set /p "START_SERVER=¿Deseas iniciar el servidor ahora? (S/N): "
if /i "%START_SERVER%"=="S" (
    echo.
    echo [INFO] Iniciando servidor de desarrollo...
    echo.
    ng serve --configuration=development
) else (
    echo.
    echo [INFO] Para iniciar el servidor manualmente, ejecuta:
    echo     ng serve --configuration=development
    echo.
)

pause

