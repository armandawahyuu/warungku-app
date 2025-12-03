const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MasterData = sequelize.define('MasterData', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    type: {
        type: DataTypes.ENUM('INCOME', 'EXPENSE'),
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

module.exports = MasterData;
