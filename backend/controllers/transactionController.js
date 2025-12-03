const { Transaction, DailySession } = require('../models');

exports.addTransaction = async (req, res) => {
    try {
        const {
            type,
            category,
            category_id,
            amount,
            source_wallet,
            from_wallet_id,
            destination_wallet,
            to_wallet_id,
            description,
            session_id
        } = req.body;

        // Find active session or use provided session_id
        let sessionId = session_id;
        if (!sessionId) {
            const session = await DailySession.findOne({ where: { status: 'OPEN' } });
            if (!session) return res.status(400).json({ message: 'No active session found. Please open warung first.' });
            sessionId = session.id;
        }

        // Resolve Category Name
        let categoryName = category;
        if (!categoryName && category_id) {
            const { MasterData } = require('../models');
            const catRecord = await MasterData.findByPk(category_id);
            if (catRecord) {
                categoryName = catRecord.name;
            }
        }
        // Fallback if still no name (should not happen if valid ID)
        if (!categoryName) categoryName = 'Uncategorized';

        const transaction = await Transaction.create({
            session_id: sessionId,
            type,
            category: categoryName,
            amount,
            source_wallet: from_wallet_id || source_wallet, // Support both field names
            destination_wallet: to_wallet_id || destination_wallet, // Support both field names
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

        const transactions = await Transaction.findAll({
            where,
            order: [['createdAt', 'DESC']],
            include: [
                { model: require('../models').Wallet, as: 'FromWallet' },
                { model: require('../models').Wallet, as: 'ToWallet' }
            ]
        });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
