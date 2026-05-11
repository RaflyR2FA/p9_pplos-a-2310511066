@echo off
echo Melakukan migrasi fresh dan seeding pada Expense Service (Laravel)...

cd expense-service
call php artisan migrate:fresh --seed
cd ..

echo.
echo Selesai! Database Expense Service berhasil di-reset.
pause