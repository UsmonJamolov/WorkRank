@echo off
echo WorkRank ishga tushmoqda...
cd /d "%~dp0\..\backend"
start "WorkRank API" cmd /k "npm start"
timeout /t 3 /nobreak >nul
cd /d "%~dp0"
start "" "http://localhost:5500"
node server.js
