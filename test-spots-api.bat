@echo off
echo ================================================================
echo PROBANDO RUTAS DE SPOTS EN LOCALHOST:3001
echo ================================================================
echo.

set PARKING_ID=1764488309993

echo 1. Testing GET /api/parkings/%PARKING_ID%/spots
echo ----------------------------------------------------------------
curl -X GET "http://localhost:3001/api/parkings/%PARKING_ID%/spots" -H "Content-Type: application/json"
echo.
echo.

echo 2. Testing POST /api/parkings/%PARKING_ID%/spots (crear spot individual)
echo ----------------------------------------------------------------
curl -X POST "http://localhost:3001/api/parkings/%PARKING_ID%/spots" ^
     -H "Content-Type: application/json" ^
     -d "{\"row\": 1, \"column\": 3, \"label\": \"C1\"}"
echo.
echo.

echo 3. Testing POST /api/parkings/%PARKING_ID%/spots/bulk (crear spots masivos)
echo ----------------------------------------------------------------
curl -X POST "http://localhost:3001/api/parkings/%PARKING_ID%/spots/bulk" ^
     -H "Content-Type: application/json" ^
     -d "[{\"row\": 1, \"column\": 4, \"label\": \"D1\"}, {\"row\": 2, \"column\": 4, \"label\": \"D2\"}]"
echo.
echo.

echo 4. Testing PATCH /api/parkings/%PARKING_ID%/spots/1 (actualizar spot)
echo ----------------------------------------------------------------
curl -X PATCH "http://localhost:3001/api/parkings/%PARKING_ID%/spots/1" ^
     -H "Content-Type: application/json" ^
     -d "{\"status\": \"OCCUPIED\"}"
echo.
echo.

echo 5. Testing DELETE /api/parkings/%PARKING_ID%/spots/999 (eliminar spot)
echo ----------------------------------------------------------------
curl -X DELETE "http://localhost:3001/api/parkings/%PARKING_ID%/spots/999"
echo.
echo.

echo ================================================================
echo PRUEBAS COMPLETADAS
echo ================================================================
pause
