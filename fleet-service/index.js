const express = require('express');
const { Bus, Relation, Schedule, sequelize } = require('../database/models');

const app = express();
app.use(express.json());

const isAdmin = (req, res, next) => {
    if (req.headers['x-user-role'] !== 'Admin') {
        return res.status(403).json({ error: 'Akses ditolak. Memerlukan hak Admin.' });
    }
    next();
};

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

app.listen(6602, () => console.log('Fleet Service berjalan di port 6602'));