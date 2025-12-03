const { DailySession, CashCount, Transaction } = require('../models');

exports.openSession = async (req, res) => {
    try {
        const {
            opening_balance_laci1,
            opening_balance_laci2,
            opening_balance_brilink,
            opening_balance_dana,
            opening_balance_digipos,
        } = req.body;

        // Check if there is already an open session
        const existingSession = await DailySession.findOne({ where: { status: 'OPEN' } });
        if (existingSession) {
            return res.status(400).json({ message: 'There is already an open session.' });
        }

        const session = await DailySession.create({
            date: new Date(),
            status: 'OPEN',
            opening_balance_laci1,
            opening_balance_laci2,
            opening_balance_brilink,
            opening_balance_dana,
            opening_balance_digipos,
        });

        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.closeSession = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            closing_balance_brilink,
            closing_balance_dana,
            closing_balance_digipos,
            actual_cash_laci1,
            actual_cash_laci2,
            cash_counts, // Array of { drawer, count_100k, ... }
            notes
        } = req.body;

        const session = await DailySession.findByPk(id);
        if (!session) return res.status(404).json({ message: 'Session not found' });

        await session.update({
            status: 'CLOSED',
            closing_balance_brilink,
            closing_balance_dana,
            closing_balance_digipos,
            actual_cash_laci1,
            actual_cash_laci2,
            notes
        });

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
            include: [Transaction]
        });
        res.json(session);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
