@echo off
title Astraea Video API Server (Port 4000)
echo ============================================
echo   🚀 Starting Video Generation API Server
echo ============================================
cd /d "%~dp0"
node server/index.js
pause
