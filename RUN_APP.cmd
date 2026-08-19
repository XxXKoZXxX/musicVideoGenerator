@echo off
title Astraea Cosmic Studio Launcher
set SCRIPTDIR=%~dp0
cd /d "%SCRIPTDIR%"

echo.
echo ===================================================
echo   ✨ Astraea Cosmic Studio & Video Generation App
echo ===================================================
echo.
echo [1] Launch Full Desktop App + Video Server (Recommended)
echo [2] Launch Video Generation Server Only (Port 4000)
echo [3] Launch Static Web Server (Port 3210)
echo [4] Reinstall Node Dependencies
echo [5] Share App Online with Testers (Public HTTPS Link)
echo.
set /p choice="Select an option [1-5] (default 1): "

if "%choice%"=="5" (
    echo Starting Public Sharing Server...
    node share.js
    pause
    exit /b
)

if "%choice%"=="2" (
    echo Starting Video API Server on http://localhost:4000...
    node server/index.js
    pause
    exit /b
)

if "%choice%"=="3" (
    echo Starting Web Server on http://localhost:3210...
    node serve.js
    pause
    exit /b
)

if "%choice%"=="4" (
    echo Installing node dependencies...
    call npm install
    echo.
    echo Dependencies installed.
    pause
    exit /b
)

echo Starting Full Desktop App + Video Server on port 3220 / 4000...
call npm run start:all
if errorlevel 1 (
    echo.
    echo An error occurred. Press any key to close...
    pause
)
