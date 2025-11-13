@echo off
echo ========================================
echo  REINICIANDO SERVIDOR JSON
echo ========================================
echo.
echo Matando proceso node en puerto 3001...
netstat -ano | findstr :3001 > temp_port.txt
for /f "tokens=5" %%a in (temp_port.txt) do (
    echo Matando proceso %%a
    taskkill /PID %%a /F
)
del temp_port.txt

echo.
echo Esperando 2 segundos...
timeout /t 2 /nobreak >nul

echo.
echo Iniciando servidor JSON con middleware actualizado...
start "JSON Server" cmd /k "json-server --watch server/db.json --port 3001 --middlewares server/middleware.js server/analytics.middleware.js server/iot.middleware.js server/billing.middleware.js server/notifications.middleware.js server/reviews-kpis.middleware.js"

echo.
echo ========================================
echo Servidor JSON reiniciado!
echo ========================================
echo.
echo Verificar en la consola del servidor que muestre:
echo [Reviews Middleware] Path original: /api/reviews/kpis
echo [Reviews Middleware] KPIs calculados: ...
echo.
pause

