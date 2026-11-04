@echo off
chcp 65001 >nul
title CampusClear Platform Launcher

:: Launch via PowerShell for 100% reliable Unicode path & port handling
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run_server.ps1"

if %errorlevel% neq 0 (
    echo.
    echo Running direct fallback launcher...
    cd /d "%~dp0campusclear"
    start "" "http://127.0.0.1:8000/"
    "C:\xampp\php\php.exe" -S 0.0.0.0:8000
)

pause
