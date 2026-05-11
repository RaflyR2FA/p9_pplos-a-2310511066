#!/bin/bash

echo "Memulai instalasi seluruh dependensi Microservices..."

echo ""
echo "[1/7] Menginstal dependensi API Gateway..."
cd api-gateway || exit
npm install
cd ..

echo ""
echo "[2/7] Menginstal dependensi Auth Service..."
cd user-service || exit
npm install
cd ..

echo ""
echo "[3/7] Menginstal dependensi Fleet Service..."
cd fleet-service || exit
npm install
cd ..

echo ""
echo "[4/7] Menginstal dependensi Booking Service..."
cd booking-service || exit
npm install
cd ..

echo ""
echo "[5/7] Menginstal dependensi Worker Service..."
cd worker-service || exit
npm install
cd ..

echo ""
echo "[6/7] Menginstal dependensi Database Tools..."
cd database || exit
npm install
cd ..

echo ""
echo "[7/7] Menginstal dependensi Expense Service (Laravel)..."
cd expense-service || exit
composer install
cd ..

echo ""
echo "Seluruh dependensi berhasil diinstal!"

read -n 1 -s -r -p "Tekan tombol apa saja untuk menutup..."
echo ""