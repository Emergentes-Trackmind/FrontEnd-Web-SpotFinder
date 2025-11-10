@echo off
echo ========================================
echo    CORRECCION DE URLs DOBLES - DASHBOARD
echo ========================================
echo.

echo ❌ PROBLEMA DETECTADO:
echo   URLs se generaban como: /api/api/analytics/totals
echo   Causa: Concatenacion incorrecta en analytics.api.ts
echo.

echo ✅ SOLUCION APLICADA:
echo.

echo 1. Corregido analytics.api.ts:
echo    - Antes: baseUrl = environment.analytics.base
echo    - Ahora:  baseUrl = apiBase + analytics.base
echo.

echo 2. Corregido environments:
echo    - analytics.base: '/analytics' (sin /api)
echo    - apiBase: 'http://localhost:3001/api'
echo    - Resultado: 'http://localhost:3001/api/analytics'
echo.

echo 🔧 URLs CORREGIDAS:
echo   ✅ GET /api/analytics/totals
echo   ✅ GET /api/analytics/revenue
echo   ✅ GET /api/analytics/occupancy
echo   ✅ GET /api/analytics/activity
echo   ✅ GET /api/analytics/top-parkings
echo.

echo 🚀 PARA PROBAR:
echo   1. npm run dev
echo   2. Login en http://localhost:4200
echo   3. Verificar Network tab (sin URLs dobles)
echo   4. Dashboard debe cargar datos reales
echo.

echo ✅ Las URLs ahora son correctas y el dashboard deberia funcionar!
echo.
pause
