# Script para probar los endpoints de Billing

Write-Host "`n=== PRUEBA DE ENDPOINTS DE BILLING ===" -ForegroundColor Cyan

# Configuración
$baseUrl = "http://127.0.0.1:3001/api"

# 1. Registrar un nuevo usuario
Write-Host "`n1. Registrando nuevo usuario..." -ForegroundColor Yellow
$registerBody = @{
    email = "test_billing_$(Get-Date -Format 'HHmmss')@gmail.com"
    password = "test123"
    firstName = "Test"
    lastName = "Billing"
    acceptTerms = $true
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    $token = $registerResponse.accessToken
    $userId = $registerResponse.user.id

    Write-Host "✅ Usuario registrado exitosamente" -ForegroundColor Green
    Write-Host "   UserID: $userId" -ForegroundColor Gray
    Write-Host "   Plan: $($registerResponse.user.plan)" -ForegroundColor Gray
    Write-Host "   Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Error al registrar usuario: $_" -ForegroundColor Red
    exit 1
}

# Headers con autenticación
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# 2. Obtener información de suscripción
Write-Host "`n2. Obteniendo información de suscripción..." -ForegroundColor Yellow
try {
    $meResponse = Invoke-RestMethod -Uri "$baseUrl/billing/me" -Method Get -Headers $headers
    Write-Host "✅ Información de suscripción obtenida" -ForegroundColor Green
    Write-Host "   Plan actual: $($meResponse.plan.name) ($($meResponse.plan.code))" -ForegroundColor Gray
    Write-Host "   Estado: $($meResponse.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error al obtener suscripción: $_" -ForegroundColor Red
}

# 3. Obtener planes disponibles
Write-Host "`n3. Obteniendo planes disponibles..." -ForegroundColor Yellow
try {
    $plansResponse = Invoke-RestMethod -Uri "$baseUrl/billing/plans" -Method Get -Headers $headers
    Write-Host "✅ Planes disponibles obtenidos: $($plansResponse.Count)" -ForegroundColor Green
    foreach ($plan in $plansResponse) {
        Write-Host "   - $($plan.name) ($($plan.code)): €$($plan.price)/$($plan.interval)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Error al obtener planes: $_" -ForegroundColor Red
}

# 4. Actualizar a plan Premium
Write-Host "`n4. Actualizando a plan Premium..." -ForegroundColor Yellow
$subscribeBody = @{
    planCode = "ADVANCED"
} | ConvertTo-Json

try {
    $subscribeResponse = Invoke-RestMethod -Uri "$baseUrl/billing/subscribe" -Method Post -Body $subscribeBody -Headers $headers
    Write-Host "✅ Plan actualizado exitosamente" -ForegroundColor Green
    Write-Host "   Nuevo plan: $($subscribeResponse.plan.name) ($($subscribeResponse.plan.code))" -ForegroundColor Gray
    Write-Host "   Estado: $($subscribeResponse.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error al actualizar plan: $_" -ForegroundColor Red
}

# 5. Verificar cambio de plan
Write-Host "`n5. Verificando cambio de plan..." -ForegroundColor Yellow
try {
    $meResponse2 = Invoke-RestMethod -Uri "$baseUrl/billing/me" -Method Get -Headers $headers
    Write-Host "✅ Plan verificado" -ForegroundColor Green
    Write-Host "   Plan actual: $($meResponse2.plan.name) ($($meResponse2.plan.code))" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error al verificar plan: $_" -ForegroundColor Red
}

# 6. Cancelar suscripción (volver a plan básico)
Write-Host "`n6. Cancelando suscripción (volver a plan básico)..." -ForegroundColor Yellow
try {
    $cancelResponse = Invoke-RestMethod -Uri "$baseUrl/billing/cancel" -Method Post -Body "{}" -Headers $headers
    Write-Host "✅ Suscripción cancelada exitosamente" -ForegroundColor Green
    Write-Host "   Plan actual: $($cancelResponse.plan.name) ($($cancelResponse.plan.code))" -ForegroundColor Gray
    Write-Host "   Estado: $($cancelResponse.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error al cancelar suscripción: $_" -ForegroundColor Red
}

# 7. Verificar que volvió a plan básico
Write-Host "`n7. Verificando vuelta a plan básico..." -ForegroundColor Yellow
try {
    $meResponse3 = Invoke-RestMethod -Uri "$baseUrl/billing/me" -Method Get -Headers $headers
    Write-Host "✅ Plan verificado" -ForegroundColor Green
    Write-Host "   Plan actual: $($meResponse3.plan.name) ($($meResponse3.plan.code))" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error al verificar plan: $_" -ForegroundColor Red
}

Write-Host "`n=== PRUEBAS COMPLETADAS ===" -ForegroundColor Cyan

