@echo off
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║          PRUEBA: LISTA DE DISPOSITIVOS IOT CONECTADA                         ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo OBJETIVO: Verificar que los dispositivos IoT creados se muestren en la lista
echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo.
echo PROBLEMA RESUELTO:
echo   ❌ ANTES: Dispositivos creados pero no visibles en la lista
echo   ✅ AHORA: Dispositivos se muestran inmediatamente
echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo.
echo IMPORTANTE: CIERRA TODAS LAS VENTANAS DEL NAVEGADOR PRIMERO
echo (Para limpiar la caché HTTP que estaba causando problemas)
echo.
echo PASOS PARA PROBAR:
echo.
echo 1️⃣  OBSERVA LAS CONSOLAS que se abrirán
echo    • Consola del Servidor JSON: Mostrará logs de creación
echo    • Consola del Navegador (F12): Mostrará logs del frontend
echo.
echo 2️⃣  En la aplicación web:
echo    └─ Ve a "Dispositivos IoT" (menú lateral)
echo    └─ Observa el estado inicial:
echo       • KPIs pueden estar en 0 o mostrar dispositivos existentes
echo       • La tabla puede estar vacía o con dispositivos
echo.
echo 3️⃣  Haz clic en "Añadir Dispositivo"
echo    └─ Llena el formulario:
echo       • Serial Number: TEST-001 (o cualquier otro)
echo       • Model: Sensor de prueba
echo       • Type: Sensor / Cámara / Barrera
echo       • Parking: (Opcional - puedes dejarlo vacío)
echo    └─ Haz clic en "Guardar"
echo.
echo 4️⃣  VERIFICA EN LA CONSOLA DEL SERVIDOR:
echo    ✅ DEBE aparecer: "✅ [IOT] Dispositivo creado para usuario X: dev-XXXXX"
echo    ✅ DEBE aparecer: "📊 [IOT] Usuario X tiene 1 dispositivos (propios + en parkings)"
echo.
echo 5️⃣  VERIFICA EN EL DASHBOARD (debe actualizarse automáticamente):
echo    ✅ KPIs deben mostrar "Total Dispositivos: 1" (o incrementarse)
echo    ✅ La tabla DEBE mostrar el dispositivo recién creado
echo    ✅ El dispositivo debe aparecer con:
echo       • Serial Number correcto
echo       • Model correcto
echo       • Parking: "Sin asignar" (si no asignaste parking)
echo       • Estado: "Offline" (por defecto)
echo.
echo 6️⃣  VERIFICA EN LA CONSOLA DEL NAVEGADOR (F12):
echo    ✅ DEBE aparecer: "✅ [DevicesFacade] Dispositivos cargados: {data: [...], total: 1}"
echo    ✅ DEBE aparecer: "📊 [DevicesDashboard] Dispositivos cargados: {total: 1, data: 1}"
echo.
echo 7️⃣  VERIFICA EN LOS PLANES (Dashboard principal):
echo    └─ Ve al Dashboard principal
echo    └─ Mira la sección de "Plan Actual"
echo    ✅ Debe mostrar "iot: {current: 1, limit: 10}" (o el valor correspondiente)
echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo.
echo RESULTADO ESPERADO:
echo.
echo ✅ Dispositivo se crea correctamente
echo ✅ Dispositivo aparece en la lista INMEDIATAMENTE
echo ✅ KPIs se actualizan correctamente
echo ✅ Planes muestran el conteo correcto
echo ✅ TODO está sincronizado
echo.
echo SI ALGO FALLA:
echo • Revisa la consola del servidor (logs rojos)
echo • Revisa la consola del navegador (F12)
echo • Busca errores 401, 403, 404, 500
echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo.
pause

echo.
echo Iniciando servidores...
echo.

start "JSON Server - Observa los logs de IoT" cmd /k "cd /d %~dp0 && echo ════════════════════════════════════════════════════════════════ && echo CONSOLA DEL SERVIDOR - Observa los logs de [IOT] aquí && echo ════════════════════════════════════════════════════════════════ && echo. && json-server --watch server/db.json --port 3001 --routes server/routes.json --middlewares server/middleware.js server/iot.middleware.js server/reservations.middleware.js server/reviews.middleware.js server/reviews-kpis.middleware.js server/billing.middleware.js server/notifications.middleware.js server/analytics.middleware.js"

timeout /t 3

start "Angular Dev" cmd /k "cd /d %~dp0 && ng serve --open"

echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo Servidores iniciados!
echo • JSON Server: http://localhost:3001
echo • Angular: http://localhost:4200
echo.
echo IMPORTANTE:
echo 1. Observa la ventana "JSON Server - Observa los logs de IoT"
echo 2. Abre la Consola del Navegador (F12) en la aplicación
echo 3. Crea un dispositivo y verifica que se muestre en la lista
echo.
echo LOGS A BUSCAR EN LA CONSOLA DEL NAVEGADOR (F12):
echo.
echo AL CARGAR EL DASHBOARD:
echo • "🔄 [DevicesDashboard] Cargando límites..."
echo • "✅ [DevicesDashboard] Límites cargados: {iot: {current: 0, ...}}"
echo • "🔄 [DevicesDashboard] Iniciando carga de dispositivos..."
echo • "📥 [DevicesDashboard] Respuesta recibida: {data: [...], total: 1}"
echo • "🔢 [DevicesDashboard] Actualizando conteo IoT a: 1"
echo • "✅ [DevicesDashboard] Conteo IoT actualizado: {iot: {current: 1, ...}}"
echo.
echo EN EL SERVIDOR:
echo • "✅ [IOT] Dispositivo creado para usuario..."
echo • "📊 [IOT] Usuario X tiene Y dispositivos..."
echo ════════════════════════════════════════════════════════════════════════════════
echo.
echo Presiona cualquier tecla para cerrar este script
echo (Los servidores seguirán ejecutándose)
pause > nul

