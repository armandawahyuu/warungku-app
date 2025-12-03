const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DailySession = sequelize.define('DailySession', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    status: {
        type: DataTypes.ENUM('OPEN', 'CLOSED'),
        defaultValue: 'OPEN',
    },
    notes: {
        type: DataTypes.TEXT,
    },
});

module.exports = DailySession;
