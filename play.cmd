@echo off
cd /d "%~dp0"
call npm.cmd run dev -- --host localhost --port 5174 --strictPort
pause
