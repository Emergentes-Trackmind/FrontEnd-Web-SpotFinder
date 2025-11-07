@echo off
echo.
echo ========================================
echo  REINICIANDO SERVIDOR MOCK
echo ========================================
echo.
echo Por favor, sigue estos pasos:
echo.
echo 1. Si el servidor mock está corriendo, presiona Ctrl+C para detenerlo
echo 2. Luego ejecuta: npm run mock:server
echo.
echo Las rutas de billing ahora están correctamente configuradas:
echo   - GET /api/billing/me
echo   - GET /api/billing/plans
echo   - POST /api/billing/subscribe
echo   - POST /api/billing/cancel
echo.
echo Una vez reiniciado, recarga la página en el navegador.
echo.
pause

