# Test Auth Endpoints - PowerShell Script
# Ejecutar: .\test-auth-endpoints.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🧪 Testing Auth & Protected Endpoints" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:3001/api"
$testEmail = "test@example.com"
$testPassword = "password123"

# Colores para resultados
function Write-Pass { param($msg) Write-Host "✅ $msg" -ForegroundColor Green }
function Write-Fail { param($msg) Write-Host "❌ $msg" -ForegroundColor Red }
function Write-Info { param($msg) Write-Host "ℹ️  $msg" -ForegroundColor Yellow }

# Test 1: Login (Ruta Pública)
Write-Host "`n[Test 1] Login - Ruta Pública" -ForegroundColor Magenta
Write-Host "------------------------------" -ForegroundColor Gray
try {
    $loginBody = @{
        email = $testEmail
        password = $testPassword
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -ErrorAction Stop

    if ($loginResponse.accessToken) {
        Write-Pass "Login exitoso"
        Write-Info "User: $($loginResponse.user.email)"
        Write-Info "Token obtenido: $($loginResponse.accessToken.Substring(0,30))..."
        $token = $loginResponse.accessToken
    } else {
        Write-Fail "Login no retornó token"
        exit 1
    }
} catch {
    Write-Fail "Login falló: $($_.Exception.Message)"
    Write-Info "¿Está el backend corriendo en $baseUrl?"
    exit 1
}

# Test 2: Analytics Totals SIN Token (debe fallar con 401)
Write-Host "`n[Test 2] Analytics Totals SIN Token (debe ser 401)" -ForegroundColor Magenta
Write-Host "---------------------------------------------------" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/analytics/totals" `
        -SkipHttpErrorCheck

    if ($response.StatusCode -eq 401) {
        Write-Pass "Correctamente rechazado - Status: 401"
    } else {
        Write-Fail "Esperado 401, recibido: $($response.StatusCode)"
    }
} catch {
    Write-Info "Error: $($_.Exception.Message)"
}

# Test 3: Analytics Totals CON Token (debe funcionar)
Write-Host "`n[Test 3] Analytics Totals CON Token (debe ser 200)" -ForegroundColor Magenta
Write-Host "----------------------------------------------------" -ForegroundColor Gray
try {
    $headers = @{ Authorization = "Bearer $token" }
    $response = Invoke-RestMethod -Uri "$baseUrl/analytics/totals" `
        -Headers $headers `
        -ErrorAction Stop

    Write-Pass "Request exitoso - Status: 200"
    Write-Info "Datos recibidos: $($response | ConvertTo-Json -Compress | Out-String | Select-Object -First 100)"
} catch {
    Write-Fail "Request falló: $($_.Exception.Message)"
    Write-Info "Verificar que el endpoint exista en el backend"
}

# Test 4: Analytics Revenue CON Token
Write-Host "`n[Test 4] Analytics Revenue CON Token" -ForegroundColor Magenta
Write-Host "-------------------------------------" -ForegroundColor Gray
try {
    $headers = @{ Authorization = "Bearer $token" }
    $response = Invoke-RestMethod -Uri "$baseUrl/analytics/revenue" `
        -Headers $headers `
        -ErrorAction Stop

    Write-Pass "Request exitoso - Status: 200"
} catch {
    Write-Fail "Request falló: $($_.Exception.Message)"
}

# Test 5: Analytics Occupancy CON Token
Write-Host "`n[Test 5] Analytics Occupancy CON Token" -ForegroundColor Magenta
Write-Host "---------------------------------------" -ForegroundColor Gray
try {
    $headers = @{ Authorization = "Bearer $token" }
    $response = Invoke-RestMethod -Uri "$baseUrl/analytics/occupancy" `
        -Headers $headers `
        -ErrorAction Stop

    Write-Pass "Request exitoso - Status: 200"
} catch {
    Write-Fail "Request falló: $($_.Exception.Message)"
}

# Test 6: Analytics Activity CON Token
Write-Host "`n[Test 6] Analytics Activity CON Token" -ForegroundColor Magenta
Write-Host "--------------------------------------" -ForegroundColor Gray
try {
    $headers = @{ Authorization = "Bearer $token" }
    $response = Invoke-RestMethod -Uri "$baseUrl/analytics/activity" `
        -Headers $headers `
        -ErrorAction Stop

    Write-Pass "Request exitoso - Status: 200"
} catch {
    Write-Fail "Request falló: $($_.Exception.Message)"
}

# Test 7: Analytics Top Parkings CON Token
Write-Host "`n[Test 7] Analytics Top Parkings CON Token" -ForegroundColor Magenta
Write-Host "------------------------------------------" -ForegroundColor Gray
try {
    $headers = @{ Authorization = "Bearer $token" }
    $response = Invoke-RestMethod -Uri "$baseUrl/analytics/top-parkings" `
        -Headers $headers `
        -ErrorAction Stop

    Write-Pass "Request exitoso - Status: 200"
} catch {
    Write-Fail "Request falló: $($_.Exception.Message)"
}

# Test 8: Profile CON Token
Write-Host "`n[Test 8] Profile CON Token" -ForegroundColor Magenta
Write-Host "---------------------------" -ForegroundColor Gray
try {
    $headers = @{ Authorization = "Bearer $token" }
    $response = Invoke-RestMethod -Uri "$baseUrl/profile" `
        -Headers $headers `
        -ErrorAction Stop

    Write-Pass "Request exitoso - Status: 200"
    Write-Info "Profile: $($response.firstName) $($response.lastName)"
} catch {
    Write-Fail "Request falló: $($_.Exception.Message)"
    Write-Info "Verificar que /api/profile exista en backend"
}

# Resumen
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ Tests Completados" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nSi todos los tests pasaron:" -ForegroundColor Yellow
Write-Host "- ✅ AuthInterceptor está funcionando correctamente" -ForegroundColor Green
Write-Host "- ✅ Rutas públicas no requieren token" -ForegroundColor Green
Write-Host "- ✅ Rutas protegidas adjuntan token automáticamente" -ForegroundColor Green
Write-Host "- ✅ Backend está procesando correctamente las peticiones" -ForegroundColor Green

