@echo off
echo ========================================
echo  REINICIANDO SERVIDOR - FIX ARCHIVE
echo ========================================
echo.
echo Cerrando servidor actual...
taskkill /F /IM node.exe /T 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Iniciando servidor con middleware corregido...
cd /d C:\Users\user\WebstormProjects\FrontEnd-Web-SpotFinder
start "JSON Server" cmd /k "json-server --watch server/db.json --port 3001 --middlewares server/middleware.js server/analytics.middleware.js server/iot.middleware.js server/billing.middleware.js server/notifications.middleware.js server/reviews-kpis.middleware.js"

echo.
echo ========================================
echo Servidor reiniciado!
echo ========================================
echo.
echo Ahora prueba:
echo 1. Recarga el frontend (Ctrl + Shift + R)
echo 2. Intenta ocultar una review
echo 3. Deberia funcionar correctamente
echo.
echo Logs a verificar en la consola del servidor:
echo [Reviews Middleware] Archivando review: rev_X
echo [Reviews Middleware] Transformado a: /reviews/rev_X
echo [Reviews Middleware] Body: { archived: true, ... }
echo.
pause

