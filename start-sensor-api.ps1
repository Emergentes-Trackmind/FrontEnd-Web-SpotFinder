# Script para iniciar un servidor de API de sensores IoT simulado
# Puerto: 3002

Write-Host "=== Servidor de API de Sensores IoT ===" -ForegroundColor Green
Write-Host "Puerto: 3002" -ForegroundColor Yellow
Write-Host "Endpoints disponibles:" -ForegroundColor Cyan
Write-Host "  GET    /api/sensors/devices - Lista de dispositivos" -ForegroundColor White
Write-Host "  GET    /api/sensors/status/{serial} - Estado de dispositivo" -ForegroundColor White
Write-Host "  POST   /api/sensors/bind - Vincular dispositivo a parking" -ForegroundColor White
Write-Host "  DELETE /api/sensors/bind/{serial} - Desvincular dispositivo" -ForegroundColor White
Write-Host ""

# Verificar si Node.js está instalado
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Node.js no está instalado o no está en el PATH" -ForegroundColor Red
    exit 1
}

# Verificar si json-server está instalado globalmente
if (!(Get-Command json-server -ErrorAction SilentlyContinue)) {
    Write-Host "json-server no encontrado. Instalando..." -ForegroundColor Yellow
    npm install -g json-server
}

# Crear archivo de datos para sensores si no existe
$sensorDataFile = "server/sensors-db.json"
if (!(Test-Path $sensorDataFile)) {
    Write-Host "Creando base de datos de sensores..." -ForegroundColor Yellow

    $sensorData = @{
        devices = @(
            @{
                id = 1
                serialNumber = "SN001-LIMA-001"
                deviceId = "dev_001"
                status = "online"
                lastSeen = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
                batteryLevel = 85
                occupied = $false
                location = @{
                    lat = -12.0464
                    lng = -77.0428
                }
                parkingSpotId = $null
            },
            @{
                id = 2
                serialNumber = "SN002-LIMA-002"
                deviceId = "dev_002"
                status = "online"
                lastSeen = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
                batteryLevel = 92
                occupied = $true
                location = @{
                    lat = -12.0465
                    lng = -77.0429
                }
                parkingSpotId = "spot_001"
            },
            @{
                id = 3
                serialNumber = "SN003-LIMA-003"
                deviceId = "dev_003"
                status = "offline"
                lastSeen = (Get-Date).AddHours(-2).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
                batteryLevel = 15
                occupied = $false
                location = @{
                    lat = -12.0466
                    lng = -77.0430
                }
                parkingSpotId = $null
            },
            @{
                id = 4
                serialNumber = "SN004-LIMA-004"
                deviceId = "dev_004"
                status = "online"
                lastSeen = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
                batteryLevel = 78
                occupied = $false
                location = @{
                    lat = -12.0467
                    lng = -77.0431
                }
                parkingSpotId = $null
            }
        )
        bindings = @(
            @{
                id = 1
                serialNumber = "SN002-LIMA-002"
                parkingSpotId = "spot_001"
                bindTime = (Get-Date).AddDays(-1).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
                active = $true
            }
        )
    } | ConvertTo-Json -Depth 10

    $sensorData | Out-File -FilePath $sensorDataFile -Encoding utf8
    Write-Host "Base de datos de sensores creada: $sensorDataFile" -ForegroundColor Green
}

# Crear archivo de rutas para la API de sensores
$routesFile = "server/sensor-routes.json"
$routesContent = @"
{
  "/api/sensors/devices": "/devices",
  "/api/sensors/status/:serial": "/devices?serialNumber=:serial",
  "/api/sensors/bind": "/bindings",
  "/api/sensors/simulation/*": "/$1"
}
"@

$routesContent | Out-File -FilePath $routesFile -Encoding utf8

Write-Host "Iniciando servidor de sensores IoT en puerto 3002..." -ForegroundColor Green
Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow
Write-Host ""

# Iniciar json-server con configuración para sensores
json-server --watch $sensorDataFile --routes $routesFile --port 3002 --host 0.0.0.0
