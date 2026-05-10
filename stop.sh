#!/bin/bash

echo "Mematikan semua Microservices..."

pm2 stop all
pm2 delete all

echo ""
echo "Semua service telah dimatikan."

read -n 1 -s -r -p "Tekan tombol apa saja untuk menutup..."
echo ""