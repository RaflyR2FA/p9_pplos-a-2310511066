@echo off
echo Mematikan Microservices Bus Ticketing...

call pm2 stop api-gateway auth-service fleet-booking-service ticket-worker expense-service ml-service
call pm2 delete api-gateway auth-service fleet-booking-service ticket-worker expense-service ml-service

echo.
echo Service Bus Ticketing telah dimatikan.
pause