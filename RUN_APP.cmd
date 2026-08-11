@echo off
REM MusicVid Studio Desktop App Launcher
REM This script launches the desktop application

echo.
echo ========================================
echo  🎬 MusicVid Studio Desktop App
echo ========================================
echo.
echo Starting application...
echo.

REM Get the directory where this script is located
set SCRIPTDIR=%~dp0

REM Change to the script directory
cd /d "%SCRIPTDIR%"

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Start the app
echo Launching MusicVid Studio...
call npm start

REM Keep window open if something goes wrong
if errorlevel 1 (
    echo.
    echo Error starting app. Press any key to close...
    pause
)
