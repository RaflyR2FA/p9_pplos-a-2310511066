#!/bin/bash

echo "Mematikan Microservices Bus Ticketing..."

pm2 stop api-gateway auth-service fleet-service booking-service ticket-worker
pm2 delete api-gateway auth-service fleet-service booking-service ticket-worker

echo ""
echo "Service Bus Ticketing telah dimatikan."

read -n 1 -s -r -p "Tekan tombol apa saja untuk menutup..."
echo ""