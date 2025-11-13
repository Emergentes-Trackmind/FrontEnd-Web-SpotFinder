@echo off
echo Iniciando servidores de desarrollo...
echo.
echo Servidor Mock: http://127.0.0.1:3001
echo Servidor Angular: http://localhost:4200
echo.
echo Iniciando Mock Server con todos los middlewares y rutas...
start "Mock Server" cmd /k "npx json-server --watch server/db.json --routes server/routes.json --port 3001 --middlewares server/middleware.js server/analytics.middleware.js server/iot.middleware.js server/billing.middleware.js server/notifications.middleware.js server/reviews-kpis.middleware.js"
timeout /t 5 /nobreak >nul
echo Iniciando Angular Dev Server...
start "Angular Dev Server" cmd /k "ng serve"
echo.
echo Servidores iniciados en ventanas separadas
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul

