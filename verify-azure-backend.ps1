# ================================================================
# Script para verificar la conexión con el backend de Azure
# ================================================================

$BackendUrl = "https://spotfinderback-eaehduf4ehh7hjah.eastus2-01.azurewebsites.net"
$ApiBase = "$BackendUrl/api"
$SwaggerUrl = "$BackendUrl/swagger-ui/index.html"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Verificación Backend Azure" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Función para verificar URL
function Test-Endpoint {
    param (
        [string]$Url,
        [string]$Description
    )

    Write-Host "[$Description]" -ForegroundColor Yellow
    Write-Host "  URL: $Url" -ForegroundColor Gray

    try {
        $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        $statusCode = $response.StatusCode

        if ($statusCode -eq 200) {
            Write-Host "  ✅ OK (Status: $statusCode)" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  ⚠️  Respuesta inesperada (Status: $statusCode)" -ForegroundColor Yellow
            return $false
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.Value__
        if ($statusCode -eq 401 -or $statusCode -eq 403) {
            Write-Host "  ⚠️  Requiere autenticación (Status: $statusCode)" -ForegroundColor Yellow
            Write-Host "     Esto es normal para endpoints protegidos" -ForegroundColor Gray
            return $true
        } elseif ($statusCode -eq 404) {
            Write-Host "  ❌ No encontrado (Status: 404)" -ForegroundColor Red
            return $false
        } else {
            Write-Host "  ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
            if ($statusCode) {
                Write-Host "     Status Code: $statusCode" -ForegroundColor Gray
            }
            return $false
        }
    }

    Write-Host ""
}

# Verificar backend principal
Write-Host "[1/7] Verificando servidor backend..." -ForegroundColor Cyan
$backendOk = Test-Endpoint -Url $BackendUrl -Description "Backend Principal"
Write-Host ""

# Verificar Swagger
Write-Host "[2/7] Verificando Swagger UI..." -ForegroundColor Cyan
$swaggerOk = Test-Endpoint -Url $SwaggerUrl -Description "Swagger Documentation"
Write-Host ""

# Verificar endpoints de autenticación
Write-Host "[3/7] Verificando endpoints de autenticación..." -ForegroundColor Cyan
Write-Host "  Nota: Estos endpoints pueden requerir autenticación" -ForegroundColor Gray
Test-Endpoint -Url "$ApiBase/auth/login" -Description "Login Endpoint" | Out-Null
Write-Host ""

# Verificar endpoints de parkings
Write-Host "[4/7] Verificando endpoints de parkings..." -ForegroundColor Cyan
Test-Endpoint -Url "$ApiBase/parkings" -Description "Parkings Endpoint" | Out-Null
Write-Host ""

# Verificar endpoints de profile
Write-Host "[5/7] Verificando endpoints de perfil..." -ForegroundColor Cyan
Test-Endpoint -Url "$ApiBase/profile" -Description "Profile Endpoint" | Out-Null
Write-Host ""

# Verificar endpoints de analytics
Write-Host "[6/7] Verificando endpoints de analytics..." -ForegroundColor Cyan
Test-Endpoint -Url "$ApiBase/analytics/totals" -Description "Analytics Totals" | Out-Null
Write-Host ""

# Verificar endpoints de IoT
Write-Host "[7/7] Verificando endpoints de IoT..." -ForegroundColor Cyan
Test-Endpoint -Url "$ApiBase/iot/devices" -Description "IoT Devices" | Out-Null
Write-Host ""

# Resumen
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Resumen de Verificación" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($backendOk) {
    Write-Host "✅ Backend de Azure está accesible" -ForegroundColor Green
} else {
    Write-Host "❌ Backend de Azure NO está accesible" -ForegroundColor Red
    Write-Host "   Verificar que el App Service esté running en Azure" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Cyan
Write-Host "  1. Revisar Swagger para ver todos los endpoints disponibles:" -ForegroundColor Gray
Write-Host "     $SwaggerUrl" -ForegroundColor Blue
Write-Host ""
Write-Host "  2. Probar el frontend conectado a Azure:" -ForegroundColor Gray
Write-Host "     .\serve-azure.bat" -ForegroundColor Blue
Write-Host ""
Write-Host "  3. Verificar configuración CORS si hay errores" -ForegroundColor Gray
Write-Host ""

# Abrir Swagger en el navegador
$openSwagger = Read-Host "¿Desea abrir Swagger en el navegador? (S/N)"
if ($openSwagger -eq "S" -or $openSwagger -eq "s") {
    Start-Process $SwaggerUrl
}

Write-Host ""
Write-Host "Presione cualquier tecla para salir..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

