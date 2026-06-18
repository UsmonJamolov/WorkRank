@echo off
echo WorkRank web ilovasi ishga tushmoqda...
cd /d "%~dp0"
start "" "http://localhost:5500"
node server.js
pause
