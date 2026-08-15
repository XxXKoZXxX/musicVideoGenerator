@echo off
REM Astraea Cosmic Studio Launcher
REM This script launches the Astraea application

echo.
echo ========================================
echo  ✨ Astraea Cosmic Studio & Oracle App
echo ========================================
echo.
echo Starting application...
echo.

set SCRIPTDIR=%~dp0
cd /d "%SCRIPTDIR%"

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Launching Astraea Cosmic Studio on http://localhost:3210...
call node serve.js

if errorlevel 1 (
    echo.
    echo Error starting app. Press any key to close...
    pause
)
