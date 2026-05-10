const express = require('express');
const amqp = require('amqplib');
const { Booking, Schedule, Bus, Relation, User, sequelize } = require('../database/models');

const app = express();
app.use(express.json());

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

app.listen(8003, () => console.log('Booking Service berjalan di port 8003'));