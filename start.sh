#!/bin/bash

echo "Memulai semua Microservices..."

pm2 start api-gateway/index.js --name "api-gateway"
pm2 start user-service/index.js --name "auth-service"
pm2 start fleet-service/index.js --name "fleet-service"
pm2 start booking-service/index.js --name "booking-service"
pm2 start worker-service/worker.js --name "ticket-worker"

cd expense-service || exit
pm2 start artisan --name "expense-service" --interpreter php -- serve
cd ..

pm2 save

echo ""
echo "Semua service berhasil dijalankan! Gunakan perintah 'pm2 logs' untuk melihat log."
pm2 list
echo ""

read -n 1 -s -r -p "Tekan tombol apa saja untuk menutup..."
echo ""