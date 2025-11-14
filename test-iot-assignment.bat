@echo off
echo ========================================
echo Probando asignacion de dispositivos IoT
echo ========================================
echo.
echo Este script va a:
echo 1. Iniciar el servidor JSON
echo 2. Iniciar la aplicacion Angular
echo.
echo Pasos para probar:
echo 1. Ve a Parkings / Crear Parking
echo 2. Completa el Step 1 (informacion basica)
echo 3. En el Step 2 (Visualizador de Plazas):
echo    - Haz clic en "Asignar" en un dispositivo IoT
echo    - Selecciona una plaza del menu
echo    - Verifica que aparece "Asignado a la plaza X"
echo 4. Haz clic en "Siguiente"
echo 5. En el Step Review verifica que muestre los dispositivos asignados
echo 6. Si vuelves al Step 2, verifica que las asignaciones se mantienen
echo.
echo IMPORTANTE: Abre la Consola del Navegador (F12) para ver los logs:
echo - "Asignando dispositivo..." cuando asignas
echo - "Spot X actualizado..." para confirmar
echo - "Guardando N spots, M con dispositivos..." al hacer clic en Siguiente
echo - "Step Review - Cargados N spots, M con dispositivos..." en el review
echo.
pause

echo Iniciando servidor JSON en puerto 3001...
start "JSON Server" cmd /k "cd /d %~dp0 && json-server --watch server/db.json --port 3001 --routes server/routes.json --middlewares server/middleware.js server/iot.middleware.js server/reservations.middleware.js server/reviews.middleware.js server/reviews-kpis.middleware.js server/billing.middleware.js server/notifications.middleware.js server/analytics.middleware.js"

timeout /t 3

echo Iniciando Angular en modo desarrollo...
start "Angular Dev" cmd /k "cd /d %~dp0 && ng serve --open"

echo.
echo Servidores iniciados!
echo - JSON Server: http://localhost:3001
echo - Angular: http://localhost:4200
echo.
echo Presiona cualquier tecla para cerrar este script (los servidores seguiran ejecutandose)
pause

