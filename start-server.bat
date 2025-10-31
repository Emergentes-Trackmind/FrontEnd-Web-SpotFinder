@echo off
echo ============================================
echo   Iniciando Servidor Mock de SpotFinder
echo ============================================
echo.

cd /d "%~dp0"

echo [1/3] Deteniendo procesos anteriores...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/3] Iniciando servidor mock...
echo.
echo Servidor corriendo en: http://127.0.0.1:3001
echo.
echo Presiona Ctrl+C para detener el servidor
echo ============================================
echo.

npm run mock:server

pause

