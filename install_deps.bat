@echo off
echo Memulai instalasi seluruh dependensi Microservices...

echo.
echo [1/7] Menginstal dependensi API Gateway...
cd api-gateway
call npm install
cd ..

echo.
echo [2/7] Menginstal dependensi Auth Service...
cd user-service
call npm install
cd ..

echo.
echo [3/7] Menginstal dependensi Fleet dan Booking Service...
cd fleet-booking-service
call npm install
cd ..

echo.
echo [4/7] Menginstal dependensi Worker Service...
cd worker-service
call npm install
cd ..

echo.
echo [5/7] Menginstal dependensi Database Tools...
cd database
call npm install
cd ..

echo.
echo [6/7] Menginstal dependensi Expense Service (Laravel)...
cd expense-service
call composer install
cd ..

echo.
echo [7/7] Menginstal dependensi ML Service...
cd ml-service
call pip install -r requirements.txt
call python train_model.py
cd ..

echo.
echo Seluruh dependensi berhasil diinstal!
pause