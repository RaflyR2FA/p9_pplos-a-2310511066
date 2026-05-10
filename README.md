# Sistem Manajemen Pemesanan Tiket Bus (Microservices)

Sistem ini adalah platform backend berbasis microservices untuk pemesanan tiket bus. Dibangun menggunakan Node.js, Express, MySQL, dan RabbitMQ. Proyek ini merupakan pemenuhan tugas mata kuliah Pembangunan Perangkat Lunak Berorientasi Service oleh Rafly Dzakki Pratama (2310511066).

## Arsitektur Sistem

Sistem ini memecah fungsionalitas menjadi beberapa layanan independen yang berkomunikasi melalui API Gateway dan Message Broker:

1. API Gateway (Port 8000): Titik akses tunggal (Entry Point) untuk semua request client. Bertugas melakukan verifikasi JWT Token dan meneruskan request (reverse proxy) ke service yang sesuai.
2. Auth/User Service (Port 8001): Menangani registrasi, login, autentikasi (bcrypt), dan manajemen profil pengguna.
3. Fleet & Route Service (Port 8002): Mengelola entitas relasional armada (Bus), rute perjalanan (Relation), dan jadwal keberangkatan (Schedule). Hanya dapat dimodifikasi oleh Admin.
4. Booking Service (Port 8003): Menangani transaksi pemesanan kursi oleh penumpang. Menggunakan Database Transaction untuk mencegah race-condition saat pemilihan kursi.
5. Notification/Ticket Worker (Background Process): Consumer RabbitMQ yang berjalan asinkron untuk memproses antrean pembuatan tiket setelah pemesanan berhasil dicatat.

## Prasyarat (Prerequisites)

- Node.js
- MySQL Database
- RabbitMQ Server (berjalan di localhost:5672)
- PM2 (opsional, untuk menjalankan secara daemon)

## Cara Menjalankan Service

1. Clone repositori ini.
2. Pastikan RabbitMQ dan MySQL sudah berjalan di sistem Anda.
3. Konfigurasi koneksi database Anda di dalam `database/connect.js`.
4. Instalasi dependensi: Jalankan `npm install` di setiap direktori service (`api-gateway`, `user-service`, `fleet-service`, `booking-service`, `worker-service`, dan `database`).
5. Inisialisasi Database: Jalankan perintah berikut untuk membuat tabel dan mengisi data awal (seeder):
   `node database/refresh.js`
6. Jalankan Aplikasi:
   - Windows: Jalankan file `start.bat`
   - Linux/Server: Jalankan `./start.sh`
   - Berhenti: Gunakan `stop.bat` (Windows) atau `./stop.sh` (Linux).

## Daftar Endpoint & Contoh Request

Berikut adalah daftar endpoint lengkap yang tersedia di sistem ini. 
**Catatan Penting:** Seluruh endpoint (kecuali Login) mewajibkan Anda menyertakan Header `Authorization: Bearer <TOKEN>`.

### 1. Auth Service

* **Login (Admin)**
    * **Method:** `POST`
    * **Endpoint:** `/api/auth/login`
    * **Body (JSON):**
        ```json
        {
            "email": "admin1@bus.com",
            "password": "password123"
        }
        ```

* **Login (Passenger)**
    * **Method:** `POST`
    * **Endpoint:** `/api/auth/login`
    * **Body (JSON):**
        ```json
        {
            "email": "rafly@mail.com",
            "password": "password123"
        }
        ```

* **Get Profile (Me)**
    * **Method:** `GET`
    * **Endpoint:** `/api/auth/me`
    * **Body:** *(Tidak ada)*

### 2. Fleet Service (Buses, Relations, Schedules)

#### Buses
* **Create Bus (Admin)**
    * **Method:** `POST`
    * **Endpoint:** `/api/fleet/buses`
    * **Body (JSON):**
        ```json
        {
            "plate_number": "B 9999 ZZZ",
            "size": "Medium",
            "class": "VIP",
            "capacity": 25
        }
        ```

* **Get All Buses**
    * **Method:** `GET`
    * **Endpoint:** `/api/fleet/buses`

* **Get Bus by ID**
    * **Method:** `GET`
    * **Endpoint:** `/api/fleet/buses/1`

* **Update Bus (Admin)**
    * **Method:** `PUT`
    * **Endpoint:** `/api/fleet/buses/5`
    * **Body (JSON):**
        ```json
        {
            "plate_number": "B 7777 RRR"
        }
        ```

* **Delete Bus (Admin)**
    * **Method:** `DELETE`
    * **Endpoint:** `/api/fleet/buses/5`

#### Relations
* **Create Relation (Admin)**
    * **Method:** `POST`
    * **Endpoint:** `/api/fleet/relations`
    * **Body (JSON):**
        ```json
        {
            "origin": "Jakarta",
            "destination": "Bandung",
            "distance_km": 150.5
        }
        ```

* **Get All Relations**
    * **Method:** `GET`
    * **Endpoint:** `/api/fleet/relations`

#### Schedules
* **Create Schedule (Admin)**
    * **Method:** `POST`
    * **Endpoint:** `/api/fleet/schedules`
    * **Body (JSON):**
        ```json
        {
            "bus_id": 1,
            "relation_id": 1,
            "departure_time": "2026-06-10T08:00:00Z",
            "price": 150000.00
        }
        ```

* **Get All Schedules**
    * **Method:** `GET`
    * **Endpoint:** `/api/fleet/schedules`

### 3. Booking Service

* **Create Booking**
    * **Method:** `POST`
    * **Endpoint:** `/api/bookings/bookings`
    * **Body (JSON):**
        ```json
        {
            "schedule_id": 1,
            "seat_number": 5
        }
        ```

* **Get All Bookings**
    * **Method:** `GET`
    * **Endpoint:** `/api/bookings/bookings`

* **Get Booking by ID**
    * **Method:** `GET`
    * **Endpoint:** `/api/bookings/bookings/1`

* **Update Booking (Change Seat)**
    * **Method:** `PUT`
    * **Endpoint:** `/api/bookings/bookings/1`
    * **Body (JSON):**
        ```json
        {
            "seat_number": 8
        }
        ```

* **Cancel Booking (Passenger)**
    * **Method:** `PUT`
    * **Endpoint:** `/api/bookings/bookings/1`
    * **Body (JSON):**
        ```json
        {
            "status": "Cancelled"
        }
        ```

* **Delete Booking (Admin)**
    * **Method:** `DELETE`
    * **Endpoint:** `/api/bookings/bookings/1`