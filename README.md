# Sistem Manajemen Pemesanan Tiket Bus (Microservices)

Sistem ini adalah platform backend berbasis microservices untuk pemesanan tiket bus dan manajemen operasional. Dibangun menggunakan ekosistem multi-bahasa yang mencakup Node.js, Express, PHP (Laravel), Python (Flask/Scikit-learn), MySQL, dan RabbitMQ. Proyek ini merupakan pemenuhan tugas mata kuliah Pembangunan Perangkat Lunak Berorientasi Service oleh Rafly Dzakki Pratama (2310511066).

## Arsitektur Sistem

Sistem ini memecah fungsionalitas menjadi beberapa layanan independen yang berkomunikasi melalui API Gateway dan Message Broker:

1. **API Gateway (Port 3136)**: Titik akses tunggal (Entry Point) untuk semua request client. Bertugas melakukan verifikasi JWT Token, menerapkan **Rate Limiting** (maksimal 5 request per menit), dan meneruskan request (reverse proxy) ke service yang sesuai.
2. **Auth/User Service (Port 3137)**: Menangani registrasi, login, autentikasi (bcrypt), dan manajemen profil pengguna.
3. **Fleet & Booking Service (Port 3138)**: Layanan terpadu yang mengelola entitas relasional armada (Bus), rute perjalanan (Relation), dan jadwal (Schedule) oleh Admin. Layanan ini juga menangani transaksi pemesanan kursi oleh penumpang dengan menggunakan Database Transaction untuk mencegah race-condition saat pemilihan kursi.
4. **Expense Service (Port 3139)**: Layanan berbasis PHP (Laravel) untuk mendata pengeluaran operasional perjalanan (tol, bensin, konsumsi kru, dll). Akses dibatasi hanya untuk Admin dan Crew.
5. **Intelligent ML Service (Port 3140)**: Layanan berbasis Python (Flask) untuk memprediksi/mengestimasi harga ideal tiket secara dinamis berdasarkan model *Machine Learning* (Random Forest) menggunakan data historis jarak, kapasitas, dan status hari libur.
6. **Notification/Ticket Worker (Background Process)**: Consumer RabbitMQ yang berjalan asinkron untuk memproses antrean pembuatan tiket setelah pemesanan berhasil dicatat.

## Prasyarat (Prerequisites)

- Node.js (v16 atau lebih baru)
- PHP (v8.1+) & Composer
- Python (v3.8+) & pip
- MySQL Database
- RabbitMQ Server (berjalan di localhost:5672)
- PM2 (opsional, untuk menjalankan secara daemon)

## Cara Menjalankan Service

1. Clone repositori ini.
2. Pastikan RabbitMQ dan MySQL sudah berjalan di sistem Anda.
3. **Konfigurasi Database**:
   - **Node.js**: Buka `database/connect.js` dan sesuaikan kredensial koneksi database MySQL Anda.
   - **Laravel**: Masuk ke folder `expense-service`, salin file `.env.example` menjadi `.env`, lalu sesuaikan kredensial koneksi database Anda.
4. **Instalasi Dependensi**: Jalankan skrip otomatis `install_deps.bat` (Windows) atau `./install_deps.sh` (Linux) di root folder. Skrip ini akan menginstal seluruh package Node, PHP, sekaligus dependensi Python dan melatih model ML secara massal.
5. **Inisialisasi Database (Seeder)**:
   - **Layanan Utama (Node.js)**: Jalankan `node database/refresh.js`.
   - **Layanan Pengeluaran (Laravel)**: Jalankan `refresh_expense.bat` (Windows) atau `./refresh_expense.sh` (Linux).
6. **Jalankan Aplikasi**:
   - Windows: Jalankan file `start.bat`
   - Linux/Server: Jalankan `./start.sh`
   - Berhenti: Gunakan `stop.bat` (Windows) atau `./stop.sh` (Linux).

---

## Daftar Endpoint & Contoh Request

Berikut adalah daftar endpoint lengkap yang tersedia di sistem ini. 
**Catatan Penting:** Seluruh endpoint (kecuali Login) mewajibkan Anda menyertakan Header `Authorization: Bearer <TOKEN>`.

### 1. Auth Service

* **Login (Admin / Passenger / Crew)**
    * **Method:** `POST`
    * **Endpoint:** `/api/auth/login`
    * **Body (JSON):**
        ```json
        {
            "email": "admin1@bus.com",
            "password": "password123"
        }
        ```

* **Get Profile (Me)**
    * **Method:** `GET`
    * **Endpoint:** `/api/auth/me`
    * **Body:** *(Tidak ada)*

### 2. Fleet & Booking Service

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

#### Schedules & ML Estimates
* **Estimate Schedule Price (Admin - Inter-service Call)**
    * **Method:** `POST`
    * **Endpoint:** `/api/fleet/schedules/estimate`
    * **Body (JSON):**
        ```json
        {
            "bus_id": 1,
            "relation_id": 1,
            "is_holiday": 1
        }
        ```

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

#### Bookings
* **Create Booking**
    * **Method:** `POST`
    * **Endpoint:** `/api/fleet/bookings`
    * **Body (JSON):**
        ```json
        {
            "schedule_id": 1,
            "seat_number": 5
        }
        ```

* **Get All Bookings**
    * **Method:** `GET`
    * **Endpoint:** `/api/fleet/bookings`

* **Get Booking by ID**
    * **Method:** `GET`
    * **Endpoint:** `/api/fleet/bookings/1`

* **Update Booking (Change Seat)**
    * **Method:** `PUT`
    * **Endpoint:** `/api/fleet/bookings/1`
    * **Body (JSON):**
        ```json
        {
            "seat_number": 8
        }
        ```

* **Cancel Booking (Passenger)**
    * **Method:** `PUT`
    * **Endpoint:** `/api/fleet/bookings/1`
    * **Body (JSON):**
        ```json
        {
            "status": "Cancelled"
        }
        ```

* **Delete Booking (Admin)**
    * **Method:** `DELETE`
    * **Endpoint:** `/api/fleet/bookings/1`

### 3. Expense Service

* **Create Expense (Admin/Crew)**
    * **Method:** `POST`
    * **Endpoint:** `/api/expenses`
    * **Body (JSON):**
        ```json
        {
            "schedule_id": 1,
            "driver_id": 1,
            "amount": 150000.00,
            "type": "toll payments",
            "details": "Pembayaran gerbang tol Cipali",
            "datetime": "2026-05-10 12:00:00"
        }
        ```

* **Get All Expenses (Admin/Crew)**
    * **Method:** `GET`
    * **Endpoint:** `/api/expenses`

* **Get Expense by ID (Admin/Crew)**
    * **Method:** `GET`
    * **Endpoint:** `/api/expenses/1`

* **Update Expense (Admin/Crew)**
    * **Method:** `PUT`
    * **Endpoint:** `/api/expenses/1`
    * **Body (JSON):**
        ```json
        {
            "amount": 250000.00,
            "details": "Pembayaran tol Cipali + Cikampek"
        }
        ```

* **Delete Expense (Admin/Crew)**
    * **Method:** `DELETE`
    * **Endpoint:** `/api/expenses/1`

### 4. Intelligent ML Service

* **Check ML Service Health**
    * **Method:** `GET`
    * **Endpoint:** `/api/ml/health`
    * **Body:** *(Tidak ada)*

* **Predict Price Directly via Gateway**
    * **Method:** `POST`
    * **Endpoint:** `/api/ml/predict`
    * **Body (JSON):**
        ```json
        {
            "jarak_km": 550.0,
            "kapasitas": 30,
            "is_holiday": 1
        }
        ```