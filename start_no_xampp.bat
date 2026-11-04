@echo off
title CampusClear Zero-XAMPP Full-Stack Runner
echo =========================================================
echo   CampusClear Cloud Edition (Zero-XAMPP Engine)
echo =========================================================
echo.
cd /d "%~dp0cloud_app"
start "" "http://localhost:8000/"
echo Starting full-stack server on http://localhost:8000 ...
node server.js
pause

