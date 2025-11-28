@echo off
REM ================================================================
REM Script para verificar configuración de Firebase en SpotFinder
REM ================================================================
echo.
echo ========================================
echo   Verificación Firebase - SpotFinder
echo ========================================
echo.

echo [INFO] Verificando configuración de Firebase para push notifications...
echo.

set "ALL_OK=1"

echo [1/6] Verificando archivos de configuración...
echo.

REM Verificar environments
findstr /C:"TU_API_KEY" "src\environments\environment.ts" >nul
if %ERRORLEVEL% EQU 0 (
    echo   [31m✗[0m environment.ts - Firebase NO configurado
    echo   [33m  → Editar: src\environments\environment.ts[0m
    set "ALL_OK=0"
) else (
    echo   [32m✓[0m environment.ts - Firebase configurado
)

findstr /C:"TU_API_KEY" "src\environments\environment.production.ts" >nul
if %ERRORLEVEL% EQU 0 (
    echo   [31m✗[0m environment.production.ts - Firebase NO configurado
    echo   [33m  → Editar: src\environments\environment.production.ts[0m
    set "ALL_OK=0"
) else (
    echo   [32m✓[0m environment.production.ts - Firebase configurado
)

findstr /C:"TU_API_KEY" "src\environments\environment.development.ts" >nul
if %ERRORLEVEL% EQU 0 (
    echo   [31m✗[0m environment.development.ts - Firebase NO configurado
    echo   [33m  → Editar: src\environments\environment.development.ts[0m
    set "ALL_OK=0"
) else (
    echo   [32m✓[0m environment.development.ts - Firebase configurado
)

echo.
echo [2/6] Verificando Service Worker...
echo.

if exist "public\firebase-messaging-sw.js" (
    findstr /C:"TU_API_KEY" "public\firebase-messaging-sw.js" >nul
    if %ERRORLEVEL% EQU 0 (
        echo   [31m✗[0m firebase-messaging-sw.js - Firebase NO configurado
        echo   [33m  → Editar: public\firebase-messaging-sw.js[0m
        set "ALL_OK=0"
    ) else (
        echo   [32m✓[0m firebase-messaging-sw.js - Firebase configurado
    )
) else (
    echo   [31m✗[0m firebase-messaging-sw.js - Archivo NO encontrado
    set "ALL_OK=0"
)

echo.
echo [3/6] Verificando dependencias de Firebase...
echo.

findstr /C:"\"firebase\"" "package.json" >nul
if %ERRORLEVEL% EQU 0 (
    echo   [32m✓[0m Dependencia firebase encontrada en package.json
) else (
    echo   [31m✗[0m Dependencia firebase NO encontrada
    echo   [33m  → Ejecutar: npm install firebase@10.7.1[0m
    set "ALL_OK=0"
)

echo.
echo [4/6] Verificando servicios de notificaciones...
echo.

if exist "src\app\notifications\services\fcm.service.ts" (
    echo   [32m✓[0m fcm.service.ts
) else (
    echo   [31m✗[0m fcm.service.ts NO encontrado
    set "ALL_OK=0"
)

if exist "src\app\notifications\services\notifications.service.ts" (
    echo   [32m✓[0m notifications.service.ts
) else (
    echo   [31m✗[0m notifications.service.ts NO encontrado
    set "ALL_OK=0"
)

if exist "src\app\notifications\services\notifications-api.client.ts" (
    echo   [32m✓[0m notifications-api.client.ts
) else (
    echo   [31m✗[0m notifications-api.client.ts NO encontrado
    set "ALL_OK=0"
)

echo.
echo [5/6] Verificando configuración del backend...
echo.

echo   [33m⚠[0m  Verificar manualmente en el backend:
echo   [33m  → Dependencia firebase-admin en pom.xml[0m
echo   [33m  → Archivo firebase-service-account.json[0m
echo   [33m  → FirebaseConfig.java creado[0m
echo   [33m  → FcmService.java creado[0m
echo   [33m  → Tabla fcm_tokens creada[0m
echo   [33m  → Endpoints /register-fcm-token y /send actualizados[0m

echo.
echo [6/6] Verificando node_modules...
echo.

if exist "node_modules\firebase" (
    echo   [32m✓[0m node_modules\firebase instalado
) else (
    echo   [31m✗[0m node_modules\firebase NO instalado
    echo   [33m  → Ejecutar: npm install[0m
    set "ALL_OK=0"
)

echo.
echo ========================================
echo   Resumen de Verificación
echo ========================================
echo.

if "%ALL_OK%"=="1" (
    echo [32m✅ Firebase está correctamente configurado[0m
    echo.
    echo [INFO] Puedes iniciar el servidor:
    echo   ng serve --configuration=development
    echo.
    echo [INFO] Al abrir la app, deberías ver:
    echo   - Solicitud de permisos de notificaciones
    echo   - Token FCM obtenido en console
    echo   - Token registrado en backend
) else (
    echo [31m❌ Firebase NO está completamente configurado[0m
    echo.
    echo [INFO] Pasos siguientes:
    echo.
    echo   1. Lee la guía completa:
    echo      GUIA_FIREBASE_PUSH_NOTIFICATIONS.md
    echo.
    echo   2. Crea proyecto en Firebase Console:
    echo      https://console.firebase.google.com/
    echo.
    echo   3. Obtén las credenciales de Firebase
    echo.
    echo   4. Actualiza los archivos marcados con ✗
    echo.
    echo   5. Ejecuta: npm install
    echo.
    echo   6. Vuelve a ejecutar este script para verificar
)

echo.
echo ========================================
echo   Información Adicional
echo ========================================
echo.

echo [INFO] Archivos que necesitan configuración de Firebase:
echo.
echo   FRONTEND:
echo   - src\environments\environment.ts
echo   - src\environments\environment.production.ts
echo   - src\environments\environment.development.ts
echo   - src\environments\environment.simulation.ts
echo   - public\firebase-messaging-sw.js
echo.
echo   BACKEND:
echo   - pom.xml (dependencia firebase-admin)
echo   - src\main\resources\firebase-service-account.json
echo   - src\main\java\com\spotfinder\config\FirebaseConfig.java
echo   - src\main\java\com\spotfinder\service\FcmService.java
echo   - src\main\java\com\spotfinder\model\FcmToken.java
echo   - src\main\java\com\spotfinder\repository\FcmTokenRepository.java
echo   - src\main\java\com\spotfinder\controller\NotificationsController.java
echo.

echo [INFO] Valores que necesitas de Firebase Console:
echo.
echo   Para FRONTEND (environments y service worker):
echo   - apiKey: "AIzaSy..."
echo   - authDomain: "proyecto.firebaseapp.com"
echo   - projectId: "proyecto-id"
echo   - storageBucket: "proyecto.appspot.com"
echo   - messagingSenderId: "123456789"
echo   - appId: "1:123:web:abc..."
echo   - vapidKey: "BH7k8..." (Web Push Certificate)
echo.
echo   Para BACKEND (firebase-service-account.json):
echo   - Descarga el archivo JSON completo desde:
echo     Firebase Console → Configuración → Cuentas de servicio
echo     → Generar nueva clave privada
echo.

echo.
echo ========================================
echo   Testing Firebase
echo ========================================
echo.

echo [INFO] Una vez configurado, probar:
echo.
echo   1. Iniciar frontend:
echo      ng serve --configuration=development
echo.
echo   2. Abrir navegador:
echo      http://localhost:4200
echo.
echo   3. Verificar en DevTools Console (F12):
echo      ✅ Firebase inicializado correctamente
echo      ✅ Token FCM obtenido: eG7x...
echo      ✅ Token FCM registrado en backend
echo.
echo   4. Enviar notificación de prueba desde backend:
echo      curl -X POST http://localhost:8080/api/notifications/send
echo.
echo   5. Ver notificación aparecer:
echo      - En la app (si está abierta)
echo      - Del sistema operativo (si está minimizada)
echo.

set /p "OPEN_GUIDE=¿Deseas abrir la guía completa? (S/N): "
if /i "%OPEN_GUIDE%"=="S" (
    echo.
    echo [INFO] Abriendo guía...
    start GUIA_FIREBASE_PUSH_NOTIFICATIONS.md
) else (
    echo.
    echo [INFO] Puedes leer la guía en:
    echo   GUIA_FIREBASE_PUSH_NOTIFICATIONS.md
)

echo.
pause

