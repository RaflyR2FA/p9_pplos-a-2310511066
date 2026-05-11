const bcrypt = require('bcryptjs');
const { sequelize, User, Bus, Relation, Schedule } = require('./models');

async function refreshDatabase() {
    try {
        console.log('Menghubungkan ke database...');
        await sequelize.authenticate();

        console.log('DROP dan CREATE ulang seluruh tabel (force: true)...');
        await sequelize.sync({ force: true });
        console.log('Seluruh tabel berhasil dikosongkan dan dibuat ulang!');

        console.log('Memulai proses seeding data awal...');
        const hashedPassword = await bcrypt.hash('password123', 10);

        await User.bulkCreate([
            { name: 'Admin Utama', email: 'admin1@bus.com', password: hashedPassword, role: 'Admin' },
            { name: 'Budi Santoso', email: 'budi@mail.com', password: hashedPassword, role: 'Crew' },
            { name: 'Joko Purwanto', email: 'joko@mail.com', password: hashedPassword, role: 'Crew' },
            { name: 'Rafly Dzakki Pratama', email: 'rafly@mail.com', password: hashedPassword, role: 'Passenger' },
            { name: 'John Doe', email: 'john@mail.com', password: hashedPassword, role: 'Passenger' },
            { name: 'Jane Doe', email: 'jane@mail.com', password: hashedPassword, role: 'Passenger' },
        ]);

        const bus1 = await Bus.create({ plate_number: 'B 1234 XYZ', size: 'Big', class: 'Executive', capacity: 40 });
        const bus2 = await Bus.create({ plate_number: 'B 5678 ABC', size: 'Big', class: 'VIP', capacity: 30 });
        const bus3 = await Bus.create({ plate_number: 'B 1234 DEF', size: 'Big', class: 'Economy', capacity: 50 });
        const bus4 = await Bus.create({ plate_number: 'B 5678 GHI', size: 'Big', class: 'Sleeper', capacity: 10 });
        const bus5 = await Bus.create({ plate_number: 'B 4321 XYZ', size: 'Big', class: 'Executive', capacity: 40 });
        const bus6 = await Bus.create({ plate_number: 'B 8765 ABC', size: 'Big', class: 'VIP', capacity: 30 });
        const bus7 = await Bus.create({ plate_number: 'B 4321 DEF', size: 'Big', class: 'Economy', capacity: 50 });
        const bus8 = await Bus.create({ plate_number: 'B 8765 GHI', size: 'Big', class: 'Sleeper', capacity: 10 });

        const relation1 = await Relation.create({ origin: 'Jakarta', destination: 'Yogyakarta', distance_km: 550 });
        const relation2 = await Relation.create({ origin: 'Bandung', destination: 'Surabaya', distance_km: 700 });

        await Schedule.bulkCreate([
            { bus_id: bus1.id, relation_id: relation1.id, departure_time: new Date('2026-06-01T19:00:00Z'), price: 700000.00 },
            { bus_id: bus2.id, relation_id: relation1.id, departure_time: new Date('2026-06-01T19:00:00Z'), price: 850000.00 },
            { bus_id: bus3.id, relation_id: relation1.id, departure_time: new Date('2026-06-02T15:00:00Z'), price: 500000.00 },
            { bus_id: bus4.id, relation_id: relation1.id, departure_time: new Date('2026-06-02T20:00:00Z'), price: 1000000.00 },
            { bus_id: bus5.id, relation_id: relation2.id, departure_time: new Date('2026-06-01T19:00:00Z'), price: 700000.00 },
            { bus_id: bus6.id, relation_id: relation2.id, departure_time: new Date('2026-06-01T19:00:00Z'), price: 850000.00 },
            { bus_id: bus7.id, relation_id: relation2.id, departure_time: new Date('2026-06-02T15:00:00Z'), price: 500000.00 },
            { bus_id: bus8.id, relation_id: relation2.id, departure_time: new Date('2026-06-02T20:00:00Z'), price: 1000000.00 }
        ]);

        console.log('Seeding data berhasil! Database siap digunakan.');
        process.exit(0);

    } catch (error) {
        console.error('Terjadi kesalahan saat refresh database:', error);
        process.exit(1);
    }
}

refreshDatabase();