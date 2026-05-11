#!/bin/bash

echo "Mematikan Microservices Bus Ticketing..."

pm2 stop api-gateway auth-service fleet-service booking-service ticket-worker expense-service
pm2 delete api-gateway auth-service fleet-service booking-service ticket-worker expense-service

echo ""
echo "Service Bus Ticketing telah dimatikan."

read -n 1 -s -r -p "Tekan tombol apa saja untuk menutup..."
echo ""