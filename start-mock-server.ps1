# Script para iniciar el mock server en una nueva ventana
Write-Host "Iniciando mock server en nueva ventana..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run mock:server"
Write-Host "Servidor mock iniciado en nueva ventana" -ForegroundColor Green
Write-Host "Presiona cualquier tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

