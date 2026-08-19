@echo off
echo Starting MusicVid Studio Desktop App & Video Server...
cd /d "%~dp0"
call npm run start:all
pause
