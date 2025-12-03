const sequelize = require('../config/database');
const DailySession = require('./DailySession');
const Transaction = require('./Transaction');
const CashCount = require('./CashCount');
const MasterData = require('./MasterData');
const User = require('./User');

// Associations
DailySession.hasMany(Transaction, { foreignKey: 'session_id' });
Transaction.belongsTo(DailySession, { foreignKey: 'session_id' });

DailySession.hasMany(CashCount, { foreignKey: 'session_id' });
CashCount.belongsTo(DailySession, { foreignKey: 'session_id' });

module.exports = {
    sequelize,
    DailySession,
    Transaction,
    CashCount,
    MasterData,
    User,
};
