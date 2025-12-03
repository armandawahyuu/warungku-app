const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    type: {
        type: DataTypes.ENUM('INCOME', 'EXPENSE', 'TRANSFER'),
        allowNull: false,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    source_wallet: {
        type: DataTypes.STRING, // Changed from ENUM to STRING for dynamic wallets
        allowNull: true,
    },
    destination_wallet: {
        type: DataTypes.STRING, // Changed from ENUM to STRING for dynamic wallets
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
    },
});

module.exports = Transaction;
