@echo off
title Astraea Cosmic Studio - Public Sharing & Tester Tunnel
set SCRIPTDIR=%~dp0
cd /d "%SCRIPTDIR%"

echo.
echo ===================================================================
echo   ✨ Astraea Cosmic Studio - 1-Click Public Sharing Launcher
echo ===================================================================
echo.
echo  Starting local server and generating public HTTPS link for testers...
echo.

node share.js
if errorlevel 1 (
    echo.
    echo [!] Server encountered an issue.
    pause
)
