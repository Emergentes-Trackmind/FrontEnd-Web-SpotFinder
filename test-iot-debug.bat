@echo off
echo ========================================
echo TEST: Asignacion de Dispositivos IoT
echo ========================================
echo.
echo PASOS PARA PROBAR:
echo.
echo 1. Abre la Consola del Navegador (F12)
echo 2. Ve a Crear Parking
echo 3. Completa Step 1 (info basica)
echo.
echo 4. En Step 2 - Visualizador de Plazas:
echo    - Busca el log: "Restaurando X spots guardados, Y con dispositivos"
echo    - Haz clic en "Asignar" en un dispositivo
echo    - Busca el log: "📱 Asignando dispositivo..."
echo    - Busca el log: "✅ Spot X actualizado: {...}"
echo    - VERIFICA: El dispositivo debe mostrar "Asignado a la plaza X"
echo.
echo 5. Haz clic en "Siguiente":
echo    - Busca el log: "✅ Guardando X spots, Y con dispositivos..."
echo.
echo 6. En Step Review:
echo    - Busca el log: "📊 Step Review - Cargados X spots, Y con dispositivos..."
echo    - VERIFICA: Debe mostrar "X dispositivos asignados"
echo.
echo 7. HAZ CLIC EN "ANTERIOR" para volver al Step 2:
echo    - Busca el log: "✅ Restaurando X spots guardados, Y con dispositivos"
echo    - Busca el log: "📱 Spots con dispositivos: [...]"
echo    - Busca el log: "✅ Y dispositivos IoT disponibles"
echo    - Busca el log: "🔄 Sincronizados Y dispositivos con sus spots"
echo    - VERIFICA: El dispositivo DEBE seguir mostrando "Asignado a la plaza X"
echo.
echo ========================================
echo Si el dispositivo NO muestra la asignacion:
echo - Copia TODOS los logs de la consola
echo - Busca errores en rojo
echo ========================================
echo.
pause

start "JSON Server" cmd /k "cd /d %~dp0 && json-server --watch server/db.json --port 3001 --routes server/routes.json --middlewares server/middleware.js server/iot.middleware.js server/reservations.middleware.js server/reviews.middleware.js server/reviews-kpis.middleware.js server/billing.middleware.js server/notifications.middleware.js server/analytics.middleware.js"

timeout /t 3

start "Angular Dev" cmd /k "cd /d %~dp0 && ng serve --open"

echo.
echo Servidores iniciados!
pause

