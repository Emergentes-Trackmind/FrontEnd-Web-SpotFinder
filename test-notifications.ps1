# Script de Prueba de Notificaciones
# Usa PowerShell para probar los endpoints de notificaciones

# Variables
$baseUrl = "http://localhost:3001/api"
$token = "TU_TOKEN_JWT_AQUI"  # Reemplazar con un token real después del login

Write-Host "🔔 Test de Notificaciones - SpotFinder" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Listar notificaciones
Write-Host "1️⃣  Listando notificaciones..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/notifications" -Method GET -Headers $headers
    Write-Host "✅ Notificaciones obtenidas: $($response.Count)" -ForegroundColor Green
    $response | ForEach-Object {
        Write-Host "   - $($_.title) [$($_.kind)]" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Error al obtener notificaciones" -ForegroundColor Red
}

Write-Host ""

# Test 2: Registrar token FCM
Write-Host "2️⃣  Registrando token FCM..." -ForegroundColor Yellow
$fcmToken = "TEST_FCM_TOKEN_" + (Get-Random)
$body = @{
    token = $fcmToken
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/notifications/register-fcm-token" -Method POST -Headers $headers -Body $body
    Write-Host "✅ Token FCM registrado: $fcmToken" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al registrar token FCM" -ForegroundColor Red
}

Write-Host ""

# Test 3: Obtener contador de no leídas
Write-Host "3️⃣  Obteniendo contador de no leídas..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/notifications/unread-count" -Method GET -Headers $headers
    Write-Host "✅ Notificaciones no leídas: $($response.count)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al obtener contador" -ForegroundColor Red
}

Write-Host ""

# Test 4: Enviar notificación
Write-Host "4️⃣  Enviando notificación de prueba..." -ForegroundColor Yellow
$notification = @{
    userId = "1761826163261"
    title = "Prueba de Notificación"
    body = "Esta es una notificación de prueba enviada desde el script."
    kind = "info"
    sendEmail = $true
    actionLabel = "Ver dashboard"
    actionUrl = "/dashboard"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/notifications/send" -Method POST -Headers $headers -Body $notification
    Write-Host "✅ Notificación enviada correctamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al enviar notificación" -ForegroundColor Red
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "✨ Tests completados" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Nota: Asegúrate de tener el servidor mock corriendo (npm run mock:server)" -ForegroundColor Yellow
Write-Host "💡 Y reemplaza TU_TOKEN_JWT_AQUI con un token válido" -ForegroundColor Yellow

