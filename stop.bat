@echo off
echo Mematikan Microservices Bus Ticketing...

call pm2 stop api-gateway auth-service fleet-service booking-service ticket-worker expense-service
call pm2 delete api-gateway auth-service fleet-service booking-service ticket-worker expense-service

echo.
echo Service Bus Ticketing telah dimatikan.
pause