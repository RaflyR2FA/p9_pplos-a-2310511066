@echo off
echo Mematikan semua Microservices...

call pm2 stop all
call pm2 delete all

echo.
echo Semua service telah dimatikan.
pause