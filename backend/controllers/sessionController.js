const { DailySession, CashCount, Transaction, SessionBalance, Wallet } = require('../models');
const { Op } = require('sequelize');

exports.openSession = async (req, res) => {
    try {
        const { balances } = req.body; // Array of { wallet_id, opening_balance }

        // Check if there is already an open session
        const existingSession = await DailySession.findOne({ where: { status: 'OPEN' } });
        if (existingSession) {
            return res.status(400).json({ message: 'There is already an open session.' });
        }

        const session = await DailySession.create({
            date: new Date(),
            status: 'OPEN',
        });

        // Create SessionBalance records
        if (balances && balances.length > 0) {
            await Promise.all(balances.map(b =>
                SessionBalance.create({
                    session_id: session.id,
                    wallet_id: b.wallet_id,
                    opening_balance: b.opening_balance
                })
            ));
        }

        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.closeSession = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            balances, // Array of { wallet_id, closing_balance (digital) or actual_balance (physical) }
            cash_counts,
            notes
        } = req.body;

        const session = await DailySession.findByPk(id);
        if (!session) return res.status(404).json({ message: 'Session not found' });

        await session.update({
            status: 'CLOSED',
            notes
        });

        // Update SessionBalance records
        if (balances && balances.length > 0) {
            await Promise.all(balances.map(async (b) => {
                const balanceRecord = await SessionBalance.findOne({
                    where: { session_id: id, wallet_id: b.wallet_id }
                });

                if (balanceRecord) {
                    // Check wallet type to decide where to save
                    const wallet = await Wallet.findByPk(b.wallet_id);
                    if (wallet.type === 'DIGITAL') {
                        await balanceRecord.update({ closing_balance: b.closing_balance });
                    } else {
                        await balanceRecord.update({ actual_balance: b.actual_balance });
                    }
                } else {
                    // Create if not exists (e.g. new wallet added mid-session? unlikely but safe)
                    // Or if it wasn't initialized at open
                    const wallet = await Wallet.findByPk(b.wallet_id);
                    const data = {
                        session_id: id,
                        wallet_id: b.wallet_id,
                    };
                    if (wallet.type === 'DIGITAL') {
                        data.closing_balance = b.closing_balance;
                    } else {
                        data.actual_balance = b.actual_balance;
                    }
                    await SessionBalance.create(data);
                }
            }));
        }

        if (cash_counts && cash_counts.length > 0) {
            await CashCount.bulkCreate(cash_counts.map(c => ({ ...c, session_id: id })));
        }

        res.json({ message: 'Session closed successfully', session });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCurrentSession = async (req, res) => {
    try {
        const session = await DailySession.findOne({
            where: { status: 'OPEN' },
            include: [
                { model: Transaction },
                {
                    model: SessionBalance,
                    include: [Wallet]
                }
            ]
        });
        res.json(session);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getLastClosedSession = async (req, res) => {
    try {
        const session = await DailySession.findOne({
            where: { status: 'CLOSED' },
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: SessionBalance,
                    include: [Wallet]
                },
                {
                    model: Transaction // Include transactions to calculate theoretical balance
                }
            ]
        });

        if (session && session.SessionBalances) {
            // Calculate theoretical balance for each wallet
            session.SessionBalances.forEach(balance => {
                const walletId = balance.wallet_id;
                let theoreticalBalance = Number(balance.opening_balance);

                session.Transactions.forEach(trx => {
                    if (trx.destination_wallet === walletId) {
                        theoreticalBalance += Number(trx.amount);
                    }
                    if (trx.source_wallet === walletId) {
                        theoreticalBalance -= Number(trx.amount);
                    }
                });

                // If stored closing/actual balance is 0 (likely due to error), use theoretical
                if (balance.Wallet.type === 'DIGITAL') {
                    if (Number(balance.closing_balance) === 0) {
                        balance.setDataValue('closing_balance', theoreticalBalance);
                    }
                } else {
                    if (Number(balance.actual_balance) === 0) {
                        balance.setDataValue('actual_balance', theoreticalBalance);
                    }
                }
            });
        }

        res.json(session);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllSessions = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const whereClause = {};

        if (startDate && endDate) {
            whereClause.date = {
                [Op.between]: [startDate, endDate]
            };
        } else if (startDate) {
            whereClause.date = {
                [Op.gte]: startDate
            };
        } else if (endDate) {
            whereClause.date = {
                [Op.lte]: endDate
            };
        }

        const sessions = await DailySession.findAll({
            where: whereClause,
            order: [['date', 'DESC']],
            include: [
                {
                    model: SessionBalance,
                    include: [Wallet]
                }
            ]
        });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateSession = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, status } = req.body;

        const session = await DailySession.findByPk(id);
        if (!session) return res.status(404).json({ message: 'Session not found' });

        await session.update({ date, status });

        res.json({ message: 'Session updated successfully', session });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
