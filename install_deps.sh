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
echo "[3/7] Menginstal dependensi Fleet dan Booking Service..."
cd fleet-booking-service || exit
npm install
cd ..

echo ""
echo "[4/7] Menginstal dependensi Worker Service..."
cd worker-service || exit
npm install
cd ..

echo ""
echo "[5/7] Menginstal dependensi Database Tools..."
cd database || exit
npm install
cd ..

echo ""
echo "[6/7] Menginstal dependensi Expense Service (Laravel)..."
cd expense-service || exit
composer install
cd ..

echo ""
echo "[7/7] Menginstal dependensi ML Service..."
cd ml-service || exit
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
python3 train_model.py
deactivate
cd ..

echo ""
echo "Seluruh dependensi berhasil diinstal!"

read -n 1 -s -r -p "Tekan tombol apa saja untuk menutup..."
echo ""