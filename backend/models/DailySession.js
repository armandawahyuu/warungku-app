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
    opening_balance_laci1: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
    },
    opening_balance_laci2: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
    },
    opening_balance_brilink: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
    },
    opening_balance_dana: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
    },
    opening_balance_digipos: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
    },
    closing_balance_brilink: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
    },
    closing_balance_dana: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
    },
    closing_balance_digipos: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
    },
    actual_cash_laci1: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
    },
    actual_cash_laci2: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
    },
    notes: {
        type: DataTypes.TEXT,
    },
});

module.exports = DailySession;
