const { Transaction, DailySession } = require('../models');

exports.addTransaction = async (req, res) => {
    try {
        const { type, category, amount, source_wallet, destination_wallet, description } = req.body;

        // Find active session
        const session = await DailySession.findOne({ where: { status: 'OPEN' } });
        if (!session) return res.status(400).json({ message: 'No active session found. Please open warung first.' });

        const transaction = await Transaction.create({
            session_id: session.id,
            type,
            category,
            amount,
            source_wallet,
            destination_wallet,
            description
        });

        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const { session_id } = req.query;
        const where = {};
        if (session_id) where.session_id = session_id;

        const transactions = await Transaction.findAll({ where, order: [['createdAt', 'DESC']] });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
