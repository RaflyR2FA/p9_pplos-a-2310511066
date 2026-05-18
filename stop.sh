#!/bin/bash

echo "Mematikan Microservices Bus Ticketing..."

pm2 stop api-gateway auth-service fleet-booking-service ticket-worker expense-service ml-service
pm2 delete api-gateway auth-service fleet-booking-service ticket-worker expense-service ml-service

echo ""
echo "Service Bus Ticketing telah dimatikan."

read -n 1 -s -r -p "Tekan tombol apa saja untuk menutup..."
echo ""