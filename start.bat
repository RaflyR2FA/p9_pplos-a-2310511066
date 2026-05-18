@echo off
echo Memulai semua Microservices...

call pm2 start api-gateway/index.js --name "api-gateway"
call pm2 start user-service/index.js --name "auth-service"
call pm2 start fleet-booking-service/index.js --name "fleet-booking-service"
call pm2 start worker-service/worker.js --name "ticket-worker"

cd expense-service
call pm2 start artisan --name "expense-service" --interpreter php -- serve
cd ..

cd ml-service
call pm2 start app.py --name "ml-service" --interpreter python
cd ..

call pm2 save

echo.
echo Semua service berhasil dijalankan! Gunakan perintah 'pm2 logs' untuk melihat log.
call pm2 list
echo.
pause