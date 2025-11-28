@echo off
REM ================================================================
REM Script para servir SpotFinder con backend de Azure (Testing)
REM ================================================================
echo.
echo ================================================
echo   SpotFinder - Servidor de Desarrollo
echo   Conectado a: Backend Azure (Producción)
echo ================================================
echo.

echo [INFO] Iniciando servidor Angular...
echo.
echo   🌐 Frontend: http://localhost:4200
echo   🔗 Backend:  https://spotfinderback-eaehduf4ehh7hjah.eastus2-01.azurewebsites.net/api
echo.
echo   ⚠️  NOTA: Este modo usa el environment.ts (production)
echo            para probar contra el backend de Azure
echo.

REM Usar configuración de producción pero sin optimizaciones para desarrollo
ng serve --configuration=production --optimization=false --source-map=true

pause

