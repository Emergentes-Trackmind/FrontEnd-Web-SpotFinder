# Script para corregir IDs duplicados en parkingProfiles

# Leer el archivo JSON
$json = Get-Content db.json -Raw | ConvertFrom-Json

# Array para parkings actualizados
$newParkings = @()

# Procesar cada parking
foreach ($parking in $json.parkingProfiles) {
    # Si el parking tiene tu ownerId o tiene ID duplicado "1"
    if ($parking.ownerId -eq '1761818827011' -or $parking.ownerId -eq '1758170181625') {
        # Generar un ID único basado en timestamp
        $parking.id = [string]([DateTimeOffset]::Now.ToUnixTimeMilliseconds())
        Write-Host "✅ Asignado nuevo ID $($parking.id) a parking '$($parking.name)' (ownerId: $($parking.ownerId))"
        Start-Sleep -Milliseconds 10
    } elseif ($parking.id -eq '1' -and $parking.ownerId -ne '1') {
        # Reasignar ID si es duplicado
        $oldId = $parking.id
        $parking.id = [string]([DateTimeOffset]::Now.ToUnixTimeMilliseconds())
        Write-Host "⚠️  Corregido ID duplicado de $oldId a $($parking.id) para parking '$($parking.name)'"
        Start-Sleep -Milliseconds 10
    }
    $newParkings += $parking
}

# Actualizar parkings
$json.parkingProfiles = $newParkings

# Guardar archivo
$json | ConvertTo-Json -Depth 100 | Set-Content db.json -Encoding UTF8

Write-Host ""
Write-Host "========================================="
Write-Host "✅ IDs de parkings corregidos exitosamente"
Write-Host "========================================="
Write-Host ""
Write-Host "Parkings actualizados:"
$newParkings | Select-Object id, ownerId, name | Format-Table -AutoSize

