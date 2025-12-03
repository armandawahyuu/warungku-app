const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CashCount = sequelize.define('CashCount', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    drawer: {
        type: DataTypes.ENUM('LACI1', 'LACI2'),
        allowNull: false,
    },
    count_100k: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    count_50k: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    count_20k: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    count_10k: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    total_amount: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
    },
});

module.exports = CashCount;
