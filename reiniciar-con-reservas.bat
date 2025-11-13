@echo off
echo ========================================
echo  REINICIANDO SERVIDOR - NUEVAS RESERVAS
echo ========================================
echo.
echo Deteniendo servidor actual...
taskkill /F /IM node.exe /T 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Iniciando servidor con las 8 nuevas reservas...
cd /d C:\Users\user\WebstormProjects\FrontEnd-Web-SpotFinder
start "JSON Server - Reservas Lucas" cmd /k "npm run mock:server"

echo.
echo ========================================
echo Servidor reiniciado!
echo ========================================
echo.
echo Pasos siguientes:
echo 1. Espera 5 segundos a que el servidor inicie
echo 2. Recarga el navegador (Ctrl + Shift + R)
echo 3. Deberia ver las 8 reservas de Estacionamiento Lucas
echo.
echo En la consola del servidor deberias ver:
echo [Reservations Middleware] Filtrando por parkingOwnerId: 1761826163261
echo.
pause

