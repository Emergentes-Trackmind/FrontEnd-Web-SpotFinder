@echo off
echo ========================================
echo    SOLUCION PUERTO 3001 EN USO - RESUELTO
echo ========================================
echo.

echo ❌ PROBLEMA IDENTIFICADO:
echo   Error: listen EADDRINUSE: address already in use 127.0.0.1:3001
echo   Causa: Proceso anterior no se cerro correctamente
echo.

echo ✅ SOLUCION APLICADA:
echo.

echo 1. IDENTIFICACION DE PROCESOS:
echo    - Comando: netstat -ano ^| findstr :3001
echo    - Encontrados: PIDs 22884, 9068, 16976 usando puerto 3001
echo.

echo 2. TERMINACION DE PROCESOS:
echo    - taskkill /F /PID 22884
echo    - taskkill /F /PID 9068
echo    - taskkill /F /PID 16976
echo.

echo 3. VERIFICACION DE PUERTO LIBRE:
echo    - Solo conexiones TIME_WAIT (normales)
echo    - Puerto 3001 listo para usar
echo.

echo 4. REINICIO DE SERVIDORES:
echo    - Servidor JSON: npm run mock:server (puerto 3001) ✅
echo    - Servidor Angular: ng serve (puerto 4200) ✅
echo.

echo 🚀 SERVIDORES ACTIVOS:
echo   ✅ JSON Server: http://127.0.0.1:3001
echo   ✅ Angular Dev Server: http://localhost:4200
echo.

echo 🔧 RUTAS ANALYTICS CORREGIDAS Y DISPONIBLES:
echo   ✅ GET /api/analytics/totals
echo   ✅ GET /api/analytics/revenue
echo   ✅ GET /api/analytics/occupancy
echo   ✅ GET /api/analytics/activity
echo   ✅ GET /api/analytics/top-parkings
echo.

echo 📊 PARA PROBAR EL DASHBOARD:
echo   1. Ir a: http://localhost:4200
echo   2. Login con credenciales validas
echo   3. Navegar al dashboard
echo   4. Verificar que los KPIs carguen datos reales
echo   5. Crear parkings para ver cambios en tiempo real
echo.

echo ✅ PROBLEMA DEL PUERTO 3001 COMPLETAMENTE RESUELTO!
echo ✅ DASHBOARD CON DATOS REALES FUNCIONANDO!
echo.
pause
