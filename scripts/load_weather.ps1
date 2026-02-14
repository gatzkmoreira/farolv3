# Load weather history via Edge Function
# Calls edge function for each city × each year to avoid timeout

$anon = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2cnZsZXNqZ3lpbXNwZHNnaG13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMzEzOTMsImV4cCI6MjA4NTgwNzM5M30.mQfxFpaI7EPsZqW6FtPows7i9M6hbz6jugC5dMH0TFc"
$base = "https://uvrvlesjgyimspdsghmw.supabase.co/functions/v1/load-weather-history"

$cities = @(
    "sao-paulo-sp","cuiaba-mt","sorriso-mt","campo-grande-ms","goiania-go",
    "ribeirao-preto-sp","londrina-pr","curitiba-pr","uberaba-mg","belo-horizonte-mg",
    "rio-verde-go","sinop-mt","lucas-do-rio-verde-mt","rondonopolis-mt","dourados-ms",
    "maringa-pr","chapeco-sc","cascavel-pr","porto-alegre-rs","barreiras-ba",
    "luis-eduardo-magalhaes-ba","palmas-to","balsas-ma","piracicaba-sp","campinas-sp",
    "uberlandia-mg","patos-de-minas-mg","rio-de-janeiro-rj","brasilia-df"
)

$years = 2016..2025
$totalRows = 0
$errors = @()

foreach ($c in $cities) {
    $cityIdx = $cities.IndexOf($c) + 1
    Write-Host "`n[$cityIdx/29] $c" -ForegroundColor Cyan
    
    foreach ($y in $years) {
        $start = "$y-01-01"
        if ($y -eq 2025) {
            $end = (Get-Date).AddDays(-1).ToString("yyyy-MM-dd")
        } else {
            $end = "$y-12-31"
        }
        
        Write-Host -NoNewline "  $y... "
        try {
            $uri = "$base`?city=$c&start=$start&end=$end"
            $r = Invoke-RestMethod -Uri $uri -Headers @{
                Authorization = "Bearer $anon"
                apikey = $anon
            } -TimeoutSec 60
            
            if ($r.success) {
                $totalRows += $r.rows
                Write-Host "$($r.rows) rows" -ForegroundColor Green
            } else {
                Write-Host "FAIL: $($r.error)" -ForegroundColor Red
                $errors += "$c/$y"
            }
        } catch {
            Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
            $errors += "$c/$y"
        }
    }
}

Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "Total rows: $totalRows" -ForegroundColor Yellow
if ($errors.Count -gt 0) {
    Write-Host "Errors: $($errors -join ', ')" -ForegroundColor Red
}
Write-Host "========================================" -ForegroundColor Yellow
