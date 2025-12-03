const sequelize = require('../config/database');
const DailySession = require('./DailySession');
const Transaction = require('./Transaction');
const CashCount = require('./CashCount');
const MasterData = require('./MasterData');
const User = require('./User');
const Wallet = require('./Wallet');
const SessionBalance = require('./SessionBalance');

// Associations
DailySession.hasMany(Transaction, { foreignKey: 'session_id' });
Transaction.belongsTo(DailySession, { foreignKey: 'session_id' });

DailySession.hasMany(CashCount, { foreignKey: 'session_id' });
CashCount.belongsTo(DailySession, { foreignKey: 'session_id' });

// New Associations for Dynamic Wallets
DailySession.hasMany(SessionBalance, { foreignKey: 'session_id' });
SessionBalance.belongsTo(DailySession, { foreignKey: 'session_id' });

Wallet.hasMany(SessionBalance, { foreignKey: 'wallet_id' });
SessionBalance.belongsTo(Wallet, { foreignKey: 'wallet_id' });

Transaction.belongsTo(Wallet, { as: 'FromWallet', foreignKey: 'source_wallet', constraints: false });
Transaction.belongsTo(Wallet, { as: 'ToWallet', foreignKey: 'destination_wallet', constraints: false });

module.exports = {
    sequelize,
    DailySession,
    Transaction,
    CashCount,
    MasterData,
    User,
    Wallet,
    SessionBalance,
};
