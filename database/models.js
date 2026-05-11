const { DataTypes } = require('sequelize');
const sequelize = require('./connect');

const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('Admin', 'Crew', 'Passenger'), defaultValue: 'Passenger' }
});

const Bus = sequelize.define('Bus', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    plate_number: { type: DataTypes.STRING, unique: true, allowNull: false },
    size: { type: DataTypes.ENUM('Mini', 'Medium', 'Big', 'Double Decker'), allowNull: false },
    class: { type: DataTypes.ENUM('Economy', 'VIP', 'Executive', 'Sleeper'), allowNull: false },
    capacity: { type: DataTypes.INTEGER, allowNull: false }
});

const Relation = sequelize.define('Relation', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    origin: { type: DataTypes.STRING, allowNull: false },
    destination: { type: DataTypes.STRING, allowNull: false },
    distance_km: { type: DataTypes.FLOAT, allowNull: false }
});

const Schedule = sequelize.define('Schedule', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    departure_time: { type: DataTypes.DATE, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
});

const Booking = sequelize.define('Booking', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    seat_number: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.ENUM('Pending', 'Paid', 'Cancelled'), defaultValue: 'Pending' }
});

Schedule.belongsTo(Bus, { foreignKey: 'bus_id' });
Schedule.belongsTo(Relation, { foreignKey: 'relation_id' });
Booking.belongsTo(User, { foreignKey: 'user_id' });
Booking.belongsTo(Schedule, { foreignKey: 'schedule_id' });

const syncDB = async () => {
    await sequelize.sync({ alter: true });
    console.log('Database terhubung dan tersinkronisasi.');
};

module.exports = { sequelize, syncDB, User, Bus, Relation, Schedule, Booking };