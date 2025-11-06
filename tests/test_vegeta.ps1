# script para test de vegeta

# variable con la ruta base del script
$BaseDir = $PSScriptRoot

# ejecucion del ataque, se pueden ajustar los parametros dependiendo los ataques y tiempos que se requieran
vegeta attack -duration=15s -targets="$BaseDir\targets.txt" -rate=20/1s -output="$BaseDir\resultado.bin"

Write-Host "Prueba finalizada. Generando reporte HTML"

# generacion del reporte 
vegeta plot -title=Resultado "$BaseDir\resultado.bin" > "$BaseDir\resultados.html"

Write-Host "Reporte generado con exito"

# apertura del reporte automaticamente
Start-Process "$BaseDir\resultados.html"