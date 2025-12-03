const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SessionBalance = sequelize.define('SessionBalance', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    opening_balance: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
    },
    closing_balance: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0, // For digital wallets
    },
    actual_balance: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0, // For physical wallets (counted cash)
    },
});

module.exports = SessionBalance;
