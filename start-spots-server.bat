@echo off
echo ================================================================
echo INICIANDO SERVIDOR MOCK CON SOPORTE PARA SPOTS
echo ================================================================
echo.
echo Servidor: http://localhost:3001
echo.
echo Rutas de Spots disponibles:
echo   GET    /api/parkings/{id}/spots
echo   POST   /api/parkings/{id}/spots
echo   POST   /api/parkings/{id}/spots/bulk
echo   PATCH  /api/parkings/{id}/spots/{spotId}
echo   DELETE /api/parkings/{id}/spots/{spotId}
echo.
echo ================================================================

npm run mock:server
