@echo off
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║               PRUEBA: ELIMINACIÓN DE PARKINGS CORREGIDA                     ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo OBJETIVO: Verificar que se pueden eliminar parkings sin errores
echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo.
echo PROBLEMA SOLUCIONADO:
echo   ❌ ANTES: TypeError: Cannot read properties of null (reading 'toString')
echo   ✅ AHORA: Eliminación funciona correctamente
echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo.
echo PASOS PARA PROBAR:
echo.
echo 1️⃣  Observa la consola del servidor (ventana que se abrirá)
echo.
echo 2️⃣  En la aplicación web:
echo    └─ Inicia sesión
echo    └─ Ve a la lista de Parkings
echo    └─ Encuentra un parking que quieras eliminar
echo.
echo 3️⃣  Haz clic en el botón "Eliminar" o icono de eliminar
echo.
echo 4️⃣  Verifica en la consola del servidor:
echo    ✅ DEBE aparecer: "✅ [DELETE] Parking XXXXX eliminado correctamente"
echo    ✅ DEBE mostrar: "DELETE /parkings/XXXXX 204 X.XXX ms - -"
echo    ❌ NO DEBE aparecer: "TypeError" o "500"
echo.
echo 5️⃣  Verifica en la aplicación:
echo    ✅ El parking debe desaparecer de la lista
echo    ✅ NO debe mostrar error
echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo.
echo CÓDIGOS DE RESPUESTA:
echo   204 = Parking eliminado exitosamente ✅
echo   401 = Token inválido (vuelve a iniciar sesión)
echo   403 = No tienes permisos (no eres el dueño)
echo   404 = Parking no encontrado
echo   500 = Error del servidor ❌
echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo.
pause

echo.
echo Iniciando servidores...
echo.

start "JSON Server - Observa esta ventana" cmd /k "cd /d %~dp0 && echo ════════════════════════════════════════════════════════════════ && echo CONSOLA DEL SERVIDOR - Observa los logs de DELETE aquí && echo ════════════════════════════════════════════════════════════════ && echo. && json-server --watch server/db.json --port 3001 --routes server/routes.json --middlewares server/middleware.js server/iot.middleware.js server/reservations.middleware.js server/reviews.middleware.js server/reviews-kpis.middleware.js server/billing.middleware.js server/notifications.middleware.js server/analytics.middleware.js"

timeout /t 3

start "Angular Dev" cmd /k "cd /d %~dp0 && ng serve --open"

echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo Servidores iniciados!
echo • JSON Server: http://localhost:3001
echo • Angular: http://localhost:4200
echo.
echo IMPORTANTE:
echo • Observa la ventana "JSON Server - Observa esta ventana"
echo • Ahí verás los logs cuando elimines un parking
echo ════════════════════════════════════════════════════════════════════════════════
echo.
echo Presiona cualquier tecla para cerrar este script
echo (Los servidores seguirán ejecutándose)
pause > nul

