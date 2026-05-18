const express = require('express');
const amqp = require('amqplib');
const axios = require('axios');
const { Bus, Relation, Schedule, Booking, User, sequelize } = require('../database/models');

const app = express();
app.use(express.json());

const isAdmin = (req, res, next) => {
    if (req.headers['x-user-role'] !== 'Admin') {
        return res.status(403).json({ error: 'Akses ditolak. Memerlukan hak Admin.' });
    }
    next();
};

let channel;
async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect('amqp://localhost');
        channel = await connection.createChannel();
        await channel.assertQueue('ticket_queue');
        console.log('Terhubung ke RabbitMQ (ticket_queue)');
    } catch (error) {
        console.error('Gagal terhubung ke RabbitMQ:', error);
    }
}
connectRabbitMQ();

app.post('/buses', isAdmin, async (req, res) => {
    try {
        const bus = await Bus.create(req.body);
        res.status(201).json({ message: 'Bus berhasil ditambahkan', data: bus });
    } catch (error) {
        res.status(400).json({ error: 'Data tidak valid atau pelat nomor sudah terdaftar' });
    }
});

app.get('/buses', async (req, res) => {
    try {
        const buses = await Bus.findAll();
        res.status(200).json({ data: buses });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/buses/:id', async (req, res) => {
    try {
        const bus = await Bus.findByPk(req.params.id);
        if (!bus) return res.status(404).json({ error: 'Bus tidak ditemukan' });
        res.status(200).json({ data: bus });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/buses/:id', isAdmin, async (req, res) => {
    try {
        const bus = await Bus.findByPk(req.params.id);
        if (!bus) return res.status(404).json({ error: 'Bus tidak ditemukan' });
        await bus.update(req.body);
        res.status(200).json({ message: 'Data bus berhasil diperbarui', data: bus });
    } catch (error) {
        res.status(400).json({ error: 'Data update tidak valid' });
    }
});

app.delete('/buses/:id', isAdmin, async (req, res) => {
    try {
        const bus = await Bus.findByPk(req.params.id);
        if (!bus) return res.status(404).json({ error: 'Bus tidak ditemukan' });
        await bus.destroy();
        res.status(200).json({ message: 'Bus berhasil dihapus' });
    } catch (error) {
        res.status(409).json({ error: 'Gagal menghapus. Bus masih tertaut dengan jadwal keberangkatan.' });
    }
});

app.post('/relations', isAdmin, async (req, res) => {
    try {
        const relation = await Relation.create(req.body);
        res.status(201).json({ message: 'Rute berhasil ditambahkan', data: relation });
    } catch (error) {
        res.status(400).json({ error: 'Data rute tidak valid' });
    }
});

app.get('/relations', async (req, res) => {
    try {
        const relations = await Relation.findAll();
        res.status(200).json({ data: relations });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/relations/:id', async (req, res) => {
    try {
        const relation = await Relation.findByPk(req.params.id);
        if (!relation) return res.status(404).json({ error: 'Rute tidak ditemukan' });
        res.status(200).json({ data: relation });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/relations/:id', isAdmin, async (req, res) => {
    try {
        const relation = await Relation.findByPk(req.params.id);
        if (!relation) return res.status(404).json({ error: 'Rute tidak ditemukan' });
        await relation.update(req.body);
        res.status(200).json({ message: 'Rute berhasil diperbarui', data: relation });
    } catch (error) {
        res.status(400).json({ error: 'Data update rute tidak valid' });
    }
});

app.delete('/relations/:id', isAdmin, async (req, res) => {
    try {
        const relation = await Relation.findByPk(req.params.id);
        if (!relation) return res.status(404).json({ error: 'Rute tidak ditemukan' });
        await relation.destroy();
        res.status(200).json({ message: 'Rute berhasil dihapus' });
    } catch (error) {
        res.status(409).json({ error: 'Gagal menghapus. Rute masih tertaut dengan jadwal keberangkatan.' });
    }
});

app.post('/schedules', isAdmin, async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { bus_id, relation_id, departure_time, price } = req.body;
        const bus = await Bus.findByPk(bus_id, { transaction: t });
        const relation = await Relation.findByPk(relation_id, { transaction: t });
        if (!bus || !relation) {
            await t.rollback();
            return res.status(404).json({ error: 'Bus atau Rute tidak ditemukan' });
        }
        const schedule = await Schedule.create({
            bus_id,
            relation_id,
            departure_time,
            price
        }, { transaction: t });
        await t.commit();
        res.status(201).json({ message: 'Jadwal berhasil ditambahkan', data: schedule });
    } catch (error) {
        await t.rollback();
        res.status(400).json({ error: 'Data jadwal tidak valid' });
    }
});

app.get('/schedules', async (req, res) => {
    try {
        const schedules = await Schedule.findAll({
            include: [
                { model: Bus, attributes: ['plate_number', 'size', 'class', 'capacity'] },
                { model: Relation, attributes: ['origin', 'destination', 'distance_km'] }
            ]
        });
        res.status(200).json({ data: schedules });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/schedules/:id', async (req, res) => {
    try {
        const schedule = await Schedule.findByPk(req.params.id, {
            include: [
                { model: Bus, attributes: ['plate_number', 'size', 'class', 'capacity'] },
                { model: Relation, attributes: ['origin', 'destination', 'distance_km'] }
            ]
        });
        if (!schedule) return res.status(404).json({ error: 'Jadwal tidak ditemukan' });
        res.status(200).json({ data: schedule });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/schedules/:id', isAdmin, async (req, res) => {
    try {
        const schedule = await Schedule.findByPk(req.params.id);
        if (!schedule) return res.status(404).json({ error: 'Jadwal tidak ditemukan' });

        await schedule.update(req.body);
        res.status(200).json({ message: 'Jadwal berhasil diperbarui', data: schedule });
    } catch (error) {
        res.status(400).json({ error: 'Data update jadwal tidak valid' });
    }
});

app.delete('/schedules/:id', isAdmin, async (req, res) => {
    try {
        const schedule = await Schedule.findByPk(req.params.id);
        if (!schedule) return res.status(404).json({ error: 'Jadwal tidak ditemukan' });

        await schedule.destroy();
        res.status(200).json({ message: 'Jadwal berhasil dihapus' });
    } catch (error) {
        res.status(409).json({ error: 'Gagal menghapus. Jadwal mungkin masih memiliki data pemesanan (Booking).' });
    }
});

app.post('/bookings', async (req, res) => {
    const userId = req.headers['x-user-id'];
    const { schedule_id, seat_number } = req.body;
    const transaction = await sequelize.transaction();
    try {
        const schedule = await Schedule.findByPk(schedule_id, { 
            include: [Bus], transaction 
        });
        if (!schedule) throw new Error('Jadwal tidak ditemukan_404');
        if (seat_number > schedule.Bus.capacity || seat_number < 1) {
            throw new Error('Nomor kursi tidak valid_400');
        }
        const existingBooking = await Booking.findOne({
            where: { schedule_id, seat_number, status: ['Pending', 'Paid'] },
            transaction
        });
        if (existingBooking) throw new Error('Kursi sudah dipesan_409');
        const booking = await Booking.create({
            user_id: userId,
            schedule_id,
            seat_number,
            status: 'Pending'
        }, { transaction });
        await transaction.commit();
        if (channel) {
            const eventData = JSON.stringify({ booking_id: booking.id, user_id: userId });
            channel.sendToQueue('ticket_queue', Buffer.from(eventData));
            console.log(`[Worker] Memproses booking ID: ${booking.id}`);
        }
        res.status(201).json({ message: 'Pemesanan berhasil, tiket sedang diproses', data: booking });
    } catch (error) {
        await transaction.rollback();
        const [msg, status] = error.message.split('_');
        console.error('Error saat membuat booking:', error);
        res.status(Number(status) || 500).json({ error: msg || 'Internal Server Error' });
    }
});

app.get('/bookings', async (req, res) => {
    const userId = req.headers['x-user-id'];
    const userRole = req.headers['x-user-role'];
    try {
        const whereClause = userRole === 'Admin' ? {} : { user_id: userId };
        const bookings = await Booking.findAll({
            where: whereClause,
            include: [
                {
                    model: Schedule,
                    include: [Bus, Relation]
                }
            ]
        });
        res.status(200).json({ data: bookings });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/bookings/:id', async (req, res) => {
    const userId = req.headers['x-user-id'];
    const userRole = req.headers['x-user-role'];
    try {
        const booking = await Booking.findByPk(req.params.id, {
            include: [{ model: Schedule, include: [Bus, Relation] }, { model: User, attributes: ['name', 'email'] }]
        });
        if (!booking) return res.status(404).json({ error: 'Pemesanan tidak ditemukan' });
        if (userRole !== 'Admin' && booking.user_id.toString() !== userId) {
            return res.status(403).json({ error: 'Akses ditolak' });
        }
        res.status(200).json({ data: booking });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/bookings/:id', async (req, res) => {
    const userId = req.headers['x-user-id'];
    const userRole = req.headers['x-user-role'];
    const { seat_number, status } = req.body;
    const transaction = await sequelize.transaction();
    try {
        const booking = await Booking.findByPk(req.params.id, {
            include: [{ model: Schedule, include: [Bus] }],
            transaction
        });
        if (!booking) throw new Error('Pemesanan tidak ditemukan_404');
        if (userRole !== 'Admin' && booking.user_id.toString() !== userId) {
            throw new Error('Akses ditolak_403');
        }
        if (seat_number && seat_number !== booking.seat_number) {
            if (seat_number > booking.Schedule.Bus.capacity || seat_number < 1) {
                throw new Error('Nomor kursi tidak valid_400');
            }
            const existing = await Booking.findOne({
                where: { schedule_id: booking.schedule_id, seat_number, status: ['Pending', 'Paid'] },
                transaction
            });
            if (existing) throw new Error('Kursi sudah dipesan orang lain_409');
            booking.seat_number = seat_number;
        }
        if (status) {
            if (userRole !== 'Admin' && status !== 'Cancelled') {
                 throw new Error('Anda hanya dapat mengubah status menjadi Cancelled_403');
            }
            booking.status = status;
        }
        await booking.save({ transaction });
        await transaction.commit();
        res.status(200).json({ message: 'Pemesanan berhasil diperbarui', data: booking });
    } catch (error) {
        await transaction.rollback();
        const [msg, statusCode] = error.message.split('_');
        res.status(Number(statusCode) || 500).json({ error: msg || 'Internal Server Error' });
    }
});

app.delete('/bookings/:id', async (req, res) => {
    const userId = req.headers['x-user-id'];
    const userRole = req.headers['x-user-role'];
    try {
        const booking = await Booking.findByPk(req.params.id);
        if (!booking) return res.status(404).json({ error: 'Pemesanan tidak ditemukan' });
        if (userRole !== 'Admin' && booking.user_id.toString() !== userId) {
            return res.status(403).json({ error: 'Akses ditolak' });
        }
        await booking.destroy();
        res.status(200).json({ message: 'Data pemesanan berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/schedules/estimate', isAdmin, async (req, res) => {
    try {
        const { bus_id, relation_id, is_holiday } = req.body;
        const bus = await Bus.findByPk(bus_id);
        const relation = await Relation.findByPk(relation_id);
        if (!bus || !relation) {
            return res.status(404).json({ error: 'Bus atau Rute tidak ditemukan' });
        }
        let predictedPrice = 0;
        let mlStatus = "success";
        try {
            const mlResponse = await axios.post('http://localhost:3140/predict', {
                jarak_km: relation.distance_km,
                kapasitas: bus.capacity,
                is_holiday: is_holiday || 0
            }, { timeout: 3000 });
            predictedPrice = mlResponse.data.prediksi_harga;
        } catch (mlError) {
            console.error('[Fallback] Python ML Service gagal diakses:', mlError.message);
            mlStatus = "fallback_mode";
            predictedPrice = (relation.distance_km * 1000) + (is_holiday ? 50000 : 0);
        }
        res.status(200).json({
            message: "Estimasi harga berhasil dikalkulasi",
            ml_status: mlStatus,
            data: {
                bus_plate: bus.plate_number,
                rute: `${relation.origin} - ${relation.destination}`,
                estimasi_harga_ideal: predictedPrice
            }
        });
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            res.status(503).json({ error: 'ML Service tidak tersedia' });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

app.listen(3138, () => console.log('Fleet & Booking Service berjalan di port 3138'));