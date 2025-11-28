@echo off
REM ================================================================
REM Script para construir SpotFinder para producción (Azure Backend)
REM ================================================================
echo.
echo ========================================
echo   SpotFinder - Build para Producción
echo   Backend: Azure
echo ========================================
echo.

echo [1/3] Limpiando builds anteriores...
if exist "dist" (
    rmdir /s /q dist
    echo   ✓ Directorio dist eliminado
) else (
    echo   ✓ No hay builds anteriores
)

echo.
echo [2/3] Compilando para producción...
echo   - Optimización: Habilitada
echo   - Source Maps: Deshabilitados
echo   - Backend URL: Azure
echo   - Log HTTP: Deshabilitado
echo.

call ng build --configuration=production

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ ERROR: Falló la compilación
    echo.
    pause
    exit /b 1
)

echo.
echo [3/3] Verificando build...
if exist "dist\spotfinder-frontend-web\browser" (
    echo   ✓ Build exitoso
    echo.
    echo ========================================
    echo   ✅ Build completado
    echo ========================================
    echo.
    echo Archivos de producción en:
    echo   📁 dist\spotfinder-frontend-web\browser\
    echo.
    echo Próximos pasos:
    echo   1. Subir contenido de 'browser' a tu servidor web
    echo   2. Configurar servidor web (Nginx, Apache, IIS, etc.)
    echo   3. Asegurar configuración CORS en Azure backend
    echo   4. Verificar que HTTPS esté habilitado
    echo.
) else (
    echo   ❌ ERROR: No se encontró el directorio de build
)

echo.
pause

