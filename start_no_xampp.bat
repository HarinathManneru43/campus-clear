@echo off
chcp 65001 >nul
title CampusClear Platform (Zero-XAMPP)
cd /d "%~dp0"

echo ========================================================
echo   Starting CampusClear Zero-XAMPP Platform...
echo ========================================================
echo.

:: Launch the browser after 2 seconds in the background
start /b cmd /c "ping 127.0.0.1 -n 3 >nul && start http://localhost:8000"

echo Starting server on http://localhost:8000 ...
echo [NOTE] Keep this window OPEN while using the website.
echo.
node server.js
pause
