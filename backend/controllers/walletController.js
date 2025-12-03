const { Wallet } = require('../models');

exports.getWallets = async (req, res) => {
    try {
        const wallets = await Wallet.findAll({
            where: { isActive: true },
            order: [['name', 'ASC']]
        });
        res.json(wallets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createWallet = async (req, res) => {
    try {
        const { name, type } = req.body;
        const wallet = await Wallet.create({ name, type });
        res.status(201).json(wallet);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteWallet = async (req, res) => {
    try {
        const { id } = req.params;
        const wallet = await Wallet.findByPk(id);
        if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

        // Soft delete by setting isActive to false
        await wallet.update({ isActive: false });
        res.json({ message: 'Wallet deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
