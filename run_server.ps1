Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "  CampusClear Digital Clearance Platform - Starting...   " -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

# 1. Check & start MySQL if not active
$mysqlRunning = $false
try {
    $c3306 = Test-NetConnection -ComputerName 127.0.0.1 -Port 3306 -WarningAction SilentlyContinue -InformationLevel Quiet
    if ($c3306) { $mysqlRunning = $true; Write-Host "[OK] MySQL active on port 3306." -ForegroundColor Green }
} catch {}

if (-not $mysqlRunning) {
    try {
        $c3307 = Test-NetConnection -ComputerName 127.0.0.1 -Port 3307 -WarningAction SilentlyContinue -InformationLevel Quiet
        if ($c3307) { $mysqlRunning = $true; Write-Host "[OK] MySQL active on port 3307." -ForegroundColor Green }
    } catch {}
}

if (-not $mysqlRunning -and (Test-Path "C:\xampp\mysql\bin\mysqld.exe")) {
    Write-Host "Starting XAMPP MariaDB..." -ForegroundColor Yellow
    Start-Process "C:\xampp\mysql\bin\mysqld.exe" -ArgumentList "--standalone" -WindowStyle Hidden
    Start-Sleep -Seconds 3
}

# 2. Launch browser
Write-Host "Opening CampusClear in browser..." -ForegroundColor Cyan
Start-Process "http://127.0.0.1:8000/"

# 3. Start PHP Server
$phpExe = "C:\xampp\php\php.exe"
if (-not (Test-Path $phpExe)) { $phpExe = "php" }

Set-Location (Join-Path $PSScriptRoot "campusclear")

Write-Host ""
Write-Host "=========================================================" -ForegroundColor Green
Write-Host "  CampusClear is LIVE at: http://127.0.0.1:8000/         " -ForegroundColor Green
Write-Host "  Keep this window open while using the application!     " -ForegroundColor Green
Write-Host "  Press Ctrl+C to stop.                                  " -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Green
Write-Host ""

& $phpExe -S 0.0.0.0:8000

