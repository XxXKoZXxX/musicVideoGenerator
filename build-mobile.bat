@echo off
echo ========================================
echo  📱 Astraea Mobile App Builder
echo ========================================
echo.
cd /d "%~dp0"
echo 1. Building Production Web / PWA Assets...
call npm run build:mobile
echo.
echo 2. PWA Build Complete in build/
echo You can now:
echo  - Open in mobile browser and tap "Add to Home Screen"
echo  - Sync with Capacitor: npx cap sync
echo.
pause
