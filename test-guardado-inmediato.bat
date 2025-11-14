@echo off
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║           PRUEBA: GUARDADO INMEDIATO DE DISPOSITIVOS IOT                    ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo OBJETIVO: Verificar que las asignaciones se guardan INMEDIATAMENTE
echo sin necesidad de hacer clic en "Siguiente"
echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo.
echo PASOS A SEGUIR:
echo.
echo 1️⃣  ABRE LA CONSOLA DEL NAVEGADOR (F12) - MUY IMPORTANTE
echo.
echo 2️⃣  Navega a: Crear Parking
echo    └─ Completa el Step 1 (información básica)
echo.
echo 3️⃣  En Step 2 (Visualizador de Plazas):
echo    └─ Haz clic en "Asignar" en un dispositivo IoT
echo    └─ Selecciona una plaza del menú
echo    └─ VERIFICA en consola: "💾 Estado guardado inmediatamente - 1 dispositivos"
echo    └─ VERIFICA UI: El dispositivo muestra "Asignado a la plaza X"
echo.
echo 4️⃣  PRUEBA CRÍTICA - Sin hacer clic en "Siguiente":
echo    └─ Navega DIRECTAMENTE al último step (Step Review)
echo    └─ Puedes hacerlo:
echo       • Haciendo clic en el indicador de pasos superior
echo       • O navegando manualmente en la URL
echo.
echo 5️⃣  En Step Review (VERIFICACIÓN PRINCIPAL):
echo    ✅ DEBE MOSTRAR: "1 dispositivos asignados"
echo    ✅ DEBE LISTAR: La asignación del dispositivo al spot
echo    ❌ NO DEBE MOSTRAR: "No hay dispositivos asignados"
echo.
echo    VERIFICA en consola:
echo    └─ "📊 Step Review - Cargados 5 spots, 1 con dispositivos IoT asignados"
echo    └─ "📱 Spots con dispositivos: [{spotNumber: X, deviceId: '...'}]"
echo.
echo 6️⃣  Vuelve al Step 2:
echo    ✅ El dispositivo DEBE seguir mostrando "Asignado a la plaza X"
echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo.
echo RESULTADO ESPERADO:
echo ✅ Las asignaciones se guardan INMEDIATAMENTE
echo ✅ Step Review muestra correctamente los dispositivos asignados
echo ✅ NO necesitas hacer clic en "Siguiente" para guardar
echo ✅ Navegación libre entre steps sin perder datos
echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo.
echo SI ALGO FALLA:
echo • Copia TODOS los logs de la consola
echo • Toma screenshot del Step Review
echo • Verifica que aparezca el log "💾 Estado guardado inmediatamente"
echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo.
pause

echo.
echo Iniciando servidores...
echo.

start "JSON Server" cmd /k "cd /d %~dp0 && json-server --watch server/db.json --port 3001 --routes server/routes.json --middlewares server/middleware.js server/iot.middleware.js server/reservations.middleware.js server/reviews.middleware.js server/reviews-kpis.middleware.js server/billing.middleware.js server/notifications.middleware.js server/analytics.middleware.js"

timeout /t 3

start "Angular Dev" cmd /k "cd /d %~dp0 && ng serve --open"

echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo Servidores iniciados!
echo • JSON Server: http://localhost:3001
echo • Angular: http://localhost:4200
echo ════════════════════════════════════════════════════════════════════════════════
echo.
echo NO OLVIDES:
echo 1. Abrir Consola del Navegador (F12)
echo 2. Ir DIRECTAMENTE al Step Review después de asignar
echo 3. Verificar que muestra "1 dispositivos asignados"
echo.
pause

