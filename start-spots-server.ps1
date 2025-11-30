$ErrorActionPreference = "Continue"

Write-Host "================================================================" -ForegroundColor Green
Write-Host "INICIANDO SERVIDOR MOCK CON MIDDLEWARE DE SPOTS" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green

Write-Host "Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green

    $npmVersion = npm --version
    Write-Host "NPM version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js no está disponible" -ForegroundColor Red
    Write-Host "Instala Node.js desde: https://nodejs.org/" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "`nDetectando procesos en puerto 3001..." -ForegroundColor Yellow
$processes = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($processes) {
    Write-Host "Terminando procesos en puerto 3001..." -ForegroundColor Red
    $processes | ForEach-Object {
        try {
            Stop-Process -Id $_.OwningProcess -Force
            Write-Host "Proceso $($_.OwningProcess) terminado" -ForegroundColor Green
        } catch {
            Write-Host "No se pudo terminar proceso $($_.OwningProcess)" -ForegroundColor Yellow
        }
    }
    Start-Sleep -Seconds 2
}

Write-Host "`nIniciando servidor JSON con middleware de spots..." -ForegroundColor Yellow
Write-Host "Puerto: 3001" -ForegroundColor Cyan
Write-Host "Middleware: server/spots.middleware.js" -ForegroundColor Cyan

Write-Host "`nUsando comando npm..." -ForegroundColor Cyan

try {
    & npm run mock:server
} catch {
    Write-Host "Error iniciando servidor con npm: $_" -ForegroundColor Red
    Write-Host "Intentando con npx directo..." -ForegroundColor Yellow
    try {
        & npx json-server --watch server/db.json --routes server/routes.json --port 3001 --middlewares server/middleware.js server/spots.middleware.js
    } catch {
        Write-Host "Error con npx: $_" -ForegroundColor Red
        Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Yellow
        $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
}
